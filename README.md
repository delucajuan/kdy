# Kuat Drive Yards Webpage

## Table of Contents
- [Introduction](#introduction)
- [Video Demo](#video-demo)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Files](#files)
    - [app.py](#python-app---apppy)
    - [kdy.db](#database---kdydb)
    - [/favicon](#favicon---staticfavicon)
    - [/images](#icons-images---staticimages)
    - [script.js](#javascript---staticscriptjs)
    - [styles.css](#css---staticstylescss)
    - [order.html](#administrator-order-details---templatesadminorderhtml)
    - [users-search.html](#user-search-results---templatesadminusers-searchhtml)
    - [about-us.html](#about-us-and-terms---about-ushtml)
    - [admin.html](#administrator-dashboard---templatesadminhtml)
    - [cart.html](#shopping-cart---templatescarthtml)
    - [checkout.html](#checkout---templatescheckouthtml)
    - [history.html](#orders-history---templateshistoryhtml)
    - [index.html](#home-page---templatesindexhtml)
    - [layout.html](#base-layout---templateslayouthtml)
    - [login.html](#login-page---templatesloginhtml)
    - [profile.html](#profile---templatesprofilehtml)
    - [register.html](#register---templatesregisterhtml)
    - [vehicle-detail.html](#vehicle-detail---templatesvehicle-detailhtml)
    - [vehicle-search.html](#vehicle-search-suggestions---templatesvehicles-searchhtml)
    - [vehicles.html](#vehicles-catalog---templatesvehicleshtml)
- [Acknowledgements](#acknowledgements)


## Introduction
This is the e-commerce website of Kuat Drive Yards, a fictional company from the Star Wars franchise that sells interplanetary vehicles, a web application built with Python using the Flask framework. It provides a platform for users to interact with vehicles, add them to their cart, and manage their profile information. The app also features user authentication, role-based access control, and a responsive user interface.


## Video Demo
https://youtu.be/QYD68SfeuMI


## Features
- User registration and login with role-based access control (standard user, admin).
- User profiles with personal information and address management.
- Cart functionality to add, update, and remove vehicles.
- Vehicle search feature with autocomplete functionality.
- Order history to view past orders and details.
- About Us page with information about the company.
- Admin panel to visualize and manage recent orders (admins only).
- Users section to manage roles and change passwords (admins only).


## Technologies Used
- Python 3
- SQLite 3
- HTML5
- CSS3
- JavaScript
- Bootstrap 5.3.0
- jQuery


## Files

### Python App - `app.py`
This Python file handles the backend functionality of the web application. It configures the session, establishes the database connection, and defines various decorated functions to manage user roles. Additionally, it provides routes for handling user authentication, cart management, profile settings, order history, and administrative tasks.

#### User Roles
The `app.py` file starts by defining decorated functions to enforce user roles on different paths:
- `@login_required`: Ensures a user is logged in as either a user or an administrator.
- `@admin_required`: Verifies that the user is an administrator.
- `@user_required`: Confirms that the user is a standard user.
- `@notAdmin`: Redirects users if they are logged in as an administrator.

#### Functions
The file also contains utility functions:
- `cartQuantity(user_id)`: Calculates the number of items in the cart for a user.
- `vehicleCategories()`: Retrieves vehicle categories for the navbar dropdown menu.

#### Routes
Routes are defined to handle various functionalities:

- **Home - '/'**: Displays a carousel with top-selling vehicles, redirecting administrators to the admin panel.

- **Log in - '/login'**: Allows users to log in or log out by handling form submissions.

- **Register - '/register'**: Handles user registration, checks inputs, and stores data in the database.

- **Add to Cart - '/add-to-cart'**: Allows users to add vehicles to their cart, updating pending orders.

- **Profile - '/profile'**: Manages user profile details, including personal information and password changes.

- **Order History - '/history'**: Displays the user's order history.

- **Vehicles Search - '/vehicles-search'**: Enables AJAX-based vehicle searches, returning results in JSON format.

- **About Us - '/about-us'**: Displays information about the company and its terms and conditions.

- **Cart - '/cart'**: Manages the shopping cart, allowing users to modify quantities and select shipping methods.

- **Checkout - '/checkout'**: Handles the checkout process, including payment and order placement.

- **Administrator Panel - '/admin'**: Displays sales statistics and a list of orders for administrators.

- **Administrator Order Detail - '/admin/order'**: Provides detailed information about a specific order for administrators.

- **Administrator Users Management - '/admin/users'**: Allows administrators to manage user roles and passwords.

- **Administrator Users Search - '/admin/users-search'**: Autocompletes user search for administrators.

- **Vehicles - '/vehicles'**: Displays a list of vehicles based on search or category filters.

- **Vehicle Details - '/vehicles'**: Shows detailed information about a selected vehicle and allows adding it to the cart.


### Database - `kdy.db`

![Database schema](https://lh3.googleusercontent.com/drive-viewer/AITFw-zdedwnfrmXBeL0h4xZvsAmsR7PR_O8rom_pSDjbxRIbW3tMRGxe7VKfQCHiQqGPEwCxrKQ2W9jemav7nObUrXfpqLGsQ=s1600)

The kdy.db database comprises the following interconnected tables:

#### vehicles
This is where the details of each vehicle are kept:
- `id`: A unique ID for each vehicle.
- `name`: The name of the vehicle (no duplicates allowed!).
- `length`: The length of the vehicle in real-world units.
- `armament`: The weaponry it packs.
- `role`: The role it plays.
- `price`: The cost of owning this ride.
- `category_id`: The ID of the category this vehicle belongs to.
- `description`: A brief description of the vehicle.
- Primary Key: `id`
- Foreign Key: `category_id` references `categories(id)`

#### categories
This is where the categories of vehicles are listed:
- `id`: A unique ID for each category.
- `name`: The name of the category.
- Primary Key: `id`

#### users
All the users' information lives here:
- `id`: A unique ID for each user.
- `username`: The unique username of the user.
- `name`: The user's first name.
- `last_name`: The user's last name.
- `hash`: The hash of the user's password.
- `address`: The user's address.
- `city`: The city where the user lives.
- `zip`: The ZIP code of the user's area.
- `planet_id`: The ID of the planet the user belongs to.
- `type`: The user's role (default is 'user').
- Primary Key: `id`
- Foreign Key: `planet_id` references `planets(id)`

#### planets
This table contains the names of all galactic planets:
- `id`: A unique ID for each planet.
- `name`: The name of the planet.
- Primary Key: `id`

### orders
The records of orders are stored here:
- `id`: A unique ID for each order.
- `user_id`: The ID of the user who made the order.
- `paid`: Whether the order is paid (1 for yes, 0 for no).
- `date_paid`: The date when the order was paid.
- `status`: The status of the order (default is 'pending').
- `shipping_method`: The chosen shipping method.
- `shipping_cost`: The cost of shipping.
- Primary Key: `id`
- Foreign Key: `user_id` references `users(id)`

#### orders_details
Detailed information about order items is recorded here:
- `id`: A unique ID for each detail.
- `order_id`: The ID of the order this detail belongs to.
- `vehicle_id`: The ID of the vehicle in this detail.
- `quantity`: The quantity of the vehicle.
- `unit_price`: The price per unit of the vehicle.
- Primary Key: `id`
- Foreign Key: 
  - `order_id` references `orders(id)`
  - `vehicle_id` references `vehicles(id)`


### Favicon - `static/favicon`
In this directory you will find the .ico and .png files necessary for the correct display of the KDY favicon.


### Icons Images - `static/images`
Here are the images that are used on the page as icons.


### Vehicles Images - `static/images/vehicles`
These are the images of the vehicles in webp format. The name of the image represents the ID of the corresponding vehicle.


### JavaScript - `static/script.js`
This file contains JavaScript code responsible for various functionalities on different pages of the application. Below is an overview of the major functionalities and sections of the code:

#### Update Mini Cart Function
The `updateMiniCart` function is responsible for updating the number of items in the cart displayed on the UI. It dynamically adjusts the cart number based on the number of items in the cart.

#### Initialization on All Pages
This section initializes various functionalities when the DOM content is loaded. It includes:

- **Updating Mini Cart:** Calls the `updateMiniCart` function to display the correct cart count.

- **Bootstrap Validation Style:** Adds custom validation styles to forms using Bootstrap's validation classes. It prevents form submission if validation fails.

#### Autocomplete Search Bar (For Standard Users Only)

This section provides autocomplete functionality for the search bar based on screen size. It includes:

- **Autocomplete Setup:** Sets up variables and functions for handling autocomplete behavior.

- **Autocomplete Logic:** Listens for input in the search bar, fetches vehicle names that match the input using AJAX, and displays the results as autocomplete suggestions.

- **Resizing Autocomplete:** Adjusts the position and size of the autocomplete dropdown based on the screen size.

- **Navbar Collapse:** Hides/shows autocomplete based on the navbar collapse state.

#### Register Form Validation
This section handles form validation for the registration page. It includes:

- **Form Setup:** Sets up variables and regular expression patterns for validation.

- **Form Submission:** Validates various form inputs (username, password, planet, etc.) and prevents form submission if validation fails.

- **Input Listeners:** Listens for input changes and updates validation status and error messages accordingly.

#### Login Form Validation
This section handles form validation for the login page. It includes similar logic to the register form validation, validating and updating input fields as the user interacts with the form.

#### Profile Form
This section handles profile form functionality on the profile page. It includes:

- **Personal Info:** Handles changing and saving personal information, including input validation and user feedback.

- **Password Change:** Handles changing the user's password with input validation and feedback.

- **Address Change:** Handles changing the user's address with input validation and feedback.

#### Admin Page
This part of the script handles the functionality on the admin page (`/admin`). It focuses on pagination and dynamically updating the orders table. Key functionalities include:

- **Pagination Control**: The script calculates the number of pages needed to display a list of orders and provides "previous" and "next" buttons to navigate through the pages. The number of orders displayed per page is configurable with the `maxRows` variable.
 
- **Order Display**: Orders are displayed in a table format. The script dynamically generates rows for each order and assigns CSS classes based on the order status (e.g., "pending," "shipped," "delivered," or "other").

- **Order Details**: Users can click on a row to view detailed information about an order. The script handles this click event and redirects the user to a detailed order view.

#### Orders History Page
This section is responsible for enhancing the behavior on the orders history page (`/history`). Notable features include:

- **Responsive Image Display**: The script ensures that images within order cards fit within the height of each card. It calculates the appropriate height based on the card's other content and adjusts image heights accordingly.

- **Window Resize Handling**: To maintain responsive design, the script adjusts the image heights dynamically whenever the window is resized.

#### Shopping Cart Page
This section enhances the shopping cart functionality on the shopping cart page (`/cart`) providing several functionalities:

- **Quantity Adjustment**: Users can increase or decrease the quantity of items in their cart using the quantity adjustment buttons.

- **Shipping Method Selection**: Users can choose between different shipping methods, each with its associated cost. The script dynamically updates the shipping costs and recalculates the cart total accordingly.
Cart Total Calculation: The script calculates the total cost of the items in the cart, considering the quantities and selected shipping method.

- **Form Submission Handling**: The script handles form submissions, including validation of user inputs, such as quantity values and selected shipping methods.

- **Unsaved Changes Alert**: If the user attempts to leave the page with unsaved changes, the script displays an alert to confirm the action and prevent accidental data loss.

#### Users Search Page
This part enhances the user search functionality on the users administration page (`/admin/users`):

- **Autocomplete Suggestions**: As users type in the search input field, the script fetches usernames that match the input and displays autocomplete suggestions in a dropdown list.

- **Username Selection**: Users can click on a username suggestion to populate the input field and initiate a search for that username.

- **Password Change Validation**: If user selects a password change, it verify that the new password meets the requirements and matches their confirmation.


### CSS - `/static/styles.css`
The `style.css` file contains custom styling rules for the user interface of the web application, among which are the following functionalities:
- Defines global color variables for consistent styling.
- Applies styles to navigation elements and cart icons.
- Styles home page carousel, cards, and drop-down menus.
- Define the style of forms, containers, alerts and autocomplete.
- Customize the appearance of tables and pagination controls.
- Create styles for order and user cards.
- Implement responsive design with media queries.


### Administrator Order Details - `templates/admin/order.html`
This template is specifically designed for administrator users to view and manage order details:

- **Main Content:**
  - Shows the current order status, payment details, and customer information.
  - Lists the ordered vehicles, their quantities, unit prices, and total costs.
  - Presents the selected shipping method and associated cost.
  - Calculates and displays the total order cost.
- **Status Modification:** Provides options to update order status:
  - "Set as shipped" option for pending orders.
  - "Set as delivered" option for orders marked as shipped.
  - "Cancel order" option to initiate order cancellation.
- **Cancellation Confirmation Modal:** Confirms order cancellation if applicable.


### User Search Results - `templates/admin/users-search.html`
This template is designed for administrators to view dynamic search results for users using JSON data. It supports autocomplete functionality, enhancing the user search experience.

### About Us and Terms - `about-us.html`
This template includes two sections:

- **About Us**:
Highlights the company's history, mission, and dedication to crafting spacecraft.

- **Terms and Conditions**:
Outlines user obligations, including account creation, pricing, orders, shipping, returns, and intellectual property rights. Users must agree to these terms before registering.

### Administrator Dashboard - `templates/admin.html`
This template is designed specifically for administrators to access a comprehensive overview of recent sales and orders. It dynamically populates the table with order details fetched from the backend.

- Sales Overview Cards:
    - **Number of Sales**:
     Displays the total number of sales made on the platform. This count is dynamically fetched from the backend using the orders variable.
    - **Amount of Sales**:
     Displays the cumulative amount of sales made on the platform. The amount is formatted to include thousands separators for better readability.
    - **Best Selling Product**:
     Shows the name of the best selling product based on recent sales.

- Recent Orders Table:
    - **Table Structure**: Presents an organized table listing recent orders with the following columns: Order #, Username, First Name, Last Name, City, Planet, Total Price, Date Paid, and Status.
    - **Pagination**: Offers a user-friendly interface with pagination controls to navigate through orders efficiently.

### Shopping Cart - `templates/cart.html`
This template is designed to display the user's shopping cart contents and facilitate the checkout process:

- **Cart Overview:**
  - Lists selected vehicles, their images, names, unit prices, quantities, and total prices.
  - Provides a visual representation of the cart's contents.

- **Quantity Adjustment:**
  - Allows users to adjust the quantity of each vehicle using "+" and "-" buttons.
  - Ensures input validation for quantities.

- **Shipping Options:**
  - Offers two shipping methods with associated costs: "Hyperspace Express Delivery" and "Galactic Cargo Service."

- **Grand Total:**
  - Calculates and displays the total cost of the cart, including selected shipping.
  
- **Continue Shopping and Checkout Buttons:**
  - Enables users to return to browsing vehicles or proceed to checkout.

- **Empty Cart Message:**
  - Displays a message when the cart is empty, encouraging users to explore available vehicles.

### Checkout - `templates/checkout.html`

This template facilitates the checkout process for users:

- **Shipping Address:**
  - Displays the selected shipping address, including address, city, ZIP code, and planet.
  - Provides a link to the user's profile for address modification.

- **Order Total:**
  - Displays the total cost of the order, including selected vehicles and shipping.

- **Payment Form:**
  - Provides fields for credit card information: credit card number, expiration date, CVC, and cardholder's name.
  - Performs input validation and provides feedback on invalid entries.
  - Offers a "Place Order" button to initiate the payment process.

### Orders History - `templates/history.html`

This template displays the orders history of the user:

- **Orders Display:**
  - Lists all orders made by the user.
  - Each order is displayed in a card with the order number, date paid, and status.
  - For each order, it lists the ordered vehicles, including quantity, vehicle name, unit price, and total price.
  - Also shows the selected shipping method and its associated cost.
  - Displays the grand total of each order.

- **No Orders:**
  - If the user has no orders, it shows an alert indicating that no orders have been placed yet.

### Home Page - `templates/index.html`

This template displays the home page:

- Displays a welcoming message.
- Features a carousel showcasing best-selling vehicles.
- Allows users to add vehicles to their cart.

### Base Layout - `templates/layout.html`

This template serves as the base layout for all pages:

- Includes Bootstrap 5.3.0 for styling.
- Integrates variables, scripts, and JavaScript.
- Features a responsive navigation bar with user-specific options.
- Displays flashed messages for error, warning, and success.
- Provides a consistent header, main content, and footer structure.

It creates a unified design and structure for the entire website, ensuring a seamless user experience and easy navigation.

### Login Page - `templates/login.html`

This template represents the login page where users can enter their credentials and log in to their accounts:

- Displays a form for users to log in.
- Includes form validation for username and password fields.
- Provides a link for new users to register instead.

### Profile - `templates/profile.html`

This template provides the profile page's interface, allowing users to manage personal information, change passwords, and update shipping addresses.

- **Personal Info**: Users can edit their first and last names.

- **Password**: Users can change their password with complexity rules.

- **Shipping Address**: Users update their address and planet selection.

JavaScript-based validation ensures accurate input.

#### Form Submission
Each section has a "Save changes" button, submitting data to `/profile` in `app.py` for processing and database update.

### Register - `templates/register.html`

This template provides the registration page for new users, allowing them to sign up for the platform.

- **User Information**: Users input their first name, last name, username, and password. Password complexity rules are provided.

- **Shipping Address**: Users provide their address, city, ZIP code, and select a planet.

- **Terms and Conditions**: Users can agree to the terms and conditions.

- **Submit**: Users can register after completing the form.

The form uses JavaScript for input validation and submits data to `/register` in `app.py` for user registration.

### Vehicle Detail - `templates/vehicle-detail.html`

This template provides detailed information about a specific vehicle, including its name, category, price, length, armament, role, and description.

- **Vehicle Details**: The template dynamically populates details about the vehicle based on the data provided by the server.

- **Add to Cart**: Users can add the vehicle to their cart using a button. The form submits data to `/add-to-cart` in `app.py`.


### Vehicle Search Suggestions - templates/vehicles-search.html
This template powers AJAX-driven search suggestions for the vehicle search bar located on the navbar. It offers real-time search results as users type, enhancing the search speed and effectiveness. 

### Vehicles Catalog - `templates/vehicles.html`

This template displays a catalog of vehicles obtained from a user search. The vehicles are presented in a responsive grid layout, each showcased within a card format. The card includes the following information:

- Thumbnail image of the vehicle
- Vehicle name, linked to additional details
- Price in currency (₵)
- "Add to cart" button for direct purchasing

The layout dynamically adjusts for various screen sizes, ensuring a user-friendly browsing experience. If the search yields no results, a message encourages users to explore the complete vehicle collection.


## Acknowledgements

Made by Juan De Luca for [CS50X 2023](https://cs50.harvard.edu/x/2023) Final Project

