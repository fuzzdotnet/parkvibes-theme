// ------------------------------------
// Banner Animation
// ------------------------------------

(function() {
  'use strict';

  const config = {
    duration: 0.8,        // Animation duration in seconds
    ease: 'power2.out',   // GSAP easing function
    staggerDelay: 0.1     // Delay between content elements
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const bannerSection = document.querySelector('.c-block--banner-animated');

  // Skip animation in Ghost admin preview only
  const isInAdminPreview = window.parent !== window && document.referrer.includes('/ghost/#/');

  if (bannerSection && !prefersReducedMotion && !isInAdminPreview) {
    // Show content immediately (fallback for when GSAP is not available)
    bannerSection.style.opacity = '1';

    // Enhanced GSAP animation if library is available
    if (typeof gsap !== 'undefined') {
      // Select all content elements within the banner
      const contentElements = bannerSection.querySelectorAll('.c-block--banner__content > *');

      // Animate content elements (staggered)
      if (contentElements.length > 0) {
        gsap.fromTo(contentElements,
          { autoAlpha: 0 }, // From state
          {
            autoAlpha: 1,
            duration: config.duration,
            ease: config.ease,
            stagger: 0.15
          });
      }
    } else {
      // Fallback: Just show the content without animation
      const allElements = bannerSection.querySelectorAll('[style*="opacity: 0"]');
      allElements.forEach(el => el.style.opacity = '1');
    }
  } else if (bannerSection) {
    // If in admin preview or reduced motion, show content immediately
    const contentElements = bannerSection.querySelectorAll('.c-block--banner__content > *');
    contentElements.forEach(el => el.style.opacity = '1');
  }
})();

// ------------------------------------
// Banner > Signup button contrast hook
// ------------------------------------
(function() {
  'use strict';

  function applyBannerSignupContrast() {
    const buttons = document.querySelectorAll('.c-block--banner .kg-signup-card-button');
    if (!buttons.length) return;

    buttons.forEach(btn => {
      // Add contrast marker class for the global system
      btn.classList.add('js-contrast');
    });
  }

  applyBannerSignupContrast();
})();
