let activeTabId = null;
let activeDomain = null;
let startTime = null;
let websiteData = {};
let trackingInterval = null;

// Function to calculate and store time spent
function calculateTimeSpent() {
  if (activeDomain && startTime) {
    const now = Date.now();
    const timeSpent = Math.floor((now - startTime) / 1000); 

    if (!websiteData[activeDomain]) {
      websiteData[activeDomain] = 0;
    }
    websiteData[activeDomain] += timeSpent;

    
    chrome.storage.local.set({ websiteData });

    startTime = now; // Reset start time for the next calculation
  }
}

// Function to start tracking time on the active tab
function startTracking(domain) {
  activeDomain = domain;
  startTime = Date.now();

  // Stop any existing interval
  if (trackingInterval) {
    clearInterval(trackingInterval);
  }

  // Start a new interval to track time every second
  trackingInterval = setInterval(calculateTimeSpent, 1000);
}

// Listener for tab activation
chrome.tabs.onActivated.addListener((activeInfo) => {
  calculateTimeSpent(); // Save time for the previous tab

  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      activeTabId = tab.id;
      startTracking(new URL(tab.url).hostname);
    }
  });
});

// Listener for tab updates (e.g., URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    calculateTimeSpent(); // Save time for the previous domain
    startTracking(new URL(changeInfo.url).hostname);
  }
});

// Listener for tab removal
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === activeTabId) {
    calculateTimeSpent(); // Save time for the closed tab
    activeTabId = null;
    activeDomain = null;
    startTime = null;

    // Stop the tracking interval
    if (trackingInterval) {
      clearInterval(trackingInterval);
    }
  }
});

// Load existing data on extension startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get("websiteData", (data) => {
    websiteData = data.websiteData || {};
  });
});

// Clean up and save data on extension shutdown
chrome.runtime.onSuspend.addListener(() => {
  calculateTimeSpent(); // Save final time data
  chrome.storage.local.set({ websiteData });

  if (trackingInterval) {
    clearInterval(trackingInterval);
  }
});
