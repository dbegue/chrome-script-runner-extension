/*

Este script muestra el nombre accessible del elemento si es usando un aria-label, aria-labelledby, aria-describedby o si es dado por el contenido. 
Tiene sus limitantes pues si es un label que le da nombre con el label 'for' no lo ve, etc.
Es para un review rapido.

*/
(() => {
  const popup = document.createElement('div');
  popup.style.position = 'absolute';
  popup.style.background = 'rgba(0,0,0,0.85)';
  popup.style.color = '#fff';
  popup.style.padding = '6px 10px';
  popup.style.borderRadius = '4px';
  popup.style.fontSize = '12px';
  popup.style.fontFamily = 'Arial, sans-serif';
  popup.style.zIndex = 999999;
  popup.style.pointerEvents = 'none';
  popup.style.maxWidth = '300px';
  popup.style.wordBreak = 'break-word';
  popup.style.display = 'none';
  popup.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
  document.body.appendChild(popup);

  let currentElement = null;

  function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (m) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[m];
    });
  }

  function getVisibleText(el) {
    let text = '';
    for (const node of el.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent.trim() + ' ';
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const style = window.getComputedStyle(node);
        if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
          text += getVisibleText(node);
        }
      }
    }
    return text.trim();
  }

  function getAttributeValues(el) {
    const attrs = ['aria-label', 'aria-labelledby', 'aria-describedby'];
    const results = [];

    let hasAnyAttr = false;

    attrs.forEach(attr => {
      if (el.hasAttribute(attr)) {
        hasAnyAttr = true;
        let value = el.getAttribute(attr);
        if (attr === 'aria-labelledby' || attr === 'aria-describedby') {
          const ids = value.split(/\s+/);
          value = ids.map(id => {
            const refEl = document.getElementById(id);
            return refEl ? refEl.textContent.trim() : `[missing element with id="${escapeHtml(id)}"]`;
          }).join(' | ');
        }
        results.push(`<strong>${escapeHtml(attr)}:</strong> <span>${escapeHtml(value)}</span>`);
      }
    });

    if (hasAnyAttr) {
      return results.join('<br>');
    } else {
      const visibleText = getVisibleText(el);
      if (visibleText) {
        return `<strong>Content:</strong> <span>${escapeHtml(visibleText)}</span>`;
      } else {
        return `<strong>No aria attributes or visible text found</strong>`;
      }
    }
  }

  function onMouseMove(e) {
    const el = e.target;

    if (el === currentElement) return;
    currentElement = el;

    const attrHTML = getAttributeValues(el);

    popup.innerHTML = attrHTML;
    popup.style.display = 'block';

    const rect = el.getBoundingClientRect();
    const popupRect = popup.getBoundingClientRect();
    let top = window.scrollY + rect.top - popupRect.height - 8;
    if (top < window.scrollY) {
      top = window.scrollY + rect.bottom + 8;
    }
    let left = window.scrollX + rect.left + (rect.width / 2) - (popupRect.width / 2);
    left = Math.max(window.scrollX + 4, Math.min(left, window.scrollX + window.innerWidth - popupRect.width - 4));

    popup.style.top = `${top}px`;
    popup.style.left = `${left}px`;
  }

  function onMouseOut(e) {
    if (e.target === currentElement) {
      popup.style.display = 'none';
      currentElement = null;
    }
  }

  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mouseout', onMouseOut);

  console.log('ARIA attribute inspector activated with styled popup. Hover elements to see attributes or content.');
})();
