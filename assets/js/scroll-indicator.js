// ------------------------------------
// Scroll Indicator Utility
// ------------------------------------

(function() {
  'use strict';

  function createScrollIndicator(containerSelector, indicatorSelector, options = {}) {
    const container = document.querySelector(containerSelector);
    const indicator = document.querySelector(indicatorSelector);

    if (!container || !indicator) {
      return () => {}; // Return empty cleanup function for consistency
    }

    const config = {
      listenResize: true,
      initialCheck: true,
      hideThreshold: 0.8,
      ...options
    };

    function updateScrollIndicator() {
      const isScrollable = container.scrollHeight > container.clientHeight;

      if (!isScrollable) {
        indicator.classList.remove('is-visible');
        return;
      }

      const {scrollTop} = container;
      const {scrollHeight} = container;
      const {clientHeight} = container;

      // Hide when user has scrolled past threshold
      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);
      const shouldShowIndicator = scrollPercentage < config.hideThreshold;

      if (shouldShowIndicator) {
        indicator.classList.add('is-visible');
      } else {
        indicator.classList.remove('is-visible');
      }
    }

    let ticking = false;

    const throttledUpdate = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateScrollIndicator();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Initial check if requested
    if (config.initialCheck) {
      requestAnimationFrame(updateScrollIndicator);
    }

    // Update on scroll (throttled)
    container.addEventListener('scroll', throttledUpdate, { passive: true });

    // Update on resize if requested (throttled)
    if (config.listenResize) {
      window.addEventListener('resize', throttledUpdate);
    }

    // Return cleanup function
    return () => {
      container.removeEventListener('scroll', throttledUpdate);
      if (config.listenResize) {
        window.removeEventListener('resize', throttledUpdate);
      }
    };
  }

  // Initialize header tags scroll indicator
  createScrollIndicator(
    '.c-header-menu__tags-container',
    '.c-header-menu__tags-indicator',
    { listenResize: true, initialCheck: true }
  );

  // Initialize modal post scroll indicator when modal content is loaded
  let modalScrollCleanup = null;

  document.addEventListener('modalContentLoaded', () => {
    // Clean up previous instance if it exists
    if (modalScrollCleanup) {
      modalScrollCleanup();
    }

    // Initialize scroll indicator for the loaded modal content
    modalScrollCleanup = createScrollIndicator(
      '.c-modal-post__content',
      '.c-modal-post__scroll-indicator',
      {
        listenResize: false,
        initialCheck: true, // Now this will work since elements exist!
        hideThreshold: 0.9
      }
    );
  });

})();
