// ------------------------------------
// Archive Table Sorting
// ------------------------------------

(function() {
  'use strict';

  const table = document.getElementById('archive-table');

  if (table) {
    const headers = table.querySelectorAll('.c-archive-table__header--sortable');
    const currentSort = {
      column: 'date',
      direction: 'desc'
    };

    // Initial sort by date (newest first)
    sortTable('date', 'desc');

    // Add click event listeners to sortable headers
    headers.forEach(header => {
      header.addEventListener('click', () => {
        const column = header.getAttribute('data-sort');
        const direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';

        sortTable(column, direction);

        // Update current sort state
        currentSort.column = column;
        currentSort.direction = direction;

        // Update header visual states
        updateHeaderStates(headers, header, direction);
      });
    });

    function sortTable(column, direction) {
      const tbody = table.querySelector('tbody');
      const rows = Array.from(tbody.querySelectorAll('tr'));

      // Sort rows based on column and direction
      rows.sort((a, b) => {
        let valueA, valueB;

        if (column === 'date') {
          valueA = a.querySelectorAll('td')[1].getAttribute('data-date');
          valueB = b.querySelectorAll('td')[1].getAttribute('data-date');
        } else if (column === 'title') {
          valueA = a.querySelectorAll('td')[0].textContent.toLowerCase();
          valueB = b.querySelectorAll('td')[0].textContent.toLowerCase();
        } else if (column === 'reading-time') {
          valueA = parseInt(a.querySelectorAll('td')[2].getAttribute('data-reading-time'), 10) || 0;
          valueB = parseInt(b.querySelectorAll('td')[2].getAttribute('data-reading-time'), 10) || 0;
        }

        if (valueA < valueB) return direction === 'asc' ? -1 : 1;
        if (valueA > valueB) return direction === 'asc' ? 1 : -1;
        return 0;
      });

      // Reorder rows in the DOM
      rows.forEach((row) => {
        tbody.appendChild(row);
      });
    }

    function updateHeaderStates(headers, activeHeader, direction) {
      headers.forEach((header) => {
        header.classList.remove('is-sorted-asc', 'is-sorted-desc');
        header.removeAttribute('aria-sort');
      });

      activeHeader.classList.add(`is-sorted-${  direction}`);
      activeHeader.setAttribute('aria-sort', direction === 'asc' ? 'ascending' : 'descending');
    }
  }
})();
