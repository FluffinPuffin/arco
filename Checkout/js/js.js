// Checkout Page JavaScript

document.addEventListener('DOMContentLoaded', async function () {

    // Redirect to login only if not authenticated (401)
    try {
        await ArcoAPI.getProfile();
    } catch (err) {
        if (err.status === 401) {
            window.location.href = '/Login/html/index.html?redirect=/Checkout/html/index.html';
            return;
        }
    }

    // -------------------------------------------------------------------------
    // Plan selection
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Date helper — builds "Mon 'YY - Mon 'YY" from today + N months
    // -------------------------------------------------------------------------

    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    function buildSubtitle(months) {
        const now = new Date();
        const end = new Date(now.getFullYear(), now.getMonth() + months, 1);
        const fmt = (d) => `${MONTH_NAMES[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`;
        return `${fmt(now)} - ${fmt(end)}`;
    }

    const planDetails = {
        '1-month':  { title: '1 Month',   subtitle: buildSubtitle(1),  price: '$4.99 USD' },
        '3-month':  { title: '3 Months',  subtitle: buildSubtitle(3),  price: '$11.25 USD' },
        '12-month': { title: '12 Months', subtitle: buildSubtitle(12), price: '$29.99 USD' },
    };

    const radioButtons = document.querySelectorAll('.radio-button');

    // Update card subtitles to reflect current dates
    radioButtons.forEach(btn => {
        const card = btn.closest('.subscription-card');
        const subtitle = card && card.querySelector('.card-subtitle');
        if (subtitle && planDetails[btn.dataset.plan]) {
            subtitle.textContent = 'From ' + planDetails[btn.dataset.plan].subtitle;
        }
    });

    radioButtons.forEach(button => {
        button.addEventListener('click', function () {
            radioButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            updateOrderSummary(this.dataset.plan);
        });
    });

    // Initialize order summary with the default selected plan
    updateOrderSummary(getSelectedPlan());

    function updateOrderSummary(plan) {
        const summaryTitle    = document.querySelector('.summary-title');
        const summarySubtitle = document.querySelector('.summary-subtitle');
        const summaryPrice    = document.querySelector('.summary-price');

        if (planDetails[plan]) {
            summaryTitle.textContent    = planDetails[plan].title;
            summarySubtitle.textContent = planDetails[plan].subtitle;
            summaryPrice.textContent    = planDetails[plan].price;
        }
    }

    // -------------------------------------------------------------------------
    // Auto-renewal toggle
    // -------------------------------------------------------------------------

    const toggleSwitch = document.getElementById('autoRenewalToggle');
    let autoRenewalEnabled = true;

    if (toggleSwitch) {
        toggleSwitch.addEventListener('click', function () {
            autoRenewalEnabled = !autoRenewalEnabled;
            this.classList.toggle('active');
        });
    }

    // -------------------------------------------------------------------------
    // Exit / Cancel button
    // -------------------------------------------------------------------------

    const exitButton = document.getElementById('exitButton');
    if (exitButton) {
        exitButton.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('Are you sure you want to exit? Your progress will not be saved.')) {
                window.history.back();
            }
        });
    }

    // -------------------------------------------------------------------------
    // Overlay helpers
    // -------------------------------------------------------------------------

    const loadingOverlay = document.getElementById('loadingOverlay');
    const successOverlay = document.getElementById('successOverlay');
    const errorOverlay   = document.getElementById('errorOverlay');

    function showLoading()  { loadingOverlay.classList.remove('hidden'); }
    function hideLoading()  { loadingOverlay.classList.add('hidden'); }
    function showSuccess()  {
        successOverlay.classList.remove('hidden');

        const successMessage = document.getElementById('successMessage');
        let secondsRemaining = 5;
        successMessage.textContent = `Receipt sent to ${document.getElementById('email').value}. Redirecting to Home Page in (${secondsRemaining}) seconds`;

        const countdownInterval = setInterval(() => {
            secondsRemaining--;
            if (secondsRemaining > 0) {
                successMessage.textContent = `Receipt sent to ${document.getElementById('email').value}. Redirecting to Home Page in (${secondsRemaining}) seconds`;
            } else {
                clearInterval(countdownInterval);
            }
        }, 1000);

        setTimeout(() => {
            window.location.href = '../../Home/html/index.html';
        }, 5000);
    }
    function showError()    { hideLoading(); errorOverlay.classList.remove('hidden'); }
    function hideError()    { errorOverlay.classList.add('hidden'); }

    errorOverlay.addEventListener('click', hideError);

    // -------------------------------------------------------------------------
    // PayPal Smart Button
    // -------------------------------------------------------------------------

    function getSelectedPlan() {
        const active = document.querySelector('.radio-button.active');
        return active ? active.dataset.plan : '12-month';
    }

    if (typeof paypal !== 'undefined') {
        paypal.Buttons({
            // Server-side order creation — amount is determined by the backend
            createOrder: async function () {
                const email = document.getElementById('email').value.trim();
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    alert('Please enter a valid email address before paying.');
                    throw new Error('Invalid email');
                }

                const plan = getSelectedPlan();
                const res  = await fetch('/api/paypal.php?action=create_order', {
                    method:      'POST',
                    credentials: 'same-origin',
                    headers:     { 'Content-Type': 'application/json' },
                    body:        JSON.stringify({ plan }),
                });
                const data = await res.json();
                if (data.error) throw new Error(data.error);
                return data.id;
            },

            // User approved payment in PayPal popup — capture it
            onApprove: async function (data) {
                showLoading();
                const plan = getSelectedPlan();

                try {
                    const res    = await fetch('/api/paypal.php?action=capture_order', {
                        method:      'POST',
                        credentials: 'same-origin',
                        headers:     { 'Content-Type': 'application/json' },
                        body:        JSON.stringify({ orderID: data.orderID, plan }),
                    });
                    const result = await res.json();
                    hideLoading();
                    if (result.success) {
                        showSuccess();
                    } else {
                        showError();
                    }
                } catch {
                    showError();
                }
            },

            onCancel: function () {
                hideLoading();
            },

            onError: function (err) {
                showError();
            },
        }).render('#paypal-button-container').catch(function (err) {
            document.getElementById('paypal-button-container').innerHTML =
                '<p style="color:red">Payment button failed to load. Please refresh or contact support.</p>';
        });
    } else {
        document.getElementById('paypal-button-container').innerHTML =
            '<p style="color:red">Payment button failed to load. Please refresh or contact support.</p>';
    }

});
