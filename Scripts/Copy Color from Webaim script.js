/* 
Este script copia los colores que estan en el checker de webaim al portapapeles, permimitiendo pegarlos en el listing sheet 

https://www.loom.com/share/902d39878bb747de9a2d051a38e1d23c

*/


(() => {
  // Helpers
  const norm = c => (c ? (c.trim().startsWith('#') ? c.trim().toUpperCase() : '#'+c.trim().toUpperCase()) : '');
  const valOf = el => (el ? (('value' in el && el.value) ? el.value : el.textContent || '').trim() : '');

  // Try main selectors first
  let c1 = valOf(document.querySelector('#hex1'));
  let c2 = valOf(document.querySelector('#hex2'));

  // Fallback: find inputs inside fieldsets labeled Foreground / Background
  if (!c1 || !c1.replace('#','').length) {
    const fgFS = [...document.querySelectorAll('fieldset')].find(f => /foreground/i.test(f.innerText));
    c1 = valOf(fgFS?.querySelector('input[type="text"], input[maxlength="7"]')) || c1;
  }
  if (!c2 || !c2.replace('#','').length) {
    const bgFS = [...document.querySelectorAll('fieldset')].find(f => /background/i.test(f.innerText));
    c2 = valOf(bgFS?.querySelector('input[type="text"], input[maxlength="7"]')) || c2;
  }

  // Ratio
  let ratio = valOf(document.querySelector('#ratio')) || valOf(document.querySelector('[aria-live][id*="ratio"]'));

  // Normalize / Final text
  const out = `Color 1: ${norm(c1)}\nColor 2: ${norm(c2)}\nRatio: ${ratio}`;

  // Diagnostics in console
  console.log('Detected:', { foreground: c1, background: c2, ratio });

  // Copy to clipboard with fallback
  const copy = async t => {
    try { await navigator.clipboard.writeText(t); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = t; ta.style.position='fixed'; ta.style.opacity='0';
      document.body.appendChild(ta); ta.select();
      document.execCommand('copy'); document.body.removeChild(ta);
    }
    showToast('Colors copied to clipboard');
  };

  // Toast message (centered, larger font)
  const showToast = msg => {
    const toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: '#333',
      color: '#fff',
      padding: '16px 24px',
      borderRadius: '8px',
      fontSize: '20px',
      fontFamily: 'sans-serif',
      opacity: '0',
      transition: 'opacity 0.3s ease',
      zIndex: 9999,
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; });
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }, 1000);
  };

  copy(out);
})();