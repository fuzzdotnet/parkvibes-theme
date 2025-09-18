// ------------------------------------
// Content Utilities
// ------------------------------------

(function() {
  'use strict';

  function decodingTranslationChars(string) {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = string;
    return textarea.value;
  }

  // Expose globally for use by other modules
  window.decodingTranslationChars = decodingTranslationChars;

  const contentTables = document.querySelectorAll('.c-content table');

  if (contentTables.length > 0) {
    contentTables.forEach((table) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'responsive-table';
      table.parentNode.insertBefore(wrapper, table);
      wrapper.appendChild(table);
    });
  }
})();
