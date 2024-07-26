CREATE TABLE vehicles (
    id INTEGER,
    name TEXT NOT NULL UNIQUE,
    length REAL,
    armament TEXT,
    role TEXT,
    price INTEGER NOT NULL,
    category_id INTEGER NOT NULL, description TEXT,
    PRIMARY KEY(id),
    FOREIGN KEY(category_id) REFERENCES categories(id)
);
CREATE TABLE categories (
    id INTEGER,
    name TEXT NOT NULL UNIQUE,
    PRIMARY KEY(id)
);
CREATE TABLE users (
    id INTEGER,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    hash TEXT NOT NULL,
    address TEXT,
    city TEXT,
    zip TEXT,
    planet_id INTEGER, type TEXT NOT NULL DEFAULT user,
    PRIMARY KEY(id),
    FOREIGN KEY(planet_id) REFERENCES planets(id)
);
CREATE TABLE planets (
    id INTEGER,
    name TEXT NOT NULL,
    PRIMARY KEY(id)
);
CREATE TABLE orders (
    id INTEGER,
    user_id INTEGER NOT NULL,
    paid INT,
    date_paid TEXT, status TEXT DEFAULT pending, shipping_method TEXT, shipping_cost INTEGER,
    PRIMARY KEY(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
);
CREATE TABLE orders_details (
    id INTEGER,
    order_id INTEGER NOT NULL,
    vehicle_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price INTEGER NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY(order_id) REFERENCES orders(id),
    FOREIGN KEY(vehicle_id) REFERENCES vehicles(id)
);
