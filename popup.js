async function runScript(fileName, scriptLabel) {
  const statusMessage = document.getElementById("statusMessage");

  try {
    statusMessage.classList.remove("error");
    statusMessage.textContent = `Running ${scriptLabel}...`;

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab || !tab.id) {
      statusMessage.classList.add("error");
      statusMessage.textContent = "No active tab found.";
      return;
    }

    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [`scripts/${fileName}`]
    });

    statusMessage.classList.remove("error");
    statusMessage.textContent = `${scriptLabel} executed successfully.`;
  } catch (error) {
    console.error(error);
    statusMessage.classList.add("error");
    statusMessage.textContent = `Could not run ${scriptLabel}.`;
  }
}

document.getElementById("runWebaimColor").addEventListener("click", () => {
  runScript("copy-color-from-webaim.js", "Copy Color from Webaim script");
});

document.getElementById("runUtestCycle").addEventListener("click", () => {
  runScript("copy-utest-cycle-name-and-id.js", "Copy UTest cycle name and ID");
});

document.getElementById("runAnHover").addEventListener("click", () => {
  runScript("AN -Hover.js", "AN-hover");
});