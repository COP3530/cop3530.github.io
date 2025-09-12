// Announcements page functionality
class AnnouncementsPage {
  constructor() {
    this.announcements = [];
    this.searchFilter = null;
    this.init();
  }

  async init() {
    await this.loadAnnouncements();
    this.setupSearch();
    this.renderAnnouncements();
  }

  async loadAnnouncements() {
    const { data, error } = await Components.fetchJSON('/data/announcements.json');
    
    if (error) {
      this.showError('Failed to load announcements. Please try again later.');
      return;
    }

    // Sort announcements by date (newest first)
    this.announcements = data.sort((a, b) => 
      new Date(b.posted_at) - new Date(a.posted_at)
    );
  }

  setupSearch() {
    const searchInput = document.getElementById('announcements-search');
    const container = document.getElementById('announcements-container');
    
    if (!searchInput || !container) return;

    this.searchFilter = new SearchFilter({
      items: this.announcements,
      searchInput: searchInput,
      container: container,
      renderFunction: (announcement) => this.createAnnouncementCard(announcement),
      searchFields: ['title', 'body']
    });
  }

  createAnnouncementCard(announcement) {
    const card = document.createElement('article');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-4';
    
    const relativeTime = Components.formatRelativeTime(announcement.posted_at);
    const formattedDate = new Date(announcement.posted_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    card.innerHTML = `
      <header class="mb-4">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          ${announcement.title}
        </h2>
        <div class="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"></path>
          </svg>
          <time datetime="${announcement.posted_at}" title="${formattedDate}">
            ${relativeTime}
          </time>
        </div>
      </header>
      
      <div class="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
        ${announcement.body}
      </div>
    `;

    return card;
  }

  renderAnnouncements() {
    const container = document.getElementById('announcements-container');
    if (!container) return;

    if (this.announcements.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <div class="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
            </svg>
          </div>
          <p class="text-gray-500 dark:text-gray-400">No announcements available yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    this.announcements.forEach(announcement => {
      container.appendChild(this.createAnnouncementCard(announcement));
    });
  }

  showError(message) {
    const container = document.getElementById('announcements-container');
    if (container) {
      container.appendChild(Components.createErrorMessage(message, {
        title: 'Loading Error'
      }));
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('announcements-container')) {
    new AnnouncementsPage();
  }
});