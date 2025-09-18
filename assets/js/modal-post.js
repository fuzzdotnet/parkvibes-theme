// ------------------------------------
// Modal Post System
// ------------------------------------

(function() {
  'use strict';

  class ModalPost {
    constructor(modalElement) {
      this.modal = modalElement;
      this.modalContent = this.modal.querySelector('.c-modal-post__content');
      this.closeButton = this.modal.querySelector('.c-modal-post__close');
      this.overlay = this.modal.querySelector('.c-modal-post__overlay');
      this.isOpen = false;
      this.triggerElement = null;

      // Configuration for consistent behavior
      this.config = {
        focusDelay: 100,          // Delay before focusing modal
        animationFrame: true,     // Use requestAnimationFrame for smooth transitions
        loadingClass: 'is-loading',
        activeClass: 'is-active',
        bodyClass: 'modal-open'
      };

      this.init();
    }

    init() {
      this.attachCloseListeners();
      this.attachKeyboardListeners();
      this.attachNavigationListener();
      this.attachInitialPostListeners();
      this.exposeGlobalFunctions();
    }

    openModal(url, event) {
      this.isOpen = true;
      this.triggerElement = event.target.closest('a');

      // Store post URL for content loading
      this.modal.setAttribute('data-post-url', url);

      // Apply accent color from card
      this.applyAccentColor(event);

      // Show modal with animation
      this.showModal();

      // Load content
      this.loadContent(url);
    }

    closeModal() {
      this.isOpen = false;

      // Update DOM state
      this.modal.classList.remove(this.config.activeClass);
      document.body.classList.remove(this.config.bodyClass);
      this.modal.setAttribute('aria-hidden', 'true');
      // Remove display manipulation - CSS handles visibility

      // Clear content after transition completes
      setTimeout(() => {
        this.modalContent.innerHTML = '';
        this.modalContent.classList.remove(this.config.loadingClass);
      }, 300); // Match CSS transition duration

      // Restore focus
      this.restoreFocus();
    }

    applyAccentColor(event) {
      const card = event.target.closest('.js-card');
      const accentColor = card?.style.getPropertyValue('--color-tag-accent');
      if (accentColor) {
        this.modal.style.setProperty('--modal-color-accent', accentColor);
      } else {
        this.modal.style.removeProperty('--modal-color-accent');
      }
    }

    showModal() {
      this.modal.setAttribute('aria-hidden', 'false');

      if (this.config.animationFrame) {
        requestAnimationFrame(() => {
          this.modal.classList.add(this.config.activeClass);
          document.body.classList.add(this.config.bodyClass);
          setTimeout(() => this.modal.focus(), this.config.focusDelay);
        });
      } else {
        this.modal.classList.add(this.config.activeClass);
        document.body.classList.add(this.config.bodyClass);
        this.modal.focus();
      }
    }

    loadContent(url) {
      this.modalContent.innerHTML = '';
      this.modalContent.classList.add(this.config.loadingClass);

      fetch(url)
        .then(response => response.text())
        .then(html => this.processContent(html, url))
        .catch(() => this.showError());
    }

    processContent(html, url) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const postElement = doc.querySelector('.c-post');

      if (postElement) {
        const modalPost = postElement.cloneNode(true);

        // Remove comments section from modal
        const commentsSection = modalPost.querySelector('.c-comments');
        if (commentsSection) {
          commentsSection.remove();
        }

        // Add headline link if missing
        this.enhanceHeadline(modalPost, url);

        // Display content
        this.modalContent.innerHTML = '';
        this.modalContent.appendChild(modalPost);
        this.modalContent.classList.remove(this.config.loadingClass);

        // Initialize signup cards (remove display: none and activate Portal)
        this.initializeSignupCards();

        // Dispatch event for other components (ToC, scroll indicator, etc.)
        document.dispatchEvent(new CustomEvent('modalContentLoaded'));
      } else {
        this.showError();
      }
    }

    enhanceHeadline(modalPost, url) {
      const headline = modalPost.querySelector('.c-post__headline');
      if (headline && !headline.querySelector('a')) {
        const headlineLink = document.createElement('a');
        headlineLink.href = url;
        headlineLink.textContent = headline.textContent;
        headline.innerHTML = '';
        headline.appendChild(headlineLink);
      }
    }

    initializeSignupCards() {
      // Ghost signup cards are only shown to logged-out visitors
      // They come with display:none and Portal normally removes it on page load
      // In modal context, we need to handle this ourselves

      const signupCards = this.modalContent.querySelectorAll('[data-lexical-signup-form]');
      if (signupCards.length === 0) return;

      // Only show signup cards to visitors (not members)
      const isVisitor = document.body.classList.contains('is-visitor');

      if (isVisitor) {
        signupCards.forEach(card => {
          // Remove the display:none that Ghost adds
          card.style.removeProperty('display');
        });
      }
    }

    showError() {
      this.modalContent.innerHTML = '<div class="c-modal-post__error">Failed to load post content.</div>';
      this.modalContent.classList.remove(this.config.loadingClass);
    }

    restoreFocus() {
      if (this.triggerElement) {
        // Restore focus without scrolling to prevent unwanted page jumps
        this.triggerElement.focus({ preventScroll: true });
        this.triggerElement = null;
      }
    }

    trapFocus(event) {
      const focusableElements = this.modal.querySelectorAll(
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
      // Allow normal navigation for modifier keys
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      event.preventDefault();
      this.openModal(targetUrl, event);
    }

    attachPostListeners(links) {
      links.forEach(link => {
        if (!link || link.hasAttribute('data-modal-attached')) return;

        link.setAttribute('data-modal-attached', 'true');
        link.addEventListener('click', (event) => {
          this.handleNavigation(event, link.getAttribute('href'));
        });
      });
    }

    attachCloseListeners() {
      this.closeButton?.addEventListener('click', () => this.closeModal());
      this.overlay?.addEventListener('click', () => this.closeModal());
    }

    attachKeyboardListeners() {
      document.addEventListener('keydown', (event) => {
        if (!this.isOpen) return;

        if (event.key === 'Escape') {
          this.closeModal();
        } else if (event.key === 'Tab') {
          this.trapFocus(event);
        }
      });
    }

    attachNavigationListener() {
      // Close on page navigation
      window.addEventListener('beforeunload', () => {
        if (this.isOpen) {
          this.closeModal();
        }
      });

      // Safari mobile fix: also listen for pageshow event
      window.addEventListener('pageshow', (event) => {
        // Close modal when page is shown from cache (Safari mobile back button)
        if (event.persisted && this.isOpen) {
          this.closeModal();
        }
      });

      // Additional Safari mobile fix: visibility change
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible' && this.isOpen) {
          // Small delay to ensure proper state detection
          setTimeout(() => {
            if (this.isOpen) {
              this.closeModal();
            }
          }, 100);
        }
      });
    }

    attachInitialPostListeners() {
      const initialLinks = document.querySelectorAll('.c-card-post__link, .c-card-post__image-link');
      this.attachPostListeners(initialLinks);
    }

    exposeGlobalFunctions() {
      // For load-more.js and other dynamic content
      window.attachModalListenersToPosts = (container) => {
        const newLinks = container.querySelectorAll('.c-card-post__link, .c-card-post__image-link');
        this.attachPostListeners(newLinks);
      };
    }
  }

  // Initialize modal if enabled and element exists
  if (typeof enablePostModalView !== 'undefined' && enablePostModalView) {
    const modalElement = document.getElementById('modal-post');
    if (modalElement) {
      new ModalPost(modalElement);
    }
  }
})();
