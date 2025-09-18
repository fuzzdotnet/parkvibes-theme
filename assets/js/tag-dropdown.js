// ------------------------------------
// Tag Dropdown Component
// ------------------------------------

(function() {
  'use strict';

  const detailsElement = document.querySelector('.c-tag-dropdown');
  const headerElement = document.querySelector('.c-page-head--tag-archive, .c-page-head--index');

  if (detailsElement && headerElement) {
    const summaryElement = detailsElement.querySelector('.c-tag-dropdown__summary');
    const {currentTagSlug} = headerElement.dataset;
    const tagList = detailsElement.querySelector('.c-tag-dropdown__list');

    // Set active state for current tag
    if (currentTagSlug && tagList) {
      const tagLinks = tagList.querySelectorAll('a');
      tagLinks.forEach(link => {
        try {
          const url = new URL(link.href);
          const pathParts = url.pathname.split('/').filter(part => part);
          if (pathParts.length >= 2 && pathParts[0] === 'tag') {
            const linkSlug = pathParts[pathParts.length - 1];
            if (linkSlug === currentTagSlug) {
              link.classList.add('is-active');
              link.setAttribute('aria-current', 'page');
            }
          }
        } catch (e) {
          console.error('Error parsing tag link URL:', link.href, e);
        }
      });
    }

    // Handle single tag scenario
    if (tagList) {
      const listItems = tagList.querySelectorAll('li');
      if (listItems.length <= 1) {
        detailsElement.classList.add('is-single-tag');
        summaryElement.addEventListener('click', (event) => {
          if (detailsElement.classList.contains('is-single-tag')) {
            event.preventDefault();
          }
        });
      }
    }

    // Dropdown utility functions
    function closeDropdown() {
      detailsElement.removeAttribute('open');
    }

    function closeDropdownAndRefocus() {
      closeDropdown();
      summaryElement.focus();
    }

    // Calculate and set dynamic max-height for dropdown
    function setDropdownMaxHeight() {
      const dropdownList = detailsElement.querySelector('.c-tag-dropdown__list');
      if (dropdownList) {
        const rect = detailsElement.getBoundingClientRect();
        const dropdownTop = rect.bottom; // Position where dropdown starts
        const viewportHeight = window.innerHeight;
        const padding = 24; // Some padding from bottom of screen
        const availableHeight = viewportHeight - dropdownTop - padding;

        // Set the calculated max height
        dropdownList.style.setProperty('--dropdown-max-height', `${Math.max(200, availableHeight)}px`);
      }
    }

    // Set max-height when dropdown opens
    detailsElement.addEventListener('toggle', () => {
      if (detailsElement.open) {
        setDropdownMaxHeight();
      }
    });

    // Recalculate on window resize
    window.addEventListener('resize', () => {
      if (detailsElement.open) {
        setDropdownMaxHeight();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && detailsElement.hasAttribute('open')) {
        closeDropdownAndRefocus();
      }
    });

    // Close on outside click
    document.addEventListener('click', (event) => {
      setTimeout(() => {
        if (detailsElement.hasAttribute('open') && !detailsElement.contains(event.target)) {
          closeDropdown();
        }
      }, 0);
    });

    // Close on page navigation
    window.addEventListener('beforeunload', () => {
      if (detailsElement.hasAttribute('open')) {
        closeDropdown();
      }
    });

    // Close on browser back/forward navigation
    // Use both popstate and pageshow for better Safari mobile compatibility
    window.addEventListener('popstate', () => {
      if (detailsElement.hasAttribute('open')) {
        closeDropdown();
      }
    });

    // Safari mobile fix: also listen for pageshow event
    window.addEventListener('pageshow', (event) => {
      // Close dropdown when page is shown from cache (Safari mobile back button)
      if (event.persisted && detailsElement.hasAttribute('open')) {
        closeDropdown();
      }
    });

    // Additional Safari mobile fix: visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && detailsElement.hasAttribute('open')) {
        // Small delay to ensure proper state detection
        setTimeout(() => {
          if (detailsElement.hasAttribute('open')) {
            closeDropdown();
          }
        }, 100);
      }
    });
  }
})();
