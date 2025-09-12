// Theme management for COP3530 website
class ThemeManager {
  constructor() {
    this.theme = this.getStoredTheme() || this.getPreferredTheme();
    this.init();
  }

  init() {
    this.updateTheme();
    this.setupToggleButton();
    this.setupSystemThemeListener();
  }

  getStoredTheme() {
    return localStorage.getItem('theme');
  }

  getPreferredTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  updateTheme() {
    const html = document.documentElement;
    
    if (this.theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Update toggle button icon if it exists
    this.updateToggleIcon();
  }

  updateToggleIcon() {
    const toggleButton = document.getElementById('theme-toggle');
    if (!toggleButton) return;

    const sunIcon = toggleButton.querySelector('.sun-icon');
    const moonIcon = toggleButton.querySelector('.moon-icon');
    
    if (this.theme === 'dark') {
      sunIcon?.classList.remove('hidden');
      moonIcon?.classList.add('hidden');
    } else {
      sunIcon?.classList.add('hidden');
      moonIcon?.classList.remove('hidden');
    }
  }

  toggle() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.theme);
    this.updateTheme();
  }

  setupToggleButton() {
    const toggleButton = document.getElementById('theme-toggle');
    if (toggleButton) {
      toggleButton.addEventListener('click', () => this.toggle());
    }
  }

  setupSystemThemeListener() {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // Only update if user hasn't manually set a preference
      if (!this.getStoredTheme()) {
        this.theme = e.matches ? 'dark' : 'light';
        this.updateTheme();
      }
    });
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ThemeManager;
}