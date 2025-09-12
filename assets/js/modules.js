// Modules page functionality
class ModulesPage {
  constructor() {
    this.modules = [];
    this.searchFilter = null;
    this.init();
  }

  async init() {
    await this.loadModules();
    this.setupSearch();
    this.renderModules();
  }

  async loadModules() {
    const { data, error } = await Components.fetchJSON('/data/modules.json');
    
    if (error) {
      this.showError('Failed to load modules. Please try again later.');
      return;
    }

    this.modules = data.sort((a, b) => a.week - b.week);
  }

  setupSearch() {
    const searchInput = document.getElementById('module-search');
    const container = document.getElementById('modules-container');
    
    if (!searchInput || !container) return;

    this.searchFilter = new SearchFilter({
      items: this.modules,
      searchInput: searchInput,
      container: container,
      renderFunction: (module) => this.createModuleCard(module),
      searchFields: ['title', 'summary', 'topics']
    });
  }

  createModuleCard(module) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 card-hover';
    
    // Create topics badges
    const topicBadges = module.topics.map(topic => 
      Components.createBadge(topic, { variant: 'primary', size: 'sm' })
    );
    
    // Create resources links
    const resourceLinks = module.resources.map(resource => 
      `<a href="${resource.url}" target="_blank" rel="noopener noreferrer" 
         class="text-blue-600 dark:text-blue-400 hover:underline text-sm">
         ${resource.label} →
       </a>`
    ).join(' · ');

    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium text-gray-500 dark:text-gray-400">Week ${module.week}</span>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${module.title}</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-3">${module.summary}</p>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2 mb-4">
        ${topicBadges.map(badge => badge.outerHTML).join('')}
      </div>
      
      <div class="flex items-center justify-between">
        <div class="flex flex-wrap gap-2 text-sm">
          ${resourceLinks}
        </div>
        <a href="${module.contentUrl}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
          View Content →
        </a>
      </div>
    `;

    // Add the topic badges to the DOM
    const topicContainer = card.querySelector('.flex.flex-wrap');
    topicContainer.innerHTML = '';
    topicBadges.forEach(badge => topicContainer.appendChild(badge));

    return card;
  }

  renderModules() {
    const container = document.getElementById('modules-container');
    if (!container) return;

    if (this.modules.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No modules available yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = '';
    this.modules.forEach(module => {
      container.appendChild(this.createModuleCard(module));
    });
  }

  showError(message) {
    const container = document.getElementById('modules-container');
    if (container) {
      container.appendChild(Components.createErrorMessage(message, {
        title: 'Loading Error'
      }));
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('modules-container')) {
    new ModulesPage();
  }
});