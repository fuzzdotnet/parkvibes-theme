// ------------------------------------
// Apple-Style Share Sheet
// ------------------------------------

(function() {
  'use strict';

  // Share Sheet functionality with event delegation
  function initShareSheet() {
    let isOpen = false;
    let currentTrigger = null; // Store which button triggered the sheet
    let activeShareSheet = null; // Store which share sheet is currently active

    // Open share sheet
    function openShareSheet() {
      if (isOpen || !activeShareSheet) return;

      isOpen = true;
      activeShareSheet.classList.add('is-active');
      activeShareSheet.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';

      // Focus management
      activeShareSheet.focus();

      // Add escape key listener
      document.addEventListener('keydown', handleEscapeKey);
    }

    // Close share sheet
    function closeShareSheet() {
      if (!isOpen || !activeShareSheet) return;

      isOpen = false;
      activeShareSheet.classList.remove('is-active');
      activeShareSheet.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';

      // Return focus to trigger button
      if (currentTrigger) {
        currentTrigger.focus();
      }

      // Remove escape key listener
      document.removeEventListener('keydown', handleEscapeKey);

      // Clear active sheet
      activeShareSheet = null;
    }

    // Handle escape key
    function handleEscapeKey(event) {
      if (event.key === 'Escape') {
        closeShareSheet();
      }
    }

    // Copy link functionality
    function copyLink() {
      let url = window.location.href;

      // Check if we're in a modal context and use the correct post URL
      if (activeShareSheet) {
        const modal = activeShareSheet.closest('.c-modal-post');
        if (modal && modal.classList.contains('is-active')) {
          const modalUrl = modal.getAttribute('data-post-url');
          if (modalUrl) {
            url = modalUrl;
          }
        }
      }

      if (navigator.clipboard && window.isSecureContext) {
        // Modern clipboard API
        navigator.clipboard.writeText(url).then(() => {
          showCopyFeedback();
        }).catch(() => {
          fallbackCopyText(url);
        });
      } else {
        // Fallback for older browsers
        fallbackCopyText(url);
      }
    }

    // Fallback copy method
    function fallbackCopyText(text) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        showCopyFeedback();
      } catch (err) {
        console.error('Failed to copy link:', err);
      }

      document.body.removeChild(textArea);
    }

    // Show copy feedback
    function showCopyFeedback() {
      const copyButton = activeShareSheet?.querySelector('[data-share-copy]');
      if (!copyButton) return;

      const copyLabel = copyButton.querySelector('.c-share__action-label');
      if (!copyLabel) return;

      const originalText = copyLabel.textContent;

      copyLabel.textContent = 'Copied!';
      copyButton.style.backgroundColor = 'color-mix(in srgb, var(--color-site-accent) 10%, transparent)';

      setTimeout(() => {
        copyLabel.textContent = originalText;
        copyButton.style.backgroundColor = '';
      }, 2000);
    }

    // Update share URLs for modal context
    function updateModalShareUrls(shareSheet) {
      // Safety check: ensure shareSheet exists
      if (!shareSheet) {
        console.warn('updateModalShareUrls called with null/undefined shareSheet');
        return;
      }

      // Check if we're in a modal context
      const modal = shareSheet.closest('.c-modal-post');
      if (!modal || !modal.classList.contains('is-active')) {
        return; // Not in modal, use template URLs
      }

      // Get the post URL from the modal's stored data
      const currentUrl = modal.getAttribute('data-post-url') || window.location.href;

      // Get the post title from modal content (try multiple selectors)
      let currentTitle;
      const titleElement = modal.querySelector('.c-post__headline') ||
                          modal.querySelector('.c-post__title') ||
                          modal.querySelector('h1');

      if (titleElement) {
        // Extract text content, handling potential links inside
        currentTitle = titleElement.textContent?.trim();
      } else {
        currentTitle = document.title;
      }

      // Get feature image from modal
      const modalImage = modal.querySelector('.c-post__feature-image');
      const featureImage = modalImage ? modalImage.src : '';

      // Update all share links in this specific share sheet
      const facebookLink = shareSheet.querySelector('[data-platform="facebook"]');
      if (facebookLink) {
        facebookLink.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
      }

      const twitterLink = shareSheet.querySelector('[data-platform="twitter"]');
      if (twitterLink) {
        twitterLink.href = `https://twitter.com/share?text=${encodeURIComponent(currentTitle)}&url=${encodeURIComponent(currentUrl)}`;
      }

      const linkedinLink = shareSheet.querySelector('[data-platform="linkedin"]');
      if (linkedinLink) {
        linkedinLink.href = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(currentTitle)}`;
      }

      const pinterestLink = shareSheet.querySelector('[data-platform="pinterest"]');
      if (pinterestLink) {
        pinterestLink.href = `http://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(featureImage)}&description=${encodeURIComponent(currentTitle)}`;
      }

      const whatsappLink = shareSheet.querySelector('[data-platform="whatsapp"]');
      if (whatsappLink) {
        whatsappLink.href = `https://wa.me/?text=${encodeURIComponent(`${currentTitle  } ${  currentUrl}`)}`;
      }
    }

    // Web Share API fallback
    function tryNativeShare() {
      if (navigator.share) {
        // Get correct URL and title for modal context
        let shareUrl = window.location.href;
        let shareTitle = document.title;

        const modal = activeShareSheet?.closest('.c-modal-post');
        if (modal && modal.classList.contains('is-active')) {
          const modalUrl = modal.getAttribute('data-post-url');
          if (modalUrl) {
            shareUrl = modalUrl;
          }
          // Get the post title from modal content (try multiple selectors)
          const titleElement = modal.querySelector('.c-post__headline') ||
                              modal.querySelector('.c-post__title') ||
                              modal.querySelector('h1');

          if (titleElement) {
            const modalTitle = titleElement.textContent?.trim();
            if (modalTitle) {
              shareTitle = modalTitle;
            }
          }
        }

        const shareData = {
          title: shareTitle,
          text: shareTitle, // Provides fallback text for email body/subject
          url: shareUrl
        };

        navigator.share(shareData).then(() => {
          closeShareSheet();
        }).catch((err) => {
          // If native share fails, show our custom sheet
          if (err.name !== 'AbortError') {
            openShareSheet();
          }
        });
      } else {
        // No native share support, show our custom sheet
        openShareSheet();
      }
    }

    // Use event delegation - works for any share button anywhere in the DOM
    document.addEventListener('click', (event) => {
      const trigger = event.target.closest('[data-share-trigger]');
      if (trigger) {
        event.preventDefault();
        currentTrigger = trigger; // Store the trigger for focus restoration

        // Find the nearest share sheet (could be in same container or modal)
        activeShareSheet = trigger.parentElement.querySelector('.c-share');
        if (!activeShareSheet) {
          // If not found in parent, look in the same container/post
          const container = trigger.closest('.c-post, .c-modal-post__content, body');
          activeShareSheet = container.querySelector('.c-share');
        }

        if (activeShareSheet) {
          // Update URLs for modal context if needed
          updateModalShareUrls(activeShareSheet);
          tryNativeShare();
        }
      }
    });

    // Use event delegation for backdrop clicks
    document.addEventListener('click', (event) => {
      if (event.target.matches('[data-share-backdrop]')) {
        closeShareSheet();
      }
    });

    // Use event delegation for copy button clicks
    document.addEventListener('click', (event) => {
      if (event.target.closest('[data-share-copy]')) {
        event.preventDefault();
        copyLink();
      }
    });
  }

  initShareSheet();
})();
