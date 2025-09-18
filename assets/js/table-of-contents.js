// ------------------------------------
// Table of Contents
// ------------------------------------

(function() {
  'use strict';

  function initToC() {
    const tocContainers = document.querySelectorAll('.c-table-of-contents');

    if (tocContainers.length) {
      // Cache DOM elements for performance
      const modalQuery = '.c-modal-post.is-active';
      const headerQuery = '.c-header--sticky';

      // Function to calculate current scroll offset dynamically
      function calculateScrollOffset() {
        // Check if we're in a modal context
        const isInModal = document.querySelector(modalQuery);

        if (isInModal) {
          // Modal: add padding for better heading visibility
          return 32;
        }
        // Full page: check for sticky header
        const header = document.querySelector(headerQuery);

        if (header) {
          // Always use actual current height for dynamic calculation
          const headerHeight = header.offsetHeight;

          return Math.ceil(headerHeight); // Use exact header height
        }
        // No sticky header, use minimal offset
        return 16;
      }

      // Function to update CSS offset property with precise timing
      function updateScrollOffset() {
        const header = document.querySelector(headerQuery);

        if (header) {
          // Check if header is currently transitioning
          const computedStyle = window.getComputedStyle(header);
          const transitionDuration = parseFloat(computedStyle.transitionDuration) * 1000; // Convert to ms

          if (transitionDuration > 0) {
            let transitionHandled = false;

            // Function to update offset (avoid duplication)
            const updateOffset = () => {
              if (!transitionHandled) {
                transitionHandled = true;
                requestAnimationFrame(() => {
                  const scrollOffset = calculateScrollOffset();
                  document.documentElement.style.setProperty('--toc-scroll-offset', `${scrollOffset  }px`);
                });
              }
            };

            // Wait for transition to complete, then measure
            const handleTransitionEnd = () => {
              header.removeEventListener('transitionend', handleTransitionEnd);
              clearTimeout(timeoutId);
              updateOffset();
            };

            header.addEventListener('transitionend', handleTransitionEnd);

            // Fallback timeout in case transitionend doesn't fire
            const timeoutId = setTimeout(() => {
              header.removeEventListener('transitionend', handleTransitionEnd);
              updateOffset();
            }, transitionDuration + 50); // Add 50ms buffer
          } else {
            // No transition, measure immediately
            requestAnimationFrame(() => {
              const scrollOffset = calculateScrollOffset();
              document.documentElement.style.setProperty('--toc-scroll-offset', `${scrollOffset  }px`);
            });
          }
        } else {
          // No header, calculate immediately
          const scrollOffset = calculateScrollOffset();
          document.documentElement.style.setProperty('--toc-scroll-offset', `${scrollOffset  }px`);
        }
      }

      // Set initial offset
      updateScrollOffset();

      // Update offset when header state changes (throttled for performance)
      let scrollTimeout;
      window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateScrollOffset, 150); // Slightly longer delay for CSS transitions
      }, { passive: true });

      // Get initial scroll offset for tocbot configuration
      const initialScrollOffset = calculateScrollOffset();

      tocbot.init({
        tocSelector: '.c-table-of-contents__content',
        contentSelector: '.c-content',
        listClass: 'c-table-of-contents__list',
        listItemClass: 'c-table-of-contents__list-item',
        linkClass: 'c-table-of-contents__list-link',
        headingSelector: 'h2, h3',
        ignoreSelector: '.kg-header-card *, .kg-signup-card *, .gh-post-upgrade-cta *',
        scrollSmooth: false, // Always use instant scrolling
        scrollSmoothDuration: 0, // No animation delay
        scrollSmoothOffset: -initialScrollOffset, // Always apply offset
        headingsOffset: initialScrollOffset, // Always use offset for proper positioning
        fixedSidebarOffset: initialScrollOffset // Additional offset for fixed elements
      });
    }

    // Show ToC if content was generated (check all ToC containers)
    tocContainers.forEach((tocContainer) => {
      const tocContent = tocContainer.querySelector('.c-table-of-contents__content');
      if (tocContent && tocContent.children.length > 0) {
        tocContainer.classList.remove('u-hidden');
      } else {
        tocContainer.classList.add('u-hidden');
      }
    });
  }

  // Initialize on page load
  initToC();

  // Re-initialize when modal content is loaded
  document.addEventListener('modalContentLoaded', () => {
    // Destroy existing tocbot instances to avoid conflicts
    if (typeof tocbot !== 'undefined') {
      tocbot.destroy();
    }
    // Re-initialize for new content
    initToC();
  });

})();
