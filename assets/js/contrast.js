// ------------------------------------
// Contrast Dynamic Color System
// ------------------------------------

(function() {
  'use strict';

  // Constants
  const CONTRAST_CLASS = 'js-contrast';
  const PROCESSED_ATTR = 'data-contrast-processed';
  const DARK_TEXT = '#000000';
  const DARK_BORDER = 'rgba(0, 0, 0, 0.15)';
  const LIGHT_TEXT = '#ffffff';
  const LIGHT_BORDER = 'rgba(255, 255, 255, 0.3)';

  // Cache for parsed colors to avoid re-parsing
  const colorCache = new Map();

  // Debounce timer for mutation observer
  let debounceTimer;

  // Calculate relative luminance using WCAG formula
  const getLuminance = (r, g, b) => {
    const [rs, gs, bs] = [r / 255, g / 255, b / 255].map(c =>
      c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
    );
    return rs * 0.2126 + gs * 0.7152 + bs * 0.0722;
  };

  // Calculate contrast ratio between two colors
  const getContrastRatio = (lum1, lum2) => {
    const lighter = Math.max(lum1, lum2);
    const darker = Math.min(lum1, lum2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  // Parse color string to RGB array
  const parseColor = (colorStr) => {
    if (!colorStr) return null;

    // Check cache first
    if (colorCache.has(colorStr)) {
      return colorCache.get(colorStr);
    }

    let result = null;

    // Try RGB/RGBA format
    const rgbMatch = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (rgbMatch) {
      const [, r, g, b] = rgbMatch;
      result = [+r, +g, +b];
    } else {
      // Try hex format
      const hexMatch = colorStr.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
      if (hexMatch) {
        let [, hex] = hexMatch;
        if (hex.length === 3) {
          hex = hex.split('').map(c => c + c).join('');
        }
        result = [
          parseInt(hex.substr(0, 2), 16),
          parseInt(hex.substr(2, 2), 16),
          parseInt(hex.substr(4, 2), 16)
        ];
      }
    }

    // Cache the result
    if (result) {
      colorCache.set(colorStr, result);
    }

    return result;
  };

  // Set CSS variables on element based on background luminance
  function setContrastVariables(element, bgLuminance, useDarkText) {
    const styles = {
      '--color-on-accent': useDarkText ? DARK_TEXT : LIGHT_TEXT
    };

    // Add button-specific variables if needed
    if (element.matches('.c-btn, .kg-signup-card-button, .kg-header-card-button, .kg-btn, .kg-btn-accent, .kg-product-card-button')) {
      styles['--color-on-accent-btn-text'] = useDarkText ? DARK_TEXT : LIGHT_TEXT;
      styles['--color-on-accent-btn-border'] = useDarkText ? DARK_BORDER : LIGHT_BORDER;
    }

    // Apply all styles at once
    Object.entries(styles).forEach(([prop, value]) => {
      element.style.setProperty(prop, value);
    });
  }

  // Process a single element for contrast adjustment
  function processElement(element) {
    let bgColor = null;

    // Check for accent color variables (minimal: prefer tag accent, then generic accent)
    const cs = getComputedStyle(element);
    const accentColor = (cs.getPropertyValue('--color-tag-accent').trim() || cs.getPropertyValue('--color-accent').trim());
    if (accentColor) {
      bgColor = accentColor;
    }

    // If the accent variable is unresolved (e.g. var(...)) or missing, fall back to computed background-color
    if (!bgColor || bgColor.includes('var(')) {
      const computedBg = cs.backgroundColor;
      if (computedBg && computedBg !== 'rgba(0, 0, 0, 0)' && computedBg !== 'transparent') {
        bgColor = computedBg;
      }
    }

    // As a last resort, check inline background-color
    if (!bgColor && element.style.backgroundColor) {
      bgColor = element.style.backgroundColor;
    }

    if (!bgColor) return;

    // Create a unique key for this color configuration
    const colorKey = bgColor;

    // Skip if already processed with the same color
    if (element.getAttribute(PROCESSED_ATTR) === colorKey) {
      return;
    }

    const bgRgb = parseColor(bgColor);
    if (!bgRgb) return;

    const bgLuminance = getLuminance(bgRgb[0], bgRgb[1], bgRgb[2]);

    // Get current text color to check existing contrast
    const computedStyle = getComputedStyle(element);
    const currentTextColor = computedStyle.color || computedStyle.getPropertyValue('--color-site-text');
    const textRgb = parseColor(currentTextColor);

    // If we can parse the current text color, check if contrast is already good
    if (textRgb) {
      const textLuminance = getLuminance(textRgb[0], textRgb[1], textRgb[2]);
      const contrastRatio = getContrastRatio(bgLuminance, textLuminance);

      // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
      // If contrast is already good (>= 4.5), don't override
      if (contrastRatio >= 4.5) {
        element.setAttribute(PROCESSED_ATTR, colorKey);
        return; // Colors already work well together
      }
    }

    // Only apply contrast fix if needed
    const useDarkText = bgLuminance > 0.5;

    // Set contrast variables
    setContrastVariables(element, bgLuminance, useDarkText);

    // Special handling for outline buttons
    if (element.classList.contains('c-btn--outline')) {
      element.style.setProperty('--btn-accent-color',
        !useDarkText || !accentColor ? bgColor : LIGHT_TEXT
      );
    }

    // Mark as processed with the color key
    element.setAttribute(PROCESSED_ATTR, colorKey);
  }

  // Process all elements with contrast class
  function processElements() {
    const elements = document.querySelectorAll(`.${CONTRAST_CLASS}`);

    // Use requestAnimationFrame for smooth processing
    if (elements.length > 0) {
      requestAnimationFrame(() => {
        elements.forEach(processElement);
      });
    }
  }

  // Debounced process function for mutation observer
  const debouncedProcess = () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processElements, 100);
  };

  // Initialize mutation observer for dynamic content
  function initObserver() {
    const observer = new MutationObserver((mutations) => {
      // Check if any mutation is relevant
      const hasRelevant = mutations.some(mutation => {
        if (mutation.type === 'attributes') {
          // Re-run when contrast-marked elements update
          if (mutation.target.classList?.contains(CONTRAST_CLASS)) return true;
        }
        // New nodes that include contrast-marked elements
        return Array.from(mutation.addedNodes).some(node =>
          node.nodeType === 1 && (
            node.classList?.contains(CONTRAST_CLASS) ||
            node.querySelector?.(`.${CONTRAST_CLASS}`)
          )
        );
      });

      if (hasRelevant) {
        debouncedProcess();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      // Watch style/class updates on nodes
      attributeFilter: ['style', 'class']
    });
  }

  // Always set up the observer so we can react to dynamically added content
  initObserver();

  // Initial processing (safe even if zero matching elements exist)
  processElements();

  // Also process on window load for any late-loading styles
  window.addEventListener('load', processElements, { once: true });
})();
