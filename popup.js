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
      files: [`Scripts/${fileName}`]
    });

    statusMessage.classList.remove("error");
    statusMessage.textContent = `${scriptLabel} executed successfully.`;
  } catch (error) {
    console.error(error);
    statusMessage.classList.add("error");
    statusMessage.textContent = `Could not run ${scriptLabel}. ${error.message}`;
  }
}

document.getElementById("runWebaimColor").addEventListener("click", () => {
  runScript("Copy Color from Webaim script.js", "Copy Color from Webaim script");
});

document.getElementById("runUtestCycle").addEventListener("click", () => {
  runScript("Copy UTest cycle name and ID.js", "Copy UTest cycle name and ID");
});

document.getElementById("runAnHover").addEventListener("click", () => {
  runScript("AN -Hover.js", "AN-hover");
});
document.getElementById("runSbCommentInfo").addEventListener("click", () => {
  runScript("SB COmment info.js", "SB Comment info");
});

document.getElementById("runSbTestCycleInfo").addEventListener("click", () => {
  runScript("SB Test Cycle info.js", "SB Test Cycle info");
});