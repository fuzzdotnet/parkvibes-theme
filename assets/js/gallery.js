// ------------------------------------
// Koenig Gallery
// ------------------------------------

(function() {
  'use strict';
  const galleryImages = document.querySelectorAll('.kg-gallery-image img');

  if (galleryImages.length > 0) {
    galleryImages.forEach((image) => {
      try {
        const container = image.closest('.kg-gallery-image');

        // Validate required attributes exist
        if (!image.attributes.width || !image.attributes.height) {
          console.warn('Gallery image missing width or height attributes:', image);
          return;
        }

        const width = parseInt(image.attributes.width.value, 10);
        const height = parseInt(image.attributes.height.value, 10);

        // Calculate aspect ratio for flex-grow value
        const ratio = width / height;

        // Apply flex ratio: ratio as flex-grow, 1 as flex-shrink, 0% as flex-basis
        container.style.flex = `${ratio} 1 0%`;
      } catch (error) {
        console.warn('Error processing gallery image:', error, image);
      }
    });
  }
})();
