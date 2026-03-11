// Forgot Password Page Functionality

document.addEventListener('DOMContentLoaded', function () {
    let currentEmail = '';

    // Form submission
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const emailInput = document.getElementById('email');
    const errorMessage = document.getElementById('errorMessage');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const email = emailInput.value.trim();

            // Clear previous error
            errorMessage.textContent = '';
            emailInput.classList.remove('error');

            // Basic validation
            if (!email) {
                showError('Please enter your email address');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showError('Please enter a valid email address');
                return;
            }

            // Here you would typically send the reset request to your backend
            console.log('Password reset request for:', email);

            // Simulate API call
            sendPasswordResetEmail(email);
        });
    }

    // Show error message
    function showError(message) {
        errorMessage.textContent = message;
        emailInput.classList.add('error');
    }

    // Simulate sending password reset email
    function sendPasswordResetEmail(email) {
        // Show loading state (optional)
        const submitButton = forgotPasswordForm.querySelector('.btn-primary');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;

        fetch('/api/reset-password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'check', email })
        })
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    showError(data.error);
                    return;
                }
                // Email exists — send the OTP
                return fetch('/api/send-otp.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                })
                    .then(r => r.json())
                    .then(otpData => {
                        submitButton.textContent = originalText;
                        submitButton.disabled = false;
                        if (otpData.error) { showError(otpData.error); return; }
                        currentEmail = email;
                        showVerificationScreen(email);
                    });
            })
            .catch(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                showError('Network error. Please try again.');
            });
    }

    // Add input validation styling
    if (emailInput) {
        emailInput.addEventListener('input', function () {
            // Clear error when user starts typing
            if (errorMessage.textContent) {
                errorMessage.textContent = '';
                emailInput.classList.remove('error');
            }
        });

        emailInput.addEventListener('blur', function () {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#1c1c1c';
            } else {
                this.style.borderColor = '#dddcdb';
            }
        });

        emailInput.addEventListener('focus', function () {
            if (!this.classList.contains('error')) {
                this.style.borderColor = '#1c1c1c';
            }
        });
    }

    // Add smooth transitions to all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input');
    interactiveElements.forEach(element => {
        element.style.transition = 'all 0.2s ease';
    });

    // Show verification screen with OTP inputs
    function showVerificationScreen(email) {
        const formWrapper = document.querySelector('.form-wrapper');

        formWrapper.innerHTML = `
            <!-- Header Section -->
            <div class="header-section">
                <h1 class="page-title">Check Your Email</h1>
                <p class="page-description verification-description">
                    A four digit code has been sent to the following email address:
                    <span class="email-highlight">${email}</span>
                </p>
            </div>

            <!-- OTP Input Section -->
            <div class="otp-section">
                <div class="otp-inputs">
                    <input type="text" class="otp-input" maxlength="1" id="otp1" autocomplete="off">
                    <input type="text" class="otp-input" maxlength="1" id="otp2" autocomplete="off">
                    <input type="text" class="otp-input" maxlength="1" id="otp3" autocomplete="off">
                    <input type="text" class="otp-input" maxlength="1" id="otp4" autocomplete="off">
                </div>
            </div>

            <!-- Verification Actions -->
            <div class="verification-actions">
                <button type="button" class="btn-primary btn-verify" id="verifyButton">Verify</button>

                <div class="resend-section">
                    <span class="resend-text">Didn't receive the email?</span>
                    <a href="#" class="resend-link" id="resendCode">Resend Code</a>
                </div>

                <a href="index.html" class="return-link">
                    <svg class="back-arrow" width="16" height="13" viewBox="0 0 16 13" fill="none"
                        xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M15.5771 6.49985L0.999878 6.49985M0.999878 6.49985L6.11103 11.611M0.999878 6.49985L6.11103 1.3887"
                            stroke="#8D8D8D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                    <span>Return to Login</span>
                </a>
            </div>
        `;

        // Update progress bar to 50% (2 segments filled)
        const progressSegments = document.querySelectorAll('.progress-segment');
        if (progressSegments.length >= 2) {
            progressSegments[1].classList.add('filled');
        }

        // Initialize OTP input functionality
        initializeOTPInputs();

        // Add verify button handler
        document.getElementById('verifyButton').addEventListener('click', handleVerification);

        // Add resend code handler
        document.getElementById('resendCode').addEventListener('click', function (e) {
            e.preventDefault();
            handleResendCode(email);
        });
    }

    // Initialize OTP input behavior
    function initializeOTPInputs() {
        const otpInputs = document.querySelectorAll('.otp-input');

        otpInputs.forEach((input, index) => {
            // Auto-focus next input
            input.addEventListener('input', function (e) {
                const value = this.value;

                // Only allow numbers
                this.value = value.replace(/[^0-9]/g, '');

                // Move to next input if value entered
                if (this.value.length === 1 && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });

            // Handle backspace to move to previous input
            input.addEventListener('keydown', function (e) {
                if (e.key === 'Backspace' && !this.value && index > 0) {
                    otpInputs[index - 1].focus();
                }
            });

            // Handle paste
            input.addEventListener('paste', function (e) {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, '');

                // Fill inputs with pasted data
                for (let i = 0; i < pasteData.length && index + i < otpInputs.length; i++) {
                    otpInputs[index + i].value = pasteData[i];
                }

                // Focus the next empty input or the last one
                const nextIndex = Math.min(index + pasteData.length, otpInputs.length - 1);
                otpInputs[nextIndex].focus();
            });
        });

        // Auto-focus first input
        if (otpInputs.length > 0) {
            otpInputs[0].focus();
        }
    }

    // Handle verification
    function handleVerification() {
        const otpInputs = document.querySelectorAll('.otp-input');
        const code = Array.from(otpInputs).map(input => input.value).join('');

        if (code.length !== 4) {
            // Show error - all fields required
            otpInputs.forEach(input => {
                if (!input.value) {
                    input.classList.add('error');
                }
            });
            return;
        }

        // Clear any errors
        otpInputs.forEach(input => input.classList.remove('error'));

        const verifyButton = document.getElementById('verifyButton');
        verifyButton.textContent = 'Verifying...';
        verifyButton.disabled = true;

        fetch('/api/verify-otp.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentEmail, otp: code })
        })
            .then(r => r.json())
            .then(data => {
                verifyButton.textContent = 'Verify';
                verifyButton.disabled = false;
                if (data.error) {
                    otpInputs.forEach(input => input.classList.add('error'));
                    alert(data.error);
                    return;
                }
                showPasswordResetScreen();
            })
            .catch(() => {
                verifyButton.textContent = 'Verify';
                verifyButton.disabled = false;
                alert('Network error. Please try again.');
            });
    }

    // Handle resend code
    function handleResendCode(email) {
        const resendLink = document.getElementById('resendCode');

        resendLink.textContent = 'Sending...';
        resendLink.style.pointerEvents = 'none';

        fetch('/api/send-otp.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        })
            .then(r => r.json())
            .then(data => {
                resendLink.textContent = 'Resend Code';
                resendLink.style.pointerEvents = 'auto';
                if (data.error) { alert(data.error); return; }
                const otpInputs = document.querySelectorAll('.otp-input');
                otpInputs.forEach(i => { i.value = ''; i.classList.remove('error'); });
                if (otpInputs[0]) otpInputs[0].focus();
                alert('A new verification code has been sent to ' + email);
            })
            .catch(() => {
                resendLink.textContent = 'Resend Code';
                resendLink.style.pointerEvents = 'auto';
                alert('Network error. Please try again.');
            });
    }

    // Show password reset screen
    function showPasswordResetScreen() {
        const formWrapper = document.querySelector('.form-wrapper');

        formWrapper.innerHTML = `
            <!-- Header Section -->
            <div class="header-section">
                <h1 class="page-title">Set New Password</h1>
                <p class="page-description">
                    Must be at least 8 characters long. Must contain at least one special character.
                </p>
            </div>

            <!-- Password Reset Form -->
            <form id="passwordResetForm" class="password-reset-form">
                <!-- Password Input -->
                <div class="form-group">
                    <label for="newPassword" class="form-label">Password</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="newPassword" name="newPassword" class="form-input password-input"
                            placeholder="Placeholder" required>
                        <button type="button" class="toggle-password" data-target="newPassword">
                            <svg class="eye-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <g transform="translate(0.25, 4.138)">
                                    <path
                                        d="M17.6299 0.506979C17.9021 0.0266516 18.5127 -0.142025 18.9931 0.130026C19.4736 0.402323 19.6423 1.01284 19.3701 1.49331C18.6203 2.81653 17.8477 3.9347 17.0586 4.86635L18.6787 6.15542C19.1108 6.49923 19.1825 7.12853 18.8388 7.56069C18.495 7.99278 17.8657 8.06453 17.4336 7.72085L15.6591 6.30971C15.0483 6.85227 14.4296 7.29435 13.8027 7.64077C13.684 7.70637 13.5649 7.76773 13.4463 7.82632L14.2675 10.422C14.4339 10.9483 14.1424 11.5102 13.6162 11.6769C13.0897 11.8435 12.527 11.552 12.3603 11.0255L11.5547 8.47964C10.3878 8.71678 9.24385 8.65203 8.15427 8.36342L7.24509 11.0187C7.06601 11.5411 6.49601 11.8198 5.9736 11.6408C5.45156 11.4615 5.17273 10.8925 5.35153 10.3703L6.28805 7.63686C5.36786 7.16271 4.50973 6.54826 3.72751 5.85952L2.12985 7.73354C1.77138 8.15348 1.13978 8.20319 0.719695 7.84487C0.299985 7.48649 0.249448 6.85573 0.60739 6.43569L2.30661 4.4435C1.43521 3.47054 0.702524 2.44807 0.142546 1.51479C-0.141354 1.04133 0.0120099 0.426885 0.48532 0.142722C0.958771 -0.141349 1.57314 0.0122189 1.85739 0.485495C3.31079 2.90783 5.81306 5.63901 8.59274 6.41128C9.93244 6.78341 11.3544 6.70871 12.8349 5.89077C14.3436 5.05719 15.9841 3.41118 17.6299 0.506979Z"
                                        fill="#1C1C1C" />
                                </g>
                            </svg>
                        </button>
                    </div>
                    <p class="error-message" id="passwordError"></p>
                </div>

                <!-- Confirm Password Input -->
                <div class="form-group">
                    <label for="confirmPassword" class="form-label">Confirm Password</label>
                    <div class="password-input-wrapper">
                        <input type="password" id="confirmPassword" name="confirmPassword" class="form-input password-input"
                            placeholder="Placeholder" required>
                        <button type="button" class="toggle-password" data-target="confirmPassword">
                            <svg class="eye-icon" width="20" height="20" viewBox="0 0 20 20" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <g transform="translate(0.25, 4.138)">
                                    <path
                                        d="M17.6299 0.506979C17.9021 0.0266516 18.5127 -0.142025 18.9931 0.130026C19.4736 0.402323 19.6423 1.01284 19.3701 1.49331C18.6203 2.81653 17.8477 3.9347 17.0586 4.86635L18.6787 6.15542C19.1108 6.49923 19.1825 7.12853 18.8388 7.56069C18.495 7.99278 17.8657 8.06453 17.4336 7.72085L15.6591 6.30971C15.0483 6.85227 14.4296 7.29435 13.8027 7.64077C13.684 7.70637 13.5649 7.76773 13.4463 7.82632L14.2675 10.422C14.4339 10.9483 14.1424 11.5102 13.6162 11.6769C13.0897 11.8435 12.527 11.552 12.3603 11.0255L11.5547 8.47964C10.3878 8.71678 9.24385 8.65203 8.15427 8.36342L7.24509 11.0187C7.06601 11.5411 6.49601 11.8198 5.9736 11.6408C5.45156 11.4615 5.17273 10.8925 5.35153 10.3703L6.28805 7.63686C5.36786 7.16271 4.50973 6.54826 3.72751 5.85952L2.12985 7.73354C1.77138 8.15348 1.13978 8.20319 0.719695 7.84487C0.299985 7.48649 0.249448 6.85573 0.60739 6.43569L2.30661 4.4435C1.43521 3.47054 0.702524 2.44807 0.142546 1.51479C-0.141354 1.04133 0.0120099 0.426885 0.48532 0.142722C0.958771 -0.141349 1.57314 0.0122189 1.85739 0.485495C3.31079 2.90783 5.81306 5.63901 8.59274 6.41128C9.93244 6.78341 11.3544 6.70871 12.8349 5.89077C14.3436 5.05719 15.9841 3.41118 17.6299 0.506979Z"
                                        fill="#1C1C1C" />
                                </g>
                            </svg>
                        </button>
                    </div>
                    <p class="error-message" id="confirmPasswordError"></p>
                </div>

                <!-- Reset Button and Return Link -->
                <div class="password-reset-actions">
                    <button type="submit" class="btn-primary">Reset</button>

                    <a href="index.html" class="return-link">
                        <svg class="back-arrow" width="16" height="13" viewBox="0 0 16 13" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M15.5771 6.49985L0.999878 6.49985M0.999878 6.49985L6.11103 11.611M0.999878 6.49985L6.11103 1.3887"
                                stroke="#8D8D8D" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                        <span>Return to Login</span>
                    </a>
                </div>
            </form>
        `;

        // Update progress bar to 75% (3 segments filled)
        const progressSegments = document.querySelectorAll('.progress-segment');
        if (progressSegments.length >= 3) {
            progressSegments[2].classList.add('filled');
        }

        // Initialize password reset functionality
        initializePasswordReset();
    }

    // Initialize password reset form
    function initializePasswordReset() {
        const passwordResetForm = document.getElementById('passwordResetForm');
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const passwordError = document.getElementById('passwordError');
        const confirmPasswordError = document.getElementById('confirmPasswordError');

        // Password visibility toggle for new password field
        const newPasswordToggle = document.querySelector('.toggle-password[data-target="newPassword"]');
        if (newPasswordToggle && newPasswordInput) {
            newPasswordToggle.addEventListener('click', function () {
                togglePasswordVisibility(newPasswordInput, newPasswordToggle);
            });
        }

        // Password visibility toggle for confirm password field
        const confirmPasswordToggle = document.querySelector('.toggle-password[data-target="confirmPassword"]');
        if (confirmPasswordToggle && confirmPasswordInput) {
            confirmPasswordToggle.addEventListener('click', function () {
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
        newPasswordInput.addEventListener('input', function () {
            passwordError.textContent = '';
            this.classList.remove('error');

            // Clear confirm password error if they now match
            if (confirmPasswordInput.value && this.value === confirmPasswordInput.value) {
                confirmPasswordError.textContent = '';
                confirmPasswordInput.classList.remove('error');
            }
        });

        confirmPasswordInput.addEventListener('input', function () {
            confirmPasswordError.textContent = '';
            this.classList.remove('error');
        });

        // Form submission
        passwordResetForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;

            // Clear previous errors
            passwordError.textContent = '';
            confirmPasswordError.textContent = '';
            newPasswordInput.classList.remove('error');
            confirmPasswordInput.classList.remove('error');

            let isValid = true;

            // Validate password requirements
            if (newPassword.length < 8) {
                passwordError.textContent = '*Must be at least 8 characters long';
                newPasswordInput.classList.add('error');
                isValid = false;
            } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                passwordError.textContent = '*Must contain at least one special character';
                newPasswordInput.classList.add('error');
                isValid = false;
            }

            // Validate passwords match
            if (newPassword !== confirmPassword) {
                confirmPasswordError.textContent = '*Passwords do not match';
                confirmPasswordInput.classList.add('error');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Show loading state
            const submitButton = passwordResetForm.querySelector('.btn-primary');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Resetting...';
            submitButton.disabled = true;

            fetch('/api/reset-password.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: currentEmail, new_password: newPassword })
            })
                .then(r => r.json())
                .then(data => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    if (data.error) {
                        passwordError.textContent = data.error;
                        newPasswordInput.classList.add('error');
                        return;
                    }
                    showSuccessScreen();
                })
                .catch(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    passwordError.textContent = 'Network error. Please try again.';
                });
        });
    }

    // Show success screen
    function showSuccessScreen() {
        const formWrapper = document.querySelector('.form-wrapper');

        formWrapper.innerHTML = `
            <!-- Header Section -->
            <div class="header-section success-header">
                <h1 class="page-title">All Done!</h1>
                <p class="page-description">
                    Password has been successfully reset. Next time you want to login, enter your newly created password.
                </p>
            </div>

            <!-- Home Page Button -->
            <div class="success-actions">
                <button type="button" class="btn-primary btn-home" id="homePageButton">
                    <span>Go to Login</span>
                    <svg class="arrow-right" width="15" height="12.26" viewBox="0 0 15 12.2576" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.65384 9.20519H0V3.05135H8.65384V9.20519Z" fill="#FFFEFD"/>
                        <path d="M15 6.12879L8.07692 12.2576V0L15 6.12879Z" fill="#FFFEFD"/>
                    </svg>
                </button>
            </div>
        `;

        // Update progress bar to 100% (all 4 segments filled)
        const progressSegments = document.querySelectorAll('.progress-segment');
        if (progressSegments.length >= 4) {
            progressSegments[3].classList.add('filled');
        }

        // Add home page button handler
        document.getElementById('homePageButton').addEventListener('click', function () {
            // Redirect to home page or login
            window.location.href = '../html/index.html';
        });
    }
});
