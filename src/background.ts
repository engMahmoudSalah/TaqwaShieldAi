// Background service worker
chrome.runtime.onInstalled.addListener(() => {
  console.log("TaqwaShield AI installed.");
  // Initialize default settings
  chrome.storage.local.get(["enabled", "sensitivity", "blurCount"], (result) => {
    if (result.enabled === undefined) {
      chrome.storage.local.set({ enabled: true });
    }
    if (result.sensitivity === undefined) {
      chrome.storage.local.set({ sensitivity: "Medium" });
    }
    if (result.blurCount === undefined) {
      chrome.storage.local.set({ blurCount: 0 });
    }
  });

  // Refresh current active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.reload(tabs[0].id);
    }
  });
});

// Listen for messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getSettings") {
    chrome.storage.local.get(["enabled", "sensitivity"], (result) => {
      sendResponse(result);
    });
    return true; // Keep message channel open
  }
  if (request.action === "incrementBlurCount") {
    chrome.storage.local.get(["blurCount"], (result) => {
      const newCount = ((result.blurCount as number) || 0) + 1;
      chrome.storage.local.set({ blurCount: newCount });
      sendResponse({ count: newCount });
    });
    return true;
  }
});
