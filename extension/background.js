// background.js

// Runs when the extension is first installed or updated
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === "install" || details.reason === "update") {
    // Open the intent prompt immediately on install/update
    await chrome.tabs.create({
      url: chrome.runtime.getURL("intentPrompt.html")
    });
  }
});

// Tries to run when Chrome restarts (not guaranteed in MV3, but can work)
// This is often called if the service worker loads for the first time in a new session.
chrome.runtime.onStartup.addListener(async () => {
  console.log("DCAF extension onStartup triggered.");
  
  // Check if we already have a user intent
  const { userIntent } = await chrome.storage.local.get("userIntent");
  
  // If no user intent is set, open the prompt
  if (!userIntent) {
    await chrome.tabs.create({
      url: chrome.runtime.getURL("intentPrompt.html")
    });
  }
});

// ...the rest of your code for onUpdated and relevance checks...
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^https?:\/\//.test(tab.url)) {
    const { userIntent } = await chrome.storage.local.get("userIntent");
    if (!userIntent) return;

    // Skip relevance check if on Google search results
    if (/^https?:\/\/(www\.)?google\.com\/search/i.test(tab.url)) {
      return;
    }

    // Call the API to check relevance...
    try {
      const response = await fetch("http://127.0.0.1:5000/check_relevance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tab.url, intent: userIntent })
      });
      const data = await response.json();
      if (data.relevance === false) {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => alert("This website is NOT relevant to your stated intent.")
        });
      }
    } catch (error) {
      console.error("Error checking relevance:", error);
    }
  }
});

