// ------------------------------------
// Newsletter Component
// ------------------------------------

(function() {
  'use strict';

  class NewsletterComponent {
    constructor(container) {
      this.container = container;
      this.selectAllBtn = container.querySelector('.c-newsletters__select-all');
      this.selectAllText = container.querySelector('.c-newsletters__select-all-text');
      this.selectAllIcon = this.selectAllBtn; // SVG is now direct child of button
      this.checkboxes = container.querySelectorAll('.c-newsletters__card-input');

      this.isAllSelected = false;

      this.init();
    }

    init() {
      if (!this.selectAllBtn || this.checkboxes.length === 0) {
        return;
      }

      this.bindEvents();
      this.updateSelectAllState();
    }

    bindEvents() {
      // Select All functionality
      this.selectAllBtn.addEventListener('click', this.handleSelectAll.bind(this));

      // Individual checkbox changes
      this.checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', this.handleCheckboxChange.bind(this));
      });
    }

    handleSelectAll() {
      this.isAllSelected = !this.isAllSelected;

      // Update all checkboxes
      this.checkboxes.forEach(checkbox => {
        checkbox.checked = this.isAllSelected;
      });

      this.updateSelectAllUI();
      this.announceSelectAllChange();
    }

    handleCheckboxChange() {
      this.updateSelectAllState();
    }

    updateSelectAllState() {
      const checkedBoxes = Array.from(this.checkboxes).filter(cb => cb.checked);
      this.isAllSelected = checkedBoxes.length === this.checkboxes.length && this.checkboxes.length > 0;
      this.updateSelectAllUI();
    }

    updateSelectAllUI() {
      if (!this.selectAllText || !this.selectAllBtn) return;

      const checkedCount = Array.from(this.checkboxes).filter(cb => cb.checked).length;
      const totalCount = this.checkboxes.length;

      // Get the SVG element (direct child of button)
      const svgElement = this.selectAllBtn.querySelector('svg');
      if (!svgElement) return;

      // Get the line elements
      const lines = svgElement.querySelectorAll('line');
      if (lines.length < 2) return;

      const [verticalLine, horizontalLine] = lines;

      if (checkedCount === 0) {
        this.selectAllText.textContent = 'SELECT ALL';
        // Show both lines (plus icon)
        verticalLine.style.display = 'block';
        horizontalLine.style.display = 'block';
        svgElement.style.transform = 'rotate(0deg)';
      } else if (checkedCount === totalCount) {
        this.selectAllText.textContent = 'DESELECT ALL';
        // Hide vertical line (minus icon)
        verticalLine.style.display = 'none';
        horizontalLine.style.display = 'block';
        svgElement.style.transform = 'rotate(0deg)';
      } else {
        this.selectAllText.textContent = `SELECT ALL (${checkedCount}/${totalCount})`;
        // Show both lines but rotate (partial selection)
        verticalLine.style.display = 'block';
        horizontalLine.style.display = 'block';
        svgElement.style.transform = 'rotate(45deg)';
      }
    }

    announceSelectAllChange() {
      // Create a live region announcement for screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'polite');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'u-screenreader';

      const checkedCount = Array.from(this.checkboxes).filter(cb => cb.checked).length;
      const totalCount = this.checkboxes.length;

      if (checkedCount === totalCount) {
        announcement.textContent = 'All newsletters selected';
      } else if (checkedCount === 0) {
        announcement.textContent = 'All newsletters deselected';
      } else {
        announcement.textContent = `${checkedCount} of ${totalCount} newsletters selected`;
      }

      document.body.appendChild(announcement);

      // Remove the announcement after screen readers have processed it
      setTimeout(() => {
        if (announcement.parentNode) {
          announcement.parentNode.removeChild(announcement);
        }
      }, 1000);
    }
  }

  // Auto-initialize newsletter components
  const newsletterBlocks = document.querySelectorAll('.c-block--newsletters');

  newsletterBlocks.forEach(block => {
    new NewsletterComponent(block);
  });

})();
