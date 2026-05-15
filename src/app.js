import Dashboard from './components/dashboard.js';
import DoNows from './components/donows.js';
import AXP from './components/axp.js';
import Projects from './components/projects.js';
import Exams from './components/exams.js';
import Opportunities from './components/opportunities.js';
import Roadmap from './components/roadmap.js';
import Reset from './components/reset.js';
import Inspiration from './components/inspiration.js';
import { seedDatabaseIfEmpty } from './db.js';

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.views = {
            'dashboard': { title: 'Dashboard Overview', subtitle: 'Welcome to your architecture journey.', component: Dashboard },
            'donows': { title: 'Do Nows & Time', subtitle: 'Your actionable tasks and schedule.', component: DoNows },
            'axp': { title: 'AXP Experience Tracker', subtitle: 'Track your 3,740 hours toward licensure.', component: AXP },
            'exams': { title: 'ARE Exams', subtitle: 'Track your Architectural Registration Exams.', component: Exams },
            'projects': { title: 'Projects & Portfolio', subtitle: 'Curate your best work.', component: Projects },
            'roadmap': { title: 'Career Roadmap', subtitle: 'Your overarching architecture timeline.', component: Roadmap },
            'opportunities': { title: 'Opportunities', subtitle: 'Scholarships, Internships, and Jobs.', component: Opportunities },
            'reset': { title: 'Studio Reset', subtitle: 'Recover energy and lock in.', component: Reset },
            'inspiration': { title: 'Inspiration Vault', subtitle: 'Randomize concepts and save ideas.', component: Inspiration }
        };

        this.init();
    }

    async init() {
        await seedDatabaseIfEmpty();
        this.setupNavigation();
        this.renderView();
        
        // Setup theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.body.classList.toggle('light-theme'); // Can implement later
        });
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links li');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                if (this.views[view]) {
                    // Update Active State
                    navLinks.forEach(l => l.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    
                    // Update View
                    this.currentView = view;
                    this.renderView();
                }
            });
        });
    }

    renderView() {
        const viewConfig = this.views[this.currentView];
        
        // Update Headers
        document.getElementById('page-title').innerText = viewConfig.title;
        document.getElementById('page-subtitle').innerText = viewConfig.subtitle;

        // Render Component
        const container = document.getElementById('view-container');
        container.innerHTML = ''; // Clear current

        if (viewConfig.component) {
            container.appendChild(viewConfig.component.render());
            if (viewConfig.component.onMount) {
                viewConfig.component.onMount();
            }
        } else {
            container.innerHTML = `<div class="glass-card"><h3>Coming Soon</h3><p class="text-muted">This module is currently under construction.</p></div>`;
        }
    }
}

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
