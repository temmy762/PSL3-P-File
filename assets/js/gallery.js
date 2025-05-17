document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    let isMenuOpen = false;    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        mobileMenuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.querySelector('.menu-overlay').classList.toggle('active');
        document.body.classList.toggle('menu-open');
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';

        // Enhanced menu item animations
        const menuItems = navLinks.querySelectorAll('li');
        menuItems.forEach((item, index) => {
            if (isMenuOpen) {
                // Reset animation
                item.style.animation = 'none';
                item.offsetHeight; // Trigger reflow
                item.style.animation = `slideIn 0.5s ease forwards ${index * 0.1}s`;
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                }, index * 100);
            } else {
                item.style.animation = '';
                item.style.opacity = '';
                item.style.transform = '';
            }
        });
    }

    mobileMenuToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });    // Close menu when clicking outside or on overlay
    document.addEventListener('click', (e) => {
        if (isMenuOpen && (e.target.classList.contains('menu-overlay') || !e.target.closest('.nav-container'))) {
            toggleMenu();
        }
    });

    // Close menu when clicking a nav link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                toggleMenu();
            }
        });
    });

    // Close menu on resize (if moving to desktop view)
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (window.innerWidth > 768 && isMenuOpen) {
                toggleMenu();
            }
        }, 250);
    });

    // Gallery configuration
    const galleryConfig = {
        images: [
            { 
                src: '../assets/images/bridal shower 4x6.jpg', 
                category: 'weddings',
                alt: 'Bridal Shower Photo Booth Moment' 
            },
            { 
                src: '../assets/images/bride+and+groom+pose+shot+on+black+white+photo+booth.jpeg', 
                category: 'weddings',
                alt: 'Bride and Groom Black and White Portrait' 
            },
            { 
                src: '../assets/images/husband and wife- flora backdrop.jpeg', 
                category: 'weddings',
                alt: 'Wedding Couple with Floral Backdrop' 
            },
            { 
                src: '../assets/images/BGK_9530.jpg', 
                category: 'corporate',
                alt: 'Corporate Event Photo Booth' 
            },
            { 
                src: '../assets/images/coporate event.jpeg', 
                category: 'corporate',
                alt: 'Corporate Team Building Event' 
            },
            { 
                src: '../assets/images/Party-360 photo booth.jpg', 
                category: '360',
                alt: '360 Degree Photo Booth Experience' 
            },
            { 
                src: '../assets/images/360 machine.jpeg', 
                category: '360',
                alt: '360 Photo Booth Setup' 
            },
            { 
                src: '../assets/images/birthday.jpeg', 
                category: 'birthday',
                alt: 'Birthday Celebration Photo Booth' 
            },
            { 
                src: '../assets/images/birthday party.jpeg', 
                category: 'birthday',
                alt: 'Birthday Party Group Photo' 
            },
            { 
                src: '../assets/images/school party.jpg', 
                category: 'vip',
                alt: 'School Event Photo Booth' 
            },
            { 
                src: '../assets/images/event-photo-booths-1024x683.jpg', 
                category: 'vip',
                alt: 'VIP Event Photo Booth Setup' 
            },
            { 
                src: '../assets/images/Event img.jpeg', 
                category: 'vip',
                alt: 'Special Event Photo Booth' 
            }
        ]
    };

    // Initialize gallery and video components
    const galleryGrid = document.querySelector('.gallery-grid');
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let touchStartX = 0;
    let touchEndX = 0;
    let currentImageIndex = 0;
    let isAnimating = false;

    // Enhanced lazy loading with Intersection Observer
    const lazyLoadImages = () => {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const wrapper = img.closest('.gallery-item');
                    
                    // Load the image
                    img.src = img.dataset.src;
                    img.onload = () => {
                        wrapper.classList.add('loaded');
                        wrapper.classList.remove('loading');
                    };
                    img.onerror = () => {
                        wrapper.classList.add('error');
                        wrapper.classList.remove('loading');
                    };
                    
                    observer.unobserve(img);
                }
            });
        }, {
            root: null,
            rootMargin: '50px',
            threshold: 0.1
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    };

    // Populate gallery with loading states
    function populateGallery() {
        const fragment = document.createDocumentFragment();
        
        galleryConfig.images.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = `gallery-item ${image.category} loading`;
            
            galleryItem.innerHTML = `
                <div class="gallery-item-inner">
                    <img 
                        src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                        data-src="${image.src}"
                        alt="${image.alt}"
                        loading="lazy">
                    <div class="gallery-item-overlay">
                        <span class="view-icon"><i class="fas fa-search"></i></span>
                    </div>
                </div>
            `;
            
            fragment.appendChild(galleryItem);

            // Staggered animation
            setTimeout(() => {
                galleryItem.style.opacity = '1';
                galleryItem.style.transform = 'translateY(0)';
            }, index * 100);
        });

        galleryGrid.appendChild(fragment);
        lazyLoadImages();

        // Add event listeners
        document.querySelectorAll('.gallery-item').forEach(item => {
            item.addEventListener('click', openLightbox);
            item.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') openLightbox(e);
            });
        });
    }

    // Touch events for lightbox
    function handleTouchStart(e) {
        touchStartX = e.touches[0].clientX;
    }

    function handleTouchMove(e) {
        touchEndX = e.touches[0].clientX;
    }

    function handleTouchEnd() {
        const touchDiff = touchStartX - touchEndX;
        const minSwipeDistance = 50;

        if (Math.abs(touchDiff) > minSwipeDistance) {
            if (touchDiff > 0) {
                // Swipe left - next image
                updateLightboxImage('next');
            } else {
                // Swipe right - previous image
                updateLightboxImage('prev');
            }
        }
    }

    // Improved video gallery with touch support
    function populateVideoGallery() {
        if (!videoGrid) return;
        
        const fragment = document.createDocumentFragment();
        
        galleryConfig.videos.forEach(video => {
            const videoItem = document.createElement('div');
            videoItem.className = `video-item ${video.type}`;
            
            videoItem.innerHTML = `
                <div class="video-wrapper">
                    <video src="${video.src}" 
                           poster="${video.poster}"
                           playsinline
                           muted 
                           loop>
                    </video>
                    <div class="video-overlay">
                        <span class="play-icon"><i class="fas fa-play"></i></span>
                    </div>
                </div>
            `;
            
            fragment.appendChild(videoItem);

            const videoElement = videoItem.querySelector('video');
            const overlay = videoItem.querySelector('.video-overlay');
            
            function toggleVideo() {
                if (videoElement.paused) {
                    videoElement.play();
                    overlay.style.opacity = '0';
                } else {
                    videoElement.pause();
                    overlay.style.opacity = '1';
                }
            }

            // Different interaction based on device type
            if (isMobile) {
                videoItem.addEventListener('click', toggleVideo);
            } else {
                videoItem.addEventListener('mouseenter', () => {
                    videoElement.play();
                    overlay.style.opacity = '0';
                });
                videoItem.addEventListener('mouseleave', () => {
                    videoElement.pause();
                    overlay.style.opacity = '1';
                });
            }
        });

        videoGrid.appendChild(fragment);
    }

    // Enhanced filter functionality with performance optimization
    const filterButtons = document.querySelectorAll('.filter-btn');
    let activeFilter = 'all';
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (isAnimating || btn.classList.contains('active')) return;
            isAnimating = true;
            
            const filter = btn.dataset.filter;
            activeFilter = filter;
            
            // Update active button state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Filter items with staggered animation
            const items = document.querySelectorAll('.gallery-item');
            let delay = 0;
            let visibleCount = 0;

            items.forEach((item, index) => {
                item.style.transition = 'all 0.3s ease';
                
                if (filter === 'all' || item.classList.contains(filter)) {
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                        item.style.display = 'block';
                    }, delay);
                    delay += 50;
                    visibleCount++;
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });

            setTimeout(() => {
                isAnimating = false;
            }, delay + 300);
        });
    });

    // Enhanced lightbox functionality
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = document.querySelector('.lightbox-image');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    
    function updateLightboxImage(direction = null) {
        if (isAnimating) return;
        isAnimating = true;

        const visibleImages = Array.from(document.querySelectorAll(`.gallery-item${activeFilter !== 'all' ? '.' + activeFilter : ''}:not([style*="display: none"]) img`));
        
        if (direction === 'next') {
            currentImageIndex = (currentImageIndex + 1) % visibleImages.length;
        } else if (direction === 'prev') {
            currentImageIndex = (currentImageIndex - 1 + visibleImages.length) % visibleImages.length;
        }
        
        const img = visibleImages[currentImageIndex];
        lightboxImage.style.opacity = '0';
        
        setTimeout(() => {
            lightboxImage.src = img.dataset.src || img.src;
            lightboxImage.alt = img.alt;
            lightboxImage.style.opacity = '1';
            isAnimating = false;
        }, 300);
    }

    function openLightbox(e) {
        const clickedItem = e.currentTarget;
        const visibleItems = Array.from(document.querySelectorAll(`.gallery-item${activeFilter !== 'all' ? '.' + activeFilter : ''}:not([style*="display: none"])`));
        currentImageIndex = visibleItems.indexOf(clickedItem);
        
        updateLightboxImage();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Add touch events for mobile
        if (isMobile) {
            lightbox.addEventListener('touchstart', handleTouchStart);
            lightbox.addEventListener('touchmove', handleTouchMove);
            lightbox.addEventListener('touchend', handleTouchEnd);
        }
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';

        // Remove touch events
        if (isMobile) {
            lightbox.removeEventListener('touchstart', handleTouchStart);
            lightbox.removeEventListener('touchmove', handleTouchMove);
            lightbox.removeEventListener('touchend', handleTouchEnd);
        }
    }

    // Event listeners
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (prevBtn) prevBtn.addEventListener('click', () => updateLightboxImage('prev'));
    if (nextBtn) nextBtn.addEventListener('click', () => updateLightboxImage('next'));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape': closeLightbox(); break;
            case 'ArrowLeft': updateLightboxImage('prev'); break;
            case 'ArrowRight': updateLightboxImage('next'); break;
        }
    });

    // Initialize
    populateGallery();
    populateVideoGallery();

    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (lightbox.classList.contains('active')) {
                updateLightboxImage();
            }
        }, 250);
    });
});
