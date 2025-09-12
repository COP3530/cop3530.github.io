# COP3530 Course Website

A modern, responsive course dashboard built with Tailwind CSS for the COP3530 Data Structures and Algorithms course. This website provides an intuitive interface for accessing course materials, programming problems, schedules, and announcements.

## 🚀 Live Demo

Visit the deployed site: [https://cop3530.github.io/cop3530.github.io](https://cop3530.github.io/cop3530.github.io)

## 📋 Features

### 🎨 Modern Design
- **Responsive Dashboard**: Clean, card-based layout that works on all devices
- **Dark Mode**: Toggle between light and dark themes with system preference detection
- **Sidebar Navigation**: Persistent navigation with mobile-friendly collapsible menu
- **Tailwind CSS**: Utility-first styling with CDN delivery for rapid development

### 📚 Content Management
- **Course Modules**: Browse weekly topics with links to instructional content
- **Programming Problems**: Searchable, filterable problem bank with difficulty ratings
- **Announcements**: Chronological course updates with relative timestamps
- **Schedule**: Week-by-week breakdown of topics, assignments, and due dates
- **Resources**: Development tools, textbooks, and learning materials
- **Syllabus**: Comprehensive course information and policies

### 🔍 Interactive Features
- **Real-time Search**: Filter content across all sections
- **Tag-based Filtering**: Multi-select tag filtering for programming problems
- **Client-side Rendering**: Fast, responsive interface with vanilla JavaScript
- **Cross-repo Integration**: Links to external course repositories

### ♿ Accessibility
- **Semantic HTML**: Proper heading structure and ARIA labels
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Skip links and descriptive text
- **Color Contrast**: WCAG compliant color schemes in both themes

## 🏗 Project Structure

```
cop3530.github.io/
├── index.html                 # Dashboard home page
├── modules.html              # Course modules browser
├── problems.html             # Programming problems catalog
├── announcements.html        # Course announcements
├── schedule.html             # Weekly schedule table
├── resources.html            # Learning resources and tools
├── syllabus.html             # Course syllabus and policies
├── assets/
│   ├── css/
│   │   └── custom.css        # Custom styles and theme overrides
│   └── js/
│       ├── components.js     # Shared UI components and utilities
│       ├── theme.js          # Dark mode management
│       ├── search.js         # Generic search and filtering
│       ├── modules.js        # Module page functionality
│       ├── problems.js       # Problems page with tag filtering
│       └── announcements.js  # Announcements rendering
├── data/
│   ├── modules.json          # Course module data
│   ├── problems.json         # Programming problems database
│   └── announcements.json    # Course announcements
└── README.md                 # Project documentation
```

## 🛠 Tech Stack

- **Framework**: Static HTML/CSS/JavaScript (GitHub Pages compatible)
- **CSS Framework**: Tailwind CSS 3.x (via CDN)
- **JavaScript**: Vanilla ES6+ (no build process required)
- **Data Format**: JSON files for content management
- **Hosting**: GitHub Pages (automatic deployment)

## 📖 Content Management

### Adding New Modules

Edit `data/modules.json` to add new course modules:

```json
{
  "id": "week05-heaps",
  "title": "Heaps and Priority Queues",
  "week": 5,
  "topics": ["Binary Heaps", "Priority Queues", "Heap Operations"],
  "summary": "Understanding heap data structure and priority queue implementations.",
  "contentUrl": "https://github.com/COP3530/Instructional-Content/tree/main/Week05",
  "resources": [
    {"label": "Slides", "url": "https://github.com/..."},
    {"label": "Video Lecture", "url": "https://youtube.com/..."}
  ]
}
```

### Adding Programming Problems

Edit `data/problems.json` to add new coding challenges:

```json
{
  "id": "pp-009",
  "title": "Heap Sort Implementation",
  "topic": "Sorting",
  "difficulty": "Medium",
  "tags": ["heap", "sorting", "in-place"],
  "repoPath": "https://github.com/COP3530/Programming-Problems/tree/main/sorting/heap-sort",
  "description": "Implement heap sort algorithm with in-place sorting and analyze time complexity."
}
```

### Publishing Announcements

Edit `data/announcements.json` to add course updates:

```json
{
  "id": "2025-02-01-midterm",
  "title": "Midterm Exam Information",
  "body": "<p>The midterm exam is scheduled for <strong>February 21st</strong> during regular class time...</p>",
  "posted_at": "2025-02-01T09:00:00Z"
}
```

## 🎯 Usage Guide

### For Students
1. **Dashboard**: Start here for quick access to recent announcements and upcoming content
2. **Modules**: Browse weekly course materials and access instructional content
3. **Problems**: Search and filter programming assignments by topic, difficulty, or tags
4. **Schedule**: View assignment due dates and exam schedules
5. **Resources**: Find development tools, textbooks, and study materials

### For Instructors
1. Update JSON files in the `data/` directory to modify course content
2. All changes are automatically reflected on the live site
3. No build process required - just commit and push changes
4. Use the GitHub repository interface for quick content updates

## 🔧 Development

### Local Development
```bash
# Clone the repository
git clone https://github.com/COP3530/cop3530.github.io.git
cd cop3530.github.io

# Serve locally (any HTTP server works)
python -m http.server 8000
# or
npx serve .
# or
php -S localhost:8000
```

### Customization
- **Colors**: Modify Tailwind color classes in HTML files
- **Styling**: Add custom CSS to `assets/css/custom.css`
- **Functionality**: Extend JavaScript files in `assets/js/`
- **Content**: Update JSON files in `data/` directory

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript features required
- CSS Grid and Flexbox support needed

## 🚀 Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the main branch. No build process is required.

### Manual Deployment
1. Ensure all files are committed to the repository
2. Push changes to the main branch
3. GitHub Pages will automatically update the live site
4. Changes typically appear within 1-5 minutes

## 🔮 Future Enhancements

### Planned Features (TODOs)
- [ ] **Build Process**: Migrate from CDN to compiled Tailwind CSS for smaller file sizes
- [ ] **GitHub API Integration**: Fetch live content from course repositories
- [ ] **Offline Support**: Add service worker for offline functionality
- [ ] **Markdown Support**: Enable markdown rendering for announcements and syllabus
- [ ] **Search Indexing**: Implement full-text search across all content
- [ ] **Static Site Generator**: Consider migration to Eleventy or similar tool
- [ ] **Progressive Enhancement**: Enhanced features for modern browsers

### Potential Improvements
- Assignment submission interface
- Grade tracking dashboard
- Student progress visualization
- Discussion forum integration
- Calendar sync (Google Calendar, Outlook)
- Email notification system
- Mobile app companion

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes following the existing code style
4. Test your changes locally
5. Commit with descriptive messages
6. Push to your fork and create a pull request

### Content Guidelines
- Use semantic HTML structure
- Follow existing JavaScript patterns
- Maintain consistent styling with Tailwind utilities
- Ensure accessibility standards are met
- Test on multiple devices and browsers

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Support

- **Issues**: Report bugs and request features via GitHub Issues
- **Discussions**: Join project discussions on GitHub Discussions
- **Documentation**: Comprehensive guides available in the Wiki
- **Contact**: Reach out to course instructors for academic content questions

---

**Built with ❤️ for COP3530 students at the University of Florida**