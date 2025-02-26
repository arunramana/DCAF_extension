chrome.runtime.onInstalled.addListener(async (details) => {
  // Open the intent prompt page only on install or update
  if (details.reason === "install" || details.reason === "update") {
    // Create a new tab with intentPrompt.html
    await chrome.tabs.create({
      url: chrome.runtime.getURL("intentPrompt.html")
    });
  }
});

// Listen for tab updates
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // We only proceed if the tab is fully loaded
  if (changeInfo.status === "complete" && /^https?:\/\//.test(tab.url)) {
    // Get the user intention
    const { userIntent } = await chrome.storage.local.get("userIntent");

    // If we haven't set an intent yet, do nothing
    if (!userIntent) {
      return;
    }

    // Skip relevance check if the URL is a Google search results page (Regex: google.com/search)
    if (/^https?:\/\/(www\.)?google\.com\/search/i.test(tab.url)) {
      return;
    }

    // Call the relevance check API
    try {
      const response = await fetch("http://127.0.0.1:5000/check_relevance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url: tab.url,
          context: userIntent
        })
      });

      const data = await response.json();

      // If the site is not relevant, show an alert in the tab context
      if (data.relevance === false) {
        await chrome.scripting.executeScript({
          target: { tabId: tabId },
          func: () => {
            alert("This website is NOT relevant to your stated intent.");
          }
        });
      }
    } catch (error) {
      console.error("Error checking relevance:", error);
      // In production, handle errors more gracefully
    }
  }
});

