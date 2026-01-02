// About Page JavaScript for Bute, Wajir, Kenya

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Animated counter for stats
    const statNumbers = document.querySelectorAll('.stat-number');
    
    function animateCounter(element, target) {
        let current = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 20);
    }

    // Intersection Observer for animated counters
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumber = entry.target;
                const target = parseInt(statNumber.getAttribute('data-count'));
                
                // Add plus sign for 1000+ numbers
                if (target >= 1000) {
                    const displayTarget = target >= 1000 ? '1000+' : target;
                    animateCounter(statNumber, target);
                    setTimeout(() => {
                        statNumber.textContent = displayTarget;
                    }, 2000);
                } else {
                    animateCounter(statNumber, target);
                }
                
                observer.unobserve(statNumber);
            }
        });
    }, observerOptions);

    statNumbers.forEach(stat => {
        observer.observe(stat);
    });

    // Team member hover animation
    const teamMembers = document.querySelectorAll('.team-member');
    
    teamMembers.forEach(member => {
        member.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });
        
        member.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Timeline item animation
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateX(0)';
            }
        });
    }, {
        threshold: 0.3
    });

    timelineItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = index % 2 === 0 ? 'translateX(-50px)' : 'translateX(50px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        timelineObserver.observe(item);
    });

    // Map Modal functionality for Bute, Wajir
    const openMapBtn = document.getElementById('openMap');
    const mapModal = document.getElementById('mapModal');
    const mapModalClose = document.getElementById('mapModalClose');
    const copyAddressBtn = document.getElementById('copyAddress');

    // Bute, Wajir coordinates and details - CORRECTED GOOGLE MAPS LINK
    const buteWajirDetails = {
        address: "Bute 5 Star Restaurant, Bute Town Center, Wajir County, Kenya",
        landmark: "Next to Bute Central Mosque",
        
        googleMapsUrl: "https://www.google.com/maps/place/Central+mosque/@3.3608111,39.4176054,18z/data=!4m15!1m8!3m7!1s0x1794fc31edf2141b:0x9a722aed81286f38!2sBute+Boys+Secondary+School!8m2!3d3.3602516!4d39.4153974!10e5!16s%2Fg%2F1tdtyrnp!3m5!1s0x1794fdc143197167:0x3114ff153fd6d9f0!8m2!3d3.3610666!4d39.4192544!16s%2Fg%2F11m_d1xfwb?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D", 
        googleMapsSearchUrl: "https://www.google.com/maps/search/?api=1&query=Bute+5+Star+Restaurant+Bute+Wajir+Kenya", 
        directions: {
            car: "From Wajir Town, take the Wajir-Bute Road (C91) north for approximately 60km. Turn left at Bute Town Center. Restaurant is on the main road next to Central Mosque.",
            publicTransport: "Take a Taxi from Wajir Town main bus station to Bute. Matatus depart every hour from 6 AM to 6 PM. Journey takes about 4 hours.",
            parking: "Ample parking available in Bute Town Center. Complimentary valet parking for restaurant guests. Secure parking lot with CCTV surveillance."
        }
    };

    // Update the map modal content with Bute, Wajir details
    function updateMapModalContent() {
        // Update address display
        const mapAddress = document.querySelector('.map-address');
        if (mapAddress) {
            mapAddress.innerHTML = `
                <strong>Address:</strong> ${buteWajirDetails.address}<br>
                <strong>Landmark:</strong> ${buteWajirDetails.landmark}<br>
               
                <strong>County:</strong> Wajir County, Kenya<br>
                <strong>Region:</strong> North Eastern Kenya
            `;
        }

        // CORRECTED: Update Google Maps link
        const googleMapsLink = document.querySelector('.btn-map-action[href*="google"]');
        if (googleMapsLink) {
            googleMapsLink.href = buteWajirDetails.googleMapsUrl;
            googleMapsLink.title = "Open Bute, Wajir location in Google Maps";
        }

        // Add direct coordinates link as well
        const coordinatesLink = `
            
        `;
        
        const mapActions = document.querySelector('.map-actions');
        if (mapActions && !document.querySelector('.btn-map-action[href*="@"]')) {
            mapActions.insertAdjacentHTML('beforeend', coordinatesLink);
        }

        // Update directions
        const directionsDiv = document.querySelector('.map-directions');
        if (directionsDiv) {
            directionsDiv.innerHTML = `
                <h4><i class="fas fa-directions"></i> Getting to Bute, Wajir</h4>
                <div class="direction-method">
                    <h5><i class="fas fa-car"></i> By Car from Wajir Town</h5>
                    <p>${buteWajirDetails.directions.car}</p>
                    <small><i class="fas fa-clock"></i> Estimated travel time: 4-5.5 hours</small>
                </div>
                <div class="direction-method">
                    <h5><i class="fas fa-bus"></i> Public Transport</h5>
                    <p>${buteWajirDetails.directions.publicTransport}</p>
                    <small><i class="fas fa-info-circle"></i> Fare: KSh 300-500 depending on season</small>
                </div>
                <div class="direction-method">
                    <h5><i class="fas fa-parking"></i> Parking</h5>
                    <p>${buteWajirDetails.directions.parking}</p>
                </div>
                <div class="direction-method">
                    <h5><i class="fas fa-info-circle"></i> Travel Tips for Northern Kenya</h5>
                    <p><strong>Best time to travel:</strong> Daylight hours (6 AM - 6 PM)<br>
                    <strong>Road condition:</strong> Mostly paved with some rough sections<br>
                    <strong>Mobile network:</strong> Good coverage with Safaricom and Airtel<br>
                    <strong>Nearest fuel station:</strong> In Bute Town Center (24/7)</p>
                </div>
            `;
        }

        // Update map placeholder text
        const mapPlaceholder = document.querySelector('.map-placeholder');
        if (mapPlaceholder) {
            const h4 = mapPlaceholder.querySelector('h4');
            const p = mapPlaceholder.querySelector('p');
            if (h4) h4.textContent = "Bute, Wajir County";
            if (p) p.textContent = "North Eastern Kenya";
            
            // Add Kenya flag
            const flagSpan = document.createElement('span');
            flagSpan.className = 'kenya-flag';
            flagSpan.style.marginRight = '10px';
            h4.insertBefore(flagSpan, h4.firstChild);
        }

        const mapPlaceholderLarge = document.querySelector('.map-placeholder-large');
        if (mapPlaceholderLarge) {
            const h4 = mapPlaceholderLarge.querySelector('h4');
            const p = mapPlaceholderLarge.querySelector('p');
            if (h4) h4.textContent = "Bute 5 Star Restaurant";
            if (p) p.textContent = "Bute Town, Wajir County, Kenya";
            
            // Add interactive map note
           
        }
    }

    // Initialize map modal with Bute, Wajir details
    updateMapModalContent();

    if (openMapBtn) {
        openMapBtn.addEventListener('click', () => {
            mapModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            // Update modal title with location
            const modalTitle = document.querySelector('.map-modal-header h3');
            if (modalTitle) {
                modalTitle.innerHTML = '<i class="fas fa-map-marker-alt"></i> Our Location in Bute, Wajir';
            }
        });
    }

    if (mapModalClose) {
        mapModalClose.addEventListener('click', () => {
            mapModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === mapModal) {
            mapModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Copy address functionality for Bute, Wajir
    if (copyAddressBtn) {
        copyAddressBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(buteWajirDetails.address).then(() => {
                // Show success message
                const originalText = copyAddressBtn.innerHTML;
                copyAddressBtn.innerHTML = '<i class="fas fa-check"></i> Address Copied!';
                copyAddressBtn.style.background = 'linear-gradient(to right, #4caf50, #2e7d32)';
                
                setTimeout(() => {
                    copyAddressBtn.innerHTML = originalText;
                    copyAddressBtn.style.background = 'linear-gradient(to right, #0c3b2e, #1a5c48)';
                }, 2000);
                
                // Also copy coordinates
                navigator.clipboard.writeText(`${buteWajirDetails.address}\nCoordinates: ${buteWajirDetails.coordinates}`);
            }).catch(err => {
                console.error('Failed to copy address: ', err);
                alert('Failed to copy address. Please copy manually:\n\n' + buteWajirDetails.address + '\n\nCoordinates: ' + buteWajirDetails.coordinates);
            });
        });
    }

    // Award items hover effect
    const awardItems = document.querySelectorAll('.award-item');
    
    awardItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.award-icon i');
            if (icon) {
                icon.style.transform = 'scale(1.2)';
                icon.style.transition = 'transform 0.3s ease';
            }
        });
        
        item.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.award-icon i');
            if (icon) {
                icon.style.transform = 'scale(1)';
            }
        });
    });

    // Philosophy image parallax effect
    const philosophyImage = document.querySelector('.philosophy-image');
    
    if (philosophyImage) {
        window.addEventListener('scroll', () => {
            const scrollPosition = window.pageYOffset;
            const imagePosition = philosophyImage.offsetTop;
            const windowHeight = window.innerHeight;
            
            if (scrollPosition > imagePosition - windowHeight + 200) {
                const parallaxValue = (scrollPosition - imagePosition) * 0.1;
                philosophyImage.style.transform = `translateY(${parallaxValue}px)`;
            }
        });
    }

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Add active class to current section in view
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    function updateActiveNav() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}` || 
                (current === '' && item.getAttribute('href') === 'index.html')) {
                item.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();

    // Update location text throughout the page
    function updateLocationText() {
        // Update visit details
        const locationDetail = document.querySelector('.detail-item:nth-child(1) .detail-content p');
        if (locationDetail) {
            locationDetail.innerHTML = "Bute Town Center, Wajir County<br>Next to Bute Central Mosque<br><span class='wajir-highlight'>North Eastern Kenya</span>";
        }

        // Update footer contact
        const footerLocation = document.querySelector('.footer-contact p:nth-child(1)');
        if (footerLocation) {
            footerLocation.innerHTML = "<i class='fas fa-map-marker-alt'></i> Bute Town, Wajir County, Kenya";
        }

        // Update page title with location
        const pageTitle = document.querySelector('title');
        if (pageTitle) {
            pageTitle.textContent = "About Us | Bute 5 Star Restaurant - Wajir, Kenya";
        }

        // Add Kenya flag to location headers
        const locationHeaders = document.querySelectorAll('h4, .detail-content h4');
        locationHeaders.forEach(header => {
            if (header.textContent.includes('Location') || header.textContent.includes('Address')) {
                header.innerHTML = `<span class="kenya-flag"></span>${header.innerHTML}`;
            }
        });
        
        // Update hero section with Google Maps link
        const heroSection = document.querySelector('.about-hero');
        if (heroSection) {
            const mapLink = document.createElement('a');
            mapLink.href = buteWajirDetails.googleMapsUrl;
            mapLink.target = '_blank';
            mapLink.className = 'map-direct-link';
            mapLink.innerHTML = '<i class="fas fa-map-marked-alt"></i> View on Google Maps';
            mapLink.style.display = 'inline-block';
            mapLink.style.marginTop = '20px';
            mapLink.style.padding = '10px 20px';
            mapLink.style.background = 'rgba(255, 255, 255, 0.2)';
            mapLink.style.color = 'white';
            mapLink.style.borderRadius = '50px';
            mapLink.style.textDecoration = 'none';
            mapLink.style.transition = 'all 0.3s ease';
            mapLink.style.border = '1px solid rgba(255, 255, 255, 0.3)';
            
            mapLink.addEventListener('mouseenter', function() {
                this.style.background = 'rgba(255, 180, 0, 0.3)';
                this.style.transform = 'translateY(-2px)';
            });
            
            mapLink.addEventListener('mouseleave', function() {
                this.style.background = 'rgba(255, 255, 255, 0.2)';
                this.style.transform = 'translateY(0)';
            });
            
            heroSection.querySelector('.about-hero-content').appendChild(mapLink);
        }
    }

    // Initialize location text updates
    updateLocationText();

    // Add Wajir-specific content to story section
    function addWajirContext() {
        const timelineItems = document.querySelectorAll('.timeline-content');
        timelineItems.forEach(item => {
            const text = item.querySelector('p').textContent;
            if (text.includes('Gumar') || text.includes('Bute District')) {
                item.querySelector('p').innerHTML = text.replace('Gumar, Bute District', 
                    `<strong>Bute Town, Wajir County</strong>`) + 
                    " <span class='wajir-highlight'>Northern Kenya's Premier Dining Destination</span>";
            }
        });

        // Update hero description
        const heroDesc = document.querySelector('.about-hero p');
        if (heroDesc) {
            heroDesc.innerHTML = "Discover the journey of Bute 5 Star Restaurant in the heart of Wajir County, " +
                "where passion for food meets commitment to excellence in every detail. " +
                "<span class='wajir-highlight'>Proudly serving North Eastern Kenya since 2008.</span>";
        }

        // Update section descriptions
        const sectionDescriptions = document.querySelectorAll('.section-title p');
        sectionDescriptions.forEach(desc => {
            if (desc.textContent.includes('culinary landmark')) {
                desc.innerHTML = "From a small family restaurant in Wajir County to a culinary landmark in Northern Kenya";
            }
            if (desc.textContent.includes('award-winning cuisine')) {
                desc.innerHTML = "The talented individuals behind North Eastern Kenya's finest halal cuisine";
            }
            if (desc.textContent.includes('Experience the difference')) {
                desc.innerHTML = "Experience the finest dining in Wajir County";
            }
        });
    }

    // Initialize Wajir context
    addWajirContext();

    // Initialize animations on page load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Add loading animation for images
window.addEventListener('load', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.5s ease';
        
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
        }
    });
});

// Add Kenya location info to console with Google Maps link
console.log(`
🌍 Bute 5 Star Restaurant - Wajir, Kenya
📍 Location: Bute Town Center, Wajir County, Kenya
🗺️ Google Maps: https://www.google.com/maps/place/Wajir,+Kenya/
📞 Contact: +254 721 237 883
🌐 Serving North Eastern Kenya with excellence since 2008
`);