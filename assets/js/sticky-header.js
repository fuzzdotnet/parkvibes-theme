// ------------------------------------
// Sticky Header Scroll Effect
// ------------------------------------

(function() {
  'use strict';

  class StickyHeader {
    constructor(element) {
      this.element = element;
      this.isScrolled = false;
      this.scrollTimeout = null;

      // Optimized thresholds for smooth transitions without vibration
      this.config = {
        enterThreshold: 80,    // Scroll position to enter scrolled state
        exitThreshold: 40,     // Scroll position to exit scrolled state (creates 40px buffer zone)
        debounceDelay: 20,     // Milliseconds to wait before state change (prevents rapid firing)
        scrolledClass: 'is-scrolled'
      };

      this.init();
    }

    init() {
      this.updateHeaderState();
      this.attachScrollListener();
    }

    updateHeaderState() {
      const currentScroll = window.scrollY;
      let shouldBeScrolled;

      // Determine new state using hysteresis thresholds
      if (!this.isScrolled && currentScroll > this.config.enterThreshold) {
        shouldBeScrolled = true;
      } else if (this.isScrolled && currentScroll < this.config.exitThreshold) {
        shouldBeScrolled = false;
      } else {
        // In buffer zone - maintain current state to prevent vibration
        return;
      }

      // Only update DOM if state actually changed
      if (shouldBeScrolled !== this.isScrolled) {
        this.isScrolled = shouldBeScrolled;
        this.element.classList.toggle(this.config.scrolledClass, this.isScrolled);
      }
    }

    attachScrollListener() {
      const handleScroll = () => {
        // Clear any pending state updates
        if (this.scrollTimeout) {
          clearTimeout(this.scrollTimeout);
        }

        // Debounce state updates to prevent excessive DOM manipulation
        this.scrollTimeout = setTimeout(() => {
          this.updateHeaderState();
        }, this.config.debounceDelay);
      };

      // Use passive listener for optimal scroll performance
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
  }

  // Initialize sticky header if element exists
  const stickyHeaderElement = document.querySelector('.c-header--sticky');
  if (stickyHeaderElement) {
    new StickyHeader(stickyHeaderElement);
  }
})();
