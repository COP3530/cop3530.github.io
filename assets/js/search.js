// Generic search and filter functionality for COP3530 website

class SearchFilter {
  constructor(options = {}) {
    this.items = options.items || [];
    this.searchInput = options.searchInput;
    this.container = options.container;
    this.renderFunction = options.renderFunction;
    this.searchFields = options.searchFields || ['title'];
    this.filterTags = new Set();
    this.init();
  }

  init() {
    if (this.searchInput) {
      this.setupSearchInput();
    }
    this.render();
  }

  setupSearchInput() {
    this.searchInput.addEventListener('input', (e) => {
      this.search(e.target.value);
    });
  }

  search(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
      this.render(this.items);
      return;
    }

    const filteredItems = this.items.filter(item => {
      return this.searchFields.some(field => {
        const value = this.getNestedValue(item, field);
        if (Array.isArray(value)) {
          return value.some(v => v.toLowerCase().includes(searchTerm));
        }
        return value && value.toLowerCase().includes(searchTerm);
      });
    });

    this.render(filteredItems);
  }

  filterByTags(tags) {
    if (!tags || tags.length === 0) {
      this.render(this.items);
      return;
    }

    const filteredItems = this.items.filter(item => {
      const itemTags = item.tags || [];
      return tags.every(tag => itemTags.includes(tag));
    });

    this.render(filteredItems);
  }

  toggleTag(tag) {
    if (this.filterTags.has(tag)) {
      this.filterTags.delete(tag);
    } else {
      this.filterTags.add(tag);
    }
    
    this.updateTagUI(tag);
    this.filterByTags(Array.from(this.filterTags));
  }

  updateTagUI(tag) {
    const tagElements = document.querySelectorAll(`[data-tag="${tag}"]`);
    tagElements.forEach(element => {
      if (this.filterTags.has(tag)) {
        element.classList.add('active');
      } else {
        element.classList.remove('active');
      }
    });
  }

  clearFilters() {
    this.filterTags.clear();
    document.querySelectorAll('[data-tag]').forEach(element => {
      element.classList.remove('active');
    });
    this.render(this.items);
  }

  render(itemsToRender = this.items) {
    if (!this.container || !this.renderFunction) {
      console.warn('SearchFilter: container or renderFunction not provided');
      return;
    }

    this.container.innerHTML = '';
    
    if (itemsToRender.length === 0) {
      this.container.innerHTML = `
        <div class="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No items found matching your criteria.</p>
        </div>
      `;
      return;
    }

    itemsToRender.forEach(item => {
      const element = this.renderFunction(item);
      this.container.appendChild(element);
    });
  }

  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  updateItems(newItems) {
    this.items = newItems;
    this.render();
  }
}

// Utility functions for common search scenarios
const SearchUtils = {
  // Create a case-insensitive substring matcher
  createSubstringMatcher: (fields) => {
    return (item, query) => {
      const searchTerm = query.toLowerCase();
      return fields.some(field => {
        const value = item[field];
        if (Array.isArray(value)) {
          return value.some(v => v.toLowerCase().includes(searchTerm));
        }
        return value && value.toLowerCase().includes(searchTerm);
      });
    };
  },

  // Create a tag-based filter
  createTagFilter: (tagField = 'tags') => {
    return (item, selectedTags) => {
      if (!selectedTags || selectedTags.length === 0) return true;
      const itemTags = item[tagField] || [];
      return selectedTags.every(tag => itemTags.includes(tag));
    };
  },

  // Debounce function for search input
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.SearchFilter = SearchFilter;
  window.SearchUtils = SearchUtils;
}