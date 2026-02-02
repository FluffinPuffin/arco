// Checkout Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    
    // Radio Button Selection
    const radioButtons = document.querySelectorAll('.radio-button');
    
    radioButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            radioButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update order summary based on selected plan
            updateOrderSummary(this.dataset.plan);
        });
    });
    
    // Toggle Switch for Auto Renewal
    const toggleSwitch = document.getElementById('autoRenewalToggle');
    let autoRenewalEnabled = true;
    
    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', function() {
            autoRenewalEnabled = !autoRenewalEnabled;
            this.classList.toggle('active');
            console.log('Auto Renewal:', autoRenewalEnabled ? 'Enabled' : 'Disabled');
        });
    }
    
    // Update Order Summary
    function updateOrderSummary(plan) {
        const summaryTitle = document.querySelector('.summary-title');
        const summarySubtitle = document.querySelector('.summary-subtitle');
        const summaryPrice = document.querySelector('.summary-price');
        const payButton = document.getElementById('payButton');
        
        let planDetails = {
            '1-month': {
                title: '1 Month',
                subtitle: 'Jan \'24 - Feb \'24',
                price: '$4.99 USD'
            },
            '3-month': {
                title: '3 Months',
                subtitle: 'Jan \'24 - Apr \'24',
                price: '$11.25 USD'
            },
            '12-month': {
                title: '12 Months',
                subtitle: 'Jan \'24 - Jan \'25',
                price: '$29.99 USD'
            }
        };
        
        if (planDetails[plan]) {
            summaryTitle.textContent = planDetails[plan].title;
            summarySubtitle.textContent = planDetails[plan].subtitle;
            summaryPrice.textContent = planDetails[plan].price;
            
            // Update pay button
            const priceMatch = planDetails[plan].price.match(/\$[\d.]+/);
            if (priceMatch && payButton) {
                payButton.querySelector('span').textContent = `Pay ${priceMatch[0]}`;
            }
        }
    }
    
    // Form Validation and Submission
    const payButton = document.getElementById('payButton');
    
    if (payButton) {
        payButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get form values
            const email = document.getElementById('email').value;
            const cardName = document.querySelector('input[name="cardName"]').value;
            const cardNumber = document.querySelector('input[name="cardNumber"]').value;
            const expiry = document.querySelector('input[name="expiry"]').value;
            const cvc = document.querySelector('input[name="cvc"]').value;
            const address = document.querySelector('input[name="address"]').value;
            const state = document.querySelector('input[name="state"]').value;
            const zipCode = document.querySelector('input[name="zipCode"]').value;
            
            // Basic validation
            if (!email || !cardName || !cardNumber || !expiry || !cvc || !address || !state || !zipCode) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Get selected plan
            const selectedPlan = document.querySelector('.radio-button.active');
            if (!selectedPlan) {
                alert('Please select a subscription plan.');
                return;
            }
            
            // Show loading overlay
            const loadingOverlay = document.getElementById('loadingOverlay');
            const successOverlay = document.getElementById('successOverlay');
            const errorOverlay = document.getElementById('errorOverlay');
            
            loadingOverlay.classList.remove('hidden');
            
            // Simulate payment processing
            console.log('Processing payment...');
            console.log({
                plan: selectedPlan.dataset.plan,
                email: email,
                autoRenewal: autoRenewalEnabled,
                cardName: cardName,
                address: address,
                state: state,
                zipCode: zipCode
            });
            
            // Simulate API call with random success/failure
            setTimeout(() => {
                // Hide loading overlay
                loadingOverlay.classList.add('hidden');
                
                // Simulate random success or failure (80% success rate)
                const isSuccess = Math.random() > 0.2;
                
                if (isSuccess) {
                    // Show success overlay
                    successOverlay.classList.remove('hidden');
                    
                    // Update countdown message
                    const successMessage = document.getElementById('successMessage');
                    let secondsRemaining = 5;
                    
                    // Update message immediately
                    successMessage.textContent = `Receipt sent to Email Address. Redirecting to Home Page in (${secondsRemaining}) seconds`;
                    
                    // Start countdown
                    const countdownInterval = setInterval(() => {
                        secondsRemaining--;
                        if (secondsRemaining > 0) {
                            successMessage.textContent = `Receipt sent to Email Address. Redirecting to Home Page in (${secondsRemaining}) seconds`;
                        } else {
                            clearInterval(countdownInterval);
                        }
                    }, 1000);
                    
                    // Redirect to Home page after 5 seconds
                    setTimeout(() => {
                        window.location.href = '../../Home/html/index.html';
                    }, 5000);
                } else {
                    // Show error overlay
                    errorOverlay.classList.remove('hidden');
                    
                    // Reload checkout page after 5 seconds
                    setTimeout(() => {
                        window.location.reload();
                    }, 5000);
                }
            }, 2000);
        });
    }
    
    // Format card number input (add spaces every 4 digits)
    const cardNumberInput = document.querySelector('input[name="cardNumber"]');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Format expiry date (MM/YY)
    const expiryInput = document.querySelector('input[name="expiry"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVC input - numbers only
    const cvcInput = document.querySelector('input[name="cvc"]');
    if (cvcInput) {
        cvcInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Exit/Cancel Button - Navigate back to Premier Club with confirmation
    const exitButton = document.getElementById('exitButton');
    if (exitButton) {
        exitButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const confirmExit = confirm('Are you sure you want to exit? Your progress will not be saved.');
            
            if (confirmExit) {
                // Navigate back to Premier Club page
                window.location.href = '../../Premier-Club/html/index.html';
            }
        });
    }
    
});
