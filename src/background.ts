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

// Download an image on behalf of the content script. Host permissions let the worker read
// images that the page itself cannot (no CORS headers). Returns a data URL, never stores it.
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action !== "fetchImage") return;
  (async () => {
    try {
      const url = String(request.url || "");
      if (!/^https?:/i.test(url)) throw new Error("unsupported url");
      const res = await fetch(url, { credentials: "omit", cache: "force-cache" });
      if (!res.ok) throw new Error("http " + res.status);
      const type = res.headers.get("content-type") || "";
      if (!type.startsWith("image/")) throw new Error("not an image");
      const buf = await res.arrayBuffer();
      if (buf.byteLength > MAX_IMAGE_BYTES) throw new Error("too large");
      let bin = "";
      const bytes = new Uint8Array(buf);
      for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
      sendResponse({ dataUrl: "data:" + type.split(";")[0] + ";base64," + btoa(bin) });
    } catch {
      sendResponse({ dataUrl: null });
    }
  })();
  return true;
});
