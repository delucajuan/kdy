import sqlite3
import re

from flask import Flask, flash, redirect, render_template, request, session
from flask_session import Session
from werkzeug.security import check_password_hash, generate_password_hash
from functools import wraps

# Configure application
app = Flask(__name__)

# Configure session to use filesystem (instead of signed cookies)
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)


def dict_factory(cursor, row):
    fields = [column[0] for column in cursor.description]
    return {key: value for key, value in zip(fields, row)} 

con = sqlite3.connect("kdy.db", check_same_thread=False)
con.row_factory = dict_factory
cur = con.cursor()

# Users and admins
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if session.get("user_id") is None:
            flash("Please login first.", "warning")
            return redirect("/login")
        return f(*args, **kwargs)
    return decorated_function

# Only admins
def admin_required(f):
    @login_required
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        userType = cur.execute("SELECT type FROM users WHERE id = ?", [user_id]).fetchone()["type"]
        if userType != "admin":
            flash("User is not admin.", "error")
            return redirect("/")
        return f(*args, **kwargs)
    return decorated_function

# Only users
def user_required(f):
    @login_required
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        userType = cur.execute("SELECT type FROM users WHERE id = ?", [user_id]).fetchone()["type"]
        if userType != "user":
            flash("User not allowed.", "error")
            return redirect("/")
        return f(*args, **kwargs)
    return decorated_function

# Everyone except admins (includes not logged users)
def notAdmin(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = session.get("user_id")
        if user_id:
            userType = cur.execute("SELECT type FROM users WHERE id = ?", [user_id]).fetchone()["type"]
            if userType == "admin":
                flash("User not allowed.", "error")
                return redirect("/")
        return f(*args, **kwargs)
    return decorated_function

# Get number of items in cart
def cartQuantity(user_id):
    if user_id:
        orders = cur.execute(
                """
                SELECT COALESCE(SUM(quantity), 0) AS vehicles 
                FROM orders_details 
                WHERE order_id = (
                                SELECT id 
                                FROM orders 
                                WHERE user_id = ? 
                                AND paid = FALSE
                                )
                """
            , [user_id]).fetchone()
    else:
        orders = {"vehicles": "0"}
    return orders

# Get vehicles categories for navbar
def vehiclesCategories():
    return cur.execute("SELECT id, name FROM categories").fetchall()


@app.route("/")
def index():
    user_id = session.get("user_id")

    # User is logged in
    if user_id:
        userType = cur.execute("SELECT type FROM users WHERE id = ?", [user_id]).fetchone()["type"]
        
        # Admin user
        if userType == "admin":
            return redirect("/admin")

    # User is not logged in
    else:
        userType = None

    carouselVehicles = cur.execute(
        """
        SELECT vehicles.id, vehicles.name, vehicles.price
        FROM vehicles
        JOIN orders_details ON orders_details.vehicle_id = vehicles.id
        JOIN orders ON orders.id = orders_details.order_id
        WHERE orders.paid = TRUE
        AND orders.status <> 'cancelled'
        GROUP BY vehicles.id
        ORDER BY SUM(orders_details.quantity) DESC
        LIMIT 4
        """
    ).fetchall()

    return render_template("index.html", vehicles=carouselVehicles, cart=cartQuantity(user_id), categories=vehiclesCategories(), userType=userType)


@app.route("/login", methods=["GET", "POST"])
def login():
    # Retrive messages
    messages = session.get("_flashes", [])

    # Clear session
    session.clear()

    # Flash messages again
    if messages:
        for message in messages:
            flash(message[1], message[0])
    
    cartOrders = {"vehicles": "0"}

    # GET
    if request.method == "GET":
        return render_template("login.html", cart=cartOrders, categories=vehiclesCategories())
    
    # POST
    else:
        username = request.form.get("username")
        password = request.form.get("password")

        # Username or password is empty
        if not username or not password:
            flash("Not all fields have been completed.", "error")
            return redirect("/login")
        
        # Username or password invalid
        credentials = cur.execute("SELECT id, hash FROM users WHERE username = ?", [username]).fetchone()
        if not credentials or not check_password_hash(credentials["hash"], password):
            flash("Invalid username and/or password.", "error")
            return redirect("/login")
        
        # Log user in and redirect to home
        session["user_id"] = credentials["id"]
        return redirect("/")
    

@app.route("/logout")
def logout():
    session.clear()
    flash("You have successfully logged out.", "success")
    return redirect("/")
  
    
@app.route("/register", methods=["GET", "POST"])
def register():

    # Retrive messages
    messages = session.get("_flashes", [])

    # Clear session
    session.clear()

    # Flash messages again
    if messages:
        for message in messages:
            flash(message[1], message[0])
    
    cartOrders = {"vehicles": "0"}
    planets = cur.execute("SELECT id, name FROM planets ORDER BY name").fetchall()

    # GET
    if request.method == "GET":
        return render_template("register.html", cart=cartOrders, planets=planets, data="", categories=vehiclesCategories())
    
    # POST
    else:
        # Save submited data to userData dict
        userData = request.form.to_dict()

        # Save password and password confirmation to separate variable and remove it from userData
        password = userData.pop("password")
        passwordConf = userData.pop("password_conf")

    # Some field is blank
        for value in userData.values():
            if not value:
                flash("Not all fields have been completed.", "error")
                return redirect("/register")
            
        # User is already taken
        if cur.execute("SELECT id FROM users where username = ?",(userData["username"],)).fetchone():
            flash("Username is already taken.", "error")
            return redirect("/register")

        # Username is invalid
        if not re.search("^[a-zA-Z0-9_.-]{4,20}$", userData["username"]):
            flash("Your username should be 4-20 characters long and can include letters, underscores (_), periods (.), and hyphens (-). No special characters or spaces allowed.", "error")
            return redirect("/register")

        # Password is invalid
        if not re.search("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d).{8,30}$", password):
            flash("Password is invalid.", "error")
            return redirect("/register")
                    
        # Passwords don´t match
        if password != passwordConf:
            flash("Passwords do not match.", "error")
            return redirect("/register")

        # Insert user into users table
        hash = generate_password_hash(password)
        cur.execute(
            """
            INSERT INTO users (username, name, last_name, hash, address, city, zip, planet_id)
            VALUES (?, ?, ? , ?, ?, ?, ?, ?)
            """, [userData["username"], userData["first_name"], userData["last_name"], hash, userData["address"], userData["city"], userData["zip"], userData["planet_id"]])
        con.commit()

        # Log user in
        session["user_id"] = cur.lastrowid

        # Redirect to home page and alert user
        flash("Account successfully created.", "success")
        return redirect("/")
    

@app.route("/add-to-cart", methods=["POST"])
@user_required
def addToCart():
    user_id = session.get("user_id")
    vehicle_id = request.form.get("add-to-cart")
    vehicleName = cur.execute("SELECT name FROM vehicles WHERE id = ?", [vehicle_id]).fetchone()["name"]
    origin = request.args.get("origin")

    # Check unpaid orders
    order = cur.execute("SELECT id FROM orders WHERE user_id = ? AND paid = FALSE", [user_id]).fetchone()
    
    # If unpaid order attach item to that order
    if order:

        # Check if order already has same vehicle
        order_details = cur.execute("SELECT id FROM orders_details WHERE order_id = ? AND vehicle_id = ?", [order["id"], vehicle_id]).fetchone()

        if order_details:
            # Add 1 to that vehicle quantity
            cur.execute("UPDATE orders_details SET quantity = quantity + 1 WHERE id = ?", [order_details["id"]])
            con.commit()

        # If not add new row to order_details
        else:
            cur.execute("INSERT INTO orders_details (order_id, vehicle_id, quantity, unit_price) VALUES (?, ?, 1, (SELECT price FROM vehicles WHERE id = ?));", [order["id"], vehicle_id, vehicle_id])
            con.commit()

    # If no unpaid order create new order and attach item to it
    else:
        cur.execute("INSERT INTO orders (user_id, paid) VALUES (?, FALSE)", [user_id])
        cur.execute("INSERT INTO orders_details (order_id, vehicle_id, quantity, unit_price) VALUES ((SELECT last_insert_rowid()), ?, 1, (SELECT price FROM vehicles WHERE id = ?))", [vehicle_id, vehicle_id])
        con.commit()

    flash(vehicleName + " added to cart", "success")
    return redirect(origin)


@app.route("/profile", methods=["GET", "POST"])
@login_required
def profile():

    # GET
    if request.method == "GET":
        user_id = session.get("user_id")
        userType = cur.execute("SELECT type FROM users WHERE id = ?", [user_id]).fetchone()["type"]
        userData = cur.execute(
            "SELECT username, name, last_name, address, city, zip, planet_id FROM users WHERE id = ?", [user_id]
            ).fetchone()
        planets = cur.execute("SELECT id, name FROM planets ORDER BY name").fetchall()
        return render_template("profile.html", cart=cartQuantity(user_id), data=userData, planets=planets, userType=userType, categories=vehiclesCategories())
    
    # POST
    else:
        user_id = session.get("user_id")

        # PInfo
        if request.form.get("submit") == "pinfo":
            firstName = request.form.get("first-name")
            lastName = request.form.get("last-name")

            if not firstName or not lastName:
                flash("Not all fields have been completed.", "error")
                return redirect("/profile")
            
            else:
                cur.execute("UPDATE users SET name = ?, last_name = ? WHERE id = ?",[firstName, lastName, user_id])
                con.commit()
                flash("Personal info successfully updated", "success")
                return redirect("/profile") 
        
        # Password
        elif request.form.get("submit") == "password":
            submitedData = request.form.to_dict()
            hash = cur.execute("SELECT hash FROM users WHERE id = ?", [user_id]).fetchone()["hash"]

            # If current password is wrong
            if not check_password_hash(hash, submitedData["current_password"]):
                flash("Current password is invalid", "error")
                return redirect("/profile")
            
            # If new password is invalid
            if not re.search("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d).{8,30}$", submitedData["new_password"]):
                    flash("New password is invalid.", "error")
                    return redirect("/profile")
                
            # If new password and new password confirmation do not match
            if submitedData["new_password"] != submitedData["new_password_conf"]:
                    flash("Passwords do not match.", "error")
                    return redirect("/profile")
            
            # Change password
            hash = generate_password_hash(submitedData["new_password"])
            cur.execute("UPDATE users SET hash = ? WHERE id = ?",[hash, user_id])
            con.commit()
            flash("Password successfully updated", "success")
            return redirect("/profile")
        
        # Address
        elif request.form.get("submit") == "address":
            submitedData = request.form.to_dict()

            # If some field is blank
            for value in submitedData.values():
                if not value:
                    flash("Not all fields have been completed.", "error")
                    return redirect("/profile")
            
            # Change address
            cur.execute("UPDATE users SET address = ?, city = ?, zip = ?, planet_id = ? WHERE id = ?", [submitedData["address"], submitedData["city"], submitedData["zip"], submitedData["planet_id"], user_id])
            con.commit()
            flash("Shipping address successfully updated", "success")
            return redirect("/profile")
        
        else:
            return redirect("/profile")

    
@app.route("/history")
@user_required
def history():
    user_id = session.get("user_id")
    orders = cur.execute(
        """
        SELECT orders.id, shipping_cost, shipping_method, SUM(quantity*unit_price + shipping_cost) as total, date_paid, status 
        FROM orders 
        JOIN orders_details ON orders.id = orders_details.order_id 
        JOIN users ON  orders.user_id = users.id
        WHERE user_id = ?
        AND paid = TRUE
        GROUP BY order_id
        ORDER BY date_paid DESC
        """, [user_id]).fetchall()
    ordersDetails = cur.execute("""
        SELECT order_id, vehicle_id, vehicles.name as vehicle,  quantity, unit_price
        FROM orders_details 
        JOIN orders ON orders_details.order_id = orders.id
        JOIN vehicles ON orders_details.vehicle_id = vehicles.id
        WHERE user_id = ?
        AND paid = TRUE
        ORDER BY date_paid DESC
        """, [user_id]).fetchall()
    return render_template("history.html", cart=cartQuantity(user_id), categories=vehiclesCategories(), orders=orders, ordersDetails=ordersDetails)


@app.route("/vehicles-search")
def vehicleSearch():

    # GET
    searchValue = request.args.get("q")
    if searchValue:
        vehicles = cur.execute("""
                    SELECT name 
                    FROM vehicles 
                    WHERE name LIKE ? 
                    ORDER BY CASE
                            WHEN name = ? THEN 1
                            WHEN name LIKE ? THEN 2
                            WHEN name LIKE ? THEN 3
                            ELSE 4
                    END, name
                    LIMIT 10
                    """, ["%" + searchValue + "%",searchValue , searchValue + "%", "%" + searchValue + "%" ]).fetchall() 
    else:
        vehicles = []
    return render_template("/vehicles-search.html", vehicles=vehicles, userType="admin")


@app.route("/about-us")
@notAdmin
def aboutus():
    user_id = session.get("user_id")
    return render_template("about-us.html", cart=cartQuantity(user_id), categories=vehiclesCategories())


@app.route("/cart", methods=["GET", "POST"])
@user_required
def cart():
    user_id = session.get("user_id")

    # GET
    if request.method == "GET":
        cartOrders = cartQuantity(user_id)
        if cartOrders["vehicles"]:
            shippingMethod = cur.execute("SELECT shipping_method FROM orders WHERE user_id = ? AND paid = FALSE", [user_id]).fetchone()['shipping_method']
            cartVehicles = cur.execute("""
                SELECT vehicles.id, vehicles.name, quantity, unit_price as price, length
                FROM orders_details 
                JOIN orders ON orders_details.order_id = orders.id 
                JOIN vehicles ON orders_details.vehicle_id = vehicles.id 
                WHERE orders.user_id = ?
                AND orders.paid = FALSE
                """, [user_id]).fetchall()
        else:
            shippingMethod = 'express'
            cartVehicles = None
        return render_template("cart.html", cart=cartOrders, categories=vehiclesCategories(), cartVehicles=cartVehicles, shippingMethod=shippingMethod)
    
    # POST
    else:
        # Continue shopping or Checkout
        vehiclesIds = request.form.getlist("vehicle-id")
        quantities = request.form.getlist("quantity")
        shipping = request.form.get("shipping-method")
        destination = request.form.get("destination")

        # Delete vehicle
        if "delete" in request.form:
            vehicle_id = request.form.get("delete")
            cur.execute("DELETE FROM orders_details WHERE vehicle_id = ? AND order_id = (SELECT id FROM orders WHERE user_id = ? AND paid = FALSE)", [vehicle_id, user_id])
            con.commit()

        # Update cart quntities
        for i, id in enumerate(vehiclesIds):

            # Check if quantity is number between 1 and 9999
            try:
                quantity = int(quantities[i])
            except ValueError:
                continue
            if quantity > 0 and quantity < 10000:
                cur.execute("UPDATE orders_details SET quantity = ? WHERE vehicle_id = ? AND order_id = (SELECT id FROM orders WHERE user_id = ? AND paid = FALSE)", [quantities[i], id, user_id])
        
        # Update shipping method
        cur.execute("UPDATE orders SET shipping_method = ? WHERE paid = FALSE AND user_id = ?", [shipping, user_id])
        con.commit()

        # Stay in cart
        if not destination:
            return redirect("/cart")

        # Checkout
        elif destination == "checkout":
            return redirect("/checkout")

        # Continue shopping
        else:
            return redirect("/vehicles")


@app.route("/checkout", methods=["GET", "POST"])
@user_required
def checkout():
    user_id = session.get("user_id")
    order = cur.execute(
        """
        SELECT order_id AS id, SUM(unit_price * quantity) AS total, shipping_method, SUM(length * quantity) as length
        FROM orders_details
        JOIN orders ON orders.id = orders_details.order_id
        JOIN vehicles ON orders_details.vehicle_id = vehicles.id
        WHERE user_id = ?
        AND paid = FALSE
        """, [user_id]).fetchone()
    
    # If cart is empty redirect to cart
    if order["id"] == None:
        return redirect("/cart")
    
    # Calculate shipping cost
    if order["shipping_method"] == "express":
        shippingCost = round(order["length"] * 8 + 1200)
    else:
        shippingCost = round(order["length"] * 5 + 600)

    # GET
    if request.method == "GET":
        shippingAddress = cur.execute(
            """
            SELECT address, city, zip, planets.name as planet 
            FROM users 
            JOIN planets ON users.planet_id = planets.id 
            WHERE users.id = ?
            """, [user_id]).fetchone()       
        orderTotal = order["total"] + shippingCost
        return render_template("checkout.html", cart=cartQuantity(user_id), categories=vehiclesCategories(), orderTotal=orderTotal, shippingAddress=shippingAddress)
    
    # POST
    else:
        cc = request.form.to_dict()

        # Check CC number
        if not re.search("[0-9]{13,19}", cc["number"]):
            flash("Invalid Credit Card", "error")
            return redirect("/checkout")
        
        # Check expiration date
        if not re.search("^(0[1-9]|1[0-2])\/[0-9]{2}$", cc["exp"]):
            flash("Invalid Credit Card", "error")
            return redirect("/checkout")
        
        # Check CVC
        if not re.search("[0-9]{3,4}", cc["cvc"]):
            flash("Invalid Credit Card", "error")
            return redirect("/checkout")
        
        # Check name
        if not re.search("^(?! )[a-zA-Z ]{2,16}[a-zA-Z]$", cc["name"]):
            flash("Invalid Credit Card", "error")
            return redirect("/checkout")

        # Place order
        cur.execute(
            """
            UPDATE orders 
            SET paid = TRUE, date_paid = CURRENT_TIMESTAMP, shipping_method = ?, shipping_cost = ?
            WHERE user_id = ?
            AND paid = FALSE
            """,[order["shipping_method"], shippingCost, user_id])
        con.commit()
        flash("Order successfully placed!", "success")
        return redirect("/history")


@app.route("/admin")
@admin_required
def admin():
    orders = cur.execute(
        """
        SELECT order_id, users.username, users.name, users.last_name, users.city, planets.name AS planet, SUM(quantity*unit_price + shipping_cost) as total, date_paid, status 
        FROM orders 
        JOIN orders_details ON orders.id = orders_details.order_id 
        JOIN users ON  orders.user_id = users.id
        JOIN planets ON users.planet_id = planets.id
        WHERE paid = TRUE
        GROUP BY order_id
        ORDER BY date_paid DESC
        """).fetchall()
    salesAmount = 0

    for order in orders:
        salesAmount += order["total"]

    bestSeller = cur.execute(
        """
        SELECT vehicles.name FROM orders_details
        JOIN vehicles ON orders_details.vehicle_id = vehicles.id
        GROUP BY vehicles.id
        ORDER BY SUM(quantity) DESC LIMIT 1
        """).fetchone()
    return render_template("admin.html", userType="admin", orders=orders, salesAmount=salesAmount, bestSeller=bestSeller)


@app.route("/admin/order", methods=["GET", "POST"])
@admin_required
def adminOrder():
    orderId = request.args.get('id')

    # GET
    if request.method == "GET":
        order = cur.execute(
            """
            SELECT orders.id, users.username, users.name, users.last_name, users.address, users.city, users.zip, planets.name AS planet, shipping_method, shipping_cost, SUM(quantity*unit_price + shipping_cost) as total, date_paid, status
            FROM orders 
            JOIN orders_details ON orders.id = orders_details.order_id
            JOIN users ON  orders.user_id = users.id
            JOIN planets ON users.planet_id = planets.id
            WHERE orders.id = ?;
            """, [orderId]).fetchone()
        orderDetails = cur.execute(
            """
            SELECT vehicles.name AS vehicle, quantity, unit_price
            FROM orders_details 
            JOIN vehicles ON orders_details.vehicle_id = vehicles.id
            WHERE order_id = ?
            """, [orderId]).fetchall()
        return render_template("/admin/order.html", order=order, orderDetails=orderDetails, userType="admin")
    
    # POST
    else:
        newStatus = request.form.get('change-status')
        cur.execute("UPDATE orders SET status =  ? WHERE id = ?", [newStatus, orderId])
        con.commit()
        return redirect("/admin/order?id=" + orderId)


@app.route("/admin/users", methods=["GET", "POST"])
@admin_required
def adminUsers():

    # GET
    if request.method == "GET":
        searchValue = request.args.get("q")
        user = cur.execute("""
                        SELECT username, users.name, last_name, address, city, zip, planets.name AS planet, type 
                        FROM users 
                        JOIN planets ON users.planet_id = planets.id
                        WHERE username = ?
                        """, [searchValue]).fetchone()
        
        if user:
            return render_template("/admin/users.html", userType="admin", user=user, searchValue=searchValue)
        
        if searchValue:
            flash("User '" + searchValue + "' not found", "warning")
            
        return render_template("/admin/users.html", userType="admin", searchValue=searchValue)
    
    # POST
    else:
        username = request.form.get("username")
        submit = request.form.get("submit")

        # Check username exist
        user_id = cur.execute("SELECT id FROM users WHERE username = ?", [username]).fetchone()["id"]
        if not user_id:
            flash("User does not exist", "error")
            return redirect("/admin/users")

        # Change password
        if submit == "password-change":

            newPassword = request.form.get("new-password")
            passwordConf = request.form.get("password-confirmation")

            # Password is invalid
            if not re.search("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d).{8,30}$", newPassword):
                flash("New password is invalid.", "error")
                return redirect("/admin/users?q=" + username)
                        
            # Passwords don´t match
            if newPassword != passwordConf:
                flash("Passwords do not match.", "error")
                return redirect("/admin/users?q=" + username)
            
            # Change password
            hash = generate_password_hash(newPassword)
            cur.execute("UPDATE users SET hash = ? WHERE id = ?",[hash, user_id])
            con.commit()
            flash("Password successfully updated.", "success")
        
        # Change user type
        elif submit == "user-admin":
            cur.execute("UPDATE users SET type = 'admin' WHERE id = ?", [user_id])

        else:
            cur.execute("UPDATE users SET type = 'user' WHERE id = ?", [user_id])
            
        return redirect("/admin/users?q=" + username)
    
# Search usersnames for AJAX fetch 
@app.route("/admin/users-search")
def usersSearch():
    users = []
    # Check if user is loged in
    user_id = session.get("user_id")
    if user_id:
        userType = cur.execute("SELECT type FROM users WHERE id = ?", [user_id]).fetchone()["type"]

        # Check if user is admin
        if userType == "admin":
            searchValue = request.args.get("q")
            if searchValue:
                users = cur.execute("SELECT username FROM users WHERE username LIKE ? LIMIT 10", [searchValue + "%"]).fetchall() 
    
    return render_template("/admin/users-search.html", users=users, userType="admin")
    

@app.route("/vehicles")
@notAdmin
def vehicles():
    user_id = session.get("user_id")
    searchValue = request.args.get("search")
    category = request.args.get("category")

    if searchValue:
        vehicles = cur.execute("SELECT * FROM vehicles WHERE name LIKE ?", ["%" + searchValue + "%"]).fetchall()
        return render_template("vehicles.html", cart=cartQuantity(user_id), vehicles=vehicles, search=searchValue, categories=vehiclesCategories())
    
    elif category:
        vehicles = cur.execute("SELECT * FROM vehicles WHERE category_id = ? ORDER BY name", [category]).fetchall()
        return render_template("vehicles.html", cart=cartQuantity(user_id), vehicles=vehicles, categories=vehiclesCategories())
    
    vehicles = cur.execute("SELECT * FROM vehicles ORDER BY category_id, name").fetchall()
    return render_template("vehicles.html", cart=cartQuantity(user_id), vehicles=vehicles, categories=vehiclesCategories())


@app.route("/vehicles/")
@notAdmin
def vehicleDetail():
    user_id = session.get("user_id")
    vehicleName = request.args.get("name")
    vehicle = cur.execute(
        """
        SELECT vehicles.id, vehicles.name, length, armament, role, price, categories.name as category, description 
        FROM vehicles 
        JOIN categories 
        ON vehicles.category_id = categories.id 
        WHERE vehicles.name = ?
        """, [vehicleName]).fetchone()
    return render_template("vehicle-detail.html", cart=cartQuantity(user_id), vehicle=vehicle, categories=vehiclesCategories())

# Run with command: python3 app.py
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)