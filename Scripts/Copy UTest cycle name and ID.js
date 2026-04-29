(() => {
  try {
    // Get the Cycle ID (e.g. "#513029") and remove the '#' character
    const cycleLink = document.querySelector('a[aria-label^="Test Cycle ID"]');
    const cycleIdText = cycleLink?.textContent.trim().replace(/^#/, '');

    // Get the H1 heading
    const h1Text = document.querySelector('h1')?.textContent.trim().replace(/\/\s*$/, '');

    if (!cycleIdText || !h1Text) {
      throw new Error("Cycle ID or heading not found");
    }

    const finalText = `${cycleIdText} - ${h1Text}`;

    // Fallback copy using textarea
    const textarea = document.createElement("textarea");
    textarea.value = finalText;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);

    // Create toast
    const toast = document.createElement("div");
    toast.textContent = `✅ Copied: ${finalText}`;
    toast.style.position = "fixed";
    toast.style.top = "50%";
    toast.style.left = "50%";
    toast.style.transform = "translate(-50%, -50%)";
    toast.style.background = "#333";
    toast.style.color = "#fff";
    toast.style.padding = "12px 24px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    toast.style.zIndex = 9999;
    toast.style.fontSize = "16px";
    toast.style.fontFamily = "sans-serif";
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s ease";

    document.body.appendChild(toast);

    // Fade in
    requestAnimationFrame(() => {
      toast.style.opacity = "1";
    });

    // Fade out after 2.5 seconds
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 2500);

  } catch (e) {
    alert("❌ Error: " + e.message);
  }
})();