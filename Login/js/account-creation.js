// Account Creation Page Functionality

// Screen management
let currentScreen = 1;
const totalScreens = 4;

// Profile pictures available
const profilePictures = [
    '/Login/images/profile/alvaro-montoro-9NGHFQSR1MI-unsplash.jpg',
    '/Login/images/profile/alvaro-montoro-BKgnt9N3Xo4-unsplash.jpg',
    '/Login/images/profile/alvaro-montoro-e40RPcyQS2U-unsplash.jpg',
    '/Login/images/profile/alvaro-montoro-xnTbQQZ9UrQ-unsplash.jpg',
    '/Login/images/profile/alvaro-montoro-ZK0y1lw71T4-unsplash.jpg',
    '/Login/images/profile/mila-okta-safitri-dUAjHkGeUjA-unsplash.jpg',
    '/Login/images/profile/mila-okta-safitri-msQuvch9JsM-unsplash.jpg',
    '/Login/images/profile/mila-okta-safitri-Rx7oHe_pt-U-unsplash.jpg',
    '/Login/images/profile/mila-okta-safitri-XdBnwaAXCgU-unsplash.jpg',
    '/Login/images/profile/ogie-GdcZelJrPkI-unsplash.jpg',
    '/Login/images/profile/pauline-loroy-4rw_bw5oUNQ-unsplash.jpg',
    '/Login/images/profile/william-drakus-m9QHsUrysVg-unsplash.jpg'
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize screen 1
    initScreen1();

    // Retrieve and display stored user data (for debugging)
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
        console.log('Stored user data:', JSON.parse(storedUserData));
    }
});

// Screen 1: Display Name
function initScreen1() {
    const displayNameInput = document.getElementById('displayName');
    const continueBtn = document.getElementById('continueBtn');
    const returnLink = document.getElementById('returnLink');

    // Real-time input validation
    if (displayNameInput) {
        displayNameInput.addEventListener('input', function() {
            checkFormValidity();
        });

        // Focus the input on page load
        displayNameInput.focus();
    }

    // Function to check form validity and enable/disable continue button
    function checkFormValidity() {
        const displayName = displayNameInput.value.trim();

        // Enable button if display name is not empty
        if (displayName.length > 0) {
            continueBtn.disabled = false;
        } else {
            continueBtn.disabled = true;
        }
    }

    // Continue button click handler
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            const displayName = displayNameInput.value.trim();

            if (!displayName) {
                alert('Please enter a display name');
                return;
            }

            // Store display name in sessionStorage
            const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
            userData.displayName = displayName;
            sessionStorage.setItem('userData', JSON.stringify(userData));

            console.log('Display name saved:', displayName);

            // Load next screen
            loadScreen(2);
        });
    }

    // Return to sign up link
    if (returnLink) {
        returnLink.addEventListener('click', function() {
            // Ask for confirmation before returning
            const confirmReturn = confirm('Are you sure you want to return to sign up? Your progress will be lost.');

            if (confirmReturn) {
                // Clear stored user data
                sessionStorage.removeItem('userData');

                // Redirect to signup page
                window.location.href = 'signup.html';
            }
        });
    }

    // Add input validation styling
    if (displayNameInput) {
        displayNameInput.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#1c1c1c';
            } else {
                this.style.borderColor = '#dddcdb';
            }
        });

        displayNameInput.addEventListener('focus', function() {
            this.style.borderColor = '#1c1c1c';
        });
    }

    // Add smooth transitions to all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input');
    interactiveElements.forEach(element => {
        element.style.transition = 'all 0.2s ease';
    });
}

// Screen 2: Profile Picture Selection
function initScreen2() {
    let selectedPicture = null;
    const continueBtn = document.getElementById('continueBtn');
    const previousLink = document.getElementById('previousLink');

    // Initially disable continue button
    continueBtn.disabled = true;

    // Add click handlers to profile pictures
    const profilePics = document.querySelectorAll('.profile-pic');
    profilePics.forEach((pic, index) => {
        pic.addEventListener('click', function() {
            // Remove selected class from all pictures
            profilePics.forEach(p => p.classList.remove('selected'));

            // Add selected class to clicked picture
            this.classList.add('selected');

            // Store selected picture
            selectedPicture = profilePictures[index];

            // Enable continue button
            continueBtn.disabled = false;
        });
    });

    // Continue button handler
    continueBtn.addEventListener('click', function() {
        if (!selectedPicture) {
            alert('Please select a profile picture');
            return;
        }

        // Store selected picture in sessionStorage
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        userData.profilePicture = selectedPicture;
        sessionStorage.setItem('userData', JSON.stringify(userData));

        console.log('Profile picture saved:', selectedPicture);

        // Load next screen
        loadScreen(3);
    });

    // Previous page link handler
    if (previousLink) {
        previousLink.addEventListener('click', function() {
            loadScreen(1);
        });
    }
}

// Screen 3: Grade Level
function initScreen3() {
    const gradeInput = document.getElementById('gradeLevel');
    const continueBtn = document.getElementById('continueBtn');
    const previousLink = document.getElementById('previousLink');

    // Initially disable continue button
    continueBtn.disabled = true;

    // Focus the input on load
    if (gradeInput) {
        gradeInput.focus();

        // Real-time input validation
        gradeInput.addEventListener('input', function() {
            const grade = this.value.trim();

            // Only allow numbers
            this.value = this.value.replace(/[^0-9]/g, '');

            // Enable button if grade is entered and valid (0-12)
            const gradeNum = parseInt(this.value);
            if (this.value !== '' && gradeNum >= 0 && gradeNum <= 12) {
                continueBtn.disabled = false;
            } else {
                continueBtn.disabled = true;
            }
        });

        // Add styling on focus/blur
        gradeInput.addEventListener('focus', function() {
            this.style.borderColor = '#1c1c1c';
        });

        gradeInput.addEventListener('blur', function() {
            if (this.value.trim() !== '') {
                this.style.borderColor = '#1c1c1c';
            } else {
                this.style.borderColor = '#dddcdb';
            }
        });
    }

    // Continue button handler
    continueBtn.addEventListener('click', function() {
        const grade = gradeInput.value.trim();

        if (!grade) {
            alert('Please enter your grade level');
            return;
        }

        const gradeNum = parseInt(grade);
        if (gradeNum < 1 || gradeNum > 5) {
            alert('Please enter a valid grade level (1-5)');
            return;
        }

        // Store grade level in sessionStorage
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        userData.gradeLevel = gradeNum;
        sessionStorage.setItem('userData', JSON.stringify(userData));

        console.log('Grade level saved:', gradeNum);

        // Load next screen
        loadScreen(4);
    });

    // Previous page link handler
    if (previousLink) {
        previousLink.addEventListener('click', function() {
            loadScreen(2);
        });
    }
}

// Screen 4: Confirmation
function initScreen4() {
    const confirmBtn = document.getElementById('confirmBtn');
    const previousLink = document.getElementById('previousLink');
    const editNameBtn = document.getElementById('editName');
    const editGradeBtn = document.getElementById('editGrade');
    const editProfilePictureBtn = document.getElementById('editProfilePicture');
    // Enable confirm button
    confirmBtn.disabled = false;

    // Edit name button handler
    if (editNameBtn) {
        editNameBtn.addEventListener('click', function() {
            loadScreen(1);
        });
    }

    // Edit profile picture button handler
    if (editProfilePictureBtn) {
        editProfilePictureBtn.addEventListener('click', function() {
            loadScreen(2);
        });
    }

    // Edit grade button handler
    if (editGradeBtn) {
        editGradeBtn.addEventListener('click', function() {
            loadScreen(3);
        });
    }

    // Confirm button handler
    confirmBtn.addEventListener('click', async function() {
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');

        try {
            const result = await ArcoAPI.register(
                userData.email,
                userData.password,
                userData.displayName || '',
                userData.profilePicture || '',
                String(userData.gradeLevel || '')
            );

            // Store profile in localStorage
            const user = result.user;
            if (user.display_name) localStorage.setItem('arco-name', user.display_name);
            if (user.avatar) localStorage.setItem('arco-avatar', user.avatar);
            if (user.grade) localStorage.setItem('arco-grade', user.grade);

            // Clean up sessionStorage
            sessionStorage.removeItem('userData');

            // Redirect to home
            window.location.href = '/Home/html/index.html';
        } catch (err) {
            alert(err.message || 'Account creation failed. Please try again.');
        }
    });

    // Previous page link handler
    if (previousLink) {
        previousLink.addEventListener('click', function() {
            loadScreen(3);
        });
    }
}

// Function to load a specific screen
function loadScreen(screenNumber) {
    const formContent = document.querySelector('.form-content');
    const actionSection = document.querySelector('.action-section');

    currentScreen = screenNumber;

    // Update progress bar
    updateProgressBar(screenNumber);

    // Load screen content based on screen number
    if (screenNumber === 1) {
        // Screen 1: Display Name
        formContent.innerHTML = `
            <div class="header-content">
                <h1 class="creation-title">What is Your Name?</h1>
                <p class="creation-description">You have to call yourself something, after all. Enter the Display Name you want your profile to go by. Get real creative with it!</p>
            </div>
            <div class="form-group">
                <label for="displayName" class="form-label">Display Name</label>
                <input type="text" id="displayName" name="displayName" class="form-input" placeholder="ex: Jane Doe" required>
            </div>
        `;

        actionSection.innerHTML = `
            <button type="button" class="btn-primary" id="continueBtn" disabled>Continue</button>
            <div class="previous-link" id="returnLink">
                <div class="previous-arrow">
                    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.5771 6.49985C15.5771 6.7985 15.4584 7.08503 15.2459 7.29753C15.0334 7.51003 14.7468 7.62873 14.4482 7.62873H3.93149L8.19656 11.8938C8.40906 12.1063 8.52776 12.3928 8.52776 12.6915C8.52776 12.9901 8.40906 13.2767 8.19656 13.4892C7.98406 13.7017 7.69753 13.8204 7.39887 13.8204C7.10021 13.8204 6.81368 13.7017 6.60118 13.4892L0.331299 7.21929C0.225684 7.11384 0.141942 6.98829 0.0849983 6.85013C0.0280547 6.71196 -0.00146484 6.56395 -0.00146484 6.41473C-0.00146484 6.26551 0.0280547 6.11749 0.0849983 5.97933C0.141942 5.84116 0.225684 5.71561 0.331299 5.61017L6.60118 -0.659714C6.70665 -0.765252 6.83221 -0.84895 6.97038 -0.905855C7.10855 -0.96276 7.25657 -0.992657 7.40581 -0.992625C7.55504 -0.992593 7.70307 -0.962634 7.84123 -0.905669C7.97939 -0.848704 8.10494 -0.764943 8.21037 -0.659344C8.31579 -0.553746 8.39949 -0.428185 8.4564 -0.290016C8.5133 -0.151848 8.5432 -0.00382826 8.54317 0.145408C8.54313 0.294644 8.51317 0.442661 8.45621 0.580824C8.39924 0.718986 8.31549 0.844537 8.21002 0.950114L3.93149 5.21097H14.4482C14.7468 5.21097 15.0334 5.32967 15.2459 5.54217C15.4584 5.75467 15.5771 6.0412 15.5771 6.33985V6.49985Z" fill="#8d8d8d" />
                    </svg>
                </div>
                <p class="previous-text">Return to Sign Up</p>
            </div>
        `;

        initScreen1();

    } else if (screenNumber === 2) {
        // Screen 2: Profile Picture Selection
        formContent.innerHTML = `
            <div class="header-content">
                <h1 class="creation-title">Choose Your Look</h1>
                <p class="creation-description">Pick your favorite profile picture from the selection below. This image will visually represent you!</p>
            </div>
            <div class="profile-pic-grid">
                ${profilePictures.map((pic, index) => `
                    <button class="profile-pic" data-index="${index}">
                        <img src="${pic}" alt="Profile Picture ${index + 1}">
                    </button>
                `).join('')}
            </div>
        `;

        actionSection.innerHTML = `
            <button type="button" class="btn-primary" id="continueBtn" disabled>Continue</button>
            <div class="previous-link" id="previousLink">
                <div class="previous-arrow">
                    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.5771 6.49985C15.5771 6.7985 15.4584 7.08503 15.2459 7.29753C15.0334 7.51003 14.7468 7.62873 14.4482 7.62873H3.93149L8.19656 11.8938C8.40906 12.1063 8.52776 12.3928 8.52776 12.6915C8.52776 12.9901 8.40906 13.2767 8.19656 13.4892C7.98406 13.7017 7.69753 13.8204 7.39887 13.8204C7.10021 13.8204 6.81368 13.7017 6.60118 13.4892L0.331299 7.21929C0.225684 7.11384 0.141942 6.98829 0.0849983 6.85013C0.0280547 6.71196 -0.00146484 6.56395 -0.00146484 6.41473C-0.00146484 6.26551 0.0280547 6.11749 0.0849983 5.97933C0.141942 5.84116 0.225684 5.71561 0.331299 5.61017L6.60118 -0.659714C6.70665 -0.765252 6.83221 -0.84895 6.97038 -0.905855C7.10855 -0.96276 7.25657 -0.992657 7.40581 -0.992625C7.55504 -0.992593 7.70307 -0.962634 7.84123 -0.905669C7.97939 -0.848704 8.10494 -0.764943 8.21037 -0.659344C8.31579 -0.553746 8.39949 -0.428185 8.4564 -0.290016C8.5133 -0.151848 8.5432 -0.00382826 8.54317 0.145408C8.54313 0.294644 8.51317 0.442661 8.45621 0.580824C8.39924 0.718986 8.31549 0.844537 8.21002 0.950114L3.93149 5.21097H14.4482C14.7468 5.21097 15.0334 5.32967 15.2459 5.54217C15.4584 5.75467 15.5771 6.0412 15.5771 6.33985V6.49985Z" fill="#8d8d8d" />
                    </svg>
                </div>
                <p class="previous-text">Previous Page</p>
            </div>
        `;

        initScreen2();

    } else if (screenNumber === 3) {
        // Screen 3: Grade Level
        formContent.innerHTML = `
            <div class="header-content">
                <h1 class="creation-title">Current Grade Level</h1>
                <p class="creation-description">By telling us what school grade you are in, you give us greater insight into what our community looks like!</p>
            </div>
            <div class="grade-input-container">
                <p class="grade-label">Grade</p>
                <input type="text" id="gradeLevel" class="grade-input" maxlength="1" inputmode="numeric" pattern="[1-5]*">
            </div>
        `;

        actionSection.innerHTML = `
            <button type="button" class="btn-primary" id="continueBtn" disabled>Continue</button>
            <div class="previous-link" id="previousLink">
                <div class="previous-arrow">
                    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.5771 6.49985C15.5771 6.7985 15.4584 7.08503 15.2459 7.29753C15.0334 7.51003 14.7468 7.62873 14.4482 7.62873H3.93149L8.19656 11.8938C8.40906 12.1063 8.52776 12.3928 8.52776 12.6915C8.52776 12.9901 8.40906 13.2767 8.19656 13.4892C7.98406 13.7017 7.69753 13.8204 7.39887 13.8204C7.10021 13.8204 6.81368 13.7017 6.60118 13.4892L0.331299 7.21929C0.225684 7.11384 0.141942 6.98829 0.0849983 6.85013C0.0280547 6.71196 -0.00146484 6.56395 -0.00146484 6.41473C-0.00146484 6.26551 0.0280547 6.11749 0.0849983 5.97933C0.141942 5.84116 0.225684 5.71561 0.331299 5.61017L6.60118 -0.659714C6.70665 -0.765252 6.83221 -0.84895 6.97038 -0.905855C7.10855 -0.96276 7.25657 -0.992657 7.40581 -0.992625C7.55504 -0.992593 7.70307 -0.962634 7.84123 -0.905669C7.97939 -0.848704 8.10494 -0.764943 8.21037 -0.659344C8.31579 -0.553746 8.39949 -0.428185 8.4564 -0.290016C8.5133 -0.151848 8.5432 -0.00382826 8.54317 0.145408C8.54313 0.294644 8.51317 0.442661 8.45621 0.580824C8.39924 0.718986 8.31549 0.844537 8.21002 0.950114L3.93149 5.21097H14.4482C14.7468 5.21097 15.0334 5.32967 15.2459 5.54217C15.4584 5.75467 15.5771 6.0412 15.5771 6.33985V6.49985Z" fill="#8d8d8d" />
                    </svg>
                </div>
                <p class="previous-text">Previous Page</p>
            </div>
        `;

        initScreen3();

    } else if (screenNumber === 4) {
        // Screen 4: Confirmation
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        const displayName = userData.displayName || 'Not Set';
        const profilePicture = userData.profilePicture || '../images/profile/alvaro-montoro-9NGHFQSR1MI-unsplash.jpg';
        const gradeLevel = userData.gradeLevel || '0';

        formContent.innerHTML = `
            <div class="header-content">
                <h1 class="creation-title">Is This Correct?</h1>
                <p class="creation-description">Before you finally create your account, briefly review the information below to see if we have it all correct.</p>
            </div>
            <div class="confirmation-container">
                <div class="profile-preview">
                    <img src="${profilePicture}" alt="Profile Picture" class="profile-preview-img" id="editProfilePicture">
                </div>
                <div class="info-container">
                    <div class="info-row">
                        <p class="info-name">${displayName}</p>
                        <button class="edit-btn" id="editName" aria-label="Edit Name">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.166 2.5009C14.3849 2.28203 14.6447 2.10842 14.9307 1.98996C15.2167 1.87151 15.5232 1.81055 15.8327 1.81055C16.1422 1.81055 16.4487 1.87151 16.7347 1.98996C17.0206 2.10842 17.2805 2.28203 17.4993 2.5009C17.7182 2.71977 17.8918 2.97961 18.0103 3.26558C18.1287 3.55155 18.1897 3.85804 18.1897 4.16757C18.1897 4.47709 18.1287 4.78358 18.0103 5.06955C17.8918 5.35552 17.7182 5.61536 17.4993 5.83423L6.24935 17.0842L1.66602 18.3342L2.91602 13.7509L14.166 2.5009Z" stroke="#8d8d8d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                    <div class="info-row">
                        <p class="info-grade">Grade Level : ${String(gradeLevel).padStart(2, '0')}</p>
                        <button class="edit-btn" id="editGrade" aria-label="Edit Grade">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14.166 2.5009C14.3849 2.28203 14.6447 2.10842 14.9307 1.98996C15.2167 1.87151 15.5232 1.81055 15.8327 1.81055C16.1422 1.81055 16.4487 1.87151 16.7347 1.98996C17.0206 2.10842 17.2805 2.28203 17.4993 2.5009C17.7182 2.71977 17.8918 2.97961 18.0103 3.26558C18.1287 3.55155 18.1897 3.85804 18.1897 4.16757C18.1897 4.47709 18.1287 4.78358 18.0103 5.06955C17.8918 5.35552 17.7182 5.61536 17.4993 5.83423L6.24935 17.0842L1.66602 18.3342L2.91602 13.7509L14.166 2.5009Z" stroke="#8d8d8d" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;

        actionSection.innerHTML = `
            <button type="button" class="btn-primary" id="confirmBtn">Confirm</button>
            <div class="previous-link" id="previousLink">
                <div class="previous-arrow">
                    <svg width="16" height="13" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.5771 6.49985C15.5771 6.7985 15.4584 7.08503 15.2459 7.29753C15.0334 7.51003 14.7468 7.62873 14.4482 7.62873H3.93149L8.19656 11.8938C8.40906 12.1063 8.52776 12.3928 8.52776 12.6915C8.52776 12.9901 8.40906 13.2767 8.19656 13.4892C7.98406 13.7017 7.69753 13.8204 7.39887 13.8204C7.10021 13.8204 6.81368 13.7017 6.60118 13.4892L0.331299 7.21929C0.225684 7.11384 0.141942 6.98829 0.0849983 6.85013C0.0280547 6.71196 -0.00146484 6.56395 -0.00146484 6.41473C-0.00146484 6.26551 0.0280547 6.11749 0.0849983 5.97933C0.141942 5.84116 0.225684 5.71561 0.331299 5.61017L6.60118 -0.659714C6.70665 -0.765252 6.83221 -0.84895 6.97038 -0.905855C7.10855 -0.96276 7.25657 -0.992657 7.40581 -0.992625C7.55504 -0.992593 7.70307 -0.962634 7.84123 -0.905669C7.97939 -0.848704 8.10494 -0.764943 8.21037 -0.659344C8.31579 -0.553746 8.39949 -0.428185 8.4564 -0.290016C8.5133 -0.151848 8.5432 -0.00382826 8.54317 0.145408C8.54313 0.294644 8.51317 0.442661 8.45621 0.580824C8.39924 0.718986 8.31549 0.844537 8.21002 0.950114L3.93149 5.21097H14.4482C14.7468 5.21097 15.0334 5.32967 15.2459 5.54217C15.4584 5.75467 15.5771 6.0412 15.5771 6.33985V6.49985Z" fill="#8d8d8d" />
                    </svg>
                </div>
                <p class="previous-text">Previous Page</p>
            </div>
        `;

        initScreen4();
    }

    // Add smooth transitions to all interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input');
    interactiveElements.forEach(element => {
        element.style.transition = 'all 0.2s ease';
    });
}

// Function to update progress bar
function updateProgressBar(screenNumber) {
    const progressSegments = document.querySelectorAll('.progress-segment');
    progressSegments.forEach((segment, index) => {
        if (index < screenNumber) {
            segment.classList.add('active');
        } else {
            segment.classList.remove('active');
        }
    });
}
