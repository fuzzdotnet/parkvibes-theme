// ------------------------------------
// Tooltip Author System
// ------------------------------------

(function() {
  'use strict';

  class TooltipAuthor {
    constructor() {
      this.hoverCard = null;
      this.showTimeout = null;
      this.hideTimeout = null;
      this.authorCache = new Map();

      // System configuration
      this.config = {
        hoverDelay: 400,          // Delay before showing card for elegant interaction
        hideDelay: 500,           // Generous delay allowing smooth mouse movement
        cardHeight: 200,          // Estimated height for viewport positioning
        margin: 16,               // Safe margin from viewport edges
        cardOffset: 8,            // Optimal spacing from trigger element
        animationFrame: true,     // Smooth transitions with requestAnimationFrame
        visibleClass: 'is-visible',
        debugMode: false          // Development debugging toggle
      };

      this.init();
    }

    init() {
      // Only enable on devices that support hover
      if (!this.supportsHover()) {
        return;
      }

      this.attachHoverListeners();
    }

    supportsHover() {
      // Check for hover support using CSS media query
      return window.matchMedia('(hover: hover)').matches;
    }

    createHoverCard() {
      if (this.hoverCard) return this.hoverCard;

      this.hoverCard = document.createElement('div');
      this.hoverCard.className = 'c-tooltip-author';
      this.hoverCard.innerHTML = `
        <div class="c-tooltip-author__content">
          <figure class="c-tooltip-author__figure">
            <a class="c-tooltip-author__avatar-link" href="">
              <img class="c-tooltip-author__avatar" src="" alt="" loading="lazy">
            </a>
          </figure>
          <div class="c-tooltip-author__info">
            <a class="c-tooltip-author__name" href=""></a>
            <p class="c-tooltip-author__bio"></p>
          </div>
        </div>
      `;

      document.body.appendChild(this.hoverCard);
      return this.hoverCard;
    }

    getCardWidth() {
      // Get actual computed width from CSS
      return this.hoverCard ? this.hoverCard.offsetWidth : 384;
    }

    positionCard(triggerElement) {
      if (!this.hoverCard) return;

      const rect = triggerElement.getBoundingClientRect();
      const { cardHeight, margin, cardOffset } = this.config;
      const cardWidth = this.getCardWidth();

      let left = rect.left + rect.width / 2 - cardWidth / 2;
      let top = rect.bottom + cardOffset;

      // Keep within viewport horizontally
      if (left < margin) left = margin;
      if (left + cardWidth > window.innerWidth - margin) {
        left = window.innerWidth - cardWidth - margin;
      }

      // Show above if not enough space below
      if (top + cardHeight > window.innerHeight - margin) {
        top = rect.top - cardHeight - cardOffset;
      }

      this.hoverCard.style.left = `${left}px`;
      this.hoverCard.style.top = `${top}px`;
    }

    showCard(triggerElement) {
      if (!this.hoverCard) return;

      this.positionCard(triggerElement);

      if (this.config.animationFrame) {
        requestAnimationFrame(() => {
          this.hoverCard.classList.add(this.config.visibleClass);
        });
      } else {
        this.hoverCard.classList.add(this.config.visibleClass);
      }
    }

    hideCard() {
      if (!this.hoverCard) return;

      this.hoverCard.classList.remove(this.config.visibleClass);
    }

    async fetchAuthorData(authorSlug) {
      // Return cached data if available
      if (this.authorCache.has(authorSlug)) {
        return this.authorCache.get(authorSlug);
      }

      try {
        const response = await fetch(`/author/${authorSlug}/`);
        if (!response.ok) return null;

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract author information using theme-specific selectors
        const name = doc.querySelector('.c-author-head h1, h1')?.textContent?.trim();
        const bio = doc.querySelector('.c-author-head .u-font-subHeading, .u-font-subHeading')?.textContent?.trim();
        const avatar = doc.querySelector('.c-author-head__image, .c-author-head img')?.src;

        if (this.config.debugMode) {
          console.log('Author extraction for:', authorSlug);
          console.log('Found name:', name);
          console.log('Found bio:', bio);
          console.log('Found avatar:', avatar);
        }

        const authorData = {
          name: name || authorSlug,
          bio: bio || null,
          avatar: avatar || null,
          url: `/author/${authorSlug}/`
        };

        // Cache the result for future requests
        this.authorCache.set(authorSlug, authorData);
        return authorData;

      } catch (error) {
        if (this.config.debugMode) {
          console.error('Error fetching author data:', error);
        }
        return null;
      }
    }

    populateCard(authorData) {
      if (!this.hoverCard || !authorData) return;

      const avatar = this.hoverCard.querySelector('.c-tooltip-author__avatar');
      const avatarLink = this.hoverCard.querySelector('.c-tooltip-author__avatar-link');
      const name = this.hoverCard.querySelector('.c-tooltip-author__name');
      const bio = this.hoverCard.querySelector('.c-tooltip-author__bio');

      // Always show name and make it clickable
      name.textContent = authorData.name;
      name.href = authorData.url;

      // Make avatar link clickable
      avatarLink.href = authorData.url;

      // Only show avatar if available
      if (authorData.avatar) {
        avatar.src = authorData.avatar;
        avatar.alt = authorData.name;
        avatar.style.display = 'block';
      } else {
        avatar.style.display = 'none';
      }

      // Only show bio if available
      if (authorData.bio) {
        bio.textContent = authorData.bio;
        bio.style.display = 'block';
      } else {
        bio.style.display = 'none';
      }
    }

    handleAuthorHover(event) {
      clearTimeout(this.hideTimeout);

      const authorLink = event.target.closest('[data-author-slug]');
      if (!authorLink) return;

      const authorSlug = authorLink.getAttribute('data-author-slug');
      if (!authorSlug) return;

      this.showTimeout = setTimeout(async () => {
        const authorData = await this.fetchAuthorData(authorSlug);
        if (authorData) {
          if (!this.hoverCard) this.createHoverCard();
          this.populateCard(authorData);
          this.showCard(authorLink);
        }
      }, this.config.hoverDelay);
    }

    handleAuthorLeave() {
      clearTimeout(this.showTimeout);
      this.hideTimeout = setTimeout(() => this.hideCard(), this.config.hideDelay);
    }

    handleCardHover() {
      clearTimeout(this.hideTimeout);
    }

    handleCardLeave() {
      this.hideTimeout = setTimeout(() => this.hideCard(), this.config.hideDelay);
    }

    attachHoverListeners() {
      document.addEventListener('mouseover', (event) => {
        if (event.target && typeof event.target.closest === 'function') {
          // Check if hovering over author link
          if (event.target.closest('[data-author-slug]')) {
            this.handleAuthorHover(event);
          }
          // Check if hovering over the hover card itself
          else if (event.target.closest('.c-tooltip-author')) {
            this.handleCardHover();
          }
        }
      });

      document.addEventListener('mouseout', (event) => {
        if (event.target && typeof event.target.closest === 'function') {
          // Check if leaving author link
          if (event.target.closest('[data-author-slug]')) {
            // Only hide if not moving to the hover card
            if (!event.relatedTarget || !event.relatedTarget.closest('.c-tooltip-author')) {
              this.handleAuthorLeave();
            }
          }
          // Check if leaving the hover card
          else if (event.target.closest('.c-tooltip-author')) {
            // Only hide if not moving back to an author link
            if (!event.relatedTarget || !event.relatedTarget.closest('[data-author-slug]')) {
              this.handleCardLeave();
            }
          }
        }
      });
    }
  }

  // Initialize tooltip author system
  new TooltipAuthor();

})();
