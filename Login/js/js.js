// Login Page Functionality

document.addEventListener('DOMContentLoaded', function() {
    // Password visibility toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');

    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;

            // Update icon
            const eyeIcon = passwordToggle.querySelector('.eye-icon');
            if (type === 'text') {
                // Show "eye open" state (password visible)
                eyeIcon.innerHTML = `
                    <g transform="translate(0.25, 5.5)">
                        <path d="M9.50011 3.99985C10.8808 3.99985 12.0001 5.11914 12.0001 6.49985C12 7.8805 10.8808 8.99985 9.50011 8.99985C8.11953 8.99975 7.00018 7.88044 7.00011 6.49985C7.00011 5.1192 8.11948 3.99995 9.50011 3.99985ZM5.69738 0.985203C7.66654 -0.102834 9.63242 -0.215738 11.4425 0.286961C14.9626 1.26478 17.811 4.53362 19.3575 7.11118C19.6415 7.58469 19.4882 8.1991 19.0148 8.48325C18.5413 8.76708 17.9269 8.61369 17.6427 8.14048C16.1892 5.71806 13.6871 2.98686 10.9073 2.2147C9.56762 1.84258 8.14571 1.91722 6.66515 2.7352C5.15658 3.56884 3.51583 5.21499 1.87023 8.11899C1.59782 8.59915 0.987297 8.76813 0.506945 8.49595C0.026624 8.22371 -0.141985 7.61308 0.129992 7.13266C1.88406 4.03727 3.75629 2.05795 5.69738 0.985203Z" fill="#1C1C1C"/>
                    </g>
                `;
            } else {
                // Show "eye closed" state (password hidden with slash through eye)
                eyeIcon.innerHTML = `
                    <g transform="translate(0.25, 4.138)">
                        <path d="M17.6299 0.506979C17.9021 0.0266516 18.5127 -0.142025 18.9931 0.130026C19.4736 0.402323 19.6423 1.01284 19.3701 1.49331C18.6203 2.81653 17.8477 3.9347 17.0586 4.86635L18.6787 6.15542C19.1108 6.49923 19.1825 7.12853 18.8388 7.56069C18.495 7.99278 17.8657 8.06453 17.4336 7.72085L15.6591 6.30971C15.0483 6.85227 14.4296 7.29435 13.8027 7.64077C13.684 7.70637 13.5649 7.76773 13.4463 7.82632L14.2675 10.422C14.4339 10.9483 14.1424 11.5102 13.6162 11.6769C13.0897 11.8435 12.527 11.552 12.3603 11.0255L11.5547 8.47964C10.3878 8.71678 9.24385 8.65203 8.15427 8.36342L7.24509 11.0187C7.06601 11.5411 6.49601 11.8198 5.9736 11.6408C5.45156 11.4615 5.17273 10.8925 5.35153 10.3703L6.28805 7.63686C5.36786 7.16271 4.50973 6.54826 3.72751 5.85952L2.12985 7.73354C1.77138 8.15348 1.13978 8.20319 0.719695 7.84487C0.299985 7.48649 0.249448 6.85573 0.60739 6.43569L2.30661 4.4435C1.43521 3.47054 0.702524 2.44807 0.142546 1.51479C-0.141354 1.04133 0.0120099 0.426885 0.48532 0.142722C0.958771 -0.141349 1.57314 0.0122189 1.85739 0.485495C3.31079 2.90783 5.81306 5.63901 8.59274 6.41128C9.93244 6.78341 11.3544 6.70871 12.8349 5.89077C14.3436 5.05719 15.9841 3.41118 17.6299 0.506979Z" fill="#1C1C1C"/>
                    </g>
                `;
            }
        });
    }

    // Remember Me toggle switch
    const rememberToggle = document.getElementById('rememberToggle');
    let isRememberChecked = !!localStorage.getItem('rememberedEmail');

    if (rememberToggle) {
        rememberToggle.setAttribute('aria-checked', isRememberChecked);
        rememberToggle.addEventListener('click', function() {
            isRememberChecked = !isRememberChecked;
            rememberToggle.setAttribute('aria-checked', isRememberChecked);
        });
    }

    // Form submission
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Basic validation
            if (!email || !password) {
                alert('Please fill in all fields');
                return;
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address');
                return;
            }

            // Send login request to backend
            try {
                const result = await ArcoAPI.login(email, password);

                // Store profile data in localStorage
                const user = result.user;
                if (user) {
                    if (user.display_name) localStorage.setItem('arco-name', user.display_name);
                    if (user.avatar) localStorage.setItem('arco-avatar', user.avatar);
                    if (user.grade) localStorage.setItem('arco-grade', user.grade);
                    if (user.id) localStorage.setItem('arco-userId', user.id);
                }

                // Remember me preference
                if (isRememberChecked) {
                    localStorage.setItem('rememberedEmail', email);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }

                // Redirect to intended page or home
                const params = new URLSearchParams(window.location.search);
                const redirectTo = params.get('redirect');
                window.location.href = redirectTo || '/Home/html/index.html';
            } catch (err) {
                alert(err.message || 'Login failed. Please try again.');
            }
        });
    }

    // Load remembered email if exists
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail && passwordInput) {
        document.getElementById('email').value = rememberedEmail;
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

    // Add smooth transitions to all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input');
    interactiveElements.forEach(element => {
        element.style.transition = 'all 0.2s ease';
    });
});
