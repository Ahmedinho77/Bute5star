// Reservation Page JavaScript for Bute 5 Star Restaurant

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

    // Pricing configuration
    const pricingConfig = {
        perPerson: {
            base: 50,
            groupDiscounts: {
                1: 1.0,    2: 0.95,   3: 0.90,   4: 0.85,   5: 0.80,
                6: 0.75,   7: 0.70,   8: 0.65,   9: 0.60,   10: 0.55,
                11: 0.50,  16: 0.40
            }
        },
        
        seatingOptions: {
            indoor: { basePrice: 0, name: "Indoor Dining" },
            outdoor: { basePrice: 10, name: "Outdoor Terrace" },
            private: { basePrice: 25, name: "Private Room" },
            any: { basePrice: 0, name: "No Preference" }
        },
        
        specialOccasions: {
            birthday: { premium: 15, name: "Birthday Celebration" },
            anniversary: { premium: 20, name: "Anniversary Celebration" },
            engagement: { premium: 25, name: "Engagement Celebration" },
            business: { premium: 10, name: "Business Dinner" },
            family: { premium: 5, name: "Family Gathering" },
            other: { premium: 10, name: "Special Celebration" }
        }
    };

    // Calculate reservation price
    function calculateReservationPrice(data) {
        const guests = parseInt(data.guests);
        const seating = data.seating;
        const occasion = data.occasion;
        
        let basePrice = pricingConfig.perPerson.base;
        let discountMultiplier = 1.0;
        
        // Apply group discount
        for (let group in pricingConfig.perPerson.groupDiscounts) {
            if (guests >= parseInt(group)) {
                discountMultiplier = pricingConfig.perPerson.groupDiscounts[group];
            }
        }
        
        let perPersonPrice = basePrice * discountMultiplier;
        let seatingPremium = pricingConfig.seatingOptions[seating].basePrice || 0;
        let occasionPremium = occasion && occasion !== '' ? pricingConfig.specialOccasions[occasion]?.premium || 0 : 0;
        
        let total = (perPersonPrice + seatingPremium + occasionPremium) * guests;
        
        return {
            basePrice: basePrice,
            perPersonPrice: perPersonPrice,
            seatingPremium: seatingPremium,
            occasionPremium: occasionPremium,
            discountMultiplier: discountMultiplier,
            total: Math.round(total * 100) / 100,
            guests: guests,
            seatingName: pricingConfig.seatingOptions[seating].name,
            occasionName: occasion && occasion !== '' ? 
                pricingConfig.specialOccasions[occasion].name : 'No special occasion'
        };
    }

    // Initialize date picker with mobile optimization
    const datePicker = flatpickr("#date", {
        minDate: "today",
        maxDate: new Date().fp_incr(90),
        dateFormat: "Y-m-d",
        disableMobile: false,
        locale: { firstDayOfWeek: 1 },
        onChange: updateConfirmation
    });

    // Multi-step form functionality
    const formSteps = document.querySelectorAll('.form-step');
    const stepDots = document.querySelectorAll('.step-dot');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    let currentStep = 1;

    // Form validation functions
    function validateStep(step) {
        let isValid = true;
        
        switch(step) {
            case 1:
                const date = document.getElementById('date').value;
                const time = document.getElementById('time').value;
                const guests = document.getElementById('guests').value;
                
                if (!date || !time || !guests) {
                    isValid = false;
                    highlightInvalidFields(['date', 'time', 'guests']);
                }
                break;
                
            case 2:
                const firstName = document.getElementById('firstName').value.trim();
                const lastName = document.getElementById('lastName').value.trim();
                const email = document.getElementById('email').value.trim();
                const phone = document.getElementById('phone').value.trim();
                
                if (!firstName || !lastName || !email || !phone) {
                    isValid = false;
                    highlightInvalidFields(['firstName', 'lastName', 'email', 'phone']);
                } else if (!validateEmail(email)) {
                    isValid = false;
                    highlightInvalidFields(['email']);
                    showToast('Please enter a valid email address', 'error');
                } else if (!validatePhone(phone)) {
                    isValid = false;
                    highlightInvalidFields(['phone']);
                    showToast('Please enter a valid phone number', 'error');
                }
                break;
                
            case 3:
                const terms = document.getElementById('terms').checked;
                if (!terms) {
                    isValid = false;
                    document.getElementById('terms').focus();
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

    // Step navigation
    function showStep(step) {
        formSteps.forEach(s => s.classList.remove('active'));
        stepDots.forEach(dot => dot.classList.remove('active'));
        
        document.getElementById(`step${step}`).classList.add('active');
        stepDots[step - 1].classList.add('active');
        
        prevBtn.style.display = step > 1 ? 'flex' : 'none';
        nextBtn.style.display = step < 3 ? 'flex' : 'none';
        submitBtn.style.display = step === 3 ? 'flex' : 'none';
        
        currentStep = step;
        
        if (step === 3) {
            updateConfirmation();
        }
    }

    // Step navigation event listeners
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            showStep(currentStep + 1);
        }
    });

    prevBtn.addEventListener('click', () => {
        showStep(currentStep - 1);
    });

    stepDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const step = parseInt(dot.getAttribute('data-step'));
            if (step < currentStep) {
                showStep(step);
            }
        });
    });

    // Update confirmation details
    function updateConfirmation() {
        // Reservation details
        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const guests = document.getElementById('guests').value;
        const occasion = document.getElementById('occasion').value;
        const seating = document.querySelector('input[name="seating"]:checked').value;
        
        // Contact details
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const requests = document.getElementById('specialRequests').value.trim();
        
        // Format date for display
        let formattedDate = 'Not selected';
        if (date) {
            const dateObj = new Date(date);
            formattedDate = dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Update summary elements
        document.getElementById('summaryDate').textContent = formattedDate;
        document.getElementById('summaryTime').textContent = time ? formatTime(time) : 'Not selected';
        document.getElementById('summaryGuests').textContent = guests ? `${guests} ${guests === '1' ? 'person' : 'people'}` : 'Not selected';
        document.getElementById('summaryOccasion').textContent = occasion ? formatOccasion(occasion) : 'No special occasion';
        document.getElementById('summarySeating').textContent = formatSeating(seating);
        
        document.getElementById('summaryName').textContent = firstName && lastName ? `${firstName} ${lastName}` : 'Not provided';
        document.getElementById('summaryEmail').textContent = email || 'Not provided';
        document.getElementById('summaryPhone').textContent = phone || 'Not provided';
        document.getElementById('summaryRequests').textContent = requests || 'None';
        
        // Update price estimate
        updatePriceEstimate();
    }

    // Update price estimate
    function updatePriceEstimate() {
        const guests = document.getElementById('guests').value;
        const seating = document.querySelector('input[name="seating"]:checked').value;
        const occasion = document.getElementById('occasion').value;
        
        const priceEstimateDiv = document.getElementById('priceEstimate');
        
        if (guests) {
            const priceData = calculateReservationPrice({
                guests: guests,
                seating: seating,
                occasion: occasion
            });
            
            priceEstimateDiv.innerHTML = `
                <div class="price-estimate">
                    <div class="price-detail-row">
                        <span>Base Price (${guests} × $${priceData.basePrice.toFixed(2)})</span>
                        <span>$${(priceData.basePrice * priceData.guests).toFixed(2)}</span>
                    </div>
                    <div class="price-detail-row discount">
                        <span>Group Discount (${Math.round((1 - priceData.discountMultiplier) * 100)}%)</span>
                        <span>-$${(priceData.basePrice * priceData.guests * (1 - priceData.discountMultiplier)).toFixed(2)}</span>
                    </div>
                    ${priceData.seatingPremium > 0 ? `
                    <div class="price-detail-row premium">
                        <span>${priceData.seatingName} Premium</span>
                        <span>+$${(priceData.seatingPremium * priceData.guests).toFixed(2)}</span>
                    </div>` : ''}
                    ${priceData.occasionPremium > 0 ? `
                    <div class="price-detail-row premium">
                        <span>${priceData.occasionName} Setup</span>
                        <span>+$${(priceData.occasionPremium * priceData.guests).toFixed(2)}</span>
                    </div>` : ''}
                    <div class="price-total-row">
                        <span>Estimated Total</span>
                        <span>$${priceData.total.toFixed(2)}</span>
                    </div>
                    <small class="price-note">* Final bill may vary based on menu selections</small>
                </div>
            `;
            
            window.currentPriceData = priceData;
        } else {
            priceEstimateDiv.innerHTML = `
                <div class="price-estimate-placeholder">
                    <p><i class="fas fa-info-circle"></i> Select number of guests to see price estimate</p>
                </div>
            `;
        }
    }

    // Formatting functions
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }

    function formatOccasion(occasion) {
        const occasions = {
            'birthday': 'Birthday Celebration',
            'anniversary': 'Anniversary Celebration',
            'engagement': 'Engagement Celebration',
            'business': 'Business Dinner',
            'family': 'Family Gathering',
            'other': 'Special Celebration'
        };
        return occasions[occasion] || occasion;
    }

    function formatSeating(seating) {
        const seatingOptions = {
            'indoor': 'Indoor Dining',
            'outdoor': 'Outdoor Terrace',
            'private': 'Private Room',
            'any': 'No Preference'
        };
        return seatingOptions[seating] || seating;
    }

    // ===========================================
    // FORM SUBMISSION
    // ===========================================

    const reservationForm = document.getElementById('reservationForm');
    if (reservationForm) {
        reservationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateStep(3)) {
                const reservationId = generateReservationId();
                const formData = new FormData(reservationForm);
                const reservationData = Object.fromEntries(formData);
                
                const priceData = calculateReservationPrice({
                    guests: reservationData.guests,
                    seating: reservationData.seating,
                    occasion: reservationData.occasion
                });
                
                // Add metadata
                reservationData.reservationId = reservationId;
                reservationData.timestamp = new Date().toISOString();
                reservationData.status = 'upcoming'; // Set to 'upcoming' for new reservations
                reservationData.price = priceData.total;
                reservationData.priceDetails = priceData;
                
                // Store reservation data
                storeReservation(reservationData);
                
                // Show success modal with details
                showSuccessModal(reservationData, priceData);
                
                // Reset form for next reservation
                setTimeout(() => {
                    resetForm();
                    updateReservationCount();
                }, 1000);
            }
        });
    }

    function generateReservationId() {
        const now = new Date();
        const dateStr = now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + 
                       String(now.getMinutes()).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `BUT-${dateStr}-${timeStr}-${randomNum}`;
    }

    // ===========================================
    // MY RESERVATIONS FUNCTIONALITY
    // ===========================================

    // Store reservation in localStorage
    function storeReservation(data) {
        const reservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        reservations.push(data);
        localStorage.setItem('buteReservations', JSON.stringify(reservations));
        showToast('Reservation saved successfully!', 'success');
        
        // Update statistics immediately
        updateReservationStats(reservations);
        updateReservationCount();
    }

    // Update reservation count badge
    function updateReservationCount() {
        const reservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        const totalCount = reservations.length;
        const countBadge = document.getElementById('reservationsCountBadge');
        const countElement = document.getElementById('reservationsCount');
        
        if (totalCount > 0) {
            if (countElement) countElement.textContent = totalCount;
            if (countBadge) countBadge.style.display = 'flex';
        } else {
            if (countElement) countElement.textContent = '0';
            if (countBadge) countBadge.style.display = 'none';
        }
    }

    // Load and display reservations
    function loadReservations(filter = 'upcoming', searchTerm = '') {
        const reservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        const container = document.getElementById('reservationsContainer');
        const now = new Date();
        
        // Update statistics with real data
        updateReservationStats(reservations);
        
        // Clear container
        if (container) {
            container.innerHTML = '';
        } else {
            console.error('Reservations container not found');
            return;
        }
        
        // If no reservations, show message
        if (reservations.length === 0) {
            const noReservationsHTML = `
                <div class="no-reservations">
                    <i class="fas fa-calendar-plus"></i>
                    <h3>No Reservations Found</h3>
                    <p>You haven't made any reservations yet. Book your first table now!</p>
                    <a href="#reservationForm" class="btn btn-primary">
                        <i class="fas fa-plus-circle"></i> Make a Reservation
                    </a>
                </div>
            `;
            container.innerHTML = noReservationsHTML;
            return;
        }
        
        // Filter reservations
        let filteredReservations = reservations;
        
        // Apply status filter
        if (filter !== 'all') {
            filteredReservations = reservations.filter(res => {
                const resDate = new Date(res.date);
                const resDateTime = new Date(res.date + 'T' + res.time);
                
                if (filter === 'upcoming') {
                    return res.status === 'upcoming' && resDateTime > now;
                } else if (filter === 'past') {
                    return res.status === 'upcoming' && resDateTime < now;
                } else if (filter === 'cancelled') {
                    return res.status === 'cancelled';
                }
                return true;
            });
        }
        
        // Apply search filter
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            filteredReservations = filteredReservations.filter(res => {
                return (
                    (res.reservationId && res.reservationId.toLowerCase().includes(searchLower)) ||
                    (res.firstName && res.firstName.toLowerCase().includes(searchLower)) ||
                    (res.lastName && res.lastName.toLowerCase().includes(searchLower)) ||
                    (res.email && res.email.toLowerCase().includes(searchLower)) ||
                    (res.date && res.date.includes(searchTerm)) ||
                    (res.time && res.time.includes(searchTerm))
                );
            });
        }
        
        // Sort by date (upcoming first, then past)
        filteredReservations.sort((a, b) => {
            const dateA = new Date(a.date + 'T' + a.time);
            const dateB = new Date(b.date + 'T' + b.time);
            return dateA - dateB;
        });
        
        // Show no reservations message if none found after filtering
        if (filteredReservations.length === 0) {
            const noFilteredReservationsHTML = `
                <div class="no-reservations">
                    <i class="fas fa-search"></i>
                    <h3>No Matching Reservations</h3>
                    <p>No reservations match your current filter or search criteria.</p>
                    <button class="btn btn-secondary" id="clearFilters">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                </div>
            `;
            container.innerHTML = noFilteredReservationsHTML;
            
            // Add event listener to clear filters button
            setTimeout(() => {
                const clearFiltersBtn = document.getElementById('clearFilters');
                if (clearFiltersBtn) {
                    clearFiltersBtn.addEventListener('click', () => {
                        document.querySelector('.filter-btn.active')?.classList.remove('active');
                        const allFilter = document.querySelector('.filter-btn[data-filter="all"]');
                        if (allFilter) allFilter.classList.add('active');
                        const searchInput = document.getElementById('reservationSearch');
                        if (searchInput) searchInput.value = '';
                        loadReservations('all', '');
                    });
                }
            }, 100);
            
            return;
        }
        
        // Display each reservation
        filteredReservations.forEach((reservation, index) => {
            const resDate = new Date(reservation.date);
            const resDateTime = new Date(reservation.date + 'T' + reservation.time);
            const isPast = resDateTime < now;
            const statusClass = reservation.status === 'cancelled' ? 'cancelled' : 
                               isPast ? 'past' : 'upcoming';
            const statusText = reservation.status === 'cancelled' ? 'Cancelled' : 
                              isPast ? 'Past' : 'Upcoming';
            
            const reservationCard = document.createElement('div');
            reservationCard.className = `reservation-card ${statusClass}`;
            reservationCard.dataset.id = reservation.reservationId;
            
            const formattedDate = resDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            reservationCard.innerHTML = `
                <div class="reservation-header">
                    <div class="reservation-id">
                        <span class="badge">${reservation.reservationId}</span>
                        <span class="reservation-status">
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </span>
                    </div>
                    <div class="reservation-actions">
                        <button class="btn-view" data-id="${reservation.reservationId}">
                            <i class="fas fa-eye"></i> View Details
                        </button>
                        ${statusClass === 'upcoming' ? `
                        <button class="btn-cancel" data-id="${reservation.reservationId}">
                            <i class="fas fa-times"></i> Cancel
                        </button>` : ''}
                        <button class="btn-print" data-id="${reservation.reservationId}">
                            <i class="fas fa-print"></i> Print
                        </button>
                    </div>
                </div>
                
                <div class="reservation-details-grid">
                    <div class="detail-group">
                        <h4><i class="fas fa-calendar-alt"></i> Reservation Details</h4>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">${formattedDate}</span>
                        </div>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Time:</span>
                            <span class="detail-value">${formatTime(reservation.time)}</span>
                        </div>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Guests:</span>
                            <span class="detail-value">${reservation.guests} ${reservation.guests === '1' ? 'person' : 'people'}</span>
                        </div>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Seating:</span>
                            <span class="detail-value">${formatSeating(reservation.seating)}</span>
                        </div>
                    </div>
                    
                    <div class="detail-group">
                        <h4><i class="fas fa-user-circle"></i> Contact Information</h4>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Name:</span>
                            <span class="detail-value">${reservation.firstName} ${reservation.lastName}</span>
                        </div>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Email:</span>
                            <span class="detail-value">${reservation.email}</span>
                        </div>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Phone:</span>
                            <span class="detail-value">${reservation.phone}</span>
                        </div>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Occasion:</span>
                            <span class="detail-value">${formatOccasion(reservation.occasion || '')}</span>
                        </div>
                    </div>
                    
                    <div class="detail-group">
                        <h4><i class="fas fa-receipt"></i> Price Information</h4>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Status:</span>
                            <span class="detail-value">${reservation.status === 'cancelled' ? 'Refunded' : 'Paid'}</span>
                        </div>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Total:</span>
                            <span class="detail-value">$${parseFloat(reservation.price || 0).toFixed(2)}</span>
                        </div>
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Booked:</span>
                            <span class="detail-value">${new Date(reservation.timestamp).toLocaleDateString()}</span>
                        </div>
                        ${reservation.specialRequests ? `
                        <div class="detail-item mobile-new-line">
                            <span class="detail-label">Special Requests:</span>
                            <span class="detail-value">${reservation.specialRequests}</span>
                        </div>` : ''}
                    </div>
                </div>
            `;
            
            container.appendChild(reservationCard);
        });
        
        // Add event listeners to buttons
        attachReservationButtonListeners();
    }

    // Update reservation statistics - FIXED TO SHOW REAL DATA
    function updateReservationStats(reservations) {
        const now = new Date();
        let upcomingCount = 0;
        let pastCount = 0;
        let cancelledCount = 0;
        
        reservations.forEach(res => {
            try {
                if (res.status === 'cancelled') {
                    cancelledCount++;
                } else if (res.date && res.time) {
                    const resDateTime = new Date(res.date + 'T' + res.time);
                    if (resDateTime > now) {
                        upcomingCount++;
                    } else {
                        pastCount++;
                    }
                }
            } catch (e) {
                console.error('Error processing reservation:', e);
            }
        });
        
        // Update the UI elements
        const upcomingElement = document.getElementById('upcomingCount');
        const totalElement = document.getElementById('totalCount');
        const cancelledElement = document.getElementById('cancelledCount');
        
        if (upcomingElement) upcomingElement.textContent = upcomingCount;
        if (totalElement) totalElement.textContent = reservations.length;
        if (cancelledElement) cancelledElement.textContent = cancelledCount;
    }

    // Attach event listeners to reservation buttons
    function attachReservationButtonListeners() {
        // View buttons
        document.querySelectorAll('.btn-view').forEach(btn => {
            btn.addEventListener('click', function() {
                const reservationId = this.dataset.id;
                viewReservationDetails(reservationId);
            });
        });
        
        // Cancel buttons
        document.querySelectorAll('.btn-cancel').forEach(btn => {
            btn.addEventListener('click', function() {
                const reservationId = this.dataset.id;
                showCancelModal(reservationId);
            });
        });
        
        // Print buttons
        document.querySelectorAll('.btn-print').forEach(btn => {
            btn.addEventListener('click', function() {
                const reservationId = this.dataset.id;
                printReservation(reservationId);
            });
        });
    }

    // View reservation details - FIXED VERSION
    function viewReservationDetails(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        const reservation = reservations.find(res => res.reservationId === reservationId);
        
        if (reservation) {
            // Fill success modal with reservation details
            const resDate = new Date(reservation.date);
            const now = new Date();
            const resDateTime = new Date(reservation.date + 'T' + reservation.time);
            const isPast = resDateTime < now;
            const formattedDate = resDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Update all modal fields
            const reservationIdElement = document.getElementById('reservationId');
            const reservationDateElement = document.getElementById('reservationDate');
            const reservationTimeElement = document.getElementById('reservationTime');
            const reservationGuestsElement = document.getElementById('reservationGuests');
            const reservationSeatingElement = document.getElementById('reservationSeating');
            const reservationOccasionElement = document.getElementById('reservationOccasion');
            const reservationNameElement = document.getElementById('reservationName');
            const reservationEmailElement = document.getElementById('reservationEmail');
            const reservationPhoneElement = document.getElementById('reservationPhone');
            const reservationRequestsElement = document.getElementById('reservationRequests');
            const reservationPriceElement = document.getElementById('reservationPrice');
            
            if (reservationIdElement) reservationIdElement.textContent = reservation.reservationId;
            if (reservationDateElement) reservationDateElement.textContent = formattedDate;
            if (reservationTimeElement) reservationTimeElement.textContent = formatTime(reservation.time);
            if (reservationGuestsElement) reservationGuestsElement.textContent = 
                `${reservation.guests} ${reservation.guests === '1' ? 'person' : 'people'}`;
            if (reservationSeatingElement) reservationSeatingElement.textContent = formatSeating(reservation.seating);
            if (reservationOccasionElement) reservationOccasionElement.textContent = formatOccasion(reservation.occasion || '');
            if (reservationNameElement) reservationNameElement.textContent = `${reservation.firstName} ${reservation.lastName}`;
            if (reservationEmailElement) reservationEmailElement.textContent = reservation.email;
            if (reservationPhoneElement) reservationPhoneElement.textContent = reservation.phone;
            if (reservationRequestsElement) reservationRequestsElement.textContent = reservation.specialRequests || 'None';
            if (reservationPriceElement) reservationPriceElement.textContent = `$${parseFloat(reservation.price || 0).toFixed(2)}`;
            
            // Update modal title and message based on status - FIXED HERE
            const successIcon = document.querySelector('.success-icon');
            const successTitle = document.querySelector('.success-content h3');
            const successMessage = document.querySelector('.success-content > p');
            
            if (reservation.status === 'cancelled') {
                // Show "Cancelled Reservation" ONLY when status is cancelled
                if (successIcon) successIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
                if (successIcon) successIcon.style.color = '#ff6b6b';
                if (successTitle) successTitle.textContent = 'Cancelled Reservation';
                if (successMessage) successMessage.textContent = 'This reservation has been cancelled.';
            } else if (isPast) {
                // Show "Past Reservation" for completed reservations
                if (successIcon) successIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                if (successIcon) successIcon.style.color = '#4caf50';
                if (successTitle) successTitle.textContent = 'Past Reservation';
                if (successMessage) successMessage.textContent = 'This reservation has been completed.';
            } else {
                // Show "Reservation Confirmed!" for upcoming reservations
                if (successIcon) successIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
                if (successIcon) successIcon.style.color = '#4caf50';
                if (successTitle) successTitle.textContent = 'Reservation Confirmed!';
                if (successMessage) successMessage.textContent = 'Your table at Bute 5 Star Restaurant has been successfully reserved.';
            }
            
            // Show the modal
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }
    }

    // Show cancel confirmation modal
    function showCancelModal(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        const reservation = reservations.find(res => res.reservationId === reservationId);
        
        if (reservation) {
            const resDate = new Date(reservation.date);
            const formattedDate = resDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Fill cancel modal
            const cancelReservationIdElement = document.getElementById('cancelReservationId');
            const cancelDateElement = document.getElementById('cancelDate');
            const cancelTimeElement = document.getElementById('cancelTime');
            const cancelGuestsElement = document.getElementById('cancelGuests');
            const cancelNameElement = document.getElementById('cancelName');
            
            if (cancelReservationIdElement) cancelReservationIdElement.textContent = reservation.reservationId;
            if (cancelDateElement) cancelDateElement.textContent = formattedDate;
            if (cancelTimeElement) cancelTimeElement.textContent = formatTime(reservation.time);
            if (cancelGuestsElement) cancelGuestsElement.textContent = 
                `${reservation.guests} ${reservation.guests === '1' ? 'person' : 'people'}`;
            if (cancelNameElement) cancelNameElement.textContent = `${reservation.firstName} ${reservation.lastName}`;
            
            // Store reservation ID for cancellation
            const cancelYesBtn = document.getElementById('cancelYes');
            if (cancelYesBtn) {
                cancelYesBtn.dataset.id = reservationId;
            }
            
            // Show modal
            const cancelModal = document.getElementById('cancelModal');
            if (cancelModal) {
                cancelModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        }
    }

    // Cancel reservation (move to cancelled and mark as cancelled)
    function cancelReservation(reservationId, reason = '') {
        const reservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        const index = reservations.findIndex(res => res.reservationId === reservationId);
        
        if (index !== -1) {
            // Mark as cancelled instead of deleting
            reservations[index].status = 'cancelled';
            reservations[index].cancelledAt = new Date().toISOString();
            reservations[index].cancellationReason = reason;
            
            localStorage.setItem('buteReservations', JSON.stringify(reservations));
            
            // Show cancellation success modal
            showCancelSuccessModal(reservations[index]);
            
            // Close cancel modal
            const cancelModal = document.getElementById('cancelModal');
            if (cancelModal) {
                cancelModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Reload reservations
            const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'upcoming';
            const searchInput = document.getElementById('reservationSearch');
            const searchTerm = searchInput ? searchInput.value : '';
            loadReservations(activeFilter, searchTerm);
            
            // Update count badge
            updateReservationCount();
        }
    }

    // Show cancellation success modal
    function showCancelSuccessModal(reservation) {
        const resDate = new Date(reservation.date);
        const formattedDate = resDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Fill cancel success modal with actual data
        const cancelledReservationIdElement = document.getElementById('cancelledReservationId');
        const cancelledDateElement = document.getElementById('cancelledDate');
        const cancelledTimeElement = document.getElementById('cancelledTime');
        const cancelledGuestsElement = document.getElementById('cancelledGuests');
        const cancelledNameElement = document.getElementById('cancelledName');
        const cancelledAtElement = document.getElementById('cancelledAt');
        const refundAmountElement = document.getElementById('refundAmount');
        
        if (cancelledReservationIdElement) cancelledReservationIdElement.textContent = reservation.reservationId;
        if (cancelledDateElement) cancelledDateElement.textContent = formattedDate;
        if (cancelledTimeElement) cancelledTimeElement.textContent = formatTime(reservation.time);
        if (cancelledGuestsElement) cancelledGuestsElement.textContent = 
            `${reservation.guests} ${reservation.guests === '1' ? 'person' : 'people'}`;
        if (cancelledNameElement) cancelledNameElement.textContent = `${reservation.firstName} ${reservation.lastName}`;
        if (cancelledAtElement) cancelledAtElement.textContent = 'Just now';
        if (refundAmountElement) refundAmountElement.textContent = `$${parseFloat(reservation.price || 0).toFixed(2)}`;
        
        // Show modal
        const cancelSuccessModal = document.getElementById('cancelSuccessModal');
        if (cancelSuccessModal) {
            cancelSuccessModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    // Print reservation
    function printReservation(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        const reservation = reservations.find(res => res.reservationId === reservationId);
        
        if (reservation) {
            // Fill the success modal with reservation details
            viewReservationDetails(reservationId);
            
            // Wait for modal to show, then print
            setTimeout(() => {
                window.print();
            }, 500);
        }
    }

    // Reset form
    function resetForm() {
        if (reservationForm) {
            reservationForm.reset();
            datePicker.clear();
            showStep(1);
            const newsletter = document.getElementById('newsletter');
            const terms = document.getElementById('terms');
            if (newsletter) newsletter.checked = false;
            if (terms) terms.checked = false;
            updatePriceEstimate();
        }
    }

    // Show success modal for NEW reservations
    function showSuccessModal(data, priceData) {
        const successModal = document.getElementById('successModal');
        const reservationDate = new Date(data.date);
        const formattedDate = reservationDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Update modal content
        const reservationIdElement = document.getElementById('reservationId');
        const reservationDateElement = document.getElementById('reservationDate');
        const reservationTimeElement = document.getElementById('reservationTime');
        const reservationGuestsElement = document.getElementById('reservationGuests');
        const reservationSeatingElement = document.getElementById('reservationSeating');
        const reservationOccasionElement = document.getElementById('reservationOccasion');
        const reservationNameElement = document.getElementById('reservationName');
        const reservationEmailElement = document.getElementById('reservationEmail');
        const reservationPhoneElement = document.getElementById('reservationPhone');
        const reservationRequestsElement = document.getElementById('reservationRequests');
        const reservationPriceElement = document.getElementById('reservationPrice');
        
        if (reservationIdElement) reservationIdElement.textContent = data.reservationId;
        if (reservationDateElement) reservationDateElement.textContent = formattedDate;
        if (reservationTimeElement) reservationTimeElement.textContent = formatTime(data.time);
        if (reservationGuestsElement) reservationGuestsElement.textContent = 
            `${data.guests} ${data.guests === '1' ? 'person' : 'people'}`;
        if (reservationSeatingElement) reservationSeatingElement.textContent = priceData.seatingName;
        if (reservationOccasionElement) reservationOccasionElement.textContent = priceData.occasionName;
        if (reservationNameElement) reservationNameElement.textContent = `${data.firstName} ${data.lastName}`;
        if (reservationEmailElement) reservationEmailElement.textContent = data.email;
        if (reservationPhoneElement) reservationPhoneElement.textContent = data.phone;
        if (reservationRequestsElement) reservationRequestsElement.textContent = data.specialRequests || 'None';
        if (reservationPriceElement) reservationPriceElement.textContent = `$${priceData.total.toFixed(2)}`;
        
        // Ensure modal shows "Reservation Confirmed!" for new reservations
        const successIcon = document.querySelector('.success-icon');
        const successTitle = document.querySelector('.success-content h3');
        const successMessage = document.querySelector('.success-content > p');
        
        if (successIcon) {
            successIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            successIcon.style.color = '#4caf50';
        }
        if (successTitle) successTitle.textContent = 'Reservation Confirmed!';
        if (successMessage) successMessage.textContent = 'Your table at Bute 5 Star Restaurant has been successfully reserved.';
        
        // Show modal
        if (successModal) {
            successModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            document.body.style.overflowX = 'hidden';
        }
    }

    // ===========================================
    // TOGGLE RESERVATIONS FUNCTIONALITY
    // ===========================================

    const toggleReservationsBtn = document.getElementById('toggleReservationsBtn');
    const myReservationsSection = document.getElementById('myReservationsSection');

    if (toggleReservationsBtn && myReservationsSection) {
        toggleReservationsBtn.addEventListener('click', function() {
            const isShowing = myReservationsSection.style.display === 'block';
            
            if (isShowing) {
                // Hide reservations
                myReservationsSection.style.display = 'none';
                toggleReservationsBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Show My Reservations';
                toggleReservationsBtn.classList.remove('showing');
                
                // Scroll to top of reservations section
                const toggleSection = document.querySelector('.my-reservations-toggle-section');
                if (toggleSection) {
                    toggleSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            } else {
                // Show reservations
                myReservationsSection.style.display = 'block';
                toggleReservationsBtn.innerHTML = '<i class="fas fa-times"></i> Hide My Reservations';
                toggleReservationsBtn.classList.add('showing');
                
                // Load reservations
                loadReservations();
                
                // Scroll to reservations section
                setTimeout(() => {
                    myReservationsSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }, 100);
            }
        });
    }

    // ===========================================
    // EVENT LISTENERS FOR MY RESERVATIONS - FIXED
    // ===========================================

    // Filter buttons - FIXED EVENT LISTENERS
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Load reservations with selected filter
            const filter = this.getAttribute('data-filter');
            const searchInput = document.getElementById('reservationSearch');
            const searchTerm = searchInput ? searchInput.value : '';
            loadReservations(filter, searchTerm);
        });
    });

    // Search input
    const searchInput = document.getElementById('reservationSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const activeFilter = document.querySelector('.filter-btn.active');
            const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'upcoming';
            loadReservations(filter, this.value);
        });
    }

    // Clear old reservations button
    const clearPastBtn = document.getElementById('clearPastReservations');
    if (clearPastBtn) {
        clearPastBtn.addEventListener('click', function() {
            clearOldReservations();
        });
    }

    // Cancel modal buttons
    const cancelCloseBtn = document.getElementById('cancelClose');
    const cancelNoBtn = document.getElementById('cancelNo');
    const cancelYesBtn = document.getElementById('cancelYes');
    
    if (cancelCloseBtn) {
        cancelCloseBtn.addEventListener('click', function() {
            const cancelModal = document.getElementById('cancelModal');
            if (cancelModal) {
                cancelModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (cancelNoBtn) {
        cancelNoBtn.addEventListener('click', function() {
            const cancelModal = document.getElementById('cancelModal');
            if (cancelModal) {
                cancelModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (cancelYesBtn) {
        cancelYesBtn.addEventListener('click', function() {
            const reservationId = this.dataset.id;
            const reasonInput = document.getElementById('cancelReason');
            const reason = reasonInput ? reasonInput.value : '';
            cancelReservation(reservationId, reason);
        });
    }

    // Cancel success modal buttons
    const cancelSuccessCloseBtn = document.getElementById('cancelSuccessClose');
    const closeCancelSuccessBtn = document.getElementById('closeCancelSuccess');
    const viewCancelledBtn = document.getElementById('viewCancelled');
    
    if (cancelSuccessCloseBtn) {
        cancelSuccessCloseBtn.addEventListener('click', function() {
            const cancelSuccessModal = document.getElementById('cancelSuccessModal');
            if (cancelSuccessModal) {
                cancelSuccessModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (closeCancelSuccessBtn) {
        closeCancelSuccessBtn.addEventListener('click', function() {
            const cancelSuccessModal = document.getElementById('cancelSuccessModal');
            if (cancelSuccessModal) {
                cancelSuccessModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (viewCancelledBtn) {
        viewCancelledBtn.addEventListener('click', function() {
            const cancelSuccessModal = document.getElementById('cancelSuccessModal');
            if (cancelSuccessModal) {
                cancelSuccessModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            
            // Show cancelled filter
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            const cancelledFilter = document.querySelector('.filter-btn[data-filter="cancelled"]');
            if (cancelledFilter) {
                cancelledFilter.classList.add('active');
                loadReservations('cancelled', '');
            }
        });
    }

    // Success modal event listeners
    const successCloseBtn = document.getElementById('successClose');
    const closeSuccessBtn = document.getElementById('closeSuccess');
    const printSection = document.querySelector('.print-section');
    const newReservationBtn = document.getElementById('newReservation');
    
    if (successCloseBtn) {
        successCloseBtn.addEventListener('click', function() {
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', function() {
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    if (printSection) {
        printSection.addEventListener('click', function() {
            window.print();
        });
    }
    
    if (newReservationBtn) {
        newReservationBtn.addEventListener('click', function() {
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
            resetForm();
            const formSection = document.querySelector('.reservation-form-section');
            if (formSection) {
                formSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const successModal = document.getElementById('successModal');
        const cancelModal = document.getElementById('cancelModal');
        const cancelSuccessModal = document.getElementById('cancelSuccessModal');
        const termsModal = document.getElementById('termsModal');
        
        if (e.target === successModal && successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        if (e.target === cancelModal && cancelModal) {
            cancelModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        if (e.target === cancelSuccessModal && cancelSuccessModal) {
            cancelSuccessModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        if (e.target === termsModal && termsModal) {
            termsModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // ===========================================
    // ADDITIONAL FUNCTIONS
    // ===========================================

    // Clear old reservations (older than 30 days)
    function clearOldReservations() {
        const reservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        const now = new Date();
        const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
        
        const activeReservations = reservations.filter(res => {
            try {
                const resDate = new Date(res.date + 'T' + res.time);
                return resDate > thirtyDaysAgo || res.status === 'upcoming';
            } catch (e) {
                return false;
            }
        });
        
        const removedCount = reservations.length - activeReservations.length;
        if (removedCount > 0) {
            if (confirm(`Clear reservations older than 30 days? This will remove ${removedCount} reservations.`)) {
                localStorage.setItem('buteReservations', JSON.stringify(activeReservations));
                showToast('Old reservations cleared successfully!', 'success');
                loadReservations();
                updateReservationCount();
            }
        } else {
            showToast('No old reservations to clear.', 'info');
        }
    }

    // Terms modal functionality
    const termsLink = document.getElementById('termsLink');
    const termsModal = document.getElementById('termsModal');
    const termsClose = document.getElementById('termsClose');
    const modalTerms = document.getElementById('modalTerms');
    const acceptTerms = document.getElementById('acceptTerms');

    if (termsLink) {
        termsLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (termsModal) {
                termsModal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        });
    }

    if (termsClose) {
        termsClose.addEventListener('click', function() {
            if (termsModal) {
                termsModal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    if (acceptTerms) {
        acceptTerms.addEventListener('click', function() {
            if (modalTerms && modalTerms.checked) {
                const termsCheckbox = document.getElementById('terms');
                if (termsCheckbox) {
                    termsCheckbox.checked = true;
                }
                if (termsModal) {
                    termsModal.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
                showToast('Terms and conditions accepted', 'success');
            } else {
                showToast('Please check the agreement box', 'error');
            }
        });
    }

    // Get Directions functionality
    const getDirectionsBtn = document.getElementById('getDirections');
    if (getDirectionsBtn) {
        getDirectionsBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const address = encodeURIComponent('Bute Town Center, Wajir County, Kenya');
            window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
        });
    }

    // FAQ functionality
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
            question.addEventListener('click', () => {
                faqItems.forEach(otherItem => {
                    if (otherItem !== item && otherItem.classList.contains('active')) {
                        otherItem.classList.remove('active');
                    }
                });
                item.classList.toggle('active');
            });
        }
    });

    // Real-time form validation
    const validateFields = ['date', 'time', 'guests', 'firstName', 'lastName', 'email', 'phone'];
    validateFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('invalid');
                    this.classList.add('valid');
                    updateConfirmation();
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

    // Event listeners for form changes
    const guestsSelect = document.getElementById('guests');
    const occasionSelect = document.getElementById('occasion');
    const seatingRadios = document.querySelectorAll('input[name="seating"]');
    
    if (guestsSelect) {
        guestsSelect.addEventListener('change', updateConfirmation);
    }
    
    if (occasionSelect) {
        occasionSelect.addEventListener('change', updateConfirmation);
    }
    
    seatingRadios.forEach(radio => {
        radio.addEventListener('change', updateConfirmation);
    });

    // Toast notification system
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Auto-fill current date and time for testing
    function initializeTestData() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        datePicker.setDate(tomorrow, true);
        
        // Set default values for testing
        const timeSelect = document.getElementById('time');
        const guestsSelect = document.getElementById('guests');
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const phoneInput = document.getElementById('phone');
        
        if (timeSelect) timeSelect.value = '19:00';
        if (guestsSelect) guestsSelect.value = '2';
        if (firstNameInput) firstNameInput.value = 'Ahmed';
        if (lastNameInput) lastNameInput.value = 'Ali';
        if (emailInput) emailInput.value = 'ahmed@example.com';
        if (phoneInput) phoneInput.value = '+254712345678';
        
        updateConfirmation();
    }

    // Initialize the page
    function initializePage() {
        // Clear any existing fake data from localStorage for fresh start
        const existingReservations = JSON.parse(localStorage.getItem('buteReservations') || '[]');
        if (existingReservations.length === 0) {
            // Initialize statistics to 0
            const upcomingElement = document.getElementById('upcomingCount');
            const totalElement = document.getElementById('totalCount');
            const cancelledElement = document.getElementById('cancelledCount');
            
            if (upcomingElement) upcomingElement.textContent = '0';
            if (totalElement) totalElement.textContent = '0';
            if (cancelledElement) cancelledElement.textContent = '0';
        } else {
            // Update with real data
            updateReservationStats(existingReservations);
        }
        
        initializeTestData();
        showStep(1);
        updateReservationCount();
        
        console.log('Bute 5 Star Reservation System initialized successfully');
    }

    // Initialize when page loads
    initializePage();
    
    // Prevent horizontal scrolling on window resize
    window.addEventListener('resize', function() {
        document.body.style.overflowX = 'hidden';
    });
});