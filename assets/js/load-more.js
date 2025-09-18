// ------------------------------------
// Ajax Load More
// ------------------------------------

(function() {
  'use strict';

  const paginationNextUrl = document.querySelector('link[rel=next]')?.getAttribute('href');
  const loadPostsButton = document.querySelector('.js-load-more');

  if (loadPostsButton && paginationNextUrl) {
    loadPostsButton.addEventListener('click', (event) => {
      event.preventDefault();

      const requestNextLink = `${paginationNextUrl.split(/page/)[0]  }page/${  paginationNextPageNumber  }/`;

      // Set loading state
      loadPostsButton.textContent = decodingTranslationChars(paginationLoadingText);
      loadPostsButton.classList.add('c-btn--loading');

      fetch(requestNextLink)
        .then(response => response.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');

          // Two contexts:
          // 1) Standard index/tag listing using cards in a grid
          // 2) Archive custom page using rows in a table
          const grid = document.querySelector('.js-grid');
          const archiveTableBody = document.querySelector('#archive-table tbody');

          if (grid) {
            const posts = doc.querySelectorAll('.js-card');
            posts.forEach(post => {
              const appendedPost = document.importNode(post, true);
              grid.appendChild(appendedPost);
            });
          } else if (archiveTableBody) {
            const rows = doc.querySelectorAll('#archive-table tbody tr');
            rows.forEach(row => {
              const appendedRow = document.importNode(row, true);
              archiveTableBody.appendChild(appendedRow);
            });
          }

          // Re-initialize modal functionality for newly loaded posts (grid context only)
          if (grid) {
            if (typeof enablePostModalView !== 'undefined' && enablePostModalView) {
              if (typeof attachModalListenersToPosts === 'function') {
                attachModalListenersToPosts(grid);
              }
            }
          }

          loadPostsButton.textContent = decodingTranslationChars(paginationMorePostsText);
          loadPostsButton.classList.remove('c-btn--loading');

          paginationNextPageNumber++;

          // If you are on the last pagination page, change button text
          if (paginationNextPageNumber > paginationAvailablePagesNumber) {
            loadPostsButton.textContent = decodingTranslationChars(paginationAllPostsLoadedText);
            loadPostsButton.classList.add('c-btn--disabled');
            loadPostsButton.setAttribute('disabled', true);
          }
        });
    });
  }
})();
