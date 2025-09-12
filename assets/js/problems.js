// Problems page functionality
class ProblemsPage {
  constructor() {
    this.problems = [];
    this.searchFilter = null;
    this.selectedTags = new Set();
    this.init();
  }

  async init() {
    await this.loadProblems();
    this.setupSearch();
    this.setupTagFiltering();
    this.renderProblems();
    this.renderTagCloud();
  }

  async loadProblems() {
    const { data, error } = await Components.fetchJSON('/data/problems.json');
    
    if (error) {
      this.showError('Failed to load problems. Please try again later.');
      return;
    }

    // Sort problems alphabetically by title
    this.problems = data.sort((a, b) => a.title.localeCompare(b.title));
  }

  setupSearch() {
    const searchInput = document.getElementById('problems-search');
    const container = document.getElementById('problems-container');
    
    if (!searchInput || !container) return;

    this.searchFilter = new SearchFilter({
      items: this.problems,
      searchInput: searchInput,
      container: container,
      renderFunction: (problem) => this.createProblemCard(problem),
      searchFields: ['title', 'description', 'topic', 'tags']
    });
  }

  setupTagFiltering() {
    // Override the SearchFilter's toggleTag method to use our custom logic
    if (this.searchFilter) {
      this.searchFilter.toggleTag = (tag) => {
        if (this.selectedTags.has(tag)) {
          this.selectedTags.delete(tag);
        } else {
          this.selectedTags.add(tag);
        }
        
        this.updateTagUI(tag);
        this.applyFilters();
      };
    }
  }

  updateTagUI(tag) {
    const tagElements = document.querySelectorAll(`[data-tag="${tag}"]`);
    tagElements.forEach(element => {
      if (this.selectedTags.has(tag)) {
        element.classList.add('active');
        element.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
      } else {
        element.classList.remove('active');
        element.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500');
      }
    });
  }

  applyFilters() {
    let filteredProblems = this.problems;

    // Apply tag filters
    if (this.selectedTags.size > 0) {
      filteredProblems = this.problems.filter(problem => {
        const problemTags = problem.tags || [];
        return Array.from(this.selectedTags).every(tag => problemTags.includes(tag));
      });
    }

    // Apply search filter if there's a search term
    const searchInput = document.getElementById('problems-search');
    if (searchInput && searchInput.value.trim()) {
      const searchTerm = searchInput.value.toLowerCase().trim();
      filteredProblems = filteredProblems.filter(problem => {
        return ['title', 'description', 'topic'].some(field => {
          const value = problem[field];
          return value && value.toLowerCase().includes(searchTerm);
        }) || (problem.tags && problem.tags.some(tag => tag.toLowerCase().includes(searchTerm)));
      });
    }

    this.renderFilteredProblems(filteredProblems);
  }

  createProblemCard(problem) {
    const card = document.createElement('div');
    card.className = 'bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 card-hover';
    
    // Create difficulty badge
    const difficultyBadge = Components.createDifficultyBadge(problem.difficulty);
    
    // Create tag badges
    const tagBadges = (problem.tags || []).map(tag => 
      Components.createBadge(tag, { 
        variant: 'default', 
        size: 'xs',
        clickable: true,
        dataTag: tag,
        onClick: () => this.searchFilter.toggleTag(tag)
      })
    );

    card.innerHTML = `
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-2">
            <span class="text-sm font-medium text-blue-600 dark:text-blue-400">${problem.topic}</span>
            ${difficultyBadge.outerHTML}
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">${problem.title}</h3>
          <p class="text-gray-600 dark:text-gray-300 mb-3">${problem.description}</p>
        </div>
      </div>
      
      <div class="flex flex-wrap gap-2 mb-4 tag-container">
        <!-- Tags will be added here -->
      </div>
      
      <div class="flex items-center justify-between">
        <span class="text-sm text-gray-500 dark:text-gray-400">ID: ${problem.id}</span>
        <a href="${problem.repoPath}" target="_blank" rel="noopener noreferrer"
           class="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors">
          View Problem →
        </a>
      </div>
    `;

    // Add tag badges to the DOM
    const tagContainer = card.querySelector('.tag-container');
    tagBadges.forEach(badge => tagContainer.appendChild(badge));

    return card;
  }

  renderFilteredProblems(problems) {
    const container = document.getElementById('problems-container');
    if (!container) return;

    container.innerHTML = '';

    if (problems.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8">
          <p class="text-gray-500 dark:text-gray-400">No problems found matching your criteria.</p>
          <button onclick="problemsPage.clearAllFilters()" 
                  class="mt-2 text-blue-600 dark:text-blue-400 hover:underline">
            Clear all filters
          </button>
        </div>
      `;
      return;
    }

    problems.forEach(problem => {
      container.appendChild(this.createProblemCard(problem));
    });
  }

  renderProblems() {
    this.renderFilteredProblems(this.problems);
  }

  renderTagCloud() {
    const tagCloudContainer = document.getElementById('tag-cloud');
    if (!tagCloudContainer) return;

    // Collect all unique tags
    const tagCounts = {};
    this.problems.forEach(problem => {
      (problem.tags || []).forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });

    // Sort tags by frequency (most used first)
    const sortedTags = Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([tag]) => tag);

    tagCloudContainer.innerHTML = '';
    
    if (sortedTags.length === 0) {
      tagCloudContainer.innerHTML = '<p class="text-gray-500 dark:text-gray-400">No tags available.</p>';
      return;
    }

    sortedTags.forEach(tag => {
      const tagBadge = Components.createBadge(tag, {
        variant: 'default',
        size: 'sm',
        clickable: true,
        dataTag: tag,
        onClick: () => this.searchFilter.toggleTag(tag)
      });
      
      tagCloudContainer.appendChild(tagBadge);
    });
  }

  clearAllFilters() {
    this.selectedTags.clear();
    document.querySelectorAll('[data-tag]').forEach(element => {
      element.classList.remove('active', 'ring-2', 'ring-offset-2', 'ring-blue-500');
    });
    
    const searchInput = document.getElementById('problems-search');
    if (searchInput) {
      searchInput.value = '';
    }
    
    this.renderProblems();
  }

  showError(message) {
    const container = document.getElementById('problems-container');
    if (container) {
      container.appendChild(Components.createErrorMessage(message, {
        title: 'Loading Error'
      }));
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('problems-container')) {
    window.problemsPage = new ProblemsPage();
  }
});