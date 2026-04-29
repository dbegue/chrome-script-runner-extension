async function runScript(fileName) {
  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  if (!tab || !tab.id) {
    console.error("No active tab found.");
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: [`scripts/${fileName}`]
  });
}

document.getElementById("runScript1").addEventListener("click", () => {
  runScript("Copy Color from Webaim script.js");
});

document.getElementById("runScript2").addEventListener("click", () => {
  runScript("Copy UTest cycle name and ID.js");
});