// Update Subscription Page JavaScript

document.addEventListener('DOMContentLoaded', async function () {

    // Redirect to login only if not authenticated (401)
    if (typeof ArcoAPI !== 'undefined') {
        try {
            await ArcoAPI.getProfile();
        } catch (err) {
            if (err.status === 401) {
                window.location.href = '/Login/html/index.html?redirect=/Checkout/html/updateSubscription.html';
                return;
            }
            console.error('Profile check failed with status', err.status, err.message);
        }
    }

    // -------------------------------------------------------------------------
    // Load current subscription plan
    // -------------------------------------------------------------------------

    // All available plan options
    const allPlans = {
        '1-month': {
            title: '1 Month',
            fullTitle: '1 Month • $4.99 USD',
            subtitle: 'From Jan 01 - Feb 01',
            price: '$4.99 USD',
            amount: '$4.99',
            dataAttr: '1-month',
            displayName: '1 Month Plan'
        },
        '3-month': {
            title: '3 Months',
            fullTitle: '3 Months • $11.25 USD',
            subtitle: 'From Jan 01 - Apr 01',
            price: '$11.25 USD',
            amount: '$11.25',
            dataAttr: '3-month',
            displayName: '3 Month Plan'
        },
        '12-month': {
            title: '12 Months',
            fullTitle: '12 Months • $29.99 USD',
            subtitle: "From Jan '25 - Jan '26",
            price: '$29.99 USD',
            amount: '$29.99',
            dataAttr: '12-month',
            displayName: '12 Month Plan'
        }
    };

    let currentUserPlan = '3-month'; // Default to 3-month

    async function loadCurrentPlan() {
        try {
            const currentPlanEl = document.getElementById('currentPlan');
            if (!currentPlanEl) {
                console.warn('Current plan element not found');
            }
            
            // Try to get current plan from localStorage
            try {
                const savedPlan = localStorage.getItem('arco-subscription-plan');
                if (savedPlan) {
                    if (currentPlanEl) {
                        currentPlanEl.textContent = savedPlan;
                    }
                    
                    // Determine the plan key from the display name
                    if (savedPlan.includes('1 Month') || savedPlan.includes('1-month')) {
                        currentUserPlan = '1-month';
                    } else if (savedPlan.includes('3 Month') || savedPlan.includes('3-month')) {
                        currentUserPlan = '3-month';
                    } else if (savedPlan.includes('12 Month') || savedPlan.includes('12-month')) {
                        currentUserPlan = '12-month';
                    } else {
                        console.warn('Could not parse plan from:', savedPlan);
                    }
                }
            } catch (storageErr) {
                console.warn('localStorage not available:', storageErr);
            }
            
            // Could also fetch from API here if available
            // if (typeof ArcoAPI !== 'undefined') {
            //     try {
            //         const profile = await ArcoAPI.getProfile();
            //         if (profile && profile.subscription) {
            //             if (currentPlanEl) {
            //                 currentPlanEl.textContent = profile.subscription;
            //             }
            //             // Parse and set currentUserPlan accordingly
            //             if (profile.subscription.includes('1 Month')) {
            //                 currentUserPlan = '1-month';
            //             } else if (profile.subscription.includes('3 Month')) {
            //                 currentUserPlan = '3-month';
            //             } else if (profile.subscription.includes('12 Month')) {
            //                 currentUserPlan = '12-month';
            //             }
            //         }
            //     } catch (apiErr) {
            //         console.warn('Failed to fetch plan from API:', apiErr);
            //     }
            // }

            // Update the cards based on current plan
            updateSubscriptionCards();
        } catch (err) {
            console.error('Failed to load current plan:', err);
            // Still try to update cards with default plan
            updateSubscriptionCards();
        }
    }

    function updateSubscriptionCards() {
        // Determine which two plans to show based on current plan
        let topPlan, bottomPlan;

        switch (currentUserPlan) {
            case '1-month':
                // If current is 1-month, show 3-month (top) and 12-month (bottom)
                topPlan = allPlans['3-month'];
                bottomPlan = allPlans['12-month'];
                break;
            case '3-month':
                // If current is 3-month, show 1-month (top) and 12-month (bottom)
                topPlan = allPlans['1-month'];
                bottomPlan = allPlans['12-month'];
                break;
            case '12-month':
                // If current is 12-month, show 1-month (top) and 3-month (bottom)
                topPlan = allPlans['1-month'];
                bottomPlan = allPlans['3-month'];
                break;
            default:
                // Fallback to 1-month and 12-month
                topPlan = allPlans['1-month'];
                bottomPlan = allPlans['12-month'];
        }

        // Update top card
        const topCard = document.querySelector('.subscription-card:first-of-type');
        if (topCard) {
            const topButton = topCard.querySelector('.radio-button');
            const topTitle = topCard.querySelector('.card-title');
            const topSubtitle = topCard.querySelector('.card-subtitle');
            
            if (topButton) {
                topButton.dataset.plan = topPlan.dataAttr;
                topButton.setAttribute('aria-label', `Select ${topPlan.title} Plan`);
            }
            if (topTitle) topTitle.textContent = topPlan.fullTitle;
            if (topSubtitle) topSubtitle.textContent = topPlan.subtitle;
        }

        // Update bottom card
        const bottomCard = document.querySelector('.subscription-card:last-of-type');
        if (bottomCard) {
            const bottomButton = bottomCard.querySelector('.radio-button');
            const bottomTitle = bottomCard.querySelector('.card-title');
            const bottomSubtitle = bottomCard.querySelector('.card-subtitle');
            
            if (bottomButton) {
                bottomButton.dataset.plan = bottomPlan.dataAttr;
                bottomButton.setAttribute('aria-label', `Select ${bottomPlan.title} Plan`);
            }
            if (bottomTitle) bottomTitle.textContent = bottomPlan.fullTitle;
            if (bottomSubtitle) bottomSubtitle.textContent = bottomPlan.subtitle;
        }

        // Remove all active classes first
        const allButtons = document.querySelectorAll('.radio-button');
        allButtons.forEach(btn => btn.classList.remove('active'));

        // Set first button as active
        const firstButton = document.querySelector('.radio-button');
        if (firstButton) {
            firstButton.classList.add('active');
        }

        // Update the order summary to reflect the default selected plan (top card)
        updateOrderSummary(topPlan.dataAttr);
    }

    // -------------------------------------------------------------------------
    // Plan selection - Use event delegation to avoid memory leaks
    // -------------------------------------------------------------------------

    const subscriptionOptions = document.querySelector('.subscription-options');
    if (subscriptionOptions) {
        subscriptionOptions.addEventListener('click', function(e) {
            // Find the closest radio button that was clicked
            const button = e.target.closest('.radio-button');
            if (!button) return;

            // Remove active from all buttons
            const allButtons = document.querySelectorAll('.radio-button');
            allButtons.forEach(btn => btn.classList.remove('active'));

            // Add active to clicked button
            button.classList.add('active');

            // Update order summary
            const plan = button.dataset.plan;
            if (plan) {
                updateOrderSummary(plan);
            }
        });
    }

    // Initialize after setting up event delegation
    loadCurrentPlan();

    function updateOrderSummary(plan) {
        // Validate plan exists
        if (!plan || !allPlans[plan]) {
            console.warn('Invalid plan:', plan);
            return;
        }

        const summaryTitle = document.getElementById('summaryTitle');
        const summarySubtitle = document.getElementById('summarySubtitle');
        const summaryPrice = document.getElementById('summaryPrice');
        const payButtonText = document.getElementById('payButtonText');

        // Check all elements exist before updating
        if (!summaryTitle || !summarySubtitle || !summaryPrice || !payButtonText) {
            console.warn('Order summary elements not found');
            return;
        }

        const planData = allPlans[plan];
        summaryTitle.textContent = planData.title;
        summarySubtitle.textContent = planData.subtitle;
        summaryPrice.textContent = planData.price;
        payButtonText.textContent = `Pay ${planData.amount}`;
    }

    // -------------------------------------------------------------------------
    // Auto-renewal toggle
    // -------------------------------------------------------------------------

    const autoRenewalToggle = document.getElementById('autoRenewalToggle');
    let autoRenewalEnabled = true;

    if (autoRenewalToggle) {
        autoRenewalToggle.addEventListener('click', function () {
            autoRenewalEnabled = !autoRenewalEnabled;
            this.classList.toggle('active');
        });
    }

    // -------------------------------------------------------------------------
    // Autofill toggle
    // -------------------------------------------------------------------------

    const autofillToggle = document.getElementById('autofillToggle');
    let autofillEnabled = false;

    if (autofillToggle) {
        autofillToggle.addEventListener('click', function () {
            autofillEnabled = !autofillEnabled;
            this.classList.toggle('active');
            
            if (autofillEnabled) {
                autofillCardDetails();
            } else {
                clearCardDetails();
            }
        });
    }

    function autofillCardDetails() {
        try {
            // Try to load saved card details from localStorage
            const savedEmail = localStorage.getItem('arco-email');
            const savedCardName = localStorage.getItem('arco-card-name');
            const savedCardNumber = localStorage.getItem('arco-card-number');
            const savedExpiry = localStorage.getItem('arco-card-expiry');
            const savedStreet = localStorage.getItem('arco-billing-street');
            const savedState = localStorage.getItem('arco-billing-state');
            const savedZip = localStorage.getItem('arco-billing-zip');

            // Populate fields if data exists and elements are present
            const emailEl = document.getElementById('email');
            const cardNameEl = document.getElementById('cardName');
            const cardNumberEl = document.getElementById('cardNumber');
            const expiryEl = document.getElementById('expiry');
            const streetEl = document.getElementById('street');
            const stateEl = document.getElementById('state');
            const zipEl = document.getElementById('zip');

            if (savedEmail && emailEl) emailEl.value = savedEmail;
            if (savedCardName && cardNameEl) cardNameEl.value = savedCardName;
            if (savedCardNumber && cardNumberEl) cardNumberEl.value = savedCardNumber;
            if (savedExpiry && expiryEl) expiryEl.value = savedExpiry;
            if (savedStreet && streetEl) streetEl.value = savedStreet;
            if (savedState && stateEl) stateEl.value = savedState;
            if (savedZip && zipEl) zipEl.value = savedZip;

            // Note: CVC is intentionally not saved or autofilled for security reasons
        } catch (err) {
            console.warn('Failed to autofill card details:', err);
        }
    }

    function clearCardDetails() {
        // Clear card detail fields
        const fields = ['email', 'cardName', 'cardNumber', 'expiry', 'cvc', 'street', 'state', 'zip'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) field.value = '';
        });
    }

    // -------------------------------------------------------------------------
    // Exit / Cancel button
    // -------------------------------------------------------------------------

    const exitButton = document.getElementById('exitButton');
    if (exitButton) {
        exitButton.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Are you sure you want to exit? Your changes will not be saved.')) {
                window.location.href = '../../Setting/html/index.html';
            }
        });
    }

    // -------------------------------------------------------------------------
    // Card input formatting
    // -------------------------------------------------------------------------

    const cardNumberInput = document.getElementById('cardNumber');
    const expiryInput = document.getElementById('expiry');
    const cvcInput = document.getElementById('cvc');

    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function (e) {
            // Remove all non-digits
            let value = e.target.value.replace(/\D/g, '');
            // Limit to 16 digits (most common card length)
            value = value.slice(0, 16);
            // Format with spaces every 4 digits
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    if (expiryInput) {
        expiryInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }

    if (cvcInput) {
        cvcInput.addEventListener('input', function (e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
        });
    }

    // -------------------------------------------------------------------------
    // Overlay helpers
    // -------------------------------------------------------------------------

    const loadingOverlay = document.getElementById('loadingOverlay');
    const successOverlay = document.getElementById('successOverlay');
    const errorOverlay = document.getElementById('errorOverlay');

    let successRedirectTimeout = null;
    let successCountdownInterval = null;

    function showLoading() { 
        if (loadingOverlay) loadingOverlay.classList.remove('hidden'); 
    }
    
    function hideLoading() { 
        if (loadingOverlay) loadingOverlay.classList.add('hidden'); 
    }
    
    function showSuccess() {
        if (!successOverlay) return;
        
        successOverlay.classList.remove('hidden');

        const successMessage = document.getElementById('successMessage');
        if (!successMessage) return;
        
        let secondsRemaining = 5;
        successMessage.textContent = `Your subscription has been updated. Redirecting to Settings in (${secondsRemaining}) seconds`;

        // Clear any existing intervals/timeouts
        if (successCountdownInterval) clearInterval(successCountdownInterval);
        if (successRedirectTimeout) clearTimeout(successRedirectTimeout);

        successCountdownInterval = setInterval(() => {
            secondsRemaining--;
            if (secondsRemaining > 0) {
                successMessage.textContent = `Your subscription has been updated. Redirecting to Settings in (${secondsRemaining}) seconds`;
            } else {
                clearInterval(successCountdownInterval);
                successCountdownInterval = null;
            }
        }, 1000);

        successRedirectTimeout = setTimeout(() => {
            window.location.href = '../../Setting/html/index.html';
        }, 5000);
    }
    
    function showError() { 
        hideLoading(); 
        if (errorOverlay) errorOverlay.classList.remove('hidden'); 
    }
    
    function hideError() { 
        if (errorOverlay) errorOverlay.classList.add('hidden'); 
    }

    errorOverlay.addEventListener('click', hideError);

    // -------------------------------------------------------------------------
    // Payment processing
    // -------------------------------------------------------------------------

    function getSelectedPlan() {
        const active = document.querySelector('.radio-button.active');
        const plan = active ? active.dataset.plan : null;
        
        // Validate the plan exists
        if (plan && allPlans[plan]) {
            return plan;
        }
        
        // Fallback: return the first available plan that's not the current plan
        console.warn('No valid plan selected, using fallback');
        for (const key in allPlans) {
            if (key !== currentUserPlan) {
                return key;
            }
        }
        
        // Ultimate fallback
        return '1-month';
    }

    const payButton = document.getElementById('payButton');
    const paymentForm = document.getElementById('paymentForm');
    let isProcessing = false; // Prevent double-click

    if (payButton) {
        payButton.addEventListener('click', async function (e) {
            e.preventDefault();

            // Prevent double-click
            if (isProcessing) {
                return;
            }

            // Validate form
            if (!paymentForm.checkValidity()) {
                paymentForm.reportValidity();
                return;
            }

            // Get form data
            const email = document.getElementById('email').value.trim();
            const cardName = document.getElementById('cardName').value.trim();
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const expiry = document.getElementById('expiry').value;
            const cvc = document.getElementById('cvc').value;
            const street = document.getElementById('street').value.trim();
            const state = document.getElementById('state').value.trim();
            const zip = document.getElementById('zip').value.trim();

            // Additional validation
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            if (cardNumber.length < 13 || cardNumber.length > 16) {
                alert('Please enter a valid card number.');
                return;
            }

            if (!/^\d{2}\/\d{2}$/.test(expiry)) {
                alert('Please enter a valid expiry date (MM/YY).');
                return;
            }

            // Validate expiry date
            const [month, year] = expiry.split('/').map(num => parseInt(num, 10));
            if (month < 1 || month > 12) {
                alert('Please enter a valid month (01-12).');
                return;
            }

            // Check if card is expired
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
            const currentMonth = currentDate.getMonth() + 1; // 0-indexed
            
            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                alert('This card has expired. Please enter a valid expiry date.');
                return;
            }

            if (cvc.length < 3 || cvc.length > 4) {
                alert('Please enter a valid CVC (3-4 digits).');
                return;
            }

            const plan = getSelectedPlan();

            isProcessing = true;
            payButton.disabled = true;
            showLoading();

            try {
                // Save card details to localStorage (for autofill feature)
                // Note: In production, never store full card numbers in localStorage
                try {
                    localStorage.setItem('arco-email', email);
                    localStorage.setItem('arco-card-name', cardName);
                    localStorage.setItem('arco-card-number', cardNumber.replace(/\d(?=\d{4})/g, '*')); // Mask all but last 4
                    localStorage.setItem('arco-card-expiry', expiry);
                    localStorage.setItem('arco-billing-street', street);
                    localStorage.setItem('arco-billing-state', state);
                    localStorage.setItem('arco-billing-zip', zip);
                } catch (storageErr) {
                    console.warn('localStorage not available:', storageErr);
                }

                // Simulate API call to process payment
                // In production, this would call a backend API
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Save the new subscription plan
                try {
                    if (allPlans[plan]) {
                        localStorage.setItem('arco-subscription-plan', allPlans[plan].displayName);
                    }
                } catch (storageErr) {
                    console.warn('Failed to save plan to localStorage:', storageErr);
                }

                // Update subscription via API if available
                if (typeof ArcoAPI !== 'undefined' && ArcoAPI.updateSubscription) {
                    await ArcoAPI.updateSubscription({
                        plan: plan,
                        autoRenewal: autoRenewalEnabled,
                        email: email
                    });
                }

                hideLoading();
                showSuccess();
            } catch (err) {
                console.error('Payment processing error:', err);
                isProcessing = false;
                payButton.disabled = false;
                showError();
            }
        });
    }

});
