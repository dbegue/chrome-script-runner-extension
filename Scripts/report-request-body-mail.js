(() => {
  /* =========================================================
     HELPERS
     ========================================================= */

  const cleanText = (text = '') =>
    text.replace(/\s+/g, ' ').trim();

  const emptyValue = 'Not found';

  // Main "In Scope" container
  const getInScopeContainer = () =>
    document.querySelector(
      'ngf-rich-text-viewer[content*="testCycleInfo.inScope"]'
    ) || document;


  /* =========================================================
     CENTERED TOAST NOTIFICATION
     ========================================================= */

  function showToast(message, duration = 3000, isError = false) {
    // Remove existing toast if the script is run again
    document.getElementById('email-copy-toast')?.remove();

    const toast = document.createElement('div');

    toast.id = 'email-copy-toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.setAttribute('aria-atomic', 'true');

    toast.textContent = message;

    Object.assign(toast.style, {
      position: 'fixed',

      // Center horizontally and vertically
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',

      zIndex: '9999999',
      background: isError ? '#8B0000' : '#222',
      color: '#fff',
      padding: '18px 28px',
      borderRadius: '8px',
      fontSize: '18px',
      fontWeight: '600',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 4px 18px rgba(0, 0, 0, 0.4)',
      maxWidth: '90%',
      textAlign: 'center',
      pointerEvents: 'none',
      opacity: '1',
      transition: 'opacity 0.3s ease'
    });

    document.body.appendChild(toast);

    // Start fade-out
    setTimeout(() => {
      toast.style.opacity = '0';
    }, Math.max(duration - 300, 0));

    // Remove completely
    setTimeout(() => {
      toast.remove();
    }, duration);
  }


  /* =========================================================
     1. CUSTOMER NAME
     In Scope --> WELCOME
     ========================================================= */

  function getCustomerName() {
    const container = getInScopeContainer();

    const headings = [
      ...container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ];

    const welcomeHeading = headings.find(
      el => cleanText(el.textContent).toUpperCase() === 'WELCOME'
    );

    if (!welcomeHeading) return '';

    let element = welcomeHeading.nextElementSibling;

    while (element) {
      // Stop if another heading is reached
      if (/^H[1-6]$/.test(element.tagName)) break;

      const strong = element.querySelector?.('strong');

      if (strong && cleanText(strong.textContent)) {
        return cleanText(strong.textContent);
      }

      element = element.nextElementSibling;
    }

    return '';
  }


  /* =========================================================
     2. CYCLE ID
     Cycle header / URL area
     ========================================================= */

  function getCycleId() {
    const cycleLink =
      document.querySelector('a[aria-label^="Test Cycle ID:"]') ||
      [...document.querySelectorAll('a')].find(a =>
        /^#\d+$/.test(cleanText(a.textContent))
      );

    if (cycleLink) {
      const source =
        cycleLink.getAttribute('aria-label') ||
        cycleLink.textContent;

      const match = source.match(/#(\d+)/);

      if (match) return match[1];
    }

    // Fallback: try URL
    const urlMatch = location.href.match(/testcycles?\/(\d+)/i);

    return urlMatch ? urlMatch[1] : '';
  }


  /* =========================================================
     3 + 4. PRODUCT ID / PRODUCT NAME
     TTL Instructions --> Product
     ========================================================= */

  function getProductInfo() {
    const ttlSection =
      document.querySelector('#ttl-instructions') || document;

    const productParagraph = [
      ...ttlSection.querySelectorAll('p')
    ].find(p => {
      const strong = p.querySelector('strong');

      return cleanText(strong?.textContent)
        .toLowerCase() === 'product:';
    });

    if (!productParagraph) {
      return {
        productId: '',
        productName: ''
      };
    }

    const fullText = cleanText(productParagraph.textContent)
      .replace(/^Product:\s*/i, '');

    const match = fullText.match(/^(\d+)\s*\/\s*(.+)$/);

    if (!match) {
      return {
        productId: '',
        productName: fullText
      };
    }

    return {
      productId: cleanText(match[1]),
      productName: cleanText(match[2])
    };
  }


  /* =========================================================
     5. TEST PLATFORM MATRIX
     In Scope --> IN SCOPE DEVICES
     Supports multiple platforms/devices
     ========================================================= */

  function getTestPlatformMatrix() {
    const container = getInScopeContainer();

    const headings = [
      ...container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ];

    const inScopeHeading = headings.find(
      el =>
        cleanText(el.textContent).toUpperCase() ===
        'IN SCOPE DEVICES'
    );

    if (!inScopeHeading) return [];

    const results = [];
    let currentCategory = '';
    let element = inScopeHeading.nextElementSibling;

    while (element) {
      // Stop at next H2 section
      if (
        element.tagName === 'H2' &&
        element !== inScopeHeading
      ) {
        break;
      }

      // Desktop:, Mobile:, Tablet:, etc.
      if (/^H[3-6]$/.test(element.tagName)) {
        currentCategory = cleanText(element.textContent)
          .replace(/:$/, '');
      }

      // Read every direct LI in UL/OL
      if (element.matches('ul, ol')) {
        const items = [
          ...element.querySelectorAll(':scope > li')
        ]
          .map(li => cleanText(li.textContent))
          .filter(Boolean);

        items.forEach(item => {
          results.push(
            currentCategory
              ? `${currentCategory}: ${item}`
              : item
          );
        });
      }

      element = element.nextElementSibling;
    }

    return results;
  }


  /* =========================================================
     6. TESTED PAGES
     In Scope --> TESTING FOCUS --> Scope
     Keeps numbering
     ========================================================= */

  function getTestedPages() {
    const container = getInScopeContainer();

    const headings = [
      ...container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    ];

    const scopeHeading = headings.find(el => {
      const text = cleanText(el.textContent)
        .replace(/:$/, '')
        .toUpperCase();

      return text === 'SCOPE';
    });

    if (!scopeHeading) return [];

    let element = scopeHeading.nextElementSibling;

    while (element) {
      if (element.matches('ol, ul')) {
        return [
          ...element.querySelectorAll(':scope > li')
        ]
          .map((li, index) => {
            const text = cleanText(li.textContent);

            return text
              ? `${index + 1}. ${text}`
              : '';
          })
          .filter(Boolean);
      }

      // Stop if another section starts
      if (/^H[1-6]$/.test(element.tagName)) {
        break;
      }

      element = element.nextElementSibling;
    }

    return [];
  }


  /* =========================================================
     7. PENDING APPROVAL ISSUE REPORTS
     Filled manually
     ========================================================= */

  function getPendingApprovalIssues() {
    return 'TBD';
  }


  /* =========================================================
     8. REPORT TYPE
     TTL Instructions --> Report Type
     ========================================================= */

  function getReportType() {
    const ttlSection =
      document.querySelector('#ttl-instructions') || document;

    const reportParagraph = [
      ...ttlSection.querySelectorAll('p')
    ].find(p =>
      /^Report Type:/i.test(cleanText(p.textContent))
    );

    if (!reportParagraph) return '';

    return cleanText(reportParagraph.textContent)
      .replace(/^Report Type:\s*/i, '')
      .trim();
  }


  /* =========================================================
     9. PO
     Special Requirements --> Log your time at
     Returns ONLY the PO number
     ========================================================= */

  function getPO() {
    const specialRequirements =
      document.querySelector('.special-requirement-container') ||
      document;

    const paragraphs = [
      ...specialRequirements.querySelectorAll('p')
    ];

    const poParagraph = paragraphs.find(p => {
      const strong = p.querySelector('strong');

      return cleanText(strong?.textContent)
        .toLowerCase() === 'log your time at:';
    });

    if (!poParagraph) return '';

    const text = cleanText(poParagraph.textContent);

    const match = text.match(
      /\bPO\s*[-–—:]?\s*(\d+)\b/i
    );

    return match ? match[1] : '';
  }


  /* =========================================================
     COLLECT DATA
     ========================================================= */

  const product = getProductInfo();

  const data = {
    customerName: getCustomerName(),
    cycleId: getCycleId(),
    productId: product.productId,
    productName: product.productName,
    testPlatformMatrix: getTestPlatformMatrix(),
    testedPages: getTestedPages(),
    pendingApprovalIssues: getPendingApprovalIssues(),
    reportType: getReportType(),
    po: getPO()
  };


  /* =========================================================
     FORMAT VALUES
     ========================================================= */

  const valueOrFallback = value =>
    value && cleanText(String(value))
      ? value
      : emptyValue;


  /* ---------------------------------------------------------
     Platform Matrix
     --------------------------------------------------------- */

  const platformText = data.testPlatformMatrix.length
    ? data.testPlatformMatrix
        .map(item => `   - ${item}`)
        .join('\n')
    : `   - ${emptyValue}`;


  /* ---------------------------------------------------------
     Tested Pages
     Keep numbering without extra bullets
     --------------------------------------------------------- */

  const pagesText = data.testedPages.length
    ? data.testedPages
        .map(item => `   ${item}`)
        .join('\n')
    : `   ${emptyValue}`;


  /* =========================================================
     EMAIL BODY
     ========================================================= */

const emailBody = `Customer Name: ${valueOrFallback(data.customerName)}
Cycle ID: ${valueOrFallback(data.cycleId)}
Product ID: ${valueOrFallback(data.productId)}
Product Name: ${valueOrFallback(data.productName)}
Test Platform Matrix:
${platformText}
Tested pages:
${pagesText}
Number of Pending Approval Issue Reports: ${data.pendingApprovalIssues}
Report Type: ${valueOrFallback(data.reportType)}
PO: ${valueOrFallback(data.po)}`;


  /* =========================================================
     OUTPUT TO CONSOLE
     ========================================================= */

  console.clear();

  console.log(
    '%cEMAIL INFORMATION',
    'font-size:16px;font-weight:bold;'
  );

  console.log('\n' + emailBody);

  console.log('\nExtracted data:');

  console.table({
    'Customer Name':
      data.customerName || emptyValue,

    'Cycle ID':
      data.cycleId || emptyValue,

    'Product ID':
      data.productId || emptyValue,

    'Product Name':
      data.productName || emptyValue,

    'Pending Approval':
      data.pendingApprovalIssues,

    'Report Type':
      data.reportType || emptyValue,

    'PO':
      data.po || emptyValue
  });


  /* =========================================================
     COPY TO CLIPBOARD
     ========================================================= */

  /* =========================================================
   COPY TO CLIPBOARD
   ========================================================= */

function showCopyButton() {
  // Remove an existing fallback if present
  document.getElementById('email-copy-fallback')?.remove();

  const container = document.createElement('div');

  container.id = 'email-copy-fallback';

  Object.assign(container.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '99999999',
    background: '#222',
    color: '#fff',
    padding: '24px',
    borderRadius: '10px',
    boxShadow: '0 6px 24px rgba(0,0,0,.45)',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center'
  });

  const message = document.createElement('div');

  message.textContent =
    'Click below to copy the email information';

  Object.assign(message.style, {
    marginBottom: '16px',
    fontSize: '16px',
    fontWeight: '600'
  });

  const button = document.createElement('button');

  button.type = 'button';
  button.textContent = 'Copy email information';

  Object.assign(button.style, {
    padding: '12px 20px',
    border: '2px solid #fff',
    borderRadius: '7px',
    background: '#fff',
    color: '#222',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer'
  });

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailBody);

      container.remove();

      showToast(
        '✓ Email information copied to clipboard'
      );

      console.log(
        '\n✅ Email information copied to clipboard.'
      );
    } catch (error) {
      console.error(
        'Clipboard copy failed:',
        error
      );

      message.textContent =
        'Could not copy the email information.';
    }
  });

  container.appendChild(message);
  container.appendChild(button);
  document.body.appendChild(container);

  button.focus();
}


/* =========================================================
   COPY TO CLIPBOARD
   ========================================================= */

function showCopyButton() {
  // Remove an existing fallback if present
  document.getElementById('email-copy-fallback')?.remove();

  const container = document.createElement('div');

  container.id = 'email-copy-fallback';

  Object.assign(container.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: '99999999',
    background: '#222',
    color: '#fff',
    padding: '24px',
    borderRadius: '10px',
    boxShadow: '0 6px 24px rgba(0,0,0,.45)',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center'
  });

  const message = document.createElement('div');

  message.textContent =
    'Click below to copy the email information';

  Object.assign(message.style, {
    marginBottom: '16px',
    fontSize: '16px',
    fontWeight: '600'
  });

  const button = document.createElement('button');

  button.type = 'button';
  button.textContent = 'Copy email information';

  Object.assign(button.style, {
    padding: '12px 20px',
    border: '2px solid #fff',
    borderRadius: '7px',
    background: '#fff',
    color: '#222',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer'
  });

  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(emailBody);

      container.remove();

      showToast(
        '✓ Email information copied to clipboard'
      );

      console.log(
        '\n✅ Email information copied to clipboard.'
      );
    } catch (error) {
      console.error(
        'Clipboard copy failed:',
        error
      );

      message.textContent =
        'Could not copy the email information.';
    }
  });

  container.appendChild(message);
  container.appendChild(button);
  document.body.appendChild(container);

  button.focus();
}


async function copyResult() {
  try {
    /*
     * navigator.clipboard requires the webpage
     * to be the active/focused document.
     */
    if (
      navigator.clipboard &&
      document.hasFocus()
    ) {
      await navigator.clipboard.writeText(emailBody);

      console.log(
        '\n✅ Email information copied to clipboard.'
      );

      showToast(
        '✓ Email information copied to clipboard'
      );

      return;
    }

    /*
     * Page is not focused.
     * Chrome will likely reject writeText(),
     * so provide a user-activated fallback.
     */
    console.warn(
      'The webpage is not focused. ' +
      'Displaying manual copy button.'
    );

    showCopyButton();

  } catch (error) {
    console.warn(
      'Automatic clipboard copy was blocked:',
      error
    );

    showCopyButton();
  }
}


  /* =========================================================
     RUN COPY
     ========================================================= */

  copyResult();


  /* =========================================================
     RETURN EXTRACTED DATA
     ========================================================= */

  return data;

})();