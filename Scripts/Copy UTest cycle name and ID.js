
(() => {
  try {
    // Get the Cycle ID and remove the '#' character
    const cycleLink = document.querySelector('a[aria-label^="Test Cycle ID"]');
    const cycleIdText = cycleLink?.textContent.trim().replace(/^#/, '');

    // Get and clean the H1 heading
    const h1Text = document.querySelector('h1')?.textContent
      .trim()
      .replace(/^\[[^\]]+\]\s*-?\s*/, '') // Remove [Starbucks...] prefix
      .replace(/^A11Y\s*-\s*/i, '')        // Remove A11Y prefix
      .replace(/\s*\/\s*Test Cycle\s*$/i, '') // Remove / Test Cycle
      .trim();

    if (!cycleIdText || !h1Text) {
      throw new Error("Cycle ID or heading not found");
    }

    const finalText = `${cycleIdText} - ${h1Text}`;

    // Copy using textarea
    const textarea = document.createElement("textarea");
    textarea.value = finalText;
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error("Failed to copy text");
    }

    // Create toast
    const toast = document.createElement("div");
    toast.textContent = `✅ Copied: ${finalText}`;

    Object.assign(toast.style, {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      background: "#333",
      color: "#fff",
      padding: "12px 24px",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
      zIndex: "9999",
      fontSize: "16px",
      fontFamily: "sans-serif",
      opacity: "0",
      transition: "opacity 0.3s ease"
    });

    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });

    // Fade out after 2.5 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 500);
    }, 2500);

  } catch (e) {
    alert("❌ Error: " + e.message);
  }
})();
