// Sign Up Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const signupForm = document.getElementById('signupForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const continueBtn = document.getElementById('continueBtn');

    // Get requirement elements
    const lengthRequirement = document.getElementById('lengthRequirement');
    const specialCharRequirement = document.getElementById('specialCharRequirement');

    // Password visibility toggle for password field
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            togglePasswordVisibility(passwordInput, passwordToggle);
        });
    }

    // Password visibility toggle for confirm password field
    if (confirmPasswordToggle && confirmPasswordInput) {
        confirmPasswordToggle.addEventListener('click', function() {
            togglePasswordVisibility(confirmPasswordInput, confirmPasswordToggle);
        });
    }

    // Function to toggle password visibility
    function togglePasswordVisibility(input, button) {
        const type = input.type === 'password' ? 'text' : 'password';
        input.type = type;

        const eyeIcon = button.querySelector('.eye-icon');
        if (type === 'text') {
            // Show "eye open" state (password visible)
            eyeIcon.innerHTML = `
                <g transform="translate(0.25, 5.5)">
                    <path d="M9.50011 3.99985C10.8808 3.99985 12.0001 5.11914 12.0001 6.49985C12 7.8805 10.8808 8.99985 9.50011 8.99985C8.11953 8.99975 7.00018 7.88044 7.00011 6.49985C7.00011 5.1192 8.11948 3.99995 9.50011 3.99985ZM5.69738 0.985203C7.66654 -0.102834 9.63242 -0.215738 11.4425 0.286961C14.9626 1.26478 17.811 4.53362 19.3575 7.11118C19.6415 7.58469 19.4882 8.1991 19.0148 8.48325C18.5413 8.76708 17.9269 8.61369 17.6427 8.14048C16.1892 5.71806 13.6871 2.98686 10.9073 2.2147C9.56762 1.84258 8.14571 1.91722 6.66515 2.7352C5.15658 3.56884 3.51583 5.21499 1.87023 8.11899C1.59782 8.59915 0.987297 8.76813 0.506945 8.49595C0.026624 8.22371 -0.141985 7.61308 0.129992 7.13266C1.88406 4.03727 3.75629 2.05795 5.69738 0.985203Z" fill="#1C1C1C"/>
                </g>
            `;
        } else {
            // Show "eye closed" state (password hidden)
            eyeIcon.innerHTML = `
                <g transform="translate(0.25, 4.138)">
                    <path d="M17.6299 0.506979C17.9021 0.0266516 18.5127 -0.142025 18.9931 0.130026C19.4736 0.402323 19.6423 1.01284 19.3701 1.49331C18.6203 2.81653 17.8477 3.9347 17.0586 4.86635L18.6787 6.15542C19.1108 6.49923 19.1825 7.12853 18.8388 7.56069C18.495 7.99278 17.8657 8.06453 17.4336 7.72085L15.6591 6.30971C15.0483 6.85227 14.4296 7.29435 13.8027 7.64077C13.684 7.70637 13.5649 7.76773 13.4463 7.82632L14.2675 10.422C14.4339 10.9483 14.1424 11.5102 13.6162 11.6769C13.0897 11.8435 12.527 11.552 12.3603 11.0255L11.5547 8.47964C10.3878 8.71678 9.24385 8.65203 8.15427 8.36342L7.24509 11.0187C7.06601 11.5411 6.49601 11.8198 5.9736 11.6408C5.45156 11.4615 5.17273 10.8925 5.35153 10.3703L6.28805 7.63686C5.36786 7.16271 4.50973 6.54826 3.72751 5.85952L2.12985 7.73354C1.77138 8.15348 1.13978 8.20319 0.719695 7.84487C0.299985 7.48649 0.249448 6.85573 0.60739 6.43569L2.30661 4.4435C1.43521 3.47054 0.702524 2.44807 0.142546 1.51479C-0.141354 1.04133 0.0120099 0.426885 0.48532 0.142722C0.958771 -0.141349 1.57314 0.0122189 1.85739 0.485495C3.31079 2.90783 5.81306 5.63901 8.59274 6.41128C9.93244 6.78341 11.3544 6.70871 12.8349 5.89077C14.3436 5.05719 15.9841 3.41118 17.6299 0.506979Z" fill="#1C1C1C"/>
                </g>
            `;
        }
    }

    // Real-time password validation
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(passwordInput.value);
            updatePasswordMatchVisuals();
            checkFormValidity();
        });
    }

    // Real-time email validation
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            checkFormValidity();
        });
    }

    // Real-time confirm password validation
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            updatePasswordMatchVisuals();
            checkFormValidity();
        });
    }

    // Function to validate password requirements
    function validatePassword(password) {
        // Check length requirement (at least 8 characters)
        const hasMinLength = password.length >= 8;
        updateRequirement(lengthRequirement, hasMinLength);

        // Check special character requirement
        const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
        const hasSpecialChar = specialCharRegex.test(password);
        updateRequirement(specialCharRequirement, hasSpecialChar);

        return hasMinLength && hasSpecialChar;
    }

    // Function to update requirement display
    function updateRequirement(element, isFulfilled) {
        if (isFulfilled) {
            element.classList.add('fulfilled');
        } else {
            element.classList.remove('fulfilled');
        }
    }

    // Function to check if email is valid
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Function to check overall form validity and enable/disable continue button
    function checkFormValidity() {
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Check all conditions
        const emailValid = isValidEmail(email);
        const passwordValid = validatePassword(password);
        const passwordsMatch = password && confirmPassword && password === confirmPassword;

        // Enable button only if all conditions are met
        if (emailValid && passwordValid && passwordsMatch) {
            continueBtn.disabled = false;
        } else {
            continueBtn.disabled = true;
        }
    }

    // Form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Basic validation
            if (!email || !password || !confirmPassword) {
                alert('Please fill in all fields');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Password requirements validation
            if (!validatePassword(password)) {
                alert('Password must meet all requirements:\n- At least 8 characters long\n- At least one special character');
                return;
            }

            // Password match validation
            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Here you would typically send the signup request to your backend
            console.log('Sign up attempt:', {
                email: email,
                password: password
            });

            // Store user data
            const userData = {
                email: email,
                password: password
            };

            // Show verification screen
            showVerificationScreen(userData);
        });
    }

    // Function to show verification screen (Method 2: Dynamic Content Replacement)
    function showVerificationScreen(userData) {
        const formWrapper = document.querySelector('.form-wrapper');

        // Replace content with verification screen
        formWrapper.innerHTML = `
            <div class="verify-content">
                <div class="verify-header">
                    <div class="verify-title-section">
                        <h1 class="verify-title">Check Your Email</h1>
                        <p class="verify-description">A four digit code has been sent to the following email address: <span class="verify-email">${userData.email}</span></p>
                    </div>
                    <div class="otp-field" id="otpField">
                        <input type="text" class="otp-input" maxlength="1" data-index="0" />
                        <input type="text" class="otp-input" maxlength="1" data-index="1" />
                        <input type="text" class="otp-input" maxlength="1" data-index="2" />
                        <input type="text" class="otp-input" maxlength="1" data-index="3" />
                    </div>
                    <button type="button" class="btn-verify" id="verifyBtn" disabled>Verify</button>
                </div>
                <div class="resend-section">
                    <p class="resend-text">Didn't receive the email?</p>
                    <a href="#" class="resend-link" id="resendLink">Resend Code</a>
                </div>
                <div class="previous-link" id="returnLink">
                    <div class="previous-arrow">
                        <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M15.5771 6.49985C15.5771 6.7985 15.4584 7.08503 15.2459 7.29753C15.0334 7.51003 14.7468 7.62873 14.4482 7.62873H3.93149L8.19656 11.8938C8.40906 12.1063 8.52776 12.3928 8.52776 12.6915C8.52776 12.9901 8.40906 13.2767 8.19656 13.4892C7.98406 13.7017 7.69753 13.8204 7.39887 13.8204C7.10021 13.8204 6.81368 13.7017 6.60118 13.4892L0.331299 7.21929C0.225684 7.11384 0.141942 6.98829 0.0849983 6.85013C0.0280547 6.71196 -0.00146484 6.56395 -0.00146484 6.41473C-0.00146484 6.26551 0.0280547 6.11749 0.0849983 5.97933C0.141942 5.84116 0.225684 5.71561 0.331299 5.61017L6.60118 -0.659714C6.70665 -0.765252 6.83221 -0.84895 6.97038 -0.905855C7.10855 -0.96276 7.25657 -0.992657 7.40581 -0.992625C7.55504 -0.992593 7.70307 -0.962634 7.84123 -0.905669C7.97939 -0.848704 8.10494 -0.764943 8.21037 -0.659344C8.31579 -0.553746 8.39949 -0.428185 8.4564 -0.290016C8.5133 -0.151848 8.5432 -0.00382826 8.54317 0.145408C8.54313 0.294644 8.51317 0.442661 8.45621 0.580824C8.39924 0.718986 8.31549 0.844537 8.21002 0.950114L3.93149 5.21097H14.4482C14.7468 5.21097 15.0334 5.32967 15.2459 5.54217C15.4584 5.75467 15.5771 6.0412 15.5771 6.33985V6.49985Z" fill="#8d8d8d"/>
                        </svg>
                    </div>
                    <p class="previous-text">Return to Sign Up</p>
                </div>
            </div>
        `;

        // Re-attach event listeners for verification screen
        initializeVerificationScreen(userData);
    }

    // Function to initialize verification screen functionality
    function initializeVerificationScreen(userData) {
        const otpInputs = document.querySelectorAll('.otp-input');
        const verifyBtn = document.getElementById('verifyBtn');
        const resendLink = document.getElementById('resendLink');
        const returnLink = document.getElementById('returnLink');

        // OTP Input handling
        otpInputs.forEach((input, index) => {
            // Handle input
            input.addEventListener('input', function(e) {
                const value = e.target.value;

                // Only allow numbers
                if (value && !/^\d$/.test(value)) {
                    e.target.value = '';
                    return;
                }

                // Move to next input if value is entered
                if (value && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }

                // Check if all inputs are filled
                checkOTPValidity();
            });

            // Handle backspace
            input.addEventListener('keydown', function(e) {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });

            // Handle paste
            input.addEventListener('paste', function(e) {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').slice(0, 4);

                if (/^\d+$/.test(pastedData)) {
                    pastedData.split('').forEach((char, i) => {
                        if (index + i < otpInputs.length) {
                            otpInputs[index + i].value = char;
                        }
                    });

                    // Focus last filled input
                    const lastIndex = Math.min(index + pastedData.length, otpInputs.length - 1);
                    otpInputs[lastIndex].focus();

                    checkOTPValidity();
                }
            });
        });

        // Focus first input
        if (otpInputs.length > 0) {
            otpInputs[0].focus();
        }

        // Check OTP validity
        function checkOTPValidity() {
            const allFilled = Array.from(otpInputs).every(input => input.value.length === 1);
            verifyBtn.disabled = !allFilled;
        }

        // Verify button click
        verifyBtn.addEventListener('click', function() {
            const otp = Array.from(otpInputs).map(input => input.value).join('');

            console.log('Verification attempt:', {
                email: userData.email,
                otp: otp
            });

            // Here you would typically verify the OTP with your backend
            // For now, we'll assume verification is successful

            // Store user data in sessionStorage for the next step
            sessionStorage.setItem('userData', JSON.stringify(userData));

            // Redirect to account creation page
            window.location.href = 'account-creation.html';
        });

        // Resend code link
        resendLink.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Resend code requested for:', userData.email);

            // Clear OTP inputs
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
            verifyBtn.disabled = true;

            alert('A new verification code has been sent to ' + userData.email);
        });

        // Return to sign up link
        returnLink.addEventListener('click', function() {
            // Reload the page to go back to signup form
            window.location.reload();
        });

        // Add smooth transitions
        const interactiveElements = document.querySelectorAll('button, a, input');
        interactiveElements.forEach(element => {
            element.style.transition = 'all 0.2s ease';
        });
    }

    // Add input validation styling
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#1c1c1c';
            } else {
                this.style.borderColor = '#dddcdb';
            }
        });

        input.addEventListener('focus', function() {
            this.style.borderColor = '#1c1c1c';
        });
    });

    // Function to update password match visual feedback
    function updatePasswordMatchVisuals() {
        if (passwordInput.value && confirmPasswordInput.value) {
            if (passwordInput.value === confirmPasswordInput.value) {
                confirmPasswordInput.style.borderColor = '#2c4a3b';
            } else {
                confirmPasswordInput.style.borderColor = '#ff6b6b';
            }
        } else {
            confirmPasswordInput.style.borderColor = '#dddcdb';
        }
    }

    // Add smooth transitions to all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input');
    interactiveElements.forEach(element => {
        element.style.transition = 'all 0.2s ease';
    });
});
