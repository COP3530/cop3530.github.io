// Shared UI components for COP3530 website

const Components = {
  // Generic fetch function with error handling
  async fetchJSON(path) {
    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error(`Error fetching ${path}:`, error);
      return { data: null, error: error.message };
    }
  },

  // Create a reusable card component
  createCard(options = {}) {
    const {
      title = '',
      subtitle = '',
      content = '',
      footer = '',
      href = null,
      className = '',
      onClick = null
    } = options;

    const card = document.createElement(href ? 'a' : 'div');
    
    if (href) {
      card.href = href;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
    }
    
    card.className = `block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 card-hover ${className}`;
    
    if (onClick) {
      card.addEventListener('click', onClick);
      card.style.cursor = 'pointer';
    }

    let cardContent = '';
    
    if (title) {
      cardContent += `<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${title}</h3>`;
    }
    
    if (subtitle) {
      cardContent += `<p class="text-sm text-gray-600 dark:text-gray-400 mb-2">${subtitle}</p>`;
    }
    
    if (content) {
      cardContent += `<div class="text-gray-700 dark:text-gray-300 mb-4">${content}</div>`;
    }
    
    if (footer) {
      cardContent += `<div class="text-sm text-gray-500 dark:text-gray-400">${footer}</div>`;
    }

    card.innerHTML = cardContent;
    return card;
  },

  // Create a badge/tag component
  createBadge(text, options = {}) {
    const {
      variant = 'default',
      size = 'sm',
      clickable = false,
      onClick = null,
      dataTag = null
    } = options;

    const badge = document.createElement(clickable ? 'button' : 'span');
    
    let baseClasses = 'inline-flex items-center font-medium rounded-full';
    
    // Size classes
    const sizeClasses = {
      xs: 'px-2 py-0.5 text-xs',
      sm: 'px-2.5 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-3 py-1.5 text-base'
    };
    
    // Variant classes
    const variantClasses = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      primary: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      secondary: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
      error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    badge.className = `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]}`;
    
    if (clickable) {
      badge.className += ' tag-pill cursor-pointer hover:scale-105 transition-transform';
      badge.type = 'button';
    }
    
    if (dataTag) {
      badge.setAttribute('data-tag', dataTag);
    }
    
    if (onClick) {
      badge.addEventListener('click', onClick);
    }
    
    badge.textContent = text;
    return badge;
  },

  // Create difficulty badge with predefined styling
  createDifficultyBadge(difficulty) {
    const variants = {
      'Easy': 'success',
      'Medium': 'warning', 
      'Hard': 'error'
    };
    
    return this.createBadge(difficulty, {
      variant: variants[difficulty] || 'default',
      size: 'sm'
    });
  },

  // Format relative time (e.g., "3 days ago")
  formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60
    };
    
    for (const [unit, seconds] of Object.entries(intervals)) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }
    
    return 'Just now';
  },

  // Create a loading skeleton
  createLoadingSkeleton(lines = 3) {
    const skeleton = document.createElement('div');
    skeleton.className = 'animate-pulse';
    
    let content = '';
    for (let i = 0; i < lines; i++) {
      const width = i === lines - 1 ? 'w-3/4' : 'w-full';
      content += `<div class="h-4 bg-gray-300 dark:bg-gray-700 rounded ${width} mb-2"></div>`;
    }
    
    skeleton.innerHTML = content;
    return skeleton;
  },

  // Create an error message component
  createErrorMessage(message, options = {}) {
    const { 
      title = 'Error',
      dismissible = false,
      onDismiss = null
    } = options;

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message flex items-start justify-between';
    
    let content = `
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium">${title}</h3>
          <p class="mt-1 text-sm">${message}</p>
        </div>
      </div>
    `;
    
    if (dismissible) {
      content += `
        <button type="button" class="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-red-500 hover:bg-red-100 dark:hover:bg-red-800">
          <span class="sr-only">Dismiss</span>
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      `;
    }
    
    errorDiv.innerHTML = content;
    
    if (dismissible && onDismiss) {
      const dismissButton = errorDiv.querySelector('button');
      dismissButton?.addEventListener('click', () => {
        errorDiv.remove();
        onDismiss();
      });
    }
    
    return errorDiv;
  },

  // Smooth scroll to element
  scrollToElement(element, offset = 0) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  },

  // Debounce utility
  debounce(func, wait) {
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
  window.Components = Components;
}