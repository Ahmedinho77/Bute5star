// Contact Page JavaScript for Bute 5 Star Restaurant

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

    // Contact Form Functionality
    const contactForm = document.getElementById('contactForm');
    const successModal = document.getElementById('successModal');
    const successClose = document.getElementById('successClose');
    const closeSuccess = document.getElementById('closeSuccess');

    // Form validation functions
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^[\d\s\-\+\(\)]{10,}$/;
        return re.test(phone);
    }

    function highlightInvalidFields(fieldIds) {
        fieldIds.forEach(id => {
            const field = document.getElementById(id);
            field.classList.add('invalid');
            setTimeout(() => field.classList.remove('invalid'), 3000);
        });
    }

    // Real-time form validation
    const validateFields = ['contactName', 'contactEmail', 'contactSubject', 'contactMessage'];
    validateFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.classList.remove('invalid');
                    this.classList.add('valid');
                } else {
                    this.classList.remove('valid');
                }
            });
            
            if (fieldId === 'contactEmail') {
                field.addEventListener('blur', function() {
                    if (this.value && !validateEmail(this.value)) {
                        this.classList.add('invalid');
                        showToast('Please enter a valid email address', 'error');
                    }
                });
            }
        }
    });

    // Phone field validation
    const phoneField = document.getElementById('contactPhone');
    if (phoneField) {
        phoneField.addEventListener('blur', function() {
            if (this.value && !validatePhone(this.value)) {
                this.classList.add('invalid');
                showToast('Please enter a valid phone number', 'error');
            }
        });
    }

    // Form submission
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Validate required fields
        let isValid = true;
        const contactName = document.getElementById('contactName').value.trim();
        const contactEmail = document.getElementById('contactEmail').value.trim();
        const contactSubject = document.getElementById('contactSubject').value;
        const contactMessage = document.getElementById('contactMessage').value.trim();
        const termsAgreement = document.getElementById('termsAgreement').checked;
        
        // Validate required fields
        if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
            isValid = false;
            highlightInvalidFields(['contactName', 'contactEmail', 'contactSubject', 'contactMessage']);
        }
        
        // Validate email format
        if (contactEmail && !validateEmail(contactEmail)) {
            isValid = false;
            highlightInvalidFields(['contactEmail']);
            showToast('Please enter a valid email address', 'error');
        }
        
        // Validate terms agreement
        if (!termsAgreement) {
            isValid = false;
            document.getElementById('termsAgreement').focus();
            showToast('Please accept the privacy policy', 'error');
        }
        
        if (isValid) {
            // Get form data
            const formData = new FormData(contactForm);
            const contactData = Object.fromEntries(formData);
            
            // Generate message reference
            const now = new Date();
            const dateStr = now.getFullYear() + 
                           String(now.getMonth() + 1).padStart(2, '0') + 
                           String(now.getDate()).padStart(2, '0');
            const timeStr = String(now.getHours()).padStart(2, '0') + 
                           String(now.getMinutes()).padStart(2, '0');
            const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
            const messageRef = `BUT-CONT-${dateStr}-${timeStr}-${randomNum}`;
            
            // Add metadata
            contactData.messageRef = messageRef;
            contactData.timestamp = now.toISOString();
            contactData.status = 'pending';
            
            // Store contact data
            storeContactMessage(contactData);
            
            // Show success modal
            showSuccessModal(contactData, messageRef);
            
            // Reset form after submission
            setTimeout(() => {
                resetContactForm();
            }, 1000);
        }
    });

    function storeContactMessage(data) {
        const messages = JSON.parse(localStorage.getItem('buteContactMessages') || '[]');
        messages.push(data);
        localStorage.setItem('buteContactMessages', JSON.stringify(messages));
        console.log('Contact message stored:', data);
    }

    function showSuccessModal(data, messageRef) {
        // Update modal content
        document.getElementById('messageRef').textContent = messageRef;
        document.getElementById('successContactName').textContent = data.contactName || 'Not provided';
        
        // Format subject for display
        let subjectDisplay = 'General Inquiry';
        if (data.contactSubject === 'reservation') subjectDisplay = 'Reservation Inquiry';
        else if (data.contactSubject === 'feedback') subjectDisplay = 'Feedback & Reviews';
        else if (data.contactSubject === 'event') subjectDisplay = 'Event Booking';
        else if (data.contactSubject === 'menu') subjectDisplay = 'Menu Questions';
        else if (data.contactSubject === 'partnership') subjectDisplay = 'Partnership Opportunities';
        else if (data.contactSubject === 'other') subjectDisplay = 'Other Inquiry';
        
        document.getElementById('successSubject').textContent = subjectDisplay;
        
        // Show modal
        successModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function resetContactForm() {
        contactForm.reset();
        document.getElementById('newsletterOptin').checked = false;
        document.getElementById('termsAgreement').checked = false;
        
        // Remove validation classes
        validateFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.remove('valid');
            }
        });
    }

    // Success modal close handlers
    successClose.addEventListener('click', () => {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    closeSuccess.addEventListener('click', () => {
        successModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });

    window.addEventListener('click', (e) => {
        if (e.target === successModal) {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && successModal.style.display === 'flex') {
            successModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });

    // Reset button functionality
    const resetBtn = document.querySelector('.btn-reset');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            resetContactForm();
            showToast('Form has been cleared', 'info');
        });
    }

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

    // Newsletter form functionality
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('newsletterEmail').value.trim();
            const terms = document.getElementById('newsletterTerms').checked;
            
            if (!email) {
                showToast('Please enter your email address', 'error');
                return;
            }
            
            if (!validateEmail(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            if (!terms) {
                showToast('Please agree to receive marketing emails', 'error');
                return;
            }
            
            // Store newsletter subscription
            const subscriptions = JSON.parse(localStorage.getItem('buteNewsletterSubscriptions') || '[]');
            const subscription = {
                email: email,
                timestamp: new Date().toISOString(),
                source: 'contact-page'
            };
            subscriptions.push(subscription);
            localStorage.setItem('buteNewsletterSubscriptions', JSON.stringify(subscriptions));
            
            // Show success message
            showToast('Thank you for subscribing to our newsletter!', 'success');
            
            // Reset form
            newsletterForm.reset();
        });
    }

    // Toast notification system
    function showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                .toast {
                    position: fixed;
                    top: 100px;
                    right: 30px;
                    background: white;
                    color: #333;
                    padding: 15px 25px;
                    border-radius: 10px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    z-index: 5000;
                    transform: translateX(100%);
                    opacity: 0;
                    transition: all 0.3s ease;
                    border-left: 4px solid #0c3b2e;
                    max-width: 350px;
                }
                .toast.show {
                    transform: translateX(0);
                    opacity: 1;
                }
                .toast-success {
                    border-left-color: #4caf50;
                }
                .toast-error {
                    border-left-color: #ff6b6b;
                }
                .toast-info {
                    border-left-color: #2196f3;
                }
                .toast i {
                    font-size: 1.2rem;
                }
                .toast-success i {
                    color: #4caf50;
                }
                .toast-error i {
                    color: #ff6b6b;
                }
                .toast-info i {
                    color: #2196f3;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Auto-open first FAQ item
    if (faqItems.length > 0) {
        faqItems[0].classList.add('active');
    }

    console.log('Bute 5 Star Contact System initialized');
});