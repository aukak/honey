// Coupon database (in a real app, this would come from an API)
const couponDatabase = {
    'amazon.com': [
      { code: 'SAVE10', discount: '10% off', expiry: '2023-12-31' },
      { code: 'FREESHIP', discount: 'Free shipping', expiry: '2023-12-31' }
    ],
    'bestbuy.com': [
      { code: 'TECH20', discount: '20% off tech', expiry: '2023-12-31' }
    ]
  };
  
  // Listen for checkout detection
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "CHECKOUT_DETECTED") {
      const domain = new URL(sender.tab.url).hostname.replace('www.', '');
      const coupons = couponDatabase[domain] || [];
      sendResponse({ coupons });
    }
  });
  
  // Track price history
  chrome.alarms.create('priceCheck', { periodInMinutes: 60 });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'priceCheck') {
      checkTrackedItems();
    }
  });
  
  async function checkTrackedItems() {
    const { trackedItems = [] } = await chrome.storage.local.get('trackedItems');
    
    trackedItems.forEach(async (item) => {
      const currentPrice = await fetchCurrentPrice(item.url);
      if (currentPrice < item.price) {
        chrome.notifications.create({
          type: 'basic',
          iconUrl: 'icons/icon128.png',
          title: 'Price Drop Alert',
          message: `${item.name} dropped from $${item.price} to $${currentPrice}`
        });
        // Update stored price
        item.price = currentPrice;
      }
    });
    
    chrome.storage.local.set({ trackedItems });
  }