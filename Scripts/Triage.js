/*
  Triage checker for accessibility issue pages.

  Checks included:
  - Issue title format: [Area]:[Type]:[Title]
  - Actual Result should not include User Impact wording
  - Web issues should include affected HTML after "HTML:"
  - Suggested Solution should match issue type methods
  - Action Performed should include Prerequisites when applicable and Steps
  - Steps should not include prerequisite/login/credential content
  - Screen Reader and Keyboard Navigation issues should include a video attachment
*/

(() => {
  const normalize = (text) =>
    (text || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();

  const getBodyText = () => document.body.innerText || "";

  const getLines = () =>
    getBodyText()
      .split(/\n+/)
      .map((line) => normalize(line))
      .filter(Boolean);

  const bodyText = getBodyText();

  const sectionLabels = [
    "DESCRIPTION",
    "MESSAGES",
    "HISTORY",
    "COMMUNITY REPRODUCTIONS",
    "COMPONENT",
    "ACTION PERFORMED",
    "EXPECTED RESULT",
    "ACTUAL RESULT",
    "FAILED CHECKPOINT",
    "FAILED SC",
    "SUGGESTED RESOLUTION",
    "USER IMPACT",
    "AREA ISSUE WAS FOUND",
    "SEVERITY",
    "STORY",
    "OTHER OCCURRENCES",
    "ATTACHMENTS",
    "ENVIRONMENT",
    "ISSUE TYPE",
    "FREQUENCY",
    "STATUS",
    "BUILD",
    "MODIFIED",
    "TESTER"
  ];

  function getIssueTitle() {
    const allLines = getLines();

    // The cycle title is usually the first heading. The issue title appears after TEST CYCLE #.
    const testCycleIndex = allLines.findIndex((line) => /TEST CYCLE\s*#/i.test(line));

    if (testCycleIndex !== -1) {
      const possibleTitle = allLines.slice(testCycleIndex + 1).find((line) => {
        return (
          line.length > 20 &&
          !/^\[.*test cycle/i.test(line) &&
          !/test cycle/i.test(line) &&
          !/^#\d+/i.test(line) &&
          !/^(tester|status|build|modified|severity|issue type|frequency|environment)$/i.test(line)
        );
      });

      if (possibleTitle) return possibleTitle;
    }

    // Fallback: find visible heading/title-like elements, excluding the cycle title.
    const headingCandidates = Array.from(
      document.querySelectorAll("h1, h2, h3, [class*='title'], [data-testid*='title']")
    )
      .map((el) => normalize(el.innerText || el.textContent || ""))
      .filter(Boolean)
      .filter((text) => {
        return (
          text.length > 20 &&
          !/test cycle/i.test(text) &&
          !/cycle end/i.test(text) &&
          !/company:/i.test(text) &&
          !/product:/i.test(text) &&
          !/status:/i.test(text)
        );
      });

    if (headingCandidates.length > 0) {
      return headingCandidates[0];
    }

    // Last fallback: find a line that looks like an issue title.
    const fallbackTitle = allLines.find((line) => {
      return (
        line.length > 20 &&
        /screen reader|keyboard|focus|contrast|button|link|heading|label|name|role|value|mod|apply/i.test(line) &&
        !/test cycle/i.test(line)
      );
    });

    return fallbackTitle || "";
  }

  function getSection(label) {
    const currentLines = getLines();

    const startIndex = currentLines.findIndex(
      (line) => line.toUpperCase() === label.toUpperCase()
    );

    if (startIndex === -1) return "";

    const endIndex = currentLines.findIndex((line, index) => {
      return (
        index > startIndex &&
        sectionLabels.includes(line.toUpperCase()) &&
        line.toUpperCase() !== label.toUpperCase()
      );
    });

    return currentLines
      .slice(startIndex + 1, endIndex === -1 ? currentLines.length : endIndex)
      .join("\n")
      .trim();
  }

  function getInlineField(label) {
    const currentLines = getLines();

    const index = currentLines.findIndex(
      (line) => line.toUpperCase() === label.toUpperCase()
    );

    if (index !== -1 && currentLines[index + 1]) {
      return currentLines[index + 1];
    }

    const match = getBodyText().match(new RegExp(label + "\\s*\\n\\s*([^\\n]+)", "i"));

    return match ? normalize(match[1]) : "";
  }

  function getAttachmentText() {
    const linkText = Array.from(document.querySelectorAll("a"))
      .map((a) => normalize(`${a.innerText || ""} ${a.href || ""}`))
      .join("\n");

    const fileLikeText = Array.from(
      document.querySelectorAll("[href], [src], [download], [title], [aria-label]")
    )
      .map((el) =>
        normalize(
          [
            el.getAttribute("href"),
            el.getAttribute("src"),
            el.getAttribute("download"),
            el.getAttribute("title"),
            el.getAttribute("aria-label"),
            el.innerText
          ]
            .filter(Boolean)
            .join(" ")
        )
      )
      .join("\n");

    return `${getSection("ATTACHMENTS")}\n${linkText}\n${fileLikeText}`;
  }

  const title = getIssueTitle();
  const actionPerformed = getSection("ACTION PERFORMED");
  const actualResult = getSection("ACTUAL RESULT");
  const suggestedResolution = getSection("SUGGESTED RESOLUTION");
  const attachments = getAttachmentText();
  const issueType = getInlineField("ISSUE TYPE");
  const environment = getInlineField("ENVIRONMENT");

  const checks = [];

  function addCheck(status, name, details) {
    checks.push({ status, name, details });
  }

  function getCombinedIssueText() {
    return `${issueType} ${title} ${environment} ${bodyText}`.toLowerCase();
  }

  function isNativeAppIssue() {
    const combined = getCombinedIssueText();

    return /android|ios|iphone|ipad|talkback|voiceover|samsung tv|roku|tvos|apple tv|native app|native|mobile app|galaxy|pixel/i.test(
      combined
    );
  }

  function isScreenReaderIssue() {
    const combined = getCombinedIssueText();

    return /screen reader|screen readers|talkback|voiceover|jaws|nvda|narrator|voice guide|assistive technology/i.test(
      combined
    );
  }

  function isKeyboardIssue() {
    const combined = getCombinedIssueText();

    return /keyboard|keyboard navigation|focus order|tab key|shift\+tab|arrow key|focus is lost|focus lost|focus does not move|focus indicator|focus/i.test(
      combined
    );
  }

  function escapeHTML(text) {
    return normalize(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();

      let copied = false;
      try {
        copied = document.execCommand("copy");
      } catch (fallbackError) {
        copied = false;
      }

      textarea.remove();
      return copied;
    }
  }

  // 1. Title format: [Area]:[Type]:[Title]
  const titlePattern = /^\s*\[[^\]]+\]\s*:\s*\[[^\]]+\]\s*:\s*.+/;

  if (!title) {
    addCheck("FAIL", "Issue title", "The issue title could not be detected.");
  } else if (titlePattern.test(title)) {
    addCheck(
      "PASS",
      "Issue title format",
      "The issue title follows the format [Area]:[Type]:[Title]."
    );
  } else {
    addCheck(
      "FAIL",
      "Issue title format",
      `The issue title does not follow the required format [Area]:[Type]:[Title]. Current issue title: "${title}"`
    );
  }

  // 2. Actual Result should not include User Impact content
  const impactKeywords = [
    "confuses",
    "confusion",
    "cognitive load",
    "prevents users",
    "users cannot",
    "users are unable",
    "screen reader users",
    "keyboard users",
    "assistive technology users",
    "as a result",
    "this makes it difficult",
    "this causes difficulty",
    "reducing overall usability",
    "breaks the expected flow",
    "breaks the expected sequential flow",
    "unclear whether",
    "user impact"
  ];

  const actualLower = actualResult.toLowerCase();
  const impactFound = impactKeywords.filter((word) => actualLower.includes(word));

  if (!actualResult) {
    addCheck("FAIL", "Actual Result", "The Actual Result section was not found.");
  } else if (impactFound.length > 0) {
    addCheck(
      "WARN",
      "Actual Result may include User Impact",
      `The Actual Result appears to include impact-related language: ${impactFound.join(
        ", "
      )}. Consider moving this content to User Impact.`
    );
  } else {
    addCheck(
      "PASS",
      "Actual Result",
      "The Actual Result appears to describe the observed behavior without user impact content."
    );
  }

  // 3. HTML required only for web issues
  const nativeIssue = isNativeAppIssue();
  const hasHTMLLabel = /HTML\s*:/i.test(actualResult);
  const hasHTMLCode = /HTML\s*:?\s*[\s\S]*<\s*[a-zA-Z][a-zA-Z0-9-]*(\s|>|\/)/i.test(
    actualResult
  );

  if (nativeIssue) {
    addCheck(
      "SKIP",
      "Affected HTML",
      "This appears to be a native app issue, so affected HTML is not required."
    );
  } else if (hasHTMLLabel && hasHTMLCode) {
    addCheck(
      "PASS",
      "Affected HTML",
      "Affected HTML appears to be included in the Actual Result after the text 'HTML:'."
    );
  } else if (hasHTMLLabel && !hasHTMLCode) {
    addCheck(
      "FAIL",
      "Affected HTML",
      "The text 'HTML:' is present, but no HTML code was detected after it."
    );
  } else {
    addCheck(
      "FAIL",
      "Affected HTML",
      "For web issues, the Actual Result should include the affected HTML after the text 'HTML:'."
    );
  }

  // 4. Suggested Solution should match issue type
  const solutionLower = suggestedResolution.toLowerCase();

  const screenReaderTerms = [
    "screen reader",
    "talkback",
    "voiceover",
    "jaws",
    "nvda",
    "accessible name",
    "accessibilitylabel",
    "accessibility label",
    "contentdescription",
    "content description",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "role",
    "state",
    "announcement",
    "announce",
    "accessibilityevent",
    "accessibility event",
    "aria-live",
    "live region",
    "name, role, value"
  ];

  const keyboardTerms = [
    "keyboard",
    "tab",
    "shift+tab",
    "focus",
    "focus order",
    "focus management",
    "keydown",
    "enter",
    "space",
    "tabindex",
    "focusable",
    "programmatically move focus",
    "visible focus",
    "focus indicator"
  ];

  const hasScreenReaderTerms = screenReaderTerms.some((term) => solutionLower.includes(term));
  const hasKeyboardTerms = keyboardTerms.some((term) => solutionLower.includes(term));

  if (!suggestedResolution) {
    addCheck("FAIL", "Suggested Solution", "The Suggested Solution section was not found.");
  } else if (isKeyboardIssue() && !isScreenReaderIssue() && hasScreenReaderTerms && !hasKeyboardTerms) {
    addCheck(
      "WARN",
      "Suggested Solution may not match issue type",
      "This appears to be a keyboard issue, but the solution mainly includes screen reader-related methods. Review whether the proposed methods are appropriate."
    );
  } else if (isScreenReaderIssue() && !isKeyboardIssue() && hasKeyboardTerms && !hasScreenReaderTerms) {
    addCheck(
      "WARN",
      "Suggested Solution may not match issue type",
      "This appears to be a screen reader issue, but the solution mainly includes keyboard-related methods. Review whether screen reader-specific methods are needed."
    );
  } else if (isScreenReaderIssue() && hasScreenReaderTerms) {
    addCheck(
      "PASS",
      "Suggested Solution",
      "The Suggested Solution appears to include screen reader-related methods."
    );
  } else if (isKeyboardIssue() && hasKeyboardTerms) {
    addCheck(
      "PASS",
      "Suggested Solution",
      "The Suggested Solution appears to include keyboard/focus-related methods."
    );
  } else {
    addCheck(
      "WARN",
      "Suggested Solution",
      "The Suggested Solution was found, but the script could not clearly confirm whether the methods match the issue type. Please review manually."
    );
  }

  // 5. Action Performed should contain Prerequisites when applicable and Steps
  const hasPrerequisites = /prerequisites?\s*:/i.test(actionPerformed);
  const hasSteps = /steps?\s*:/i.test(actionPerformed);

  if (!actionPerformed) {
    addCheck("FAIL", "Action Performed", "The Action Performed section was not found.");
  } else {
    if (hasPrerequisites) {
      addCheck("PASS", "Action Performed - Prerequisites", "Prerequisites are included.");
    } else {
      addCheck(
        "WARN",
        "Action Performed - Prerequisites",
        "Prerequisites were not found. Add them when they apply."
      );
    }

    if (hasSteps) {
      addCheck("PASS", "Action Performed - Steps", "Steps are included.");
    } else {
      addCheck(
        "FAIL",
        "Action Performed - Steps",
        "Steps were not found. The Action Performed section should include clear reproduction steps."
      );
    }
  }

  // 6. Steps should not contain login/credential/prerequisite information
  let stepsText = "";
  const stepsMatch = actionPerformed.match(/steps?\s*:\s*([\s\S]*)/i);

  if (stepsMatch) {
    stepsText = stepsMatch[1];
  }

  const prerequisiteWordsInSteps = [
    "login",
    "log in",
    "sign in",
    "credentials",
    "username",
    "password",
    "email",
    "user account",
    "account:",
    "vpn",
    "prerequisite",
    "prerequisites"
  ];

  const badStepTerms = prerequisiteWordsInSteps.filter((term) =>
    stepsText.toLowerCase().includes(term)
  );

  if (stepsText && badStepTerms.length > 0) {
    addCheck(
      "WARN",
      "Steps contain prerequisite-related content",
      `The Steps section appears to include prerequisite/login-related content: ${badStepTerms.join(
        ", "
      )}. Move this information to Prerequisites.`
    );
  } else if (stepsText) {
    addCheck(
      "PASS",
      "Steps content",
      "The Steps section does not appear to include login or credential-related prerequisites."
    );
  }

  // 7. Attachment must contain video for Screen Reader or Keyboard Navigation issues
  const videoPattern = /\.(mp4|mov|webm|avi|mkv|m4v)\b|video|recording|screen recording/i;

  if (isScreenReaderIssue() || isKeyboardIssue()) {
    if (videoPattern.test(attachments) || videoPattern.test(bodyText)) {
      addCheck("PASS", "Video attachment", "A video attachment appears to be present.");
    } else {
      addCheck(
        "FAIL",
        "Video attachment",
        "Screen reader and keyboard navigation issues must include a video attachment."
      );
    }
  } else {
    addCheck(
      "SKIP",
      "Video attachment",
      "This issue type does not appear to require a mandatory video attachment."
    );
  }

  // Remove previous panel if it already exists
  const previousPanel = document.getElementById("triage-checker-panel");
  if (previousPanel) previousPanel.remove();

  const panel = document.createElement("div");
  panel.id = "triage-checker-panel";
  panel.setAttribute("role", "region");
  panel.setAttribute("aria-label", "Issue triage checker results");

  panel.style.cssText = `
    position: fixed;
    top: 20px;
    left: 20px;
    width: 470px;
    max-height: 85vh;
    overflow: auto;
    z-index: 999999;
    background: #ffffff;
    color: #222222;
    border: 2px solid #222222;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0,0,0,.25);
    font-family: Arial, sans-serif;
    font-size: 14px;
    padding: 16px;
  `;

  const counts = checks.reduce(
    (acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    },
    { PASS: 0, WARN: 0, FAIL: 0, SKIP: 0 }
  );

  const statusColor = {
    PASS: "#0b6b0b",
    WARN: "#9a5b00",
    FAIL: "#b00020",
    SKIP: "#666666"
  };

  const reportText = [
    `Issue title detected: ${title || "Not detected"}`,
    "",
    ...checks.map((check) => `[${check.status}] ${check.name}: ${check.details}`)
  ].join("\n");

  panel.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
      <h2 style="font-size:18px; margin:0;">Issue Triage Checker</h2>
      <button id="close-triage-panel" type="button" style="cursor:pointer;">Close</button>
    </div>

    <div style="margin:12px 0; padding:8px; background:#f5f5f5; border-radius:6px;">
      <strong>Issue title detected:</strong>
      <div style="margin-top:4px;">${escapeHTML(title || "Not detected")}</div>
    </div>

    <p style="margin:12px 0;">
      <strong>Summary:</strong>
      <span style="color:${statusColor.FAIL}">FAIL: ${counts.FAIL || 0}</span> |
      <span style="color:${statusColor.WARN}">WARN: ${counts.WARN || 0}</span> |
      <span style="color:${statusColor.PASS}">PASS: ${counts.PASS || 0}</span> |
      <span style="color:${statusColor.SKIP}">SKIP: ${counts.SKIP || 0}</span>
    </p>

    <button id="copy-triage-report" type="button" style="margin-bottom:12px; cursor:pointer;">
      Copy report
    </button>

    <div>
      ${checks
        .map(
          (check) => `
            <div style="border-top:1px solid #dddddd; padding:10px 0;">
              <strong style="color:${statusColor[check.status]}">
                [${check.status}] ${escapeHTML(check.name)}
              </strong>
              <p style="margin:6px 0 0;">${escapeHTML(check.details)}</p>
            </div>
          `
        )
        .join("")}
    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById("close-triage-panel").addEventListener("click", () => {
    panel.remove();
  });

  document.getElementById("copy-triage-report").addEventListener("click", async () => {
    const copied = await copyText(reportText);
    const status = document.createElement("div");
    status.textContent = copied
      ? "Triage report copied to clipboard."
      : "Could not copy the triage report automatically.";
    status.setAttribute("role", "status");
    status.style.cssText = "margin-top:8px; font-weight:700;";
    panel.querySelector("#copy-triage-report").after(status);
    setTimeout(() => status.remove(), 2500);
  });

  console.table(checks);
})();
