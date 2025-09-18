// ------------------------------------
// Header Menu System
// ------------------------------------

(function() {
  'use strict';

  class HeaderMenu {
    constructor(toggleElement, menuElement) {
      this.toggle = toggleElement;
      this.menu = menuElement;
      this.isOpen = false;
      this.lastFocusedElement = null;
      this.resizeTimer = null;

      // Configuration for consistent behavior
      this.config = {
        animationDuration: 250,    // CSS transition duration (--motion-duration-fast)
        animationBuffer: 30,       // Extra time for smooth navigation
        focusDelay: 100,          // Delay before focusing menu
        visibilityDelay: 300,     // Delay before hiding menu (should match CSS)
        desktopBreakpoint: 768,   // Breakpoint for auto-close on resize
        resizeDebounce: 250       // Debounce for resize events
      };

      this.init();
    }

    init() {
      this.attachToggleListener();
      this.attachKeyboardListeners();
      this.attachOutsideClickListener();
      this.attachResizeListener();
      this.attachNavigationListeners();
      this.attachBrowserNavigationListener();
    }

    openMenu() {
      this.isOpen = true;
      this.lastFocusedElement = document.activeElement;

      // Update DOM state
      this.menu.style.visibility = 'visible';
      this.menu.classList.add('is-open');
      this.menu.setAttribute('aria-hidden', 'false');
      this.toggle.classList.add('is-active');
      this.toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-is-open');

      // Focus management for accessibility
      setTimeout(() => {
        this.menu.focus();
      }, this.config.focusDelay);
    }

    closeMenu() {
      this.isOpen = false;

      // Update DOM state
      this.menu.classList.remove('is-open');
      this.menu.setAttribute('aria-hidden', 'true');
      this.toggle.classList.remove('is-active');
      this.toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-is-open');

      // Restore focus
      this.restoreFocus();

      // Hide after animation completes
      setTimeout(() => {
        if (!this.isOpen) {
          this.menu.style.visibility = 'hidden';
        }
      }, this.config.visibilityDelay);
    }

    restoreFocus() {
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
        this.lastFocusedElement = null;
      } else {
        this.toggle.focus();
      }
    }

    trapFocus(event) {
      const focusableElements = this.menu.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const [firstElement] = focusableElements;
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift + Tab: moving backwards
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else if (document.activeElement === lastElement) {
          // Tab: moving forwards
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
    handleNavigation(event, targetUrl) {
      if (this.isOpen) {
        // Prevent immediate navigation
        event.preventDefault();

        // Close menu with smooth animation
        this.closeMenu();

        // Navigate after animation completes
        setTimeout(() => {
          window.location.href = targetUrl;
        }, this.config.animationDuration + this.config.animationBuffer);
      }
    }
    attachToggleListener() {
      this.toggle.addEventListener('click', () => {
        if (this.isOpen) {
          this.closeMenu();
        } else {
          this.openMenu();
        }
      });
    }
    attachKeyboardListeners() {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && this.isOpen) {
          event.preventDefault();
          this.closeMenu();
        }

        // Trap focus when menu is open
        if (this.isOpen) {
          this.trapFocus(event);
        }
      });
    }
    attachOutsideClickListener() {
      document.addEventListener('click', (event) => {
        if (this.isOpen && !this.menu.contains(event.target) && !this.toggle.contains(event.target)) {
          this.closeMenu();
        }
      });
    }
    attachResizeListener() {
      window.addEventListener('resize', () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
          if (this.isOpen && window.innerWidth > this.config.desktopBreakpoint) {
            this.closeMenu();
          }
        }, this.config.resizeDebounce);
      });
    }
    attachNavigationListeners() {
      const navLinks = this.menu.querySelectorAll('a[href]');
      navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
          this.handleNavigation(event, link.href);
        });
      });
    }
    attachBrowserNavigationListener() {
      window.addEventListener('popstate', () => {
        if (this.isOpen) {
          this.closeMenu();
        }
      });
    }
  }

  // Initialize header menu if elements exist
  const menuToggle = document.getElementById('menuToggle');
  const headerMenu = document.getElementById('headerMenu');

  if (headerMenu && menuToggle) {
    new HeaderMenu(menuToggle, headerMenu);
  }
})();
