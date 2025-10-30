// Site-wide JavaScript for Litterateur Cafe Website

// Initialize all functionalities when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  initPasswordToggles();
  initCopyToClipboard();
  initFloatingCart();
  initFormValidation();
});

// 1. Show/Hide Password Toggle Functionality
function initPasswordToggles() {
  // Find all password input fields
  const passwordInputs = document.querySelectorAll('input[type="password"]');
  
  passwordInputs.forEach(input => {
    // Check if toggle doesn't already exist
    if (!input.parentElement.classList.contains('password-wrapper')) {
      // Wrap input in a container for positioning
      const wrapper = document.createElement('div');
      wrapper.className = 'password-wrapper';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
      
      // Create toggle button
      const toggle = document.createElement('span');
      toggle.className = 'password-toggle';
      toggle.innerHTML = '👁️';
      toggle.setAttribute('title', 'Show password');
      
      // Add click event
      toggle.addEventListener('click', function() {
        if (input.type === 'password') {
          input.type = 'text';
          toggle.innerHTML = '🙈';
          toggle.setAttribute('title', 'Hide password');
        } else {
          input.type = 'password';
          toggle.innerHTML = '👁️';
          toggle.setAttribute('title', 'Show password');
        }
      });
      
      wrapper.appendChild(toggle);
    }
  });
}

// 2. Copy Referral Code to Clipboard Functionality
function initCopyToClipboard() {
  // Find all copy buttons (elements with class 'copy-btn' or data-copy attribute)
  const copyButtons = document.querySelectorAll('.copy-btn, [data-copy]');
  
  copyButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Get the text to copy (either from data-copy attribute or nearest .referral-code element)
      let textToCopy = button.getAttribute('data-copy');
      
      if (!textToCopy) {
        const codeElement = button.closest('.referral-code') || 
                           document.querySelector('.referral-code');
        if (codeElement) {
          textToCopy = codeElement.textContent.trim();
        }
      }
      
      if (textToCopy) {
        // Use Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
            showCopyFeedback(button);
          }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopy(textToCopy, button);
          });
        } else {
          fallbackCopy(textToCopy, button);
        }
      }
    });
  });
}

// Fallback copy method for older browsers
function fallbackCopy(text, button) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showCopyFeedback(button);
  } catch (err) {
    console.error('Fallback copy failed:', err);
    alert('Failed to copy. Please copy manually: ' + text);
  }
  
  document.body.removeChild(textarea);
}

// Show visual feedback when text is copied
function showCopyFeedback(button) {
  const originalText = button.textContent;
  button.textContent = '✓ Copied!';
  button.classList.add('copied');
  
  setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove('copied');
  }, 2000);
}

// 3. Floating Cart Icon with Item Count
function initFloatingCart() {
  // Check if floating cart already exists
  let floatingCart = document.querySelector('.floating-cart');
  
  if (!floatingCart) {
    // Create floating cart element
    floatingCart = document.createElement('div');
    floatingCart.className = 'floating-cart';
    floatingCart.innerHTML = '🛒<span class="cart-count">0</span>';
    floatingCart.setAttribute('title', 'View Cart');
    
    // Add click event to navigate to cart page
    floatingCart.addEventListener('click', function() {
      window.location.href = 'Cart and checkout.html';
    });
    
    document.body.appendChild(floatingCart);
  }
  
  // Initialize cart from localStorage
  updateCartCount();
}

// Update cart count from localStorage
function updateCartCount() {
  const floatingCart = document.querySelector('.floating-cart');
  if (!floatingCart) return;
  
  const cartCountElement = floatingCart.querySelector('.cart-count');
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  
  if (cartCountElement) {
    cartCountElement.textContent = totalItems;
    
    // Hide count if 0
    if (totalItems === 0) {
      cartCountElement.style.display = 'none';
    } else {
      cartCountElement.style.display = 'flex';
    }
  }
}

// Get cart from localStorage
function getCart() {
  try {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
  } catch (e) {
    console.error('Error reading cart from localStorage:', e);
    return [];
  }
}

// Add item to cart
function addToCart(item) {
  const cart = getCart();
  
  // Check if item already exists
  const existingItem = cart.find(i => i.id === item.id);
  
  if (existingItem) {
    existingItem.quantity = (existingItem.quantity || 1) + 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    return true;
  } catch (e) {
    console.error('Error saving cart to localStorage:', e);
    return false;
  }
}

// Remove item from cart
function removeFromCart(itemId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== itemId);
  
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    return true;
  } catch (e) {
    console.error('Error saving cart to localStorage:', e);
    return false;
  }
}

// Clear entire cart
function clearCart() {
  try {
    localStorage.removeItem('cart');
    updateCartCount();
    return true;
  } catch (e) {
    console.error('Error clearing cart:', e);
    return false;
  }
}

// 4. Basic Form Validation
function initFormValidation() {
  const forms = document.querySelectorAll('form[data-validate]');
  
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (validateForm(form)) {
        // Form is valid, allow submission
        console.log('Form is valid, submitting...');
        // form.submit(); // Uncomment to actually submit
      }
    });
    
    // Real-time validation on blur
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', function() {
        validateField(input);
      });
      
      // Clear error on input
      input.addEventListener('input', function() {
        clearFieldError(input);
      });
    });
  });
}

// Validate entire form
function validateForm(form) {
  const inputs = form.querySelectorAll('input, textarea, select');
  let isValid = true;
  
  inputs.forEach(input => {
    if (!validateField(input)) {
      isValid = false;
    }
  });
  
  return isValid;
}

// Validate individual field
function validateField(field) {
  // Clear previous error
  clearFieldError(field);
  
  let isValid = true;
  let errorMessage = '';
  
  // Check if field is required
  if (field.hasAttribute('required') && !field.value.trim()) {
    isValid = false;
    errorMessage = 'This field is required';
  }
  
  // Email validation
  if (field.type === 'email' && field.value.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(field.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
  }
  
  // Phone validation (basic)
  if (field.type === 'tel' && field.value.trim()) {
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(field.value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number';
    }
  }
  
  // Min length validation
  if (field.hasAttribute('minlength') && field.value.trim()) {
    const minLength = parseInt(field.getAttribute('minlength'));
    if (field.value.length < minLength) {
      isValid = false;
      errorMessage = `Minimum ${minLength} characters required`;
    }
  }
  
  // Max length validation
  if (field.hasAttribute('maxlength') && field.value.trim()) {
    const maxLength = parseInt(field.getAttribute('maxlength'));
    if (field.value.length > maxLength) {
      isValid = false;
      errorMessage = `Maximum ${maxLength} characters allowed`;
    }
  }
  
  // Pattern validation
  if (field.hasAttribute('pattern') && field.value.trim()) {
    const pattern = new RegExp(field.getAttribute('pattern'));
    if (!pattern.test(field.value)) {
      isValid = false;
      errorMessage = field.getAttribute('data-error') || 'Invalid format';
    }
  }
  
  if (!isValid) {
    showFieldError(field, errorMessage);
  }
  
  return isValid;
}

// Show field error
function showFieldError(field, message) {
  field.classList.add('error');
  
  // Create or update error message element
  let errorElement = field.nextElementSibling;
  if (!errorElement || !errorElement.classList.contains('error-message')) {
    errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    field.parentNode.insertBefore(errorElement, field.nextSibling);
  }
  
  errorElement.textContent = message;
}

// Clear field error
function clearFieldError(field) {
  field.classList.remove('error');
  
  const errorElement = field.nextElementSibling;
  if (errorElement && errorElement.classList.contains('error-message')) {
    errorElement.remove();
  }
}

// Export functions for use in other scripts
window.LitterateurCafe = {
  addToCart,
  removeFromCart,
  clearCart,
  getCart,
  updateCartCount,
  validateForm,
  validateField
};
