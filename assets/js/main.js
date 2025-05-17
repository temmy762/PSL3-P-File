// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const header = document.querySelector('.main-header');
    let lastScroll = 0;

    // Handle mobile menu toggle
    mobileMenuToggle?.addEventListener('click', () => {
        mobileMenuToggle.classList.toggle('active');
        navLinks?.classList.toggle('active');
        document.body.classList.toggle('menu-open');
        
        // Prevent scrolling when menu is open
        if (document.body.classList.contains('menu-open')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        
        // Animate menu items
        const menuItems = navLinks?.querySelectorAll('li');
        menuItems?.forEach((item, index) => {
            if (navLinks.classList.contains('active')) {
                item.style.animation = `slideIn 0.3s ease forwards ${index * 0.1}s`;
            } else {
                item.style.animation = '';
            }
        });
    });

    // Close menu when clicking a link
    navLinks?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuToggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
            document.body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-container') && navLinks?.classList.contains('active')) {
            navLinks.classList.remove('active');
            document.body.classList.remove('menu-open');
        }
    });

    // Handle header visibility on scroll
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scrolled');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // Scrolling down
            header.classList.add('scroll-down');
            header.classList.remove('scroll-up');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // Scrolling up
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }

        header.classList.add('scrolled');
        lastScroll = currentScroll;
    });    // Initialize hero slider
    const sliderContainer = document.querySelector('.hero-slider');
    if (sliderContainer) {
        console.log("Found slider container:", sliderContainer);
        setTimeout(() => {
            try {
                const slider = new ImageSlider(sliderContainer);
                console.log("Slider initialized successfully");
            } catch (error) {
                console.error("Error initializing slider:", error);
            }
        }, 100); // Small delay to ensure DOM is fully ready
    } else {
        console.error("Could not find hero slider container");
    }
});

// Hero Slider
class ImageSlider {
    constructor(container) {
        this.container = container;
        // Use absolute paths to ensure images load correctly
        this.images = [
            'assets/images/hero section.jpeg',
            'assets/images/Event img.jpeg'
        ];
        this.currentIndex = 0;
        this.interval = 5000; // 5 seconds per slide
        this.intervalId = null;
        this.isTransitioning = false;
        
        // Create a test image to verify loading
        const testImage = new Image();
        testImage.onload = () => console.log("Test image loaded successfully");
        testImage.onerror = () => console.error("Failed to load test image");
        testImage.src = this.images[0];
        
        this.init();
        
        // Log status for debugging
        console.log("Slider initialized with images:", this.images);
    }    init() {
        // Check if slides already exist in the container
        const existingSlides = this.container.querySelectorAll('.slide');
        const existingDots = this.container.querySelector('.slider-controls')?.querySelectorAll('.slider-dot');
        
        // If slides already exist in HTML, use them instead of creating new ones
        if (existingSlides.length > 0) {
            console.log("Using existing slides in the HTML");
            
            // Add click events to existing dots
            if (existingDots && existingDots.length > 0) {
                existingDots.forEach((dot, index) => {
                    dot.addEventListener('click', () => this.goToSlide(index));
                });
            }
        } else {
            // Clear container and create new slides (fallback if HTML doesn't have slides)
            console.log("Creating new slides dynamically");
            this.container.innerHTML = '';
            
            // Create slides
            this.images.forEach((image, index) => {
                console.log("Creating slide with image:", image);
                const slide = document.createElement('div');
                slide.className = `slide ${index === 0 ? 'active' : ''}`;
                slide.style.backgroundImage = `url(${image})`;
                this.container.appendChild(slide);
            });

            // Create dots
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'slider-controls';
            
            this.images.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
                dot.addEventListener('click', () => this.goToSlide(index));
                dotsContainer.appendChild(dot);
            });
            
            this.container.appendChild(dotsContainer);
        }
        
        // Add event listeners for pause on hover
        this.container.addEventListener('mouseenter', () => this.pauseAutoSlide());
        this.container.addEventListener('mouseleave', () => this.resumeAutoSlide());
        
        // Start automatic sliding
        this.startAutoSlide();
    }

    goToSlide(index) {
        if (index === this.currentIndex || this.isTransitioning) return;
        
        // Set transitioning flag
        this.isTransitioning = true;
        
        // Update slides
        const slides = this.container.querySelectorAll('.slide');
        slides[this.currentIndex].classList.remove('active');
        slides[index].classList.add('active');
        
        // Update dots
        const dots = this.container.querySelectorAll('.slider-dot');
        dots[this.currentIndex].classList.remove('active');
        dots[index].classList.add('active');
        
        this.currentIndex = index;
        
        // Reset transitioning flag after transition completes
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000); // Match this to the CSS transition time
    }

    nextSlide() {
        const nextIndex = (this.currentIndex + 1) % this.images.length;
        this.goToSlide(nextIndex);
    }

    startAutoSlide() {
        this.intervalId = setInterval(() => this.nextSlide(), this.interval);
    }
    
    pauseAutoSlide() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    resumeAutoSlide() {
        if (!this.intervalId) {
            this.startAutoSlide();
        }
    }
}

// Smooth Scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe elements with animation classes
document.querySelectorAll('.feature, .section-title, .testimonial').forEach(el => {
    observer.observe(el);
});
