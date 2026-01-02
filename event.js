// Events Page JavaScript for Bute 5 Star Restaurant with Admin Panel

document.addEventListener('DOMContentLoaded', function() {
    // Admin Configuration
    const ADMIN_CONFIG = {
        defaultPassword: 'Ahmedinho77.', // CHANGE THIS FOR PRODUCTION!
        sessionTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
        rememberMeDays: 7
    };

    // State variables
    let isAdminLoggedIn = false;
    let sessionTimer = null;
    let adminPassword = ADMIN_CONFIG.defaultPassword;
    let currentInquiries = [];
    let filteredInquiries = [];

    // DOM Elements
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const adminPanelBtn = document.getElementById('adminPanelBtn');
    const adminLoginModal = document.getElementById('adminLoginModal');
    const adminPanelModal = document.getElementById('adminPanelModal');
    const adminModalClose = document.getElementById('adminModalClose');
    const loginModalClose = document.getElementById('loginModalClose');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminPasswordInput = document.getElementById('adminPassword');
    const togglePassword = document.getElementById('togglePassword');
    const adminLogoutBtn = document.getElementById('adminLogout');
    const changePasswordBtn = document.getElementById('changePassword');
    const changePasswordModal = document.getElementById('changePasswordModal');
    const changePasswordClose = document.getElementById('changePasswordClose');
    const changePasswordForm = document.getElementById('changePasswordForm');
    const cancelChangePasswordBtn = document.getElementById('cancelChangePassword');
    const exportCSVBtn = document.getElementById('exportCSV');
    const printInquiriesBtn = document.getElementById('printInquiries');
    const clearAllInquiriesBtn = document.getElementById('clearAllInquiries');
    const searchInquiriesInput = document.getElementById('searchInquiries');
    const filterStatusSelect = document.getElementById('filterStatus');
    const filterEventTypeSelect = document.getElementById('filterEventType');
    const inquiriesList = document.getElementById('inquiriesList');
    const sessionTimerElement = document.getElementById('sessionTimer');
    const totalInquiriesElement = document.getElementById('totalInquiries');
    const pendingInquiriesElement = document.getElementById('pendingInquiries');
    const contactedInquiriesElement = document.getElementById('contactedInquiries');
    const confirmedInquiriesElement = document.getElementById('confirmedInquiries');

    // Mobile menu toggle
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }

    // Initialize date picker for event inquiry
    const eventDatePicker = flatpickr("#eventDate", {
        minDate: "today",
        maxDate: new Date().fp_incr(365),
        dateFormat: "Y-m-d",
        disableMobile: false,
        locale: { firstDayOfWeek: 1 },
        onChange: updateInquirySummary
    });

    // Event space details modal
    const spaceModal = document.getElementById('spaceModal');
    const spaceModalClose = document.getElementById('spaceModalClose');
    const spaceModalBody = document.getElementById('spaceModalBody');
    const viewSpaceButtons = document.querySelectorAll('.btn-view-space');

    // Space details data
    const spaceDetails = {
        terrace: {
            title: "Garden Terrace",
            capacity: "40-60 guests",
            image: "images/terrace-space.jpg",
            description: "Our beautiful outdoor terrace offers a stunning garden setting perfect for sunset events, summer celebrations, and outdoor gatherings. The space features comfortable seating, garden views, and a sophisticated ambiance.",
            features: [
                "Open-air setting with covered areas",
                "Beautiful garden and sunset views",
                "Flexible seating arrangements",
                "Outdoor heating for cooler evenings",
                "Garden lighting and decor included",
                "Direct access to main restaurant"
            ],
            dimensions: "500 sq ft (46 sq m)",
            rentalFee: "$500 (minimum spend applies)",
            bestFor: ["Wedding ceremonies", "Summer parties", "Corporate mixers", "Birthday celebrations", "Sunset cocktails"]
        },
        private: {
            title: "The Royal Room",
            capacity: "20-40 guests",
            image: "images/private-room.jpg",
            description: "An elegant private dining room with customizable decor, perfect for intimate gatherings, business dinners, and special celebrations. The room features sophisticated furnishings and personalized service.",
            features: [
                "Customizable decor and lighting",
                "State-of-the-art audio-visual system",
                "Dedicated service staff",
                "Private entrance available",
                "Adjustable room partitioning",
                "Complimentary WiFi"
            ],
            dimensions: "300 sq ft (28 sq m)",
            rentalFee: "$300 (minimum spend applies)",
            bestFor: ["Business meetings", "Intimate dinners", "Anniversary celebrations", "Small weddings", "Family gatherings"]
        },
        main: {
            title: "Grand Ballroom",
            capacity: "80-120 guests",
            image: "images/main-dining.jpg",
            description: "Our largest event space with sophisticated ambiance, ideal for weddings, corporate galas, and large celebrations. Features a stage, dance floor, and professional lighting system.",
            features: [
                "Stage and dance floor included",
                "Professional audio system",
                "Advanced lighting system",
                "Projector and screen available",
                "Multiple entry points",
                "Full-service bar setup"
            ],
            dimensions: "1200 sq ft (111 sq m)",
            rentalFee: "$800 (minimum spend applies)",
            bestFor: ["Wedding receptions", "Corporate galas", "Large birthday parties", "Charity events", "Product launches"]
        },
        boardroom: {
            title: "Executive Boardroom",
            capacity: "10-20 guests",
            image: "images/boardroom.jpg",
            description: "Modern boardroom with state-of-the-art technology for business meetings, presentations, and executive gatherings. Equipped with video conferencing and presentation tools.",
            features: [
                "Video conferencing system",
                "Interactive whiteboard",
                "High-speed WiFi",
                "Presentation tools included",
                "Comfortable ergonomic chairs",
                "Natural daylight with blackout options"
            ],
            dimensions: "200 sq ft (18.5 sq m)",
            rentalFee: "$150 per half-day",
            bestFor: ["Business meetings", "Strategy sessions", "Client presentations", "Team workshops", "Executive lunches"]
        }
    };

    // View space details
    viewSpaceButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const spaceCard = this.closest('.space-card');
            const spaceType = spaceCard.getAttribute('data-space');
            
            if (spaceDetails[spaceType]) {
                showSpaceDetails(spaceDetails[spaceType]);
            }
        });
    });

    // Close space modal
    spaceModalClose.addEventListener('click', () => {
        closeSpaceModal();
    });

    window.addEventListener('click', (e) => {
        if (e.target === spaceModal) {
            closeSpaceModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && spaceModal.style.display === 'flex') {
            closeSpaceModal();
        }
    });

    function closeSpaceModal() {
        spaceModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }

    function showSpaceDetails(space) {
        spaceModalBody.innerHTML = `
            <div class="space-details">
                <div class="space-details-header">
                    <h2>${space.title}</h2>
                    <div class="space-capacity">Capacity: ${space.capacity}</div>
                </div>
                
                <div class="space-details-image">
                    <img src="${space.image}" alt="${space.title}">
                </div>
                
                <div class="space-details-content">
                    <div class="space-details-section">
                        <h3><i class="fas fa-info-circle"></i> Description</h3>
                        <p>${space.description}</p>
                    </div>
                    
                    <div class="space-details-grid">
                        <div class="space-details-section">
                            <h3><i class="fas fa-check-circle"></i> Features</h3>
                            <ul>
                                ${space.features.map(feature => `<li><i class="fas fa-check"></i> ${feature}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="space-details-section">
                            <h3><i class="fas fa-cube"></i> Specifications</h3>
                            <div class="specifications">
                                <div class="spec-item">
                                    <span class="spec-label">Dimensions:</span>
                                    <span class="spec-value">${space.dimensions}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Rental Fee:</span>
                                    <span class="spec-value">${space.rentalFee}</span>
                                </div>
                                <div class="spec-item">
                                    <span class="spec-label">Minimum Booking:</span>
                                    <span class="spec-value">3 hours</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-details-section">
                        <h3><i class="fas fa-star"></i> Best For</h3>
                        <div class="best-for-tags">
                            ${space.bestFor.map(item => `<span class="tag">${item}</span>`).join('')}
                        </div>
                    </div>
                    
                    <div class="space-details-actions">
                        <button class="btn-select-space" onclick="selectSpace('${space.title}')">
                            <i class="fas fa-check"></i> Select This Space
                        </button>
                        <a href="#inquiry-form" class="btn-inquire-space" onclick="closeModalAndScrollToForm()">
                            <i class="fas fa-calendar-alt"></i> Inquire About Booking
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        spaceModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Global function to close modal and scroll to form
    window.closeModalAndScrollToForm = function() {
        closeSpaceModal();
        
        setTimeout(() => {
            document.getElementById('inquiry-form').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
    };

    window.selectSpace = function(spaceTitle) {
        const spaceCheckboxes = document.querySelectorAll('input[name="eventSpace"]');
        spaceCheckboxes.forEach(checkbox => {
            if (spaceTitle.toLowerCase().includes(checkbox.value) || 
                spaceTitle.includes("Terrace") && checkbox.value === "terrace" ||
                spaceTitle.includes("Royal") && checkbox.value === "private" ||
                spaceTitle.includes("Ballroom") && checkbox.value === "main" ||
                spaceTitle.includes("Boardroom") && checkbox.value === "boardroom") {
                checkbox.checked = true;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
        
        closeSpaceModal();
        
        setTimeout(() => {
            document.getElementById('inquiry-form').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }, 100);
        
        showToast(`${spaceTitle} selected. Please complete the inquiry form below.`, 'success');
    };

    // Event inquiry form functionality
    const inquiryForm = document.getElementById('eventInquiryForm');
    const inquirySteps = document.querySelectorAll('.form-step');
    const inquiryStepDots = document.querySelectorAll('.step-dot');
    const inquiryPrevBtn = document.getElementById('inquiryPrevBtn');
    const inquiryNextBtn = document.getElementById('inquiryNextBtn');
    const inquirySubmitBtn = document.getElementById('inquirySubmitBtn');
    let currentInquiryStep = 1;

    // Initialize form steps
    function showInquiryStep(step) {
        inquirySteps.forEach(s => s.classList.remove('active'));
        inquiryStepDots.forEach(dot => dot.classList.remove('active'));
        
        document.getElementById(`inquiryStep${step}`).classList.add('active');
        inquiryStepDots[step - 1].classList.add('active');
        
        inquiryPrevBtn.style.display = step > 1 ? 'flex' : 'none';
        inquiryNextBtn.style.display = step < 3 ? 'flex' : 'none';
        inquirySubmitBtn.style.display = step === 3 ? 'flex' : 'none';
        
        currentInquiryStep = step;
        
        if (step === 3) {
            updateInquirySummary();
        }
    }

    // Step navigation
    inquiryNextBtn.addEventListener('click', () => {
        if (validateInquiryStep(currentInquiryStep)) {
            showInquiryStep(currentInquiryStep + 1);
        }
    });

    inquiryPrevBtn.addEventListener('click', () => {
        showInquiryStep(currentInquiryStep - 1);
    });

    inquiryStepDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const step = parseInt(dot.getAttribute('data-step'));
            if (step < currentInquiryStep) {
                showInquiryStep(step);
            }
        });
    });

    // Form validation
    function validateInquiryStep(step) {
        let isValid = true;
        
        switch(step) {
            case 1:
                const eventType = document.getElementById('eventType').value;
                const eventDate = document.getElementById('eventDate').value;
                const eventGuests = document.getElementById('eventGuests').value;
                const eventTime = document.getElementById('eventTime').value;
                
                if (!eventType || !eventDate || !eventGuests || !eventTime) {
                    isValid = false;
                    highlightInvalidFields(['eventType', 'eventDate', 'eventGuests', 'eventTime']);
                }
                break;
                
            case 2:
                const contactName = document.getElementById('contactName').value.trim();
                const contactEmail = document.getElementById('contactEmail').value.trim();
                const contactPhone = document.getElementById('contactPhone').value.trim();
                
                if (!contactName || !contactEmail || !contactPhone) {
                    isValid = false;
                    highlightInvalidFields(['contactName', 'contactEmail', 'contactPhone']);
                } else if (!validateEmail(contactEmail)) {
                    isValid = false;
                    highlightInvalidFields(['contactEmail']);
                    showToast('Please enter a valid email address', 'error');
                } else if (!validatePhone(contactPhone)) {
                    isValid = false;
                    highlightInvalidFields(['contactPhone']);
                    showToast('Please enter a valid phone number', 'error');
                }
                break;
                
            case 3:
                const termsAgreement = document.getElementById('termsAgreement').checked;
                if (!termsAgreement) {
                    isValid = false;
                    document.getElementById('termsAgreement').focus();
                    showToast('Please accept the terms and conditions', 'error');
                }
                break;
        }
        
        return isValid;
    }

    function highlightInvalidFields(fieldIds) {
        fieldIds.forEach(id => {
            const field = document.getElementById(id);
            field.classList.add('invalid');
            setTimeout(() => field.classList.remove('invalid'), 3000);
        });
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]{10,}$/;
        return re.test(phone);
    }

    // Update inquiry summary
    function updateInquirySummary() {
        const eventType = document.getElementById('eventType').value;
        const eventDate = document.getElementById('eventDate').value;
        const eventGuests = document.getElementById('eventGuests').value;
        const eventTime = document.getElementById('eventTime').value;
        const eventBudget = document.getElementById('eventBudget').value;
        const eventDescription = document.getElementById('eventDescription').value;
        
        const spaceCheckboxes = document.querySelectorAll('input[name="eventSpace"]:checked');
        const selectedSpaces = Array.from(spaceCheckboxes).map(cb => {
            switch(cb.value) {
                case 'terrace': return 'Outdoor Terrace';
                case 'private': return 'Private Dining Room';
                case 'main': return 'Main Dining Room';
                case 'boardroom': return 'Executive Boardroom';
                default: return cb.value;
            }
        }).join(', ');
        
        const contactName = document.getElementById('contactName').value.trim();
        const contactEmail = document.getElementById('contactEmail').value.trim();
        const contactPhone = document.getElementById('contactPhone').value.trim();
        const contactCompany = document.getElementById('contactCompany').value.trim();
        
        let formattedDate = 'Not selected';
        if (eventDate) {
            const dateObj = new Date(eventDate);
            formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        const eventTypeDisplay = eventType ? 
            eventType.charAt(0).toUpperCase() + eventType.slice(1) : 'Not selected';
        
        const timeDisplay = eventTime ? 
            eventTime.charAt(0).toUpperCase() + eventTime.slice(1) : 'Not selected';
        
        let budgetDisplay = 'Not specified';
        if (eventBudget === '50-75') budgetDisplay = '$50 - $75 per person';
        else if (eventBudget === '76-100') budgetDisplay = '$76 - $100 per person';
        else if (eventBudget === '101-150') budgetDisplay = '$101 - $150 per person';
        else if (eventBudget === '151-200') budgetDisplay = '$151 - $200 per person';
        else if (eventBudget === '200+') budgetDisplay = '$200+ per person';
        else if (eventBudget === 'custom') budgetDisplay = 'Custom budget';
        
        document.getElementById('summaryEventType').textContent = eventTypeDisplay;
        document.getElementById('summaryEventDate').textContent = formattedDate;
        document.getElementById('summaryEventGuests').textContent = eventGuests ? eventGuests.replace('-', ' to ') + ' guests' : 'Not selected';
        document.getElementById('summaryEventTime').textContent = timeDisplay;
        document.getElementById('summaryEventSpaces').textContent = selectedSpaces || 'No preference';
        document.getElementById('summaryEventBudget').textContent = budgetDisplay;
        
        document.getElementById('summaryContactName').textContent = contactName || 'Not provided';
        document.getElementById('summaryContactEmail').textContent = contactEmail || 'Not provided';
        document.getElementById('summaryContactPhone').textContent = contactPhone || 'Not provided';
        document.getElementById('summaryContactCompany').textContent = contactCompany || 'Not provided';
        
        document.getElementById('summaryEventDescriptionText').textContent = 
            eventDescription || 'No description provided';
    }

    // Package selection
    const packageButtons = document.querySelectorAll('.btn-select-package');
    
    packageButtons.forEach(button => {
        button.addEventListener('click', function() {
            const packageType = this.getAttribute('data-package');
            selectPackage(packageType);
        });
    });

    function selectPackage(packageType) {
        let packageDetails;
        let packageName;
        
        switch(packageType) {
            case 'silver':
                packageDetails = 'Silver Package ($75 per person) - Includes 3-course dinner, standard setup, basic audio, and floral centerpieces';
                packageName = 'Silver Package';
                break;
            case 'gold':
                packageDetails = 'Gold Package ($120 per person) - Includes 4-course gourmet dinner, premium setup, professional audio, custom decor, and photo booth';
                packageName = 'Gold Package';
                break;
            case 'platinum':
                packageDetails = 'Platinum Package ($180 per person) - Includes 5-course tasting menu, luxury setup, full AV system, complete event design, and dedicated manager';
                packageName = 'Platinum Package';
                break;
        }
        
        const eventDesc = document.getElementById('eventDescription');
        const currentDesc = eventDesc.value;
        
        if (currentDesc.includes('Package:')) {
            const lines = currentDesc.split('\n').filter(line => !line.includes('Package:'));
            lines.push(`Package: ${packageDetails}`);
            eventDesc.value = lines.join('\n');
        } else {
            eventDesc.value = currentDesc + (currentDesc ? '\n\n' : '') + `Package: ${packageDetails}`;
        }
        
        document.getElementById('eventBudget').value = 
            packageType === 'silver' ? '50-75' :
            packageType === 'gold' ? '101-150' : '151-200';
        
        showToast(`${packageName} selected. Please complete the inquiry form below.`, 'success');
        
        document.getElementById('inquiry-form').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Custom package inquiry
    const customInquiryBtn = document.getElementById('customInquiryBtn');
    
    if (customInquiryBtn) {
        customInquiryBtn.addEventListener('click', () => {
            document.getElementById('eventBudget').value = 'custom';
            
            const eventDesc = document.getElementById('eventDescription');
            const currentDesc = eventDesc.value;
            eventDesc.value = currentDesc + (currentDesc ? '\n\n' : '') + 
                'Custom Package Requested: Please contact me to discuss custom event options and pricing.';
            
            document.getElementById('inquiry-form').scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
            
            showToast('Custom package selected. Please complete the inquiry form below.', 'success');
        });
    }

    // Testimonials slider
    const testimonialSlides = document.querySelectorAll('.testimonial-slide');
    const sliderDots = document.querySelectorAll('.slider-dot');
    const sliderPrev = document.querySelector('.slider-prev');
    const sliderNext = document.querySelector('.slider-next');
    let currentSlide = 0;

    function showSlide(index) {
        testimonialSlides.forEach(slide => slide.classList.remove('active'));
        sliderDots.forEach(dot => dot.classList.remove('active'));
        
        testimonialSlides[index].classList.add('active');
        sliderDots[index].classList.add('active');
        currentSlide = index;
    }

    sliderPrev.addEventListener('click', () => {
        let newIndex = currentSlide - 1;
        if (newIndex < 0) newIndex = testimonialSlides.length - 1;
        showSlide(newIndex);
    });

    sliderNext.addEventListener('click', () => {
        let newIndex = currentSlide + 1;
        if (newIndex >= testimonialSlides.length) newIndex = 0;
        showSlide(newIndex);
    });

    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
        });
    });

    // Auto-advance slides every 5 seconds
    setInterval(() => {
        let newIndex = currentSlide + 1;
        if (newIndex >= testimonialSlides.length) newIndex = 0;
        showSlide(newIndex);
    }, 5000);

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
            item.classList.toggle('active');
        });
    });

    // Form submission
    inquiryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateInquiryStep(3)) {
            const formData = new FormData(inquiryForm);
            const inquiryData = Object.fromEntries(formData);
            
            // Generate inquiry reference
            const now = new Date();
            const dateStr = now.getFullYear() + 
                           String(now.getMonth() + 1).padStart(2, '0') + 
                           String(now.getDate()).padStart(2, '0');
            const timeStr = String(now.getHours()).padStart(2, '0') + 
                           String(now.getMinutes()).padStart(2, '0');
            const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const inquiryRef = `BUT-EVT-${dateStr}-${timeStr}-${randomNum}`;
            
            // Add metadata
            inquiryData.inquiryRef = inquiryRef;
            inquiryData.timestamp = now.toISOString();
            inquiryData.status = 'pending';
            inquiryData.submittedAt = now.toLocaleString();
            inquiryData.id = Date.now();
            
            // Store inquiry data
            storeInquiry(inquiryData);
            
            // Show success modal
            showSuccessModal(inquiryData, inquiryRef);
            
            // Reset form after submission
            setTimeout(() => {
                resetInquiryForm();
            }, 1000);
        }
    });

    function storeInquiry(data) {
        const inquiries = JSON.parse(localStorage.getItem('buteEventInquiries') || '[]');
        inquiries.push(data);
        localStorage.setItem('buteEventInquiries', JSON.stringify(inquiries));
        console.log('Event inquiry stored:', data);
        
        // Refresh admin panel if open
        if (isAdminLoggedIn) {
            loadInquiries();
        }
    }

    function showSuccessModal(data, inquiryRef) {
        const successModal = document.getElementById('successModal');
        
        document.getElementById('inquiryRef').textContent = inquiryRef;
        document.getElementById('successContactName').textContent = data.contactName || 'Not provided';
        document.getElementById('successEventType').textContent = 
            data.eventType ? data.eventType.charAt(0).toUpperCase() + data.eventType.slice(1) : 'Not specified';
        
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function resetInquiryForm() {
        inquiryForm.reset();
        eventDatePicker.clear();
        showInquiryStep(1);
        document.getElementById('newsletterOptin').checked = false;
        document.getElementById('termsAgreement').checked = false;
    }

    // Success modal event listeners
    document.getElementById('successClose').addEventListener('click', function() {
        document.getElementById('successModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    document.getElementById('closeSuccess').addEventListener('click', function() {
        document.getElementById('successModal').style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === document.getElementById('successModal')) {
            document.getElementById('successModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('successModal').style.display === 'flex') {
            document.getElementById('successModal').style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // ADMIN PANEL FUNCTIONS
    
    // Check for saved admin session
    function checkSavedSession() {
        const savedSession = localStorage.getItem('buteAdminSession');
        if (savedSession) {
            const sessionData = JSON.parse(savedSession);
            const now = new Date().getTime();
            
            if (sessionData.expires > now) {
                adminPassword = sessionData.password;
                startAdminSession();
            } else {
                localStorage.removeItem('buteAdminSession');
            }
        }
    }
    
    // Show admin login modal
    adminPanelBtn.addEventListener('click', () => {
        if (!isAdminLoggedIn) {
            adminLoginModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        } else {
            showAdminPanel();
        }
    });
    
    // Close login modal
    loginModalClose.addEventListener('click', () => {
        adminLoginModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === adminLoginModal) {
            adminLoginModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Toggle password visibility
    togglePassword.addEventListener('click', () => {
        const type = adminPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        adminPasswordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });
    
    // Admin login form submission
    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const password = adminPasswordInput.value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        if (password === adminPassword) {
            // Save session if remember me is checked
            if (rememberMe) {
                const expires = new Date().getTime() + (ADMIN_CONFIG.rememberMeDays * 24 * 60 * 60 * 1000);
                const sessionData = {
                    password: adminPassword,
                    expires: expires
                };
                localStorage.setItem('buteAdminSession', JSON.stringify(sessionData));
            }
            
            startAdminSession();
            adminLoginModal.style.display = 'none';
            adminPasswordInput.value = '';
            showToast('Admin login successful!', 'success');
        } else {
            showToast('Incorrect password!', 'error');
            adminPasswordInput.classList.add('invalid');
            setTimeout(() => adminPasswordInput.classList.remove('invalid'), 1000);
        }
    });
    
    // Start admin session
    function startAdminSession() {
        isAdminLoggedIn = true;
        adminPanelBtn.innerHTML = '<i class="fas fa-user-shield"></i> View Inquiries';
        showAdminPanel();
        startSessionTimer();
    }
    
    // Show admin panel
    function showAdminPanel() {
        adminPanelModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        loadInquiries();
    }
    
    // Close admin panel
    adminModalClose.addEventListener('click', () => {
        adminPanelModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === adminPanelModal) {
            adminPanelModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Admin logout
    adminLogoutBtn.addEventListener('click', () => {
        logoutAdmin();
    });
    
    function logoutAdmin() {
        isAdminLoggedIn = false;
        adminPanelBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin Panel';
        adminPanelModal.style.display = 'none';
        clearInterval(sessionTimer);
        localStorage.removeItem('buteAdminSession');
        showToast('Admin logged out successfully', 'success');
    }
    
    // Start session timer
    function startSessionTimer() {
        clearInterval(sessionTimer);
        let timeLeft = ADMIN_CONFIG.sessionTimeout / 1000;
        
        sessionTimer = setInterval(() => {
            timeLeft--;
            
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            sessionTimerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft <= 0) {
                logoutAdmin();
                showToast('Session expired. Please login again.', 'info');
            }
        }, 1000);
    }
    
    // Load inquiries
    function loadInquiries() {
        const inquiries = JSON.parse(localStorage.getItem('buteEventInquiries') || '[]');
        currentInquiries = inquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        filteredInquiries = [...currentInquiries];
        
        updateStats();
        renderInquiries();
        applyFilters();
    }
    
    // Update statistics
    function updateStats() {
        totalInquiriesElement.textContent = currentInquiries.length;
        
        const pending = currentInquiries.filter(i => i.status === 'pending').length;
        const contacted = currentInquiries.filter(i => i.status === 'contacted').length;
        const confirmed = currentInquiries.filter(i => i.status === 'confirmed').length;
        
        pendingInquiriesElement.textContent = pending;
        contactedInquiriesElement.textContent = contacted;
        confirmedInquiriesElement.textContent = confirmed;
    }
    
    // Render inquiries list
    function renderInquiries() {
        if (filteredInquiries.length === 0) {
            inquiriesList.innerHTML = `
                <div class="no-inquiries">
                    <i class="fas fa-inbox"></i>
                    <p>No event inquiries found</p>
                </div>
            `;
            return;
        }
        
        inquiriesList.innerHTML = filteredInquiries.map(inquiry => `
            <div class="inquiry-item" data-id="${inquiry.id}">
                <div class="inquiry-item-header">
                    <div>
                        <strong>${inquiry.contactName || 'Unnamed'}</strong> - 
                        ${inquiry.eventType ? inquiry.eventType.charAt(0).toUpperCase() + inquiry.eventType.slice(1) : 'Unknown Event'}
                    </div>
                    <div class="inquiry-status status-${inquiry.status || 'pending'}">
                        ${inquiry.status || 'pending'}
                    </div>
                </div>
                
                <div class="inquiry-ref">${inquiry.inquiryRef}</div>
                <div class="inquiry-date">Submitted: ${inquiry.submittedAt || 'Unknown date'}</div>
                
                <div class="inquiry-content">
                    <div class="inquiry-section">
                        <h4><i class="fas fa-calendar-alt"></i> Event Details</h4>
                        <p><strong>Type:</strong> ${inquiry.eventType || 'Not specified'}</p>
                        <p><strong>Date:</strong> ${inquiry.eventDate || 'Not specified'}</p>
                        <p><strong>Guests:</strong> ${inquiry.eventGuests || 'Not specified'}</p>
                        <p><strong>Time:</strong> ${inquiry.eventTime || 'Not specified'}</p>
                        <p><strong>Budget:</strong> ${inquiry.eventBudget || 'Not specified'}</p>
                    </div>
                    
                    <div class="inquiry-section">
                        <h4><i class="fas fa-user-circle"></i> Contact Information</h4>
                        <p><strong>Name:</strong> ${inquiry.contactName || 'Not provided'}</p>
                        <p><strong>Email:</strong> ${inquiry.contactEmail || 'Not provided'}</p>
                        <p><strong>Phone:</strong> ${inquiry.contactPhone || 'Not provided'}</p>
                        <p><strong>Company:</strong> ${inquiry.contactCompany || 'Not provided'}</p>
                    </div>
                    
                    <div class="inquiry-section">
                        <h4><i class="fas fa-file-alt"></i> Event Description</h4>
                        <p>${inquiry.eventDescription || 'No description provided'}</p>
                    </div>
                    
                    <div class="inquiry-section">
                        <h4><i class="fas fa-cogs"></i> Additional Info</h4>
                        <p><strong>Spaces:</strong> ${getSelectedSpaces(inquiry)}</p>
                        <p><strong>Newsletter:</strong> ${inquiry.newsletterOptin ? 'Subscribed' : 'Not subscribed'}</p>
                    </div>
                </div>
                
                <div class="inquiry-actions">
                    <button class="btn-action contact" onclick="updateInquiryStatus(${inquiry.id}, 'contacted')">
                        <i class="fas fa-phone"></i> Mark as Contacted
                    </button>
                    <button class="btn-action confirm" onclick="updateInquiryStatus(${inquiry.id}, 'confirmed')">
                        <i class="fas fa-check"></i> Confirm Event
                    </button>
                    <button class="btn-action cancel" onclick="updateInquiryStatus(${inquiry.id}, 'cancelled')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                    <button class="btn-action delete" onclick="deleteInquiry(${inquiry.id})">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // Helper function to get selected spaces
    function getSelectedSpaces(inquiry) {
        if (!inquiry.eventSpace) return 'No preference';
        
        const spaces = Array.isArray(inquiry.eventSpace) ? inquiry.eventSpace : [inquiry.eventSpace];
        return spaces.map(space => {
            switch(space) {
                case 'terrace': return 'Outdoor Terrace';
                case 'private': return 'Private Dining Room';
                case 'main': return 'Main Dining Room';
                case 'boardroom': return 'Executive Boardroom';
                default: return space;
            }
        }).join(', ');
    }
    
    // Update inquiry status
    window.updateInquiryStatus = function(id, status) {
        const inquiries = JSON.parse(localStorage.getItem('buteEventInquiries') || '[]');
        const inquiryIndex = inquiries.findIndex(i => i.id === id);
        
        if (inquiryIndex !== -1) {
            inquiries[inquiryIndex].status = status;
            inquiries[inquiryIndex].statusUpdated = new Date().toLocaleString();
            localStorage.setItem('buteEventInquiries', JSON.stringify(inquiries));
            
            loadInquiries();
            showToast(`Inquiry marked as ${status}`, 'success');
        }
    };
    
    // Delete inquiry
    window.deleteInquiry = function(id) {
        if (confirm('Are you sure you want to delete this inquiry? This action cannot be undone.')) {
            const inquiries = JSON.parse(localStorage.getItem('buteEventInquiries') || '[]');
            const filteredInquiries = inquiries.filter(i => i.id !== id);
            localStorage.setItem('buteEventInquiries', JSON.stringify(filteredInquiries));
            
            loadInquiries();
            showToast('Inquiry deleted successfully', 'success');
        }
    };
    
    // Apply filters and search
    function applyFilters() {
        const searchTerm = searchInquiriesInput.value.toLowerCase();
        const statusFilter = filterStatusSelect.value;
        const eventTypeFilter = filterEventTypeSelect.value;
        
        filteredInquiries = currentInquiries.filter(inquiry => {
            const matchesSearch = 
                (inquiry.contactName && inquiry.contactName.toLowerCase().includes(searchTerm)) ||
                (inquiry.contactEmail && inquiry.contactEmail.toLowerCase().includes(searchTerm)) ||
                (inquiry.eventType && inquiry.eventType.toLowerCase().includes(searchTerm)) ||
                (inquiry.inquiryRef && inquiry.inquiryRef.toLowerCase().includes(searchTerm));
            
            const matchesStatus = !statusFilter || inquiry.status === statusFilter;
            const matchesEventType = !eventTypeFilter || inquiry.eventType === eventTypeFilter;
            
            return matchesSearch && matchesStatus && matchesEventType;
        });
        
        renderInquiries();
    }
    
    // Event listeners for filters
    searchInquiriesInput.addEventListener('input', applyFilters);
    filterStatusSelect.addEventListener('change', applyFilters);
    filterEventTypeSelect.addEventListener('change', applyFilters);
    
    // Export to CSV
    exportCSVBtn.addEventListener('click', () => {
        exportToCSV();
    });
    
    function exportToCSV() {
        if (currentInquiries.length === 0) {
            showToast('No inquiries to export', 'info');
            return;
        }
        
        const headers = [
            'Reference', 'Date Submitted', 'Status', 'Event Type', 'Event Date', 'Guests',
            'Contact Name', 'Email', 'Phone', 'Company', 'Budget', 'Description'
        ];
        
        const csvData = currentInquiries.map(inquiry => [
            inquiry.inquiryRef || '',
            inquiry.submittedAt || '',
            inquiry.status || '',
            inquiry.eventType || '',
            inquiry.eventDate || '',
            inquiry.eventGuests || '',
            inquiry.contactName || '',
            inquiry.contactEmail || '',
            inquiry.contactPhone || '',
            inquiry.contactCompany || '',
            inquiry.eventBudget || '',
            inquiry.eventDescription ? inquiry.eventDescription.replace(/[\n\r]/g, ' ') : ''
        ]);
        
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bute-events-inquiries-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('CSV exported successfully', 'success');
    }
    
    // Print inquiries
    printInquiriesBtn.addEventListener('click', () => {
        printInquiries();
    });
    
    function printInquiries() {
        if (currentInquiries.length === 0) {
            showToast('No inquiries to print', 'info');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Bute 5 Star - Event Inquiries</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        h1 { color: #0c3b2e; }
                        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                        th { background-color: #f0f9f0; }
                        .status { padding: 4px 8px; border-radius: 4px; font-size: 0.9em; }
                        .status-pending { background: #fff3e0; }
                        .status-contacted { background: #e8f5e9; }
                        .status-confirmed { background: #e3f2fd; }
                        .status-cancelled { background: #ffebee; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>Bute 5 Star - Event Inquiries Report</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                    <p>Total Inquiries: ${currentInquiries.length}</p>
                    
                    <table>
                        <thead>
                            <tr>
                                <th>Ref</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Event Type</th>
                                <th>Contact</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Guests</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${currentInquiries.map(inquiry => `
                                <tr>
                                    <td>${inquiry.inquiryRef}</td>
                                    <td>${inquiry.submittedAt || ''}</td>
                                    <td><span class="status status-${inquiry.status || 'pending'}">${inquiry.status || 'pending'}</span></td>
                                    <td>${inquiry.eventType || ''}</td>
                                    <td>${inquiry.contactName || ''}</td>
                                    <td>${inquiry.contactPhone || ''}</td>
                                    <td>${inquiry.contactEmail || ''}</td>
                                    <td>${inquiry.eventGuests || ''}</td>
                                    <td>${inquiry.eventDate || ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <button class="no-print" onclick="window.print()">Print</button>
                    <button class="no-print" onclick="window.close()">Close</button>
                </body>
            </html>
        `);
        printWindow.document.close();
    }
    
    // Clear all inquiries
    clearAllInquiriesBtn.addEventListener('click', () => {
        if (confirm('⚠️ WARNING: This will delete ALL event inquiries. This action cannot be undone!\n\nAre you absolutely sure?')) {
            localStorage.removeItem('buteEventInquiries');
            loadInquiries();
            showToast('All inquiries cleared', 'success');
        }
    });
    
    // Change password functionality
    changePasswordBtn.addEventListener('click', () => {
        changePasswordModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    });
    
    changePasswordClose.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    cancelChangePasswordBtn.addEventListener('click', () => {
        changePasswordModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === changePasswordModal) {
            changePasswordModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Password strength checker
    const newPasswordInput = document.getElementById('newPassword');
    const strengthMeter = document.getElementById('strengthMeter');
    const strengthText = document.getElementById('strengthText');
    
    newPasswordInput.addEventListener('input', () => {
        const password = newPasswordInput.value;
        let strength = 0;
        
        if (password.length >= 6) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        strengthMeter.style.width = `${strength}%`;
        
        if (strength < 50) {
            strengthMeter.style.backgroundColor = '#ff6b6b';
            strengthText.textContent = 'Weak password';
        } else if (strength < 75) {
            strengthMeter.style.backgroundColor = '#ffb400';
            strengthText.textContent = 'Medium password';
        } else {
            strengthMeter.style.backgroundColor = '#4caf50';
            strengthText.textContent = 'Strong password';
        }
    });
    
    // Change password form submission
    changePasswordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (currentPassword !== adminPassword) {
            showToast('Current password is incorrect', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showToast('New password must be at least 6 characters', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        
        adminPassword = newPassword;
        
        // Update saved session if exists
        const savedSession = localStorage.getItem('buteAdminSession');
        if (savedSession) {
            const sessionData = JSON.parse(savedSession);
            sessionData.password = newPassword;
            localStorage.setItem('buteAdminSession', JSON.stringify(sessionData));
        }
        
        changePasswordModal.style.display = 'none';
        document.body.style.overflow = 'auto';
        changePasswordForm.reset();
        
        showToast('Password changed successfully', 'success');
    });
    
    // Toast notification system
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // Real-time form validation
    const validateFields = ['eventType', 'eventDate', 'eventGuests', 'eventTime', 'contactName', 'contactEmail', 'contactPhone'];
    validateFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('invalid');
                    this.classList.add('valid');
                    updateInquirySummary();
                } else {
                    this.classList.remove('valid');
                }
            });
            
            field.addEventListener('blur', function() {
                if (this.type === 'email' && this.value && !validateEmail(this.value)) {
                    this.classList.add('invalid');
                    showToast('Please enter a valid email address', 'error');
                } else if (this.type === 'tel' && this.value && !validatePhone(this.value)) {
                    this.classList.add('invalid');
                    showToast('Please enter a valid phone number', 'error');
                }
            });
        }
    });
    
    // Initialize
    showInquiryStep(1);
    showSlide(0);
    checkSavedSession(); // Check for saved admin session on page load
    
    console.log('Bute 5 Star Events System initialized');
    console.log('Admin Panel Access:');
    console.log('1. Click the "Admin Panel" button in bottom right');
    console.log('2. Enter password: ButeAdmin2024');
    console.log('3. Change password in admin panel for security');
});