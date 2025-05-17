document.addEventListener('DOMContentLoaded', () => {
    // Remove fixed header behavior for contact page
    const header = document.querySelector('.main-header');
    header.style.position = 'relative';
    header.style.marginTop = '0';
    
    // Override existing scroll event with empty handler for this page
    // This prevents the header from changing position on scroll
    window.addEventListener('scroll', function contactPageScrollHandler(e) {
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
    });    // Initialize map
    const map = L.map('map').setView([34.1072, -118.2566], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add custom marker
    const marker = L.marker([34.1072, -118.2566]).addTo(map);
    marker.bindPopup("<b>PSL3 Productions</b><br>2260 Allesandro St<br>Los Angeles, CA 90039").openPopup();
    marker.bindPopup("<b>PSL3 Productions</b><br>Los Angeles, CA").openPopup();    // Form validation and submission
    const contactForm = document.getElementById('contactForm');
    const formInputs = contactForm.querySelectorAll('input, textarea, select');
    const formStatus = document.getElementById('formStatus');

    function validateInput(input) {
        const inputGroup = input.closest('.input-group');
        const errorMessage = inputGroup.querySelector('.error-message');

        // Skip validation for empty fields on input events (only validate on submit and blur)
        if (input.dataset.validating !== 'true' && !input.value.trim()) {
            return true;
        }

        if (!input.value.trim()) {
            inputGroup.classList.add('error');
            if (!errorMessage) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'This field is required';
                inputGroup.appendChild(error);
            }
            return false;
        }

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
        
        if (input.type === 'date' && !validateDate(input.value)) {
            inputGroup.classList.add('error');
            if (!errorMessage) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Please select a valid future date';
                inputGroup.appendChild(error);
            }
            return false;
        }        inputGroup.classList.remove('error');
        inputGroup.classList.add('valid');
        if (errorMessage) {
            errorMessage.remove();
        }
        return true;
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validatePhone(phone) {
        return /^[\d\s\-+()]{10,}$/.test(phone.replace(/[^\d\s\-+()]/g, ''));
    }
    
    function validateDate(dateString) {
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
                contactForm.reset();
            }, 5000);
        }
    }

    formInputs.forEach(input => {
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

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        let isValid = true;
        formInputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        const submitBtn = contactForm.querySelector('.submit-btn');
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
            const formData = new FormData(contactForm);
            const formDataObj = {};
            formData.forEach((value, key) => {
                formDataObj[key] = value;
            });
            
            console.log('Form data to be submitted:', formDataObj);
            
            // Simulate API call with a delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Show success status
            showFormStatus('success', 'Thank you for reaching out! Your message has been received. We will contact you shortly to discuss your event in detail.');
            
            // Reset form fields with a delay to allow for visual feedback
            setTimeout(() => {
                contactForm.reset();
            }, 500);
            
            // Update button to show success
            btnText.textContent = 'Message Sent!';
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
            showFormStatus('error', 'Something went wrong while sending your message. Please try again or contact us directly by phone.');
            
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

    // FAQ Accordion
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = '0';
                }
            });

            // Toggle current item
            item.classList.toggle('active');
            if (!isActive) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = '0';
            }
        });
    });

    // Animate elements on scroll
    const animateElements = document.querySelectorAll('.info-card, .contact-form-container, .faq-item');
    
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
