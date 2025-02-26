document.getElementById("saveIntentButton").addEventListener("click", async () => {
  const intentValue = document.getElementById("intentInput").value.trim();

  if (!intentValue) {
    alert("Please enter an intention before saving.");
    return;
  }

  // Save to chrome.storage.local
  await chrome.storage.local.set({ userIntent: intentValue });

  alert("Your intent has been saved!");

  // Optionally close this tab
  chrome.tabs.getCurrent((tab) => {
    chrome.tabs.remove(tab.id);
  });
});

