(() => {
  const MEMBER_NAME = 'Ernesto';
  const EXPERT_NAME = 'Ernesto';

  function normalizeSpaces(text) {
    return text.replace(/\s+/g, ' ').trim();
  }

  function formatDate(date) {
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const y = date.getFullYear();
    return `${m}/${d}/${y}`;
  }

  function addBusinessDays(startDate, businessDays) {
    const date = new Date(startDate);
    let added = 0;

    while (added < businessDays) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 0 && day !== 6) added++;
    }

    return date;
  }

  function showToast(message) {
    const existing = document.getElementById('custom-copy-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'custom-copy-toast';
    toast.textContent = message;

    Object.assign(toast.style, {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0, 0, 0, 0.88)',
      color: '#fff',
      padding: '14px 22px',
      borderRadius: '10px',
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      zIndex: '999999',
      boxShadow: '0 6px 18px rgba(0,0,0,0.3)',
      opacity: '0',
      transition: 'opacity 0.25s ease'
    });

    document.body.appendChild(toast);
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 2400);
  }

  function getCycleIdAndName() {
    const idLink = document.querySelector('.test-cycle-meta-container a');
    const titleH1 = document.querySelector('.testcycle-title h1');

    let cycleId = idLink ? normalizeSpaces(idLink.textContent) : '';
    cycleId = cycleId.replace(/^#/, '');

    let cycleName = titleH1 ? normalizeSpaces(titleH1.textContent) : '';
    cycleName = cycleName.replace(/\s*\/\s*Test Cycle\s*$/i, '').trim();

    if (!cycleId && !cycleName) return '';
    return `${cycleId} - ${cycleName}`;
  }

  function getScopeSectionNodes() {
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')];

    const scopeHeading = headings.find(h =>
      /^scope\s*:?\s*$/i.test(normalizeSpaces(h.textContent))
    );

    if (!scopeHeading) return [];

    const nodes = [];
    let current = scopeHeading.nextElementSibling;

    while (current) {
      if (/^H[1-6]$/i.test(current.tagName)) break;
      nodes.push(current);
      current = current.nextElementSibling;
    }

    return nodes;
  }

  function getScenarioStoryTextFromScope() {
    const scopeNodes = getScopeSectionNodes();
    if (!scopeNodes.length) return '';

    const paragraphs = scopeNodes.filter(node => node.tagName === 'P');
    const blocks = [];

    for (let i = 0; i < paragraphs.length; i++) {
      const p = paragraphs[i];
      const text = normalizeSpaces(p.textContent);

      if (/^Scenario\s+\d+\s*:/i.test(text)) {
        let block = text;

        const next = paragraphs[i + 1];
        if (next) {
          const nextText = normalizeSpaces(next.textContent);
          if (/^Story\s*:/i.test(nextText)) {
            block += ` | ${nextText}`;
          }
        }

        blocks.push(block);
      }
    }

    return blocks.join(' || ');
  }

  const cycleInfo = getCycleIdAndName();
  const scenarioStory = getScenarioStoryTextFromScope();

  if (!cycleInfo) {
    showToast('No se pudo obtener el ID y nombre del ciclo');
    console.error('No se encontró el ID/nombre del ciclo.');
    return;
  }

  if (!scenarioStory) {
    showToast('No se encontraron Scenario/Story dentro de Scope');
    console.error('No se encontraron Scenario/Story dentro de Scope.');
    return;
  }

  const today = new Date();
  const batch1 = addBusinessDays(today, 2);
  const batch2 = addBusinessDays(today, 5);

  const row = [
    cycleInfo,
    scenarioStory,
    MEMBER_NAME,
    EXPERT_NAME,
    formatDate(today),
    formatDate(batch1),
    formatDate(batch2)
  ].join('\t');

 function copyToClipboard(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;

  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  textarea.style.opacity = '0';

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;

  try {
    copied = document.execCommand('copy');
  } catch (err) {
    console.error('execCommand copy failed:', err);
  }

  textarea.remove();

  return copied;
}

const copied = copyToClipboard(row);

if (copied) {
  console.log('Fila copiada al portapapeles:\n', row);
  showToast('La fila se copió al portapapeles');
} else {
  console.error('No se pudo copiar al portapapeles.');
  showToast('No se pudo copiar al portapapeles');
}
})();