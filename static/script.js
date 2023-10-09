function updateMiniCart() {

    if (typeof itemsInCart != 'undefined') {
        // Select number of items in cart
        const cartNumbers = document.querySelectorAll('.cart-number');
        const cartNumberLg = document.querySelector('#cart-number-lg');
        const cartNumberMd = document.querySelector('#cart-number-md');

        // Change number of items inside cart and remove any added class
        cartNumbers.forEach(cartNumber => {
            cartNumber.innerHTML = itemsInCart;
            cartNumber.className = 'cart-number';
        });

        // If more than 9 items in cart: resize
        if (itemsInCart < 10) {
            cartNumberLg.classList.add('cart-number-1d');
            cartNumberMd.classList.add('cart-number-md-1d');
        }

        else if (itemsInCart < 100) {
            cartNumberLg.classList.add('cart-number-2d');
            cartNumberMd.classList.add('cart-number-md-2d');
        }

        else if (itemsInCart < 1000) {
            cartNumberLg.classList.add('cart-number-3d');
            cartNumberMd.classList.add('cart-number-md-3d');
        }

        else {
            cartNumberLg.innerHTML = '999+';
            cartNumberLg.classList.add('cart-number-4d');
            cartNumberMd.innerHTML = '99+';
            cartNumberMd.classList.add('cart-number-md-3d');
        }
    }
}

// ALL PAGES
document.addEventListener('DOMContentLoaded', () => {

    updateMiniCart();

    // Bootstrap validation style
    (() => {
        'use strict'

        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        const forms = document.querySelectorAll('.needs-validation');

        // Loop over them and prevent submission
        Array.from(forms).forEach(form => {
            form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add('was-validated');
            }, false)
        })
    })()
});

// Only standard users
if (userType && userType != 'admin') {
    document.addEventListener('DOMContentLoaded', () => {

        // AUTOCOMPLETE SEARCH BAR
        const navbarCollapse = document.querySelector('#navbarSupportedContent');
        const searchInputLg = document.querySelector('#vehicle-search-lg');
        const searchInputMd = document.querySelector('#vehicle-search-md');
        const autocompleteLg = document.querySelector('#autocomplete-lg');
        const autocompleteMd = document.querySelector('#autocomplete-md');

        // Set size and position of autocomplete DIV relative to search bar
        function resizeAutocomplete() {

            // LG and bigger screens
            if (window.innerWidth > 991) {

                // Set the autocomplete DIV with same width of search bar
                autocompleteLg.style.width = searchInputLg.offsetWidth + 'px';

                // Position autocomplete DIV just under search bar
                autocompleteLg.style.left = searchInputLg.getBoundingClientRect().left + 'px';
                autocompleteLg.style.top = (searchInputLg.getBoundingClientRect().top + searchInputLg.offsetHeight) + 'px';

                autocompleteMd.classList.add('d-none');
                autocompleteLg.classList.remove('d-none');
            }

            // MD and smaller screens
            else {

                // Set the autocomplete DIV with same width of search bar
                autocompleteMd.style.width = searchInputMd.offsetWidth + 'px';

                // Position autocomplete DIV just under search bar
                autocompleteMd.style.left = (searchInputMd.getBoundingClientRect().left + window.scrollX) + 'px';
                autocompleteMd.style.top = (searchInputMd.getBoundingClientRect().top + searchInputMd.offsetHeight + window.scrollY) + 'px';

                // Hide autocomplete for LG screens and show it for MD screens
                autocompleteLg.classList.add('d-none');
                autocompleteMd.classList.remove('d-none');

                // If navbar is hidden 
                if (!navbarCollapse.classList.contains('show')) {
                    autocompleteMd.classList.add('d-none');
                }

                // If navbar is not hidden
                else {
                    autocompleteMd.classList.remove('d-none');
                }
            }
        }


        // Listen for input LG and bigger screens
        searchInputLg.addEventListener('input', async function () {

            // Copy input to MD search bar
            searchInputMd.value = this.value;

            // Use AJAX for geting vehicles names that matches input
            let response = await fetch('/vehicles-search?q=' + searchInputLg.value);
            let vehicles = await response.json();

            let html = '';

            // Iterate within every item in vehicles
            for (let i in vehicles) {
                let name = vehicles[i].name;
                // Nest each name inside a DIV and add to html variable
                html += '<div class="list-group-item list-group-item-action autocomplete-vehicle">' + name + '</div>';
            }

            // Add vehicles to DIV
            autocompleteLg.innerHTML = html;
            let autocompleteVehicles = document.querySelectorAll('.autocomplete-vehicle');

            // Set size of autocomplete DIV
            resizeAutocomplete();

            // Autocomplete input when click on vehicle
            autocompleteVehicles.forEach(vehicle => {
                vehicle.addEventListener('click', () => {
                    window.location.href = '/vehicles/?name=' + encodeURIComponent(vehicle.innerHTML);
                })
            });
        });

        // Listen for input MD and smaller screens
        searchInputMd.addEventListener('input', async function () {

            // Copy input to LG search bar
            searchInputLg.value = this.value;

            // Use AJAX for geting vehicles names that matches input
            let response = await fetch('/vehicles-search?q=' + searchInputMd.value);
            let vehicles = await response.json();

            let html = '';

            // Iterate within every item in vehicles
            for (let i in vehicles) {
                let name = vehicles[i].name;
                // Nest each name inside a DIV and add to html variable
                html += '<div class="list-group-item list-group-item-action autocomplete-vehicle">' + name + '</div>';
            }

            // Add vehicles to DIV
            autocompleteMd.innerHTML = html;
            let autocompleteVehicles = document.querySelectorAll('.autocomplete-vehicle');

            // Set size of autocomplete DIV
            resizeAutocomplete();

            // Autocomplete input when click on vehicle
            autocompleteVehicles.forEach(vehicle => {
                vehicle.addEventListener('click', () => {
                    window.location.href = '/vehicles/?name=' + encodeURIComponent(vehicle.innerHTML);
                })
            });
        });


        // Resize autocomplete on window width change
        window.addEventListener('resize', resizeAutocomplete);

        // Hide/show autocomplete on navbar collapse
        document.querySelector('.navbar-toggler').addEventListener('click', () => {
            resizeAutocomplete();
        })
    })
}


// REGISTER FORM 
if (window.location.pathname === '/register') {
    document.addEventListener('DOMContentLoaded', () => {

        const username = document.querySelector('#register-username');
        const userNameFeedback = document.querySelector('#invalid-username-feedback');
        const password = document.querySelector('#register-password');
        const pConf = document.querySelector('#register-password-conf');
        const usernamePattern = /^[a-zA-Z0-9_.-]{4,20}$/;
        const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d).{8,30}$/;
        const planet = document.querySelector('#register-planet');
        const terms = document.querySelector('#register-terms');
        const form = document.querySelector('#register-form');
        const passwordConfFeedback = document.querySelector('#invalid-password-conf-feedback');
        const inputs = form.querySelectorAll('input, select');

        form.addEventListener('submit', event => {

            // If inputs are empty mark as invalid else as valid
            inputs.forEach(input => {

                if (!input.value) {
                    input.classList.remove('is-valid');
                    input.classList.add('is-invalid');
                    event.preventDefault();
                    event.stopPropagation();
                }

                else {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                }
            });

            // Username is invalid
            if (!usernamePattern.test(username.value) && username.value) {
                username.classList.remove('is-valid');
                username.classList.add('is-invalid');
                userNameFeedback.innerHTML = 'Your username should be 4-20 characters long and can include letters, underscores (_), periods (.), and hyphens (-). No special characters or spaces allowed.';
                event.preventDefault();
                event.stopPropagation();
            }

            // Password is invalid
            if (!passwordPattern.test(password.value)) {
                password.classList.remove('is-valid');
                password.classList.add('is-invalid');
                event.preventDefault();
                event.stopPropagation();
            }

            // Passwords don't match
            if (password.value != pConf.value) {
                pConf.classList.remove('is-valid');
                pConf.classList.add('is-invalid');
                event.preventDefault();
                event.stopPropagation();
                passwordConfFeedback.innerHTML = 'Passwords do not match.';
            }

            // Not planet selction
            if (planet.value == 'Select one') {
                planet.classList.remove('is-valid');
                planet.classList.add('is-invalid');
                event.preventDefault();
                event.stopPropagation();
            }
            else {
                planet.classList.remove('is-invalid');
                planet.classList.add('is-valid');
            }

            // Not agree of terms and conditions
            if (!terms.checked) {
                terms.classList.remove('is-valid');
                terms.classList.add('is-invalid');
                event.preventDefault();
                event.stopPropagation();
            }

            // If first submission fails listen for input
            inputs.forEach(input => {
                input.addEventListener('input', () => {

                    // No input
                    if (!input.value) {
                        input.classList.remove('is-valid');
                        input.classList.add('is-invalid');
                    }

                    else {
                        input.classList.remove('is-invalid');
                        input.classList.add('is-valid');
                    }

                    // Username
                    if (input.id == 'register-username') {

                        // No username
                        if (!input.value) {
                            userNameFeedback.innerHTML = 'Please choose a username.';
                        }

                        // Username invalid
                        else if (!usernamePattern.test(input.value)) {
                            username.classList.remove('is-valid');
                            username.classList.add('is-invalid');
                            userNameFeedback.innerHTML = 'Your username should be 4-20 characters long and can include letters, underscores (_), periods (.), and hyphens (-). No special characters or spaces allowed.';
                        }
                    }

                    // Password
                    if (input.id == 'register-password') {

                        // Password invalid
                        if (!passwordPattern.test(input.value) && input.value) {
                            input.classList.remove('is-valid');
                            input.classList.add('is-invalid');
                        }

                        // Passwords don´t match
                        if (input.value != pConf.value) {
                            pConf.classList.remove('is-valid');
                            pConf.classList.add('is-invalid');
                            passwordConfFeedback.innerHTML = 'Passwords do not match.';
                        }

                        // Passwords match
                        else if (input.value === pConf.value) {
                            pConf.classList.remove('is-invalid');
                            pConf.classList.add('is-valid');
                        }
                    }

                    // Password confirmation
                    if (input.id == 'register-password-conf') {

                        // No password confirmation
                        if (!input.value) {
                            userNameFeedback.innerHTML = 'Please re-enter password.';
                        }

                        // Passwords don´t match
                        else if (input.value != password.value) {
                            input.classList.remove('is-valid');
                            input.classList.add('is-invalid');
                            passwordConfFeedback.innerHTML = 'Passwords do not match.';
                        }
                    }

                    // Not agree of terms and conditions
                    if (input.id == 'register-terms' && !input.checked) {
                        input.classList.remove('is-valid');
                        input.classList.add('is-invalid');
                    }
                })
            });
        });
    })
}


// LOGIN FORM VALIDATION
if (window.location.pathname === '/login') {
    document.addEventListener('DOMContentLoaded', () => {

        const form = document.querySelector('#login-form');
        const inputs = form.querySelectorAll('input');

        form.addEventListener('submit', event => {

            // If inputs are empty mark as invalid else as valid
            inputs.forEach(input => {

                if (!input.value) {
                    input.classList.add('is-invalid');
                    event.preventDefault();
                    event.stopPropagation();
                }

                else {
                    input.classList.remove('is-invalid');
                }
            });

            // If first submission fails listen for input
            inputs.forEach(input => {
                input.addEventListener('input', () => {

                    // No input
                    if (!input.value) {
                        input.classList.add('is-invalid');
                    }

                    else {
                        input.classList.remove('is-invalid');
                    }

                })
            });
        });
    })
}

// PROFILE FORM
if (window.location.pathname === '/profile') {
    document.addEventListener('DOMContentLoaded', () => {

        // Global variables
        const fieldests = document.querySelectorAll('fieldset');

        // Personal info variables
        const firstName = document.querySelector('#first-name');
        const lastName = document.querySelector('#last-name');
        const firstNameValue = firstName.value;
        const lastNameValue = lastName.value;
        const pInfoForm = document.querySelector('#pinfo-form');
        const pInfoFieldset = document.querySelector('#pinfo-fieldset');
        const pInfoChangeBtn = document.querySelector('#pinfo-change');
        const pInfoInputs = pInfoForm.querySelectorAll('input');
        const savePInfo = document.querySelector('#save-pinfo');

        // Password variables
        const passwordForm = document.querySelector('#password-form');
        const passwordFieldset = document.querySelector('#password-fieldset');
        const passwordChangeBtn = document.querySelector('#password-change');
        const passwordInputs = passwordForm.querySelectorAll('input');
        const newPassword = document.querySelector('#new-password');
        const passwordConf = document.querySelector('#password-conf');
        const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d).{8,30}$/;
        const passwordConfFeedback = document.querySelector('#invalid-password-conf-feedback');

        // Address variables
        const address = document.querySelector('#address');
        const city = document.querySelector('#city')
        const zip = document.querySelector('#zip');
        const planet = document.querySelector('#planet');
        const addressValue = address.value;
        const cityValue = city.value;
        const zipValue = zip.value;
        const planetValue = planet.value;
        const addressForm = document.querySelector('#address-form');
        const addressFieldset = document.querySelector('#address-fieldset');
        const addressChangeBtn = document.querySelector('#address-change');
        const addressInputs = addressForm.querySelectorAll('input, select');
        const saveAddress = document.querySelector('#save-address');

        // Personal info change button function
        function changePInfo() {

            // Click change button
            if (pInfoFieldset.disabled) {

                // Disable other forms
                fieldests.forEach(fieldset => {
                    if (!fieldset.disabled) {
                        if (fieldset.id == 'password-fieldset') {
                            changePassword();
                        }
                        else if (fieldset.id == 'address-fieldset') {
                            changeAddress();
                        }
                    }
                });
                pInfoFieldset.removeAttribute('disabled', '');
                pInfoChangeBtn.innerHTML = 'Cancel';
                pInfoChangeBtn.classList.remove('btn-outline-dark');
                pInfoChangeBtn.classList.add('btn-outline-danger');
                savePInfo.classList.remove('d-none');
            }

            // Click cancel button
            else {
                firstName.value = firstNameValue;
                lastName.value = lastNameValue;
                pInfoFieldset.setAttribute('disabled', '');
                pInfoChangeBtn.innerHTML = 'Change';
                pInfoChangeBtn.classList.remove('btn-outline-danger');
                pInfoChangeBtn.classList.add('btn-outline-dark');
                pInfoInputs.forEach(input => {
                    input.classList.remove('is-invalid');
                    input.classList.remove('is-valid');
                });
                savePInfo.classList.add('d-none');
            }
        }

        // Listen for click on change personal info button
        pInfoChangeBtn.addEventListener('click', changePInfo);

        // Personal info submit
        pInfoForm.addEventListener('submit', (event) => {

            // If inputs are empty mark as invalid else as valid
            pInfoInputs.forEach(input => {

                if (!input.value) {
                    input.classList.remove('is-valid');
                    input.classList.add('is-invalid');
                    event.preventDefault();
                    event.stopPropagation();
                }

                else {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                }
            });

            // If first submission fails listen for input
            pInfoInputs.forEach(input => {
                input.addEventListener('input', () => {

                    // No input
                    if (!input.value) {
                        input.classList.remove('is-valid');
                        input.classList.add('is-invalid');
                    }

                    else {
                        input.classList.remove('is-invalid');
                        input.classList.add('is-valid');
                    }

                })
            });
        });

        // Password change button function
        function changePassword() {

            // Click change button
            if (passwordFieldset.disabled) {

                // Disable other forms
                fieldests.forEach(fieldset => {

                    if (!fieldset.disabled) {

                        if (fieldset.id == 'pinfo-fieldset') {
                            changePInfo();
                        }

                        else if (fieldset.id == 'address-fieldset') {
                            changeAddress();
                        }
                    }
                });
                passwordFieldset.removeAttribute('disabled', '');
                passwordFieldset.classList.remove('d-none');
                passwordChangeBtn.innerHTML = 'Cancel';
                passwordChangeBtn.classList.remove('btn-outline-dark');
                passwordChangeBtn.classList.add('btn-outline-danger');
            }

            // Click cancel button
            else {
                passwordFieldset.setAttribute('disabled', '');
                passwordFieldset.classList.add('d-none');
                passwordChangeBtn.innerHTML = 'Change';
                passwordChangeBtn.classList.remove('btn-outline-danger');
                passwordChangeBtn.classList.add('btn-outline-dark');
                passwordInputs.forEach(input => {
                    input.value = '';
                    input.classList.remove('is-invalid');
                    input.classList.remove('is-valid');
                });

            }
        }

        // Listen for click on password change button
        passwordChangeBtn.addEventListener('click', changePassword);

        // Password submit
        passwordForm.addEventListener('submit', event => {

            // If inputs are empty mark as invalid else as valid
            passwordInputs.forEach(input => {

                if (!input.value) {
                    input.classList.remove('is-valid');
                    input.classList.add('is-invalid');
                    event.preventDefault();
                    event.stopPropagation();
                }

                else {
                    input.classList.remove('is-invalid');

                    if (input.id != 'current-password') {
                        input.classList.add('is-valid');
                    }
                }
            });

            // New password is invalid
            if (!passwordPattern.test(newPassword.value)) {
                newPassword.classList.remove('is-valid');
                newPassword.classList.add('is-invalid');
                event.preventDefault();
                event.stopPropagation();
            }

            // Passwords don't match
            if (newPassword.value != passwordConf.value) {
                passwordConf.classList.remove('is-valid');
                passwordConf.classList.add('is-invalid');
                event.preventDefault();
                event.stopPropagation();
                passwordConfFeedback.innerHTML = 'Passwords do not match.';
            }

            // If first submission fails listen for input
            passwordInputs.forEach(input => {
                input.addEventListener('input', () => {

                    // No input
                    if (!input.value) {
                        input.classList.remove('is-valid');
                        input.classList.add('is-invalid');
                    }

                    else {
                        input.classList.remove('is-invalid');

                        if (input.id != 'current-password') {
                            input.classList.add('is-valid');
                        }
                    }

                    // Password
                    if (input.id == 'new-password') {

                        // Password invalid
                        if (!passwordPattern.test(input.value) && input.value) {
                            input.classList.remove('is-valid');
                            input.classList.add('is-invalid');
                        }

                        // Passwords don´t match
                        if (input.value != passwordConf.value) {
                            passwordConf.classList.remove('is-valid');
                            passwordConf.classList.add('is-invalid');
                            passwordConfFeedback.innerHTML = 'Passwords do not match.';
                        }

                        // Passwords match
                        else if (input.value === passwordConf.value) {
                            passwordConf.classList.remove('is-invalid');
                            passwordConf.classList.add('is-valid');
                        }
                    }

                    // Password confirmation
                    if (input.id == 'password-conf') {

                        // No password confirmation
                        if (!input.value) {
                            userNameFeedback.innerHTML = 'Please re-enter password.';
                        }

                        // Passwords don´t match
                        else if (input.value != newPassword.value) {
                            input.classList.remove('is-valid');
                            input.classList.add('is-invalid');
                            passwordConfFeedback.innerHTML = 'Passwords do not match.';
                        }
                    }
                })
            });
        });

        // Address change button function
        function changeAddress() {

            // Click change button
            if (addressFieldset.disabled) {

                // Disable other forms
                fieldests.forEach(fieldset => {

                    if (!fieldset.disabled) {

                        if (fieldset.id == 'pinfo-fieldset') {
                            changePInfo();
                        }

                        else if (fieldset.id == 'password-fieldset') {
                            changePassword();
                        }
                    }
                });
                addressFieldset.removeAttribute('disabled', '');
                addressFieldset.classList.remove('d-none');
                addressChangeBtn.innerHTML = 'Cancel';
                addressChangeBtn.classList.remove('btn-outline-dark');
                addressChangeBtn.classList.add('btn-outline-danger');
                saveAddress.classList.remove('d-none');
            }

            // Click cancel button
            else {
                address.value = addressValue;
                city.value = cityValue;
                zip.value = zipValue;
                planet.value = planetValue;

                addressFieldset.setAttribute('disabled', '');
                addressChangeBtn.innerHTML = 'Change';
                addressChangeBtn.classList.remove('btn-outline-danger');
                addressChangeBtn.classList.add('btn-outline-dark');
                addressInputs.forEach(input => {
                    input.classList.remove('is-invalid');
                    input.classList.remove('is-valid');
                });
                saveAddress.classList.add('d-none');
            }
        }

        // Listen for click on address change button
        addressChangeBtn.addEventListener('click', changeAddress);

        // Shipping address submit
        addressForm.addEventListener('submit', event => {

            // If inputs are empty mark as invalid else as valid
            addressInputs.forEach(input => {

                if (!input.value) {
                    input.classList.remove('is-valid');
                    input.classList.add('is-invalid');
                    event.preventDefault();
                    event.stopPropagation();
                }

                else {
                    input.classList.remove('is-invalid');
                    input.classList.add('is-valid');
                }
            });

            // If first submission fails listen for input
            addressInputs.forEach(input => {
                input.addEventListener('input', () => {

                    // No input
                    if (!input.value) {
                        input.classList.remove('is-valid');
                        input.classList.add('is-invalid');
                    }

                    else {
                        input.classList.remove('is-invalid');
                        input.classList.add('is-valid');
                    }
                })
            });
        });
    })
}

// ADMIN
if (window.location.pathname === '/admin') {
    document.addEventListener('DOMContentLoaded', () => {

        const maxRows = 20;
        let pages = Math.ceil(orders.length / maxRows);

        if (pages > 9) {
            pages = 9;
        }

        const tablePagination = document.querySelector('#table-pagination');
        let page = 1;
        const table = document.querySelector('#orders-table');
        const tBody = table.querySelector('tbody');

        // '<<' '>>' pagination buttons
        const previousPage = document.querySelector('#previous-page');
        const nextPage = document.querySelector('#next-page');

        // Create orders table
        function createTable(page) {
            let firstOrder = (page * maxRows) - maxRows; // First order of current page

            // Clear table
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }

            // Itinerate within rows
            for (let i = 0; i < maxRows && firstOrder + i < orders.length; i++) {

                let order = orders[firstOrder + i];
                let row = tBody.insertRow(-1);

                if (order.status == 'pending') {
                    row.classList.add('table-warning');
                }

                else if (order.status == 'shipped') {
                    row.classList.add('table-primary');
                }

                else if (order.status == 'delivered') {
                    row.classList.add('table-success');
                }

                else {
                    row.classList.add('table-danger');
                }

                // Add order data to rows
                row.insertCell(0).innerHTML = order.order_id;
                row.insertCell(1).innerHTML = order.username;
                row.insertCell(2).innerHTML = order.name;
                row.insertCell(3).innerHTML = order.last_name;
                row.insertCell(4).innerHTML = order.city;
                row.insertCell(5).innerHTML = order.planet;
                row.insertCell(6).innerHTML = '₵' + new Intl.NumberFormat('en-US').format(order.total);
                row.cells[6].classList.add('text-end', 'font-monospace', 'money');
                row.insertCell(7).innerHTML = order.date_paid;
                row.insertCell(8).innerHTML = order.status;

                // Row click
                row.addEventListener("click", () => {
                    window.location.href = '/admin/order?id=' + encodeURIComponent(order.order_id);
                })
            }
        }

        function pageChange(newPage) {
            const pageItems = document.querySelectorAll('.page-item');

            // Mark current page as active
            pageItems.forEach(element => {

                if (element.firstChild.innerHTML == newPage) {
                    element.classList.add('active');
                }

                else {
                    element.classList.remove('active');
                }
            });

            // Disable '<<' if no previous page
            if (newPage > 1) {
                previousPage.classList.remove('disabled');
            }

            else {
                previousPage.classList.add('disabled');
            }

            // Disable '>>' if no next page
            if (newPage < pages) {
                nextPage.classList.remove('disabled');
            }

            else {
                nextPage.classList.add('disabled');
            }
            page = newPage;
            createTable(newPage);
        }
        createTable(page);

        // Add number of pages to pagination
        for (let j = 0; j < pages; j++) {
            const li = document.createElement("li");
            const a = document.createElement("a");
            const number = document.createTextNode(j + 1);

            a.appendChild(number);
            a.classList.add('page-link');
            a.href = "#";
            li.appendChild(a);
            li.classList.add('page-item');
            tablePagination.insertBefore(li, nextPage);

            // If first page mark as active
            if (j == 0) {
                li.classList.add('active');
            }

            // Pagination numbers on click
            a.addEventListener("click", () => {

                // Execute page change function
                pageChange(parseInt(a.innerHTML));
            })
        }

        // if more than one page enable '>>'
        if (pages > 1) {
            nextPage.classList.remove('disabled');
        }

        // Pagination '<<' button on click
        previousPage.addEventListener('click', () => {
            if (!previousPage.classList.contains('disabled')) {
                pageChange(page - 1);
            }
        })

        // Pagination '>>' button on click
        nextPage.addEventListener('click', () => {
            if (!nextPage.classList.contains('disabled')) {
                pageChange(page + 1);
            }
        })
    })
}


// ORDERS HISTORY
if (window.location.pathname === '/history') {
    document.addEventListener('DOMContentLoaded', () => {
        const ordersCards = document.querySelectorAll('.order-card');

        // Makes images fit on the height of card
        function setImagesHeight() {
            ordersCards.forEach(element => {
                const orderImages = element.querySelector('.order-images');
                const orderData = element.querySelector('.order-data');

                if ($(window).width() > 575) {
                    orderImages.style.height = orderData.offsetHeight + 'px';
                }

                else {
                    orderImages.style.height = 55 + 'VW';
                }
            })
        }
        window.addEventListener('resize', setImagesHeight);
        setImagesHeight();
    })
}


// SHOPPING CART
if (window.location.pathname === '/cart') {
    document.addEventListener('DOMContentLoaded', () => {

        // If cart is empty return
        if (itemsInCart < 1) {
            return;
        }

        const quantityLessBtns = document.querySelectorAll('.quantity-less');
        const quantityPlusBtns = document.querySelectorAll('.quantity-plus');
        const quantities = document.querySelectorAll('.vehicle-quantity');
        const lengths = document.querySelectorAll('input.vehicle-length');
        const shippingSelections = document.querySelectorAll('input[name="shipping-method"]');
        const expressShippingCost = document.querySelector('#express-shipping-cost');
        const cargoShippingCost = document.querySelector('#cargo-shipping-cost');
        const cartForm = document.querySelector('#cart-form');
        const cartBtns = document.querySelectorAll('.cart-btn');
        const quantityInputs = document.querySelectorAll('.vehicle-quantity');
        let unsavedCart = false;

        // Update quantities
        function updateQuantities() {
            let quantitiesSum = 0;

            // Sum total quantity of items
            quantities.forEach(element => {
                let quantity = parseInt(element.value)
                if (quantity > 0) {
                    quantitiesSum += parseInt(element.value);
                }

            });

            if (quantitiesSum < 0) {
                quantitiesSum = 0;
            }

            itemsInCart = quantitiesSum;

            // Updates mini cart
            updateMiniCart();
        }

        // Update grand total
        function updateGrandTotal() {
            const grandTotal = document.querySelector('#cart-total');
            const totals = document.querySelectorAll('.vehicle-total');
            let totalValue = 0;

            // Sum total of each vehicle
            totals.forEach(total => {
                totalValue += parseInt(total.innerHTML.replace(/,/g, ''));
            })

            // Update shipping cost
            updateShippingCost();

            // Get selected shipping element
            const shippingSelected = document.querySelector('#shipping-div input[name="shipping-method"]:checked');

            // Extract shipping value from selected element
            const shippingCost = parseInt(shippingSelected.parentElement.querySelector('.shipping-cost').innerHTML.replace(/,/g, ''));

            // Sum shipping cost
            totalValue += shippingCost;

            // Insert total value to grand total
            grandTotal.innerHTML = new Intl.NumberFormat('en-US').format(totalValue);
        }

        // Update totals values
        function updateTotals(element) {

            // Extract vehicle id number from element id
            const vehicle_id = element.id.match(/\d+/g)[0];

            const total = document.querySelector('#total-' + vehicle_id);
            let price = document.querySelector('#price-' + vehicle_id).innerHTML.replace(/,/g, '');
            let quantity = element.value;
            let totalValue = price * quantity;
            if (totalValue < 1) {
                totalValue = '';
            }

            // Set vehicle total as totalValue
            total.innerHTML = new Intl.NumberFormat('en-US').format(totalValue);

            // Update grand total
            updateGrandTotal();

            // Update quantities
            updateQuantities();

            // Set cart as unsaved for confirmation message
            unsavedCart = true;

        }

        // Update shipping cost
        function updateShippingCost() {

            // Sum length of all vehicles in cart
            totalLength = 0;
            for (let i = 0; i < lengths.length; i++) {
                totalLength += quantities[i].value * lengths[i].value;
            }

            // If length is positive set shipping costs
            if (totalLength >= 0) {
                expressShippingCost.innerHTML = new Intl.NumberFormat('en-US').format(Math.round(totalLength * 8 + 1200));
                cargoShippingCost.innerHTML = new Intl.NumberFormat('en-US').format(Math.round(totalLength * 5 + 600));
            }
        }

        // - button
        quantityLessBtns.forEach(element => {
            element.addEventListener('click', () => {
                let quantity = element.nextElementSibling;
                if (quantity.value > 1) {
                    quantity.value -= 1;
                }

                // Remove invalid warning
                if (quantity.value > 0 && quantity.value < 10000) {
                    quantity.classList.remove('is-invalid');
                }
                updateTotals(quantity);
            })
        });

        // + button
        quantityPlusBtns.forEach(element => {
            element.addEventListener('click', () => {
                let quantity = element.previousElementSibling;
                let value = parseInt(quantity.value);
                if (value < 9999) {
                    quantity.value = value + 1;
                }

                // Remove invalid warning
                if (quantity.value > 0 && quantity.value < 10000) {
                    quantity.classList.remove('is-invalid');
                }
                updateTotals(quantity);
            })
        });



        // When form submits (by delete button) set cart as saved
        cartForm.addEventListener('submit', () => {
            unsavedCart = false;
        })

        // Quantity inputs
        quantities.forEach(element => {

            // Execute updateTotals function when input changes
            element.addEventListener('input', () => {
                updateTotals(element);
            })

            // Prevent form submision when enter key is pressed
            element.addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            })
        });

        // Execute updateGrandTotal when page loads
        updateGrandTotal();

        // Shipping method radio buttons
        shippingSelections.forEach(() => {

            // Prevent form submision when enter key is pressed
            addEventListener('keydown', function (e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                }
            })

            // Execute updateGrandTotal when shipping selection changes
            addEventListener('change', () => {
                updateGrandTotal();

                // Set cart as unsaved for confirmation message
                unsavedCart = true;
            })
        })

        // Cart buttons (continue shopping - checkout)
        cartBtns.forEach(btn => {
            btn.addEventListener('click', () => {

                // If cart has unsaved changes submit form
                if (unsavedCart) {
                    let error = false;

                    // Check for invalid inputs in quantities
                    quantityInputs.forEach(input => {
                        let quantity = Number(input.value);

                        if (!quantity || !Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
                            input.classList.add('is-invalid')
                            error = true;
                            input.addEventListener('input', () => {

                                // Remove invalid warning
                                if (input.value > 0 && input.value < 10000) {
                                    input.classList.remove('is-invalid');
                                }
                            })
                        }
                    })

                    // If invalid input return
                    if (error) { return }

                    // Create hidden input for submit which button was clicked
                    let hInput = document.createElement('input');
                    hInput.type = 'hidden';
                    hInput.name = 'destination';
                    hInput.value = btn.innerHTML.toLowerCase();

                    // Append the input element to the form
                    cartForm.appendChild(hInput);

                    // Submit form
                    cartForm.submit();

                    // Set cart as saved
                    unsavedCart = false;
                }

                // If cart didn't change redirect
                else {

                    // Checkout
                    if (btn.innerHTML.toLowerCase() == 'checkout') {
                        window.location.href = "/checkout";
                    }

                    // Continue shopping
                    else {
                        window.location.href = "/vehicles";
                    }
                }
            })
        });

        // If cart has unsaved changes ask for confirmation before reloading or exit page
        window.addEventListener('beforeunload', (event) => {
            if (unsavedCart) {
                event.preventDefault();
                event.returnValue = 'Are you sure you want to leave? Changes made in the cart will be lost.';
            }
        });
    });
}

// USERS SEARCH
if (window.location.pathname === '/admin/users') {
    document.addEventListener('DOMContentLoaded', () => {

        // Usernames input field
        let input = document.querySelector('#search-user');

        // Create DIV element
        let autocomplete = document.createElement('div');
        autocomplete.classList.add('autocomplete-items', 'list-group', 'text-start', 'mt-1');

        // Append created DIV to input 
        input.parentNode.appendChild(autocomplete);

        // Listen for input
        input.addEventListener('input', async function () {

            // Use AJAX for geting usernames that matches input
            let response = await fetch('/admin/users-search?q=' + input.value);
            let users = await response.json();

            let html = '';

            // Iterate within every item in users
            for (let i in users) {
                let username = users[i].username;
                // Nest each username inside a DIV and add to html variable
                html += '<div class="list-group-item list-group-item-action autocomplete-username">' + username + '</div>';
            }


            // Add usernames to DIV
            autocomplete.innerHTML = html;
            let usernames = document.querySelectorAll('.autocomplete-username');

            // Autocomplete input when click on username
            usernames.forEach(username => {
                username.addEventListener('click', () => {
                    input.value = username.innerHTML;
                    autocomplete.innerHTML = "";
                    window.location.href = '/admin/users?q=' + username.innerHTML;

                })
            });
        });

        const form = document.querySelector('#password-change');

        // Only if form exist (an user is selected)
        if (form) {
            const inputs = form.querySelectorAll('input');
            const passwordPattern = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?\d).{8,30}$/;
            const password = document.querySelector('#new-password');
            const pConf = document.querySelector('#password-confirmation');

            // Password change validation
            form.addEventListener('submit', event => {

                // If inputs are empty mark as invalid else as valid
                inputs.forEach(input => {

                    if (!input.value) {
                        input.classList.add('is-invalid');
                        event.preventDefault();
                        event.stopPropagation();
                    }

                    else {
                        input.classList.remove('is-invalid');
                    }
                });

                // Password is invalid
                if (!passwordPattern.test(password.value)) {
                    password.classList.remove('is-valid');
                    password.classList.add('is-invalid');
                    event.preventDefault();
                    event.stopPropagation();
                }

                // Passwords don't match
                if (password.value != pConf.value) {
                    pConf.classList.remove('is-valid');
                    pConf.classList.add('is-invalid');
                    event.preventDefault();
                    event.stopPropagation();
                }

                // If first submission fails listen for input
                inputs.forEach(input => {
                    input.addEventListener('input', () => {

                        // No input
                        if (!input.value) {
                            input.classList.add('is-invalid');
                        }

                        else {
                            input.classList.remove('is-invalid');
                        }
                    });
                });
            });

        }
    });
}

