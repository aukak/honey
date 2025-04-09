// Detect checkout pages
function detectCheckoutPage() {
    const checkoutSelectors = [
      'input[name="coupon"]',
      'input[name="promo"]',
      'input[name="discount"]',
      '#couponCode',
      '#promoCode'
    ];
    
    return checkoutSelectors.some(selector => document.querySelector(selector));
  }
  
  // Apply coupon code
  async function applyCoupon(code) {
    const couponField = document.querySelector('input[name="coupon"], input[name="promo"], input[name="discount"], #couponCode, #promoCode');
    if (couponField) {
      couponField.value = code;
      const applyBtn = document.querySelector('button[value="Apply"], button[name="applyCoupon"]');
      if (applyBtn) {
        applyBtn.click();
        return true;
      }
    }
    return false;
  }
  
  // Main content script logic
  if (detectCheckoutPage()) {
    chrome.runtime.sendMessage({type: "CHECKOUT_DETECTED"}, (response) => {
      if (response.coupons && response.coupons.length > 0) {
        showCouponNotification(response.coupons);
      }
    });
  }
  
  function showCouponNotification(coupons) {
    // Create modern notification UI
    const notification = document.createElement('div');
    notification.className = 'modern-honey-notification';
    
    // Notification HTML
    notification.innerHTML = `
      <div class="notification-header">
        <h3>ModernHoney found ${coupons.length} coupons!</h3>
        <button class="close-btn">×</button>
      </div>
      <div class="coupon-list">
        ${coupons.map(coupon => `
          <div class="coupon-item">
            <span class="code">${coupon.code}</span>
            <span class="discount">${coupon.discount}</span>
            <button class="apply-btn" data-code="${coupon.code}">Apply</button>
          </div>
        `).join('')}
      </div>
    `;
    
    // Add to page and style
    document.body.appendChild(notification);
    
    // Add event listeners
    notification.querySelectorAll('.apply-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyCoupon(btn.dataset.code);
      });
    });
    
    notification.querySelector('.close-btn').addEventListener('click', () => {
      notification.remove();
    });
  }