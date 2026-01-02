// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    mobileMenuBtn.innerHTML = navLinks.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Smooth scrolling for menu categories
document.querySelectorAll('.category-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.category-link').forEach(item => {
            item.classList.remove('active');
        });
        
        // Add active class to clicked link
        this.classList.add('active');
        
        // Scroll to section
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        window.scrollTo({
            top: targetSection.offsetTop - 100,
            behavior: 'smooth'
        });
    });
});

// Highlight current category on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.menu-section');
    const navLinks = document.querySelectorAll('.category-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= (sectionTop - 150)) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Order System - FIXED VERSION
let orderItems = [];
let orderTotal = 0;
let currentStep = 1;
let completedOrders = JSON.parse(localStorage.getItem('buteCompletedOrders') || '[]');

// Initialize order cart
const orderCartBtn = document.getElementById('orderCartBtn');
const cartCount = document.getElementById('cartCount');
const orderModal = document.getElementById('orderModal');
const modalClose = document.getElementById('modalClose');
const orderItemsContainer = document.getElementById('orderItems');
const orderTotalElement = document.getElementById('orderTotal');
const clearOrderBtn = document.getElementById('clearOrder');
const successModal = document.getElementById('successModal');
const closeSuccessBtn = document.getElementById('closeSuccess');

// Step navigation elements
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const confirmBtn = document.getElementById('confirmBtn');
const stepDots = document.querySelectorAll('.step-dot');
const steps = document.querySelectorAll('.order-step');

// Form elements
const customerForm = document.getElementById('customerForm');
const orderTypeRadios = document.querySelectorAll('input[name="orderType"]');
const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
const locationGroup = document.getElementById('locationGroup');
const cardDetails = document.getElementById('cardDetails');
const termsAgreement = document.getElementById('termsAgreement');

// Confirmation elements
const confirmationItems = document.getElementById('confirmationItems');
const confirmationTotal = document.getElementById('confirmationTotal');
const confirmationCustomer = document.getElementById('confirmationCustomer');
const confirmationDelivery = document.getElementById('confirmationDelivery');

// Add to order functionality - FIXED: Properly attach event listeners
document.addEventListener('click', function(e) {
    // Handle order buttons
    if (e.target.closest('.order-btn') || e.target.closest('.preview-order-btn')) {
        e.preventDefault();
        e.stopPropagation();
        
        const menuItemCard = e.target.closest('.menu-item-card');
        const itemName = menuItemCard.querySelector('h3').textContent;
        const itemPrice = parseFloat(menuItemCard.querySelector('.menu-item-price').textContent.replace('$', ''));
        
        // Add item to order
        addToOrder(itemName, itemPrice);
        
        // Show confirmation message
        showOrderConfirmation(itemName);
    }
});

function addToOrder(name, price) {
    // Check if item already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.name === name);
    
    if (existingItemIndex !== -1) {
        // Increment quantity if item already exists
        orderItems[existingItemIndex].quantity++;
    } else {
        // Add new item to order
        orderItems.push({
            id: Date.now() + Math.random(), // Add unique ID for each item
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    // Update order total
    orderTotal += price;
    
    // Update UI
    updateOrderUI();
}

function updateOrderUI() {
    // Update cart count
    const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Show/hide cart button
    if (totalItems > 0) {
        orderCartBtn.style.display = 'flex';
    } else {
        orderCartBtn.style.display = 'none';
    }
    
    // Update order modal if open
    if (orderModal.style.display === 'flex') {
        updateOrderModal();
    }
}

function updateOrderModal() {
    if (!orderItemsContainer) return;
    
    orderItemsContainer.innerHTML = '';
    
    if (orderItems.length === 0) {
        orderItemsContainer.innerHTML = '<p class="empty-order">No items in your order yet. Add items from the menu.</p>';
        orderTotalElement.textContent = '$0.00';
        return;
    }
    
    orderItems.forEach((item, index) => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <div class="order-item-info">
                <h4>${item.name}</h4>
                <p>$${item.price.toFixed(2)} each</p>
            </div>
            <div class="order-item-controls">
                <button class="quantity-btn minus" data-index="${index}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn plus" data-index="${index}">+</button>
                <button class="remove-btn" data-index="${index}"><i class="fas fa-trash"></i></button>
            </div>
            <div class="order-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        orderItemsContainer.appendChild(orderItem);
    });
    
    // Update total
    orderTotalElement.textContent = `$${orderTotal.toFixed(2)}`;
    
    // Add event listeners for quantity controls
    orderItemsContainer.querySelectorAll('.quantity-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const isPlus = this.classList.contains('plus');
            
            if (isPlus) {
                orderItems[index].quantity++;
                orderTotal += orderItems[index].price;
            } else {
                if (orderItems[index].quantity > 1) {
                    orderItems[index].quantity--;
                    orderTotal -= orderItems[index].price;
                }
            }
            
            updateOrderModal();
        });
    });
    
    // Add event listeners for remove buttons
    orderItemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            orderTotal -= orderItems[index].price * orderItems[index].quantity;
            orderItems.splice(index, 1);
            updateOrderUI();
        });
    });
}

function showOrderConfirmation(itemName) {
    const confirmation = document.createElement('div');
    confirmation.className = 'order-confirmation';
    confirmation.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${itemName} added to order!</span>
    `;
    
    document.body.appendChild(confirmation);
    
    setTimeout(() => {
        confirmation.remove();
    }, 2000);
}

// Step navigation functions
function showStep(step) {
    // Hide all steps
    steps.forEach(s => s.classList.remove('active'));
    stepDots.forEach(dot => dot.classList.remove('active'));
    
    // Show current step
    document.getElementById(`step${step}`).classList.add('active');
    stepDots[step - 1].classList.add('active');
    
    // Update button visibility
    prevBtn.style.display = step > 1 ? 'flex' : 'none';
    nextBtn.style.display = step < 4 ? 'flex' : 'none';
    confirmBtn.style.display = step === 4 ? 'flex' : 'none';
    
    // Update current step
    currentStep = step;
    
    // Update confirmation details if on last step
    if (step === 4) {
        updateConfirmationDetails();
    }
}

function updateConfirmationDetails() {
    // Update order items
    confirmationItems.innerHTML = '';
    if (orderItems.length === 0) {
        confirmationItems.innerHTML = '<p>No items in order</p>';
    } else {
        orderItems.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'confirmation-item';
            itemDiv.innerHTML = `
                <span>${item.name} × ${item.quantity}</span>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            confirmationItems.appendChild(itemDiv);
        });
    }
    
    // Update total
    confirmationTotal.textContent = `$${orderTotal.toFixed(2)}`;
    
    // Update customer details
    const name = document.getElementById('customerName').value || 'Not provided';
    const phone = document.getElementById('customerPhone').value || 'Not provided';
    const email = document.getElementById('customerEmail').value || 'Not provided';
    const instructions = document.getElementById('specialInstructions').value || 'None';
    
    confirmationCustomer.innerHTML = `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Special Instructions:</strong> ${instructions}</p>
    `;
    
    // Update delivery details
    const orderType = document.querySelector('input[name="orderType"]:checked').value;
    const location = document.getElementById('deliveryLocation').value || 
                    (orderType === 'pickup' ? 'Restaurant Pickup' : 'Not provided');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    confirmationDelivery.innerHTML = `
        <p><strong>Order Type:</strong> ${orderType === 'delivery' ? 'Delivery' : 'Pickup'}</p>
        <p><strong>${orderType === 'delivery' ? 'Delivery Address:' : 'Pickup Location:'}</strong> ${location}</p>
        <p><strong>Payment Method:</strong> ${getPaymentMethodText(paymentMethod)}</p>
    `;
}

function getPaymentMethodText(method) {
    switch(method) {
        case 'cash': return 'Cash on Delivery';
        case 'card': return 'Credit/Debit Card';
        case 'mobile': return 'Mobile Payment';
        default: return 'Cash on Delivery';
    }
}

function validateStep(step) {
    switch(step) {
        case 1:
            if (orderItems.length === 0) {
                alert('Please add at least one item to your order.');
                return false;
            }
            return true;
        case 2:
            const name = document.getElementById('customerName').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            
            if (name === '') {
                alert('Please enter your full name.');
                document.getElementById('customerName').focus();
                return false;
            }
            
            if (phone === '') {
                alert('Please enter your phone number.');
                document.getElementById('customerPhone').focus();
                return false;
            }
            
            // Simple phone validation
            if (!/^[\d\s\-\+\(\)]{10,}$/.test(phone)) {
                alert('Please enter a valid phone number.');
                document.getElementById('customerPhone').focus();
                return false;
            }
            
            return true;
        case 3:
            const orderType = document.querySelector('input[name="orderType"]:checked').value;
            
            if (orderType === 'delivery') {
                const location = document.getElementById('deliveryLocation').value.trim();
                if (location === '') {
                    alert('Please enter your delivery address.');
                    document.getElementById('deliveryLocation').focus();
                    return false;
                }
            }
            
            return true;
        case 4:
            if (!termsAgreement.checked) {
                alert('Please agree to the Terms & Conditions to place your order.');
                termsAgreement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                return false;
            }
            return true;
        default:
            return true;
    }
}

// Event Listeners
orderCartBtn.addEventListener('click', () => {
    if (orderItems.length === 0) {
        alert('Please add items to your order first.');
        return;
    }
    orderModal.style.display = 'flex';
    showStep(1);
    updateOrderModal();
});

modalClose.addEventListener('click', () => {
    orderModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === orderModal) {
        orderModal.style.display = 'none';
    }
    if (e.target === successModal) {
        successModal.style.display = 'none';
    }
});

// FIXED: Clear Order Button - now working properly
clearOrderBtn.addEventListener('click', () => {
    if (orderItems.length > 0) {
        if (confirm('Are you sure you want to clear your current order?')) {
            resetCurrentOrder();
        }
    } else {
        alert('Your order is already empty.');
    }
});

// FIXED: Properly reset current order
function resetCurrentOrder() {
    // Clear order arrays
    orderItems = [];
    orderTotal = 0;
    
    // Reset UI
    updateOrderUI();
    
    // Reset to step 1
    showStep(1);
    
    // Reset form if on step 2 or beyond
    if (currentStep >= 2) {
        customerForm.reset();
        termsAgreement.checked = false;
        
        // Reset radio buttons to default
        document.querySelector('input[name="orderType"][value="delivery"]').checked = true;
        document.querySelector('input[name="paymentMethod"][value="cash"]').checked = true;
        if (cardDetails) cardDetails.style.display = 'none';
    }
}

// Step navigation
nextBtn.addEventListener('click', () => {
    if (validateStep(currentStep)) {
        showStep(currentStep + 1);
    }
});

prevBtn.addEventListener('click', () => {
    showStep(currentStep - 1);
});

// Step dots click
stepDots.forEach(dot => {
    dot.addEventListener('click', () => {
        const step = parseInt(dot.getAttribute('data-step'));
        if (step < currentStep) {
            showStep(step);
        }
    });
});

// Order type change
orderTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        const locationInput = document.getElementById('deliveryLocation');
        if (e.target.value === 'delivery') {
            locationGroup.style.display = 'block';
            locationInput.required = true;
            locationInput.placeholder = 'Enter your delivery address';
        } else {
            locationGroup.style.display = 'block';
            locationInput.required = false;
            locationInput.placeholder = 'Pickup at restaurant (optional note)';
            locationInput.value = '';
        }
    });
});

// Payment method change
paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'card') {
            cardDetails.style.display = 'block';
        } else {
            cardDetails.style.display = 'none';
        }
    });
});

// Terms agreement checkbox
termsAgreement.addEventListener('change', function() {
    const termsLabel = this.closest('.checkbox-label');
    if (this.checked) {
        termsLabel.style.backgroundColor = 'rgba(12, 59, 46, 0.05)';
        termsLabel.style.border = '1px solid #0c3b2e';
    } else {
        termsLabel.style.backgroundColor = '';
        termsLabel.style.border = '';
    }
});

// FIXED: Confirm Order Button - now working properly
confirmBtn.addEventListener('click', () => {
    if (validateStep(4)) {
        // Generate random order ID with timestamp
        const now = new Date();
        const dateStr = now.getFullYear() + 
                       String(now.getMonth() + 1).padStart(2, '0') + 
                       String(now.getDate()).padStart(2, '0');
        const timeStr = String(now.getHours()).padStart(2, '0') + 
                       String(now.getMinutes()).padStart(2, '0');
        const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const orderId = `BUT-${dateStr}-${timeStr}-${randomNum}`;
        
        // Get form values
        const orderType = document.querySelector('input[name="orderType"]:checked').value;
        const location = document.getElementById('deliveryLocation').value || 
                        (orderType === 'pickup' ? 'Restaurant Pickup' : 'Not provided');
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        // Store order details
        const orderDetails = {
            orderId: orderId,
            items: [...orderItems], // Copy current order items
            total: orderTotal,
            customer: {
                name: document.getElementById('customerName').value,
                phone: document.getElementById('customerPhone').value,
                email: document.getElementById('customerEmail').value || '',
                instructions: document.getElementById('specialInstructions').value || ''
            },
            delivery: {
                type: orderType,
                location: location
            },
            payment: {
                method: paymentMethod
            },
            timestamp: now.toISOString(),
            status: 'confirmed',
            date: now.toLocaleDateString(),
            time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        
        // Store order in completed orders
        completedOrders.unshift(orderDetails);
        if (completedOrders.length > 50) {
            completedOrders = completedOrders.slice(0, 50);
        }
        localStorage.setItem('buteCompletedOrders', JSON.stringify(completedOrders));
        
        // Calculate estimated time
        const deliveryTime = new Date(now.getTime() + 45 * 60000);
        const options = { hour: '2-digit', minute: '2-digit' };
        const estimatedTime = deliveryTime.toLocaleTimeString([], options);
        
        // Update success modal with receipt
        const successDetails = document.querySelector('.success-details');
        let receiptItems = '';
        orderItems.forEach(item => {
            receiptItems += `
                <div class="receipt-item">
                    <span>${item.name} × ${item.quantity}</span>
                    <span>$${(item.price * item.quantity).toFixed(2)}</span>
                </div>
            `;
        });
        
        successDetails.innerHTML = `
            <div class="receipt-header">
                <h4><i class="fas fa-check-circle"></i> Order Confirmed!</h4>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Date:</strong> ${orderDetails.date} at ${orderDetails.time}</p>
            </div>
            
            <div class="receipt-section">
                <h5><i class="fas fa-utensils"></i> Order Summary</h5>
                ${receiptItems}
                <div class="receipt-total">
                    <span>Total Amount:</span>
                    <span class="receipt-total-amount">$${orderTotal.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="receipt-section">
                <h5><i class="fas fa-user"></i> Customer Details</h5>
                <p><strong>Name:</strong> ${orderDetails.customer.name}</p>
                <p><strong>Phone:</strong> ${orderDetails.customer.phone}</p>
                ${orderDetails.customer.email ? `<p><strong>Email:</strong> ${orderDetails.customer.email}</p>` : ''}
                ${orderDetails.customer.instructions ? `<p><strong>Instructions:</strong> ${orderDetails.customer.instructions}</p>` : ''}
            </div>
            
            <div class="receipt-section">
                <h5><i class="fas fa-truck"></i> Delivery Information</h5>
                <p><strong>Type:</strong> ${orderDetails.delivery.type === 'delivery' ? 'Delivery' : 'Pickup'}</p>
                <p><strong>${orderDetails.delivery.type === 'delivery' ? 'Address:' : 'Location:'}</strong> ${orderDetails.delivery.location}</p>
                <p><strong>Estimated ${orderDetails.delivery.type === 'delivery' ? 'Delivery' : 'Pickup'} Time:</strong> ${estimatedTime}</p>
            </div>
            
            <div class="receipt-section">
                <h5><i class="fas fa-credit-card"></i> Payment Information</h5>
                <p><strong>Method:</strong> ${getPaymentMethodText(orderDetails.payment.method)}</p>
                <p><strong>Status:</strong> <span class="status-confirmed">Confirmed ✅</span></p>
            </div>
            
            <div class="receipt-note">
                <p><i class="fas fa-info-circle"></i> We'll send updates via SMS on ${orderDetails.customer.phone}</p>
                <p><i class="fas fa-history"></i> Order saved to your order history</p>
                <p><i class="fas fa-shopping-cart"></i> Your cart has been cleared for your next order</p>
            </div>
            
            <div class="receipt-actions">
                <button class="print-receipt-btn" onclick="window.print()">
                    <i class="fas fa-print"></i> Print Receipt
                </button>
            </div>
        `;
        
        // Show success modal and reset order
        setTimeout(() => {
            orderModal.style.display = 'none';
            successModal.style.display = 'flex';
            
            // Reset current order
            resetCurrentOrder();
            
            // Update order history button
            updateOrderHistoryButton();
        }, 500);
    }
});

// Function to view order history
function viewOrderHistory() {
    if (completedOrders.length === 0) {
        alert('No previous orders found. Place your first order!');
        return;
    }
    
    const historyModal = document.createElement('div');
    historyModal.className = 'order-history-modal';
    historyModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 4000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        overflow-y: auto;
    `;
    
    let historyHTML = `
        <div class="history-content" style="
            background: white;
            border-radius: 15px;
            padding: 20px;
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        ">
            <div class="history-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #0c3b2e;
            ">
                <h3 style="margin: 0; color: #0c3b2e;">
                    <i class="fas fa-history"></i> Order History
                </h3>
                <button class="close-history" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #666;
                    cursor: pointer;
                ">&times;</button>
            </div>
            
            <div class="history-stats" style="
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
                text-align: center;
            ">
                <p style="margin: 0;">
                    <strong>Total Orders:</strong> ${completedOrders.length}
                    <br>
                    <small>Most recent orders first</small>
                </p>
            </div>
    `;
    
    // Display last 10 orders
    const recentOrders = completedOrders.slice(0, 10);
    recentOrders.forEach((order, index) => {
        const orderDate = new Date(order.timestamp);
        const formattedDate = orderDate.toLocaleDateString();
        const formattedTime = orderDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        historyHTML += `
            <div class="history-order" style="
                border: 1px solid #e0e0e0;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 15px;
                background: ${index === 0 ? '#f8fff8' : 'white'};
            ">
                <div class="order-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                ">
                    <h4 style="margin: 0; color: #0c3b2e; font-size: 1rem;">
                        #${order.orderId}
                    </h4>
                    <span style="
                        background: #0c3b2e;
                        color: white;
                        padding: 4px 10px;
                        border-radius: 20px;
                        font-size: 0.8rem;
                        font-weight: 600;
                    ">
                        $${order.total.toFixed(2)}
                    </span>
                </div>
                
                <div class="order-details" style="font-size: 0.9rem;">
                    <p style="margin: 5px 0; color: #666;">
                        <i class="far fa-calendar"></i> ${formattedDate} at ${formattedTime}
                    </p>
                    <p style="margin: 5px 0; color: #666;">
                        <i class="fas fa-box"></i> ${totalItems} item${totalItems !== 1 ? 's' : ''}
                    </p>
                    <p style="margin: 5px 0; color: #666;">
                        <i class="fas fa-user"></i> ${order.customer.name}
                    </p>
                    <p style="margin: 5px 0; color: #666;">
                        <i class="fas fa-truck"></i> ${order.delivery.type === 'delivery' ? 'Delivery' : 'Pickup'}
                    </p>
                </div>
                
                <button class="view-order-details" data-index="${index}" style="
                    width: 100%;
                    background: #f8f9fa;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    padding: 8px;
                    margin-top: 10px;
                    color: #0c3b2e;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <i class="fas fa-eye"></i> View Details
                </button>
            </div>
        `;
    });
    
    historyHTML += `
            <div class="history-footer" style="
                margin-top: 20px;
                text-align: center;
                padding-top: 15px;
                border-top: 1px solid #e0e0e0;
            ">
                <p style="margin: 0; color: #666; font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i> Orders are saved locally in your browser
                </p>
                <button class="clear-history" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 5px;
                    margin-top: 10px;
                    cursor: pointer;
                    font-weight: 600;
                ">
                    <i class="fas fa-trash"></i> Clear All History
                </button>
            </div>
        </div>
    `;
    
    historyModal.innerHTML = historyHTML;
    document.body.appendChild(historyModal);
    
    // Close button functionality
    historyModal.querySelector('.close-history').addEventListener('click', () => {
        historyModal.remove();
    });
    
    // Close on outside click
    historyModal.addEventListener('click', (e) => {
        if (e.target === historyModal) {
            historyModal.remove();
        }
    });
    
    // View order details
    historyModal.querySelectorAll('.view-order-details').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            const order = completedOrders[index];
            
            let itemsList = '';
            order.items.forEach(item => {
                itemsList += `${item.name} × ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
            });
            
            alert(`Order Details - ${order.orderId}\n\n` +
                  `Items:\n${itemsList}\n` +
                  `Total: $${order.total.toFixed(2)}\n` +
                  `Customer: ${order.customer.name}\n` +
                  `Phone: ${order.customer.phone}\n` +
                  `Type: ${order.delivery.type === 'delivery' ? 'Delivery' : 'Pickup'}\n` +
                  `Date: ${new Date(order.timestamp).toLocaleString()}`);
        });
    });
    
    // FIXED: Clear history button - now working properly
    historyModal.querySelector('.clear-history').addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (confirm('Are you sure you want to clear all order history? This cannot be undone.')) {
            localStorage.removeItem('buteCompletedOrders');
            completedOrders = [];
            historyModal.remove();
            alert('Order history cleared!');
            updateOrderHistoryButton();
        }
    });
}

// Function to update order history button visibility
function updateOrderHistoryButton() {
    const orderHistoryBtn = document.getElementById('orderHistoryBtn');
    if (orderHistoryBtn) {
        if (completedOrders.length > 0) {
            orderHistoryBtn.style.display = 'flex';
            orderHistoryBtn.innerHTML = `<i class="fas fa-history"></i> Orders (${completedOrders.length})`;
        } else {
            orderHistoryBtn.style.display = 'none';
        }
    }
}

// Close success modal
closeSuccessBtn.addEventListener('click', () => {
    successModal.style.display = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set default values
    document.querySelector('input[name="orderType"][value="delivery"]').checked = true;
    document.querySelector('input[name="paymentMethod"][value="cash"]').checked = true;
    if (cardDetails) cardDetails.style.display = 'none';
    
    // Add required attribute to name and phone fields
    document.getElementById('customerName').required = true;
    document.getElementById('customerPhone').required = true;
    
    // Add pattern for phone validation
    document.getElementById('customerPhone').pattern = '^[\\d\\s\\-\\+\\(\\)]{10,}$';
    document.getElementById('customerPhone').title = 'Please enter a valid phone number with at least 10 digits';
    
    // Load completed orders from localStorage
    completedOrders = JSON.parse(localStorage.getItem('buteCompletedOrders') || '[]');
    
    // Create order history button
    const orderHistoryBtn = document.createElement('button');
    orderHistoryBtn.id = 'orderHistoryBtn';
    orderHistoryBtn.innerHTML = '<i class="fas fa-history"></i> Order History';
    orderHistoryBtn.style.cssText = `
        position: fixed;
        bottom: 150px;
        right: 30px;
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: white;
        border: none;
        padding: 12px 15px;
        border-radius: 50px;
        cursor: pointer;
        z-index: 1000;
        font-size: 0.9rem;
        font-weight: 600;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        display: ${completedOrders.length > 0 ? 'flex' : 'none'};
        align-items: center;
        gap: 8px;
        transition: all 0.3s ease;
    `;
    
    orderHistoryBtn.addEventListener('mouseenter', () => {
        orderHistoryBtn.style.transform = 'translateY(-3px)';
        orderHistoryBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
    });
    
    orderHistoryBtn.addEventListener('mouseleave', () => {
        orderHistoryBtn.style.transform = 'translateY(0)';
        orderHistoryBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
    });
    
    orderHistoryBtn.onclick = viewOrderHistory;
    document.body.appendChild(orderHistoryBtn);
    
    // Mobile positioning
    const updateButtonPosition = () => {
        if (window.innerWidth <= 480) {
            orderHistoryBtn.style.bottom = '140px';
            orderHistoryBtn.style.right = '15px';
            orderHistoryBtn.style.fontSize = '0.8rem';
            orderHistoryBtn.style.padding = '10px 12px';
        } else {
            orderHistoryBtn.style.bottom = '150px';
            orderHistoryBtn.style.right = '30px';
            orderHistoryBtn.style.fontSize = '0.9rem';
            orderHistoryBtn.style.padding = '12px 15px';
        }
    };
    
    updateButtonPosition();
    window.addEventListener('resize', updateButtonPosition);
    
    // Initialize with empty cart
    updateOrderUI();
});

// AI Assistant for Bute 5 Star Restaurant - ENHANCED VERSION with Mobile Fixes
document.addEventListener('DOMContentLoaded', function() {
    // AI Assistant Elements
    const aiAssistant = document.getElementById('aiAssistant');
    const aiAssistantToggle = document.getElementById('aiAssistantToggle');
    const aiCloseBtn = document.getElementById('aiCloseBtn');
    const aiMessages = document.getElementById('aiMessages');
    const aiUserInput = document.getElementById('aiUserInput');
    const aiSendBtn = document.getElementById('aiSendBtn');
    const aiQuickQuestions = document.querySelectorAll('.quick-question');

    // Create mobile close button
    const aiMobileClose = document.createElement('button');
    aiMobileClose.className = 'ai-mobile-close';
    aiMobileClose.innerHTML = '<i class="fas fa-times"></i>';
    aiAssistant.appendChild(aiMobileClose);

    // Menu Database for AI (same as before)
    const menuDatabase = {
        starters: [
            { name: "Truffle Arancini", price: 18, description: "Crispy risotto balls filled with mozzarella and black truffle", dietary: ["vegetarian"], category: "starter" },
            { name: "Chicken Liver Pâté", price: 20, description: "Halal chicken liver pâté with fig compote", dietary: ["halal"], category: "starter" },
            { name: "Burrata Caprese", price: 22, description: "Fresh burrata with heirloom tomatoes and basil oil", dietary: ["vegetarian"], category: "starter" },
            { name: "Lobster Bisque", price: 24, description: "Rich lobster bisque with coconut cream", category: "starter" },
            { name: "Beef Tartare", price: 20, description: "Hand-cut prime halal beef with capers", dietary: ["halal"], category: "starter" }
        ],
        mains: [
            { name: "Wagyu Beef Tenderloin", price: 85, description: "Premium halal Wagyu beef with truffle mashed potatoes", dietary: ["halal", "signature"], category: "main" },
            { name: "Herb-Crusted Rack of Lamb", price: 68, description: "New Zealand lamb rack with rosemary jus", dietary: ["halal"], category: "main" },
            { name: "Duck à l'Orange", price: 56, description: "Confit duck leg with orange glaze", dietary: ["halal"], category: "main" },
            { name: "Truffle Risotto", price: 42, description: "Carnaroli rice with Parmigiano-Reggiano and black truffle", dietary: ["vegetarian"], category: "main" },
            { name: "Chicken Kebab Platter", price: 38, description: "Grilled chicken kebabs with saffron rice", dietary: ["halal"], category: "main" }
        ],
        seafood: [
            { name: "Lobster Thermidor", price: 78, description: "Atlantic lobster baked with creamy mustard sauce", category: "seafood", popular: true },
            { name: "Pan-Seared Halibut", price: 58, description: "Wild-caught halibut with lemon beurre blanc", category: "seafood" },
            { name: "Seafood Linguine", price: 52, description: "Homemade linguine with shrimp, scallops, and mussels", category: "seafood" },
            { name: "Grilled Salmon", price: 48, description: "Scottish salmon with dill cream sauce", category: "seafood" }
        ],
        desserts: [
            { name: "Umm Ali", price: 14, description: "Traditional Egyptian bread pudding", dietary: ["vegetarian"], category: "dessert" },
            { name: "Chocolate Date Cake", price: 16, description: "Rich chocolate cake with date filling", dietary: ["vegetarian", "signature"], category: "dessert" },
            { name: "Seasonal Fruit Tart", price: 12, description: "Almond tart with fresh seasonal fruits", dietary: ["vegetarian"], category: "dessert" },
            { name: "Artisan Cheese Board", price: 18, description: "Selection of five artisan cheeses", dietary: ["vegetarian"], category: "dessert" }
        ],
        beverages: [
            { name: "Bute Sunset", price: 12, description: "Pomegranate juice, fresh orange, lime, and mint", category: "beverage" },
            { name: "Arabian Nights", price: 10, description: "Date syrup, coconut milk, banana, and cardamom", category: "beverage" },
            { name: "Mint Lemonade Sparkler", price: 8, description: "Fresh lemon juice, mint leaves, sparkling water", category: "beverage" },
            { name: "Arabic Coffee", price: 6, description: "Traditional Arabic coffee with cardamom", category: "beverage" }
        ]
    };

    // AI Responses Database (same as before)
    const aiResponses = {
        greetings: [
            "Hello! 👋 Welcome to Bute 5 Star Restaurant! I'm your AI dining assistant. How can I help you explore our exquisite menu today?",
            "Welcome to Bute 5 Star! 🍽️ I'm here to help you discover amazing culinary delights. What would you like to know about our menu?",
            "Hi there! 👋 Ready for a wonderful dining experience? I can help you with menu recommendations, dietary info, and more!"
        ],
        
        thanks: [
            "You're very welcome! 😊 It's my pleasure to help. Enjoy your dining experience at Bute 5 Star Restaurant!",
            "Happy to assist! 🍽️ If you have any more questions, I'm always here to help. Bon appétit!",
            "Thank YOU for visiting Bute 5 Star! ✨ Remember, all our meat is 100% halal certified. Have a wonderful meal!",
            "My pleasure! 🎉 I hope you have an amazing dining experience. Don't hesitate to ask if you need anything else!"
        ],
        
        developer: [
            "This AI assistant was developed by **Ahmed Ali**! 👨‍💻 He's the talented developer behind Bute 5 Star Restaurant's entire website and digital experience.",
            "I was created by **Ahmed Ali**! 🚀 He's the developer who designed and built this amazing website. You can find his contact info in the footer below.",
            "The mastermind behind me is **Ahmed Ali**! 💻 He programmed me to help you explore our menu. You can reach him through the restaurant contact info.",
            "**Ahmed Ali** developed this AI assistant! 📱 He built the entire Bute 5 Star website to provide you with this seamless dining experience."
        ],
        
        help: [
            "I can help you with:\n• Menu recommendations based on your preferences\n• Dietary information (halal/vegetarian)\n• Ingredient questions and preparation methods\n• Price ranges and chef's specials\n• Beverage pairings\n• Reservation information\n\nWhat would you like to know?",
            "As your dining assistant, I can:\n• Suggest dishes for special occasions\n• Answer questions about our ingredients\n• Help with dietary restrictions\n• Recommend wine pairings (non-alcoholic alternatives)\n• Provide contact and location info\n• Guide you through our menu categories",
            "Need help choosing? I can assist with:\n• Popular dishes and chef's favorites\n• Halal and vegetarian options\n• Price comparisons\n• Food and beverage pairings\n• Special dietary needs\n• Restaurant hours and reservations\n\nJust ask away!"
        ],
        
        popular: [
            "Our most popular dishes are:\n🔥 **Lobster Thermidor** ($78) - Atlantic lobster with creamy mustard sauce\n🥩 **Wagyu Beef Tenderloin** ($85) - Premium halal Wagyu (our signature dish)\n🍰 **Chocolate Date Cake** ($16) - Rich chocolate with date filling\n🍹 **Mint Lemonade Sparkler** ($8) - Refreshing house special mocktail",
            "Customers absolutely love:\n1. **Lobster Thermidor** ($78) - Our #1 seller\n2. **Wagyu Beef Tenderloin** ($85) - Signature dish\n3. **Truffle Arancini** ($18) - Perfect starter\n4. **Chocolate Date Cake** ($16) - Must-try dessert\n\nAll highly recommended by our regular guests!",
            "The crowd favorites include:\n• **Lobster Thermidor** ($78) - Most ordered seafood dish\n• **Wagyu Beef Tenderloin** ($85) - Chef's signature creation\n• **Beef Tartare** ($20) - Popular halal starter\n• **Mint Lemonade Sparkler** ($8) - Refreshing beverage choice"
        ],
        
        vegetarian: [
            "Great vegetarian options:\n🥗 **Starters:** Truffle Arancini ($18), Burrata Caprese ($22)\n🍝 **Mains:** Truffle Risotto ($42)\n🍰 **Desserts:** All our desserts are vegetarian! Try Chocolate Date Cake ($16) or Umm Ali ($14)\n\nWe take vegetarian dining seriously! 🌱",
            "For vegetarians, I recommend:\n• **Truffle Risotto** ($42) - Creamy with black truffle\n• **Burrata Caprese** ($22) - Fresh burrata with heirloom tomatoes\n• **Seasonal Fruit Tart** ($12) - Light and refreshing dessert\n• **Artisan Cheese Board** ($18) - Perfect for sharing",
            "Vegetarian-friendly choices:\n🎯 **Best main:** Truffle Risotto ($42)\n✨ **Best starter:** Truffle Arancini ($18)\n🍓 **Best dessert:** Seasonal Fruit Tart ($12)\n🧀 **Best shareable:** Artisan Cheese Board ($18)\n\nAll absolutely delicious!"
        ],
        
        halal: [
            "All our meat is 100% halal certified! 🕌 Popular halal dishes:\n🥩 **Wagyu Beef Tenderloin** ($85) - Premium halal Wagyu\n🐑 **Herb-Crusted Rack of Lamb** ($68) - New Zealand lamb\n🦆 **Duck à l'Orange** ($56) - Confit duck leg\n🍗 **Chicken Kebab Platter** ($38) - Perfect for sharing",
            "You can enjoy any of our meat dishes with confidence - all are halal certified! Special halal treats:\n• **Beef Tartare** ($20) - Hand-cut prime halal beef\n• **Chicken Liver Pâté** ($20) - Halal chicken liver\n• **Wagyu Beef Tenderloin** ($85) - Our signature halal dish",
            "From starters to mains, all our meat dishes are prepared with certified halal ingredients:\n🔸 **Starters:** Beef Tartare ($20), Chicken Liver Pâté ($20)\n🔸 **Mains:** Wagyu Beef ($85), Rack of Lamb ($68), Duck à l'Orange ($56), Chicken Kebab Platter ($38)"
        ],
        
        priceRange: [
            "Our price ranges:\n🥗 **Starters:** $18-$24\n🍽️ **Mains:** $38-$85\n🐟 **Seafood:** $48-$78\n🍰 **Desserts:** $12-$18\n🍹 **Beverages:** $6-$12\n\nWe offer options for every budget! 💰",
            "Price overview:\n• Starters from $18 (Truffle Arancini)\n• Mains from $38 (Chicken Kebab Platter)\n• Seafood from $48 (Grilled Salmon)\n• Desserts from $12 (Seasonal Fruit Tart)\n• Beverages from $6 (Arabic Coffee)\n\nPremium options like Wagyu Beef at $85",
            "Budget-friendly to luxury:\n💲 **Economical:** Chicken Kebab Platter ($38)\n💲💲 **Mid-range:** Duck à l'Orange ($56)\n💲💲💲 **Premium:** Wagyu Beef Tenderloin ($85)\n💲💲💲💲 **Luxury:** Lobster Thermidor ($78)\n\nSomething for every occasion!"
        ],
        
        recommendations: {
            romantic: "For a romantic dinner: 💖\n• Start: Truffle Arancini ($18)\n• Main: Wagyu Beef Tenderloin ($85)\n• Dessert: Chocolate Date Cake ($16)\n• Drink: Bute Sunset mocktail ($12)\n✨ Perfect for special moments!",
            family: "Great for families: 👨‍👩‍👧‍👦\n• Kid-friendly: Chicken Kebab Platter ($38)\n• Shareable: Seafood Linguine ($52)\n• Dessert: Umm Ali ($14) - everyone loves it!\n• Drink: Mint Lemonade Sparkler ($8)\n🎉 Fun for all ages!",
            healthy: "Healthy choices: 🥗\n• Main: Pan-Seared Halibut ($58) with grilled vegetables\n• Drink: Green Detox juice ($7)\n• Dessert: Seasonal Fruit Tart ($12)\n• Starter: Burrata Caprese ($22)\n🌿 Fresh and nutritious!",
            luxurious: "Luxury experience: 💎\n• Starter: Lobster Bisque ($24)\n• Main: Lobster Thermidor ($78)\n• Dessert: Artisan Cheese Board ($18)\n• Drink: Arabic Coffee ($6) with dates\n🌟 Indulge in excellence!"
        }
    };

    // Initialize AI Assistant
    function initAIAssistant() {
        // Toggle AI Assistant with improved mobile handling
        aiAssistantToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            aiAssistant.style.display = 'flex';
            aiAssistantToggle.style.display = 'none';
            
            // Focus on input and scroll to bottom after a small delay
            setTimeout(() => {
                if (aiUserInput) {
                    aiUserInput.focus();
                }
                scrollToBottom();
            }, 100);
        });

        // Close AI Assistant (desktop)
        aiCloseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            aiAssistant.style.display = 'none';
            aiAssistantToggle.style.display = 'flex';
        });

        // Close AI Assistant (mobile)
        aiMobileClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            aiAssistant.style.display = 'none';
            aiAssistantToggle.style.display = 'flex';
        });

        // Close on outside click for mobile - Improved for better touch handling
        document.addEventListener('click', function(e) {
            const isMobile = window.innerWidth <= 480;
            if (isMobile && aiAssistant.style.display === 'flex') {
                // Check if click is outside AI container and not on toggle button
                if (!aiAssistant.contains(e.target) && 
                    e.target !== aiAssistantToggle && 
                    !aiAssistantToggle.contains(e.target)) {
                    aiAssistant.style.display = 'none';
                    aiAssistantToggle.style.display = 'flex';
                }
            }
        });

        // Send message on button click
        aiSendBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            sendMessage();
        });

        // Send message on Enter key
        aiUserInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });

        // Quick question buttons with improved mobile handling
        aiQuickQuestions.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const question = this.getAttribute('data-question');
                addUserMessage(question);
                setTimeout(() => {
                    processUserInput(question);
                }, 500);
            });
        });

        // Handle window resize with improved mobile detection
        window.addEventListener('resize', handleResize);
        handleResize(); // Initial check
        
        // Prevent iOS zoom on input focus (common mobile issue)
        aiUserInput.addEventListener('focus', function() {
            if (window.innerWidth <= 480) {
                document.body.style.zoom = "1.0";
            }
        });
        
        // Add touch event listeners for better mobile support
        aiAssistantToggle.addEventListener('touchstart', function(e) {
            // Add active state for visual feedback
            this.style.transform = 'scale(0.95)';
        });
        
        aiAssistantToggle.addEventListener('touchend', function(e) {
            // Remove active state
            this.style.transform = 'scale(1)';
        });
        
        // Prevent text selection on double tap (mobile)
        aiAssistantToggle.style.userSelect = 'none';
        aiAssistantToggle.style.webkitUserSelect = 'none';
    }

    // Handle window resize for AI
    function handleResize() {
        const isMobile = window.innerWidth <= 480;
        if (isMobile) {
            aiMobileClose.style.display = 'flex';
            // Ensure AI toggle is visible and clickable
            aiAssistantToggle.style.display = 'flex';
            aiAssistantToggle.style.zIndex = '9999';
            aiAssistantToggle.style.pointerEvents = 'auto';
        } else {
            aiMobileClose.style.display = 'none';
        }
    }

    // Add user message to chat
    function addUserMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'ai-message ai-message-user';
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message}</p>
            </div>
            <div class="message-time">${getCurrentTime()}</div>
        `;
        aiMessages.appendChild(messageDiv);
        aiUserInput.value = '';
        scrollToBottom();
    }

    // Add bot message to chat
    function addBotMessage(message, isTyping = false) {
        if (isTyping) {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'ai-typing-indicator';
            typingDiv.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            aiMessages.appendChild(typingDiv);
            scrollToBottom();
            return typingDiv;
        } else {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'ai-message ai-message-bot';
            messageDiv.innerHTML = `
                <div class="message-content">${message}</div>
                <div class="message-time">${getCurrentTime()}</div>
            `;
            aiMessages.appendChild(messageDiv);
            scrollToBottom();
            return messageDiv;
        }
    }

    // Send message function
    function sendMessage() {
        const message = aiUserInput.value.trim();
        if (message) {
            addUserMessage(message);
            showTypingIndicator();
            setTimeout(() => {
                processUserInput(message);
            }, 1000 + Math.random() * 1000);
        } else {
            // If empty, focus back on input
            aiUserInput.focus();
        }
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingIndicator = addBotMessage('', true);
        setTimeout(() => {
            if (typingIndicator && typingIndicator.parentNode) {
                typingIndicator.remove();
            }
        }, 1500);
    }

    // Process user input with AI logic
    function processUserInput(input) {
        const lowerInput = input.toLowerCase();
        let response = '';

        // Check for greetings
        if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
            response = getRandomResponse(aiResponses.greetings);
        }
        // Check for thanks
        else if (lowerInput.includes('thank') || lowerInput.includes('thanks') || lowerInput.includes('thank you')) {
            response = getRandomResponse(aiResponses.thanks);
        }
        // Check for developer/creator
        else if (lowerInput.includes('developer') || lowerInput.includes('created') || lowerInput.includes('who made you') || 
                 lowerInput.includes('who created you') || lowerInput.includes('ahmed ali') || lowerInput.includes('ahmed')) {
            response = getRandomResponse(aiResponses.developer);
        }
        // Check for help
        else if (lowerInput.includes('help') || lowerInput.includes('what can you do')) {
            response = getRandomResponse(aiResponses.help);
        }
        // Check for popular dishes
        else if (lowerInput.includes('popular') || lowerInput.includes('best seller') || lowerInput.includes('most ordered')) {
            response = getRandomResponse(aiResponses.popular);
        }
        // Check for vegetarian
        else if (lowerInput.includes('vegetarian') || lowerInput.includes('veg') || lowerInput.includes('no meat')) {
            response = getRandomResponse(aiResponses.vegetarian);
        }
        // Check for halal
        else if (lowerInput.includes('halal') || lowerInput.includes('islamic') || lowerInput.includes('permissible')) {
            response = getRandomResponse(aiResponses.halal);
        }
        // Check for price
        else if (lowerInput.includes('price') || lowerInput.includes('cost') || lowerInput.includes('expensive') || lowerInput.includes('cheap')) {
            response = getRandomResponse(aiResponses.priceRange);
        }
        // Check for recommendations
        else if (lowerInput.includes('recommend') || lowerInput.includes('suggest') || lowerInput.includes('what should i order')) {
            response = getRecommendation(lowerInput);
        }
        // Check for specific dishes
        else if (lowerInput.includes('wagyu') || lowerInput.includes('beef')) {
            response = getDishInfo('Wagyu Beef Tenderloin');
        }
        else if (lowerInput.includes('lobster')) {
            response = getDishInfo('Lobster Thermidor');
        }
        else if (lowerInput.includes('truffle') && lowerInput.includes('risotto')) {
            response = getDishInfo('Truffle Risotto');
        }
        else if (lowerInput.includes('chocolate') && lowerInput.includes('cake')) {
            response = getDishInfo('Chocolate Date Cake');
        }
        // Check for dietary restrictions
        else if (lowerInput.includes('gluten') || lowerInput.includes('allergy') || lowerInput.includes('intolerant')) {
            response = "Please inform our staff about any allergies. Most dishes can be modified. For severe allergies, we recommend the Truffle Risotto or Grilled Salmon.";
        }
        // Check for reservation
        else if (lowerInput.includes('reservation') || lowerInput.includes('book') || lowerInput.includes('table')) {
            response = "You can make reservations through our website or call +254 721 237 883. We recommend booking in advance, especially for weekends.";
        }
        // Check for hours
        else if (lowerInput.includes('open') || lowerInput.includes('close') || lowerInput.includes('hour')) {
            response = "We're open daily from 5:00 PM to 11:00 PM. Friday Family Feast from 12:00 PM to 4:00 PM.";
        }
        // Check for location/address
        else if (lowerInput.includes('where') || lowerInput.includes('location') || lowerInput.includes('address') || lowerInput.includes('find')) {
            response = "Bute 5 Star Restaurant is located in **Gumar, Bute District**. You can find us on Google Maps or contact +254 721 237 883 for directions.";
        }
        // Check for contact
        else if (lowerInput.includes('contact') || lowerInput.includes('phone') || lowerInput.includes('call') || lowerInput.includes('email')) {
            response = "📞 **Phone:** +254 721 237 883\n📧 **Email:** reservations@bute5star.com\n📍 **Address:** Gumar, Bute District\n⏰ **Hours:** Daily 5:00 PM - 11:00 PM";
        }
        // Check for close/exit
        else if (lowerInput.includes('bye') || lowerInput.includes('goodbye') || lowerInput.includes('exit') || lowerInput.includes('quit')) {
            response = "Thank you for chatting with me! Feel free to ask more questions anytime. Have a wonderful dining experience at Bute 5 Star! 👋";
        }
        // Check for compliments
        else if (lowerInput.includes('good') || lowerInput.includes('nice') || lowerInput.includes('awesome') || lowerInput.includes('great') || 
                 lowerInput.includes('amazing') || lowerInput.includes('excellent') || lowerInput.includes('cool')) {
            response = "Thank you! 😊 I'm glad I could help. The real stars are our chefs who create these amazing dishes!";
        }
        // Check for menu
        else if (lowerInput.includes('menu') || lowerInput.includes('dish') || lowerInput.includes('food') || lowerInput.includes('eat')) {
            response = "We have an exquisite menu with 5 categories:\n\n1. **Starters & Appetizers** ($18-$24)\n2. **Main Courses** ($38-$85)\n3. **Seafood Specialties** ($48-$78)\n4. **Desserts** ($12-$18)\n5. **Premium Beverages** ($6-$12)\n\nAll our meat is 100% halal certified! 🕌";
        }
        // Default response - search menu
        else {
            response = searchMenu(lowerInput);
        }

        // Add bot response
        setTimeout(() => {
            addBotMessage(response);
        }, 500);
    }

    // Get random response from array
    function getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Get dish information
    function getDishInfo(dishName) {
        let dish = null;
        
        // Search in all categories
        for (const category in menuDatabase) {
            dish = menuDatabase[category].find(item => 
                item.name.toLowerCase().includes(dishName.toLowerCase())
            );
            if (dish) break;
        }
        
        if (dish) {
            let dietaryInfo = '';
            if (dish.dietary) {
                dietaryInfo = dish.dietary.includes('halal') ? ' (Halal)' : 
                             dish.dietary.includes('vegetarian') ? ' (Vegetarian)' : 
                             dish.dietary.includes('signature') ? ' (Signature Dish)' : '';
            }
            
            return `**${dish.name}**${dietaryInfo}<br>
                    Price: $${dish.price}<br>
                    ${dish.description}<br><br>
                    ${getPairingSuggestion(dish.category)}`;
        }
        
        return "I couldn't find that specific dish in our menu. Could you be more specific?";
    }

    // Get pairing suggestion
    function getPairingSuggestion(category) {
        const pairings = {
            starter: "Pairs well with our Bute Sunset mocktail or a light white wine (non-alcoholic alternative: Sparkling Apple Cider).",
            main: "Great with our Arabic Coffee or Mint Lemonade Sparkler. For meat dishes, try our pomegranate juice.",
            seafood: "Perfect with our Tropical Fruit Blend or a crisp Sauvignon Blanc alternative.",
            dessert: "Excellent with our Masala Chai or Hot Chocolate Royale.",
            beverage: "This beverage pairs well with most of our dishes!"
        };
        
        return pairings[category] || "This item pairs well with a variety of our other offerings.";
    }

    // Get recommendation based on input
    function getRecommendation(input) {
        if (input.includes('romantic') || input.includes('date')) {
            return aiResponses.recommendations.romantic;
        } else if (input.includes('family') || input.includes('kids')) {
            return aiResponses.recommendations.family;
        } else if (input.includes('healthy') || input.includes('light') || input.includes('diet')) {
            return aiResponses.recommendations.healthy;
        } else if (input.includes('luxury') || input.includes('expensive') || input.includes('special')) {
            return aiResponses.recommendations.luxurious;
        } else {
            // Random recommendation
            const randomCategory = Object.keys(aiResponses.recommendations)[
                Math.floor(Math.random() * Object.keys(aiResponses.recommendations).length)
            ];
            return aiResponses.recommendations[randomCategory];
        }
    }

    // Search menu items
    function searchMenu(query) {
        const results = [];
        
        // Search in all categories
        for (const category in menuDatabase) {
            const matches = menuDatabase[category].filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                (item.dietary && item.dietary.some(d => d.includes(query)))
            );
            
            results.push(...matches);
        }
        
        if (results.length > 0) {
            let response = `I found ${results.length} item(s) related to "${query}":<br><br>`;
            
            // Limit to 3 results
            results.slice(0, 3).forEach(item => {
                const dietary = item.dietary ? 
                    item.dietary.includes('halal') ? ' (Halal)' : 
                    item.dietary.includes('vegetarian') ? ' (Vegetarian)' : '' : '';
                
                response += `• **${item.name}**${dietary} - $${item.price}<br>`;
                response += `  ${item.description}<br><br>`;
            });
            
            if (results.length > 3) {
                response += `And ${results.length - 3} more items. Try being more specific!`;
            }
            
            return response;
        }
        
        return `I couldn't find anything related to "${query}" in our menu. Try asking about specific categories like starters, mains, seafood, desserts, or beverages. Or tell me what you're in the mood for!`;
    }

    // Get current time for message timestamp
    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Scroll chat to bottom
    function scrollToBottom() {
        setTimeout(() => {
            if (aiMessages) {
                aiMessages.scrollTop = aiMessages.scrollHeight;
            }
        }, 100);
    }

    // Initialize AI when page loads
    setTimeout(() => {
        initAIAssistant();
        
        // Auto-open AI assistant after 10 seconds if user hasn't interacted (desktop only)
        setTimeout(() => {
            if (!sessionStorage.getItem('aiInteracted')) {
                const isMobile = window.innerWidth <= 480;
                if (!isMobile) { // Only auto-open on desktop
                    aiAssistantToggle.click();
                }
                sessionStorage.setItem('aiInteracted', 'true');
            }
        }, 10000);
    }, 1000);

    // Mobile-specific fixes
    function applyMobileFixes() {
        if (window.innerWidth <= 480) {
            // Ensure AI toggle is always visible and clickable
            const aiToggle = document.getElementById('aiAssistantToggle');
            if (aiToggle) {
                aiToggle.style.zIndex = '9999';
                aiToggle.style.pointerEvents = 'auto';
                aiToggle.style.display = 'flex';
            }
            
            // Ensure order cart button doesn't overlap
            const orderCart = document.getElementById('orderCartBtn');
            if (orderCart) {
                orderCart.style.zIndex = '9998';
            }
        }
    }

    // Apply mobile fixes on load and resize
    window.addEventListener('load', applyMobileFixes);
    window.addEventListener('resize', applyMobileFixes);
});