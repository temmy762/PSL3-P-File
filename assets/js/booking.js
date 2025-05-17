document.addEventListener('DOMContentLoaded', () => {
    // Remove fixed header behavior for booking page
    const header = document.querySelector('.main-header');
    header.style.position = 'relative';
    header.style.marginTop = '0';
    
    // Override existing scroll event with empty handler for this page
    // This prevents the header from changing position on scroll
    window.addEventListener('scroll', function bookingPageScrollHandler(e) {
        // Keep header in place - override any other scroll behaviors
        header.classList.remove('scrolled', 'scroll-down', 'scroll-up');
        e.stopPropagation();
    }, true);
    
    // Reset any existing classes
    header.classList.remove('scrolled', 'scroll-down', 'scroll-up');
    
    // Mobile menu functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const menuOverlay = document.querySelector('.menu-overlay');
    let isMenuOpen = false;

    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        menuOverlay.classList.toggle('active');
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    }

    mobileMenuToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !e.target.closest('.nav-container')) {
            toggleMenu();
        }
    });
    
    // Form validation and submission
    const inquiryForm = document.getElementById('inquiryForm');
    const formInputs = inquiryForm.querySelectorAll('input, textarea, select');
    const formStatus = document.getElementById('formStatus');

    function validateInput(input) {
        // Skip checkbox validation here - they're handled separately
        if (input.type === 'checkbox') {
            return true;
        }
        
        const inputGroup = input.closest('.input-group');
        const errorMessage = inputGroup.querySelector('.error-message');

        // Skip validation for empty fields on input events (only validate on submit and blur)
        if (input.dataset.validating !== 'true' && !input.value.trim()) {
            return true;
        }

        // Skip validation for non-required fields that are empty
        if (!input.required && !input.value.trim()) {
            inputGroup.classList.remove('error');
            if (errorMessage) errorMessage.remove();
            return true;
        }

        // Required field validation
        if (input.required && !input.value.trim()) {
            inputGroup.classList.add('error');
            if (!errorMessage) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'This field is required';
                inputGroup.appendChild(error);
            }
            return false;
        }

        // Email validation
        if (input.type === 'email' && !validateEmail(input.value)) {
            inputGroup.classList.add('error');
            if (!errorMessage) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please enter a valid email address';
                inputGroup.appendChild(error);
            }
            return false;
        }

        // Phone validation
        if (input.type === 'tel' && !validatePhone(input.value)) {
            inputGroup.classList.add('error');
            if (!errorMessage) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please enter a valid phone number (min 10 digits)';
                inputGroup.appendChild(error);
            }
            return false;
        }
        
        // Date validation
        if (input.type === 'date' && !validateDate(input.value)) {
            inputGroup.classList.add('error');
            if (!errorMessage) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please select a valid future date';
                inputGroup.appendChild(error);
            }
            return false;
        }
        
        // Remove error if validation passes
        inputGroup.classList.remove('error');
        inputGroup.classList.add('valid');
        if (errorMessage) {
            errorMessage.remove();
        }
        return true;
    }

    // Validate at least one event type is selected
    function validateEventTypes() {
        const checkboxes = document.querySelectorAll('input[name="eventType"]');
        const container = document.getElementById('eventTypeContainer');
        const errorMessage = container.querySelector('.error-message');
        
        let isChecked = false;
        checkboxes.forEach(cb => {
            if (cb.checked) isChecked = true;
        });
        
        if (!isChecked) {
            container.classList.add('error');
            if (!errorMessage) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please select at least one event type';
                container.appendChild(error);
            }
            return false;
        } else {
            container.classList.remove('error');
            if (errorMessage) errorMessage.remove();
            return true;
        }
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^[\d\s\-+()]{10,}$/.test(phone.replace(/[^\d\s\-+()]/g, ''));
    }
    
    function validateDate(dateString) {
        if (!dateString) return false;
        
        const selectedDate = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
    }

    // Show form submission status
    function showFormStatus(type, message) {
        formStatus.textContent = message;
        formStatus.className = 'form-status ' + type;
        
        // Scroll to status message
        setTimeout(() => {
            formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        if (type === 'success') {
            setTimeout(() => {
                formStatus.className = 'form-status';
            }, 8000);
        }
    }

    // Validate form inputs on blur and input events
    formInputs.forEach(input => {
        // Skip checkbox event listeners - they're handled separately
        if (input.type === 'checkbox') return;
        
        input.addEventListener('blur', () => {
            input.dataset.validating = 'true';
            validateInput(input);
        });
        
        input.addEventListener('input', () => {
            if (input.dataset.validating === 'true') {
                validateInput(input);
            }
            
            const inputGroup = input.closest('.input-group');
            if (input.value.trim()) {
                inputGroup.classList.add('has-value');
            } else {
                inputGroup.classList.remove('has-value');
            }
        });
        
        // Special handling for date input to ensure labels work correctly
        if (input.type === 'date') {
            input.addEventListener('change', () => {
                const inputGroup = input.closest('.input-group');
                if (input.value) {
                    inputGroup.classList.add('has-value');
                }
            });
        }
    });
    
    // Add event listeners to event type checkboxes
    const eventTypeCheckboxes = document.querySelectorAll('input[name="eventType"]');
    eventTypeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', validateEventTypes);
    });

    // Form submission handler
    inquiryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;
        
        // Validate all form inputs
        formInputs.forEach(input => {
            // Skip checkboxes - they're handled separately
            if (input.type !== 'checkbox' && !validateInput(input)) {
                isValid = false;
            }
        });
        
        // Validate event type checkboxes
        if (!validateEventTypes()) {
            isValid = false;
        }

        if (!isValid) return;

        const submitBtn = inquiryForm.querySelector('.submit-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const originalText = btnText.textContent;
        
        // Show a nicer form submission animation
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        
        // Add loading animation to button icon
        const btnIcon = submitBtn.querySelector('i');
        btnIcon.className = 'fas fa-spinner fa-spin';

        try {
            // Gather form data for simulated submission
            const formData = new FormData(inquiryForm);
            const formDataObj = {};
            formData.forEach((value, key) => {
                // Handle multiple checkboxes with the same name
                if (key === 'eventType') {
                    if (!formDataObj[key]) formDataObj[key] = [];
                    formDataObj[key].push(value);
                } else {
                    formDataObj[key] = value;
                }
            });
            
            console.log('Form data to be submitted:', formDataObj);
            
            // Simulate API call with a delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success status
            showFormStatus('success', 'Thank you for your inquiry! We\'ve received your details and will contact you shortly to discuss your event.');
            
            // Reset form fields with a delay to allow for visual feedback
            setTimeout(() => {
                inquiryForm.reset();
                
                // Reset validation states
                formInputs.forEach(input => {
                    const inputGroup = input.closest('.input-group');
                    if (inputGroup) {
                        inputGroup.classList.remove('error', 'valid', 'has-value');
                        const errorMessage = inputGroup.querySelector('.error-message');
                        if (errorMessage) errorMessage.remove();
                    }
                });
                
                // Reset event type validation
                const eventTypeContainer = document.getElementById('eventTypeContainer');
                eventTypeContainer.classList.remove('error');
                const errorMessage = eventTypeContainer.querySelector('.error-message');
                if (errorMessage) errorMessage.remove();
                
            }, 500);
            
            // Update button to show success
            btnText.textContent = 'Inquiry Sent!';
            btnIcon.className = 'fas fa-check';
            
            // Reset button after delay
            setTimeout(() => {
                btnText.textContent = originalText;
                btnIcon.className = 'fas fa-paper-plane';
                submitBtn.disabled = false;
            }, 4000);
            
        } catch (error) {
            console.error('Form submission error:', error);
            
            // Show error status
            showFormStatus('error', 'Something went wrong while sending your inquiry. Please try again or contact us directly by phone.');
            
            // Update button to show error
            btnText.textContent = 'Error! Try Again';
            btnIcon.className = 'fas fa-exclamation-triangle';
            
            // Reset button after delay
            setTimeout(() => {
                btnText.textContent = originalText;
                btnIcon.className = 'fas fa-paper-plane';
                submitBtn.disabled = false;
            }, 3000);
        }
    });

    // Animate elements on scroll
    const animateElements = document.querySelectorAll('.info-card, .inquiry-form-container, .testimonial-card');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(element => {
        element.style.opacity = '0';
        observer.observe(element);
    });
});
