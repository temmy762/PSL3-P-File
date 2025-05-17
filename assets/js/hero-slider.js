// Enhanced standalone slider script with robust error handling
document.addEventListener('DOMContentLoaded', function() {
    const slider = document.querySelector('.hero-slider');
    if (!slider) {
        console.error("Hero slider not found!");
        return;
    }
    
    // Get all slides
    const slides = slider.querySelectorAll('.slide');
    if (slides.length < 2) {
        console.warn("Not enough slides found:", slides.length);
        return;
    }
    
    console.log("Slider found with", slides.length, "slides");
    
    // For each slide, preload the image to ensure it's loaded properly
    slides.forEach((slide, index) => {
        const bgImage = slide.style.backgroundImage;
        if (bgImage) {
            // Extract the URL from the backgroundImage property
            const urlMatch = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
            if (urlMatch && urlMatch[1]) {
                const imageUrl = urlMatch[1];
                const img = new Image();
                img.onload = () => console.log(`✓ Slide ${index + 1} image loaded: ${imageUrl}`);
                img.onerror = () => {
                    console.error(`✗ Failed to load slide ${index + 1} image: ${imageUrl}`);
                    // Apply a fallback background color
                    slide.style.backgroundColor = '#000';
                };
                img.src = imageUrl;
            }
        } else {
            console.warn(`Slide ${index + 1} has no background image!`);
        }
    });
    
    let currentIndex = 0;
    
    function showSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Show the selected slide
        slides[index].classList.add('active');
        
        // Update dots
        const dots = slider.querySelectorAll('.slider-dot');
        if (dots.length > 0) {
            dots.forEach(dot => dot.classList.remove('active'));
            dots[index].classList.add('active');
        }
    }
    
    function nextSlide() {
        currentIndex = (currentIndex + 1) % slides.length;
        showSlide(currentIndex);
    }
    
    // Add click events to dots
    const dots = slider.querySelectorAll('.slider-dot');
    if (dots.length > 0) {
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                showSlide(currentIndex);
            });
        });
    }
    
    // Auto-advance slides
    const slideInterval = setInterval(nextSlide, 5000);
    
    // Pause automatic sliding when interacting with the slider
    slider.addEventListener('mouseover', () => clearInterval(slideInterval));
    
    // Resume automatic sliding when mouse leaves the slider
    slider.addEventListener('mouseleave', () => setInterval(nextSlide, 5000));
    
    // Make sure the first slide is shown initially
    showSlide(0);
    
    // Log initialization success
    console.log("✓ Hero slider initialized successfully!");
});
