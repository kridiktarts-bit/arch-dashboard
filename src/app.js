import Dashboard from './components/dashboard.js';
import DoNows from './components/donows.js';
import Projects from './components/projects.js';
import Opportunities from './components/opportunities.js';
import Roadmap from './components/roadmap.js';
import Reset from './components/reset.js';
import Inspiration from './components/inspiration.js';
import LearningPath from './components/learning_path.js';
import Milestones from './components/milestones.js';
import Skills from './components/skills.js';
import Resources from './components/resources.js';
import Settings from './components/settings.js';
import Schedule from './components/schedule.js'; 
import { 
    getActiveCareer, 
    getUserOnboarding, 
    saveUserOnboarding, 
    getRoadmap, 
    seedDatabaseIfEmpty, 
    getCareerConfig,
    generateCalendarSchedule 
} from './db.js';

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.views = {
            'dashboard': { title: 'Dashboard Overview', subtitle: 'Overview of your milestones and objectives.', component: Dashboard },
            'donows': { title: "Today's Tasks", subtitle: 'Your actionable tasks and checklist.', component: DoNows },
            'schedule': { title: 'Schedule Planner', subtitle: 'Interactive weekly calendar with task dependencies.', component: Schedule },
            'learning_path': { title: 'Learning Path / Project Phases', subtitle: 'Step-by-step master plan of your stages.', component: LearningPath },
            'milestones': { title: 'Milestones & Targets', subtitle: 'Log progress to unlock key accomplishments.', component: Milestones },
            'skills': { title: 'Skills Inventory', subtitle: 'Visual review of your competencies.', component: Skills },
            'portfolio': { title: 'Portfolio & Deliverables', subtitle: 'Curate your creative work.', component: Projects },
            'opportunities': { title: 'Opportunities Board', subtitle: 'Personalized contests, grants, and internships.', component: Opportunities },
            'achievements': { title: 'Achievements & Badges', subtitle: 'Earn rewards for unlocking career milestones.', component: Milestones },
            'reset': { title: 'Focus Mode / Studio Reset', subtitle: 'Recover energy and lock in.', component: Reset },
            'resources': { title: 'Learning Resources', subtitle: 'Curated study guides and reference tools.', component: Resources },
            'inspiration': { title: 'Inspiration Vault', subtitle: 'Randomize concepts and save creative ideas.', component: Inspiration },
            'settings': { title: 'Settings', subtitle: 'Manage your profile and career settings.', component: Settings }
        };

        this.init();
    }

    async init() {
        await seedDatabaseIfEmpty();
        
        const onboarding = getUserOnboarding();
        if (!onboarding) {
            document.querySelector('.app-container').style.display = 'none';
            document.getElementById('onboarding-container').style.display = 'flex';
            this.runOnboardingWizard();
        } else {
            document.getElementById('onboarding-container').style.display = 'none';
            document.querySelector('.app-container').style.display = 'flex';
            await this.setupNavigation();
            this.renderView();
        }

        // Setup theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
        });
    }

    async setupNavigation() {
        const career = getActiveCareer();
        const onboarding = getUserOnboarding();
        
        // Load onboarding config to dynamically retrieve sidebar template links
        const careerOnboardingConfig = await getCareerConfig(career, 'onboarding');
        const isProfessional = onboarding && (onboarding.experience_status === 'experienced' || onboarding.experience_status === 'pro');
        const navKey = isProfessional ? 'professional' : 'beginner';

        const logoIcon = document.getElementById('sidebar-logo-icon') || document.querySelector('.logo-icon');
        const logoText = document.getElementById('sidebar-logo-text') || document.querySelector('.logo-text');
        
        if (career === 'comic_creator') {
            if (logoIcon) logoIcon.innerText = '🎨';
            if (logoText) logoText.innerText = 'ComicTrack';
        } else {
            if (logoIcon) logoIcon.innerText = '🏛️';
            if (logoText) logoText.innerText = 'ArchTrack';
        }

        const navContainer = document.getElementById('dynamic-nav-sections');
        
        // Assemble dynamic sidebar links from JSON configuration
        let linksList = [];
        if (careerOnboardingConfig && careerOnboardingConfig.sidebarTemplates && careerOnboardingConfig.sidebarTemplates[navKey]) {
            linksList = careerOnboardingConfig.sidebarTemplates[navKey];
        } else {
            // fallback
            linksList = [
                { "id": "dashboard", "name": "Overview", "icon": "📊" },
                { "id": "donows", "name": "Practice Tracker", "icon": "⚡" },
                { "id": "schedule", "name": "Calendar", "icon": "📅" },
                { "id": "settings", "name": "Settings", "icon": "⚙️" }
            ];
        }

        let navHtml = `
            <div class="nav-section">
                <p class="nav-heading">WORKSPACE</p>
                <ul class="nav-links">
        `;
        linksList.forEach(link => {
            const isActive = link.id === this.currentView;
            navHtml += `
                <li class="${isActive ? 'active' : ''}" data-view="${link.id}">
                    <span class="icon">${link.icon}</span> ${link.name}
                </li>
            `;
        });
        navHtml += `</ul></div>`;
        navContainer.innerHTML = navHtml;

        // Customise views templates titles/subtitles for professional vs beginner mode
        if (isProfessional) {
            if (career === 'comic_creator') {
                this.views['learning_path'] = { title: "Production Pipeline", subtitle: "Track active production phase tasks.", component: LearningPath };
                this.views['donows'] = { title: "Chapter Tracker", subtitle: "Monitor pages and chapters completeness.", component: DoNows };
                this.views['portfolio'] = { title: "Publishing Channels", subtitle: "Manage uploads and Tapas/Webtoon distribution.", component: Projects };
                this.views['resources'] = { title: "Marketing Campaign", subtitle: "Promotional teasers and social campaign schedules.", component: Resources };
            } else {
                this.views['learning_path'] = { title: "AXP Hour Log", subtitle: "Log experience hours under AXP categories.", component: LearningPath };
                this.views['donows'] = { title: "ARE Exam Prep", subtitle: "Schedule study guides and practice quizzes.", component: DoNows };
                this.views['portfolio'] = { title: "Job Applications", subtitle: "Track networking and firm outreach logs.", component: Projects };
                this.views['resources'] = { title: "Licensure Timeline", subtitle: "State licensing registration checklist.", component: Resources };
            }
        } else {
            this.views['learning_path'] = { title: "Learning Path", subtitle: "Master foundations and course exercises.", component: LearningPath };
            this.views['donows'] = { title: "Practice Tracker", subtitle: "Log daily drawing hours and lessons.", component: DoNows };
            this.views['portfolio'] = { title: "My Portfolio Projects", subtitle: "Curate creative design works.", component: Projects };
            this.views['resources'] = { title: "Reference Resources", subtitle: "Books, study guides, and templates.", component: Resources };
        }

        const navLinks = document.querySelectorAll('.nav-links li');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const view = e.currentTarget.getAttribute('data-view');
                if (this.views[view]) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                    this.currentView = view;
                    this.renderView();
                }
            });
        });

        // Update User Profile Footer
        if (onboarding) {
            const userNameEl = document.getElementById('sidebar-user-name') || document.querySelector('.user-name');
            const userRoleEl = document.getElementById('sidebar-user-role') || document.querySelector('.user-role');
            const avatarEl = document.getElementById('sidebar-user-avatar') || document.querySelector('.avatar');

            if (userNameEl) userNameEl.innerText = onboarding.firstName;
            if (userRoleEl) {
                userRoleEl.innerText = isProfessional 
                    ? `Professional • ${career === 'comic_creator' ? 'Comic Creator' : 'Graduate Architect'}`
                    : `Beginner • ${career === 'comic_creator' ? 'Comic Student' : 'Arch Student'}`;
            }
            if (avatarEl) {
                avatarEl.innerText = onboarding.firstName.charAt(0).toUpperCase();
                avatarEl.style.background = 'linear-gradient(135deg, var(--primary), var(--secondary))';
                avatarEl.style.color = 'white';
                avatarEl.style.display = 'flex';
                avatarEl.style.alignItems = 'center';
                avatarEl.style.justifyContent = 'center';
                avatarEl.style.fontWeight = 'bold';
            }
        }
    }

    renderView() {
        const viewConfig = this.views[this.currentView];
        const titleEl = document.getElementById('page-title');
        const subtitleEl = document.getElementById('page-subtitle');
        if (titleEl) titleEl.innerText = viewConfig.title;
        if (subtitleEl) subtitleEl.innerText = viewConfig.subtitle;

        const container = document.getElementById('view-container');
        if (!container) return;
        
        container.innerHTML = '';

        if (viewConfig.component) {
            container.appendChild(viewConfig.component.render());
            if (viewConfig.component.onMount) {
                viewConfig.component.onMount();
            }
        } else {
            container.innerHTML = `<div class="glass-card"><h3>Coming Soon</h3><p class="text-muted">This module is currently under construction.</p></div>`;
        }
    }

    runOnboardingWizard() {
        const container = document.getElementById('onboarding-container');
        
        const wizardState = {
            step: 0,
            firstName: '',
            age: '',
            country: '',
            state: '',
            education: '', 
            career: '', 
            
            // Q1
            experience_status: '', 
            // Q2
            specificGoal: '', 
            // Q3
            project_type: '',
            // Q4 & Q5
            chapters_count: 5,
            pages_per_chapter: 10,
            // Q6 & Q7
            completed_stages: [],
            scheduled_stages: [],
            // Q7.5
            planning_depth: '4', // 1: goal, 2: weekly, 3: daily, 4: manager
            // Q8
            pacing_rate: '1',
            // Q9 & Q10
            daily_hours: 3,
            work_days: ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"], 
            // Q11 & Q12
            start_date: '',
            desired_deadline: '',
            realistic_deadline: '',
            deadline_warning_active: false,
            // Q13
            unavailable_reasons: [],
            unavailable_dates_custom: '',
            
            journeyType: 'short',
            weeklyHours: 15
        };

        let careerFollowUpConfig = null;

        const steps = [
            // Welcome Screen (Step 0)
            () => `
                <div class="onboarding-card" style="text-align: center;">
                    <div style="font-size: 64px; margin-bottom: 24px;">🚀</div>
                    <h1 class="onboarding-title">Build Your Dream Career</h1>
                    <p class="onboarding-subtitle">Your personalized roadmap from today to your dream job.</p>
                    <button class="onboarding-btn onboarding-btn-primary" id="btn-start" style="width: 100%; max-width: 320px; font-size: 18px;">Start Planning</button>
                </div>
            `,
            // Step 1 - About You
            () => `
                <div class="onboarding-card">
                    <div class="onboarding-step-indicator">
                        <div class="step-dot active"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                    </div>
                    <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 1 — About You</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 24px;">Tell us about your background.</p>
                    
                    <div class="onboarding-form">
                        <div>
                            <label class="input-label">First Name</label>
                            <input type="text" id="ob-first-name" class="text-input" placeholder="e.g. Mariam" value="${wizardState.firstName}">
                        </div>
                        <div style="display: flex; gap: 16px;">
                            <div style="flex: 1;">
                                <label class="input-label">Age</label>
                                <input type="number" id="ob-age" class="text-input" placeholder="e.g. 17" value="${wizardState.age}">
                            </div>
                            <div style="flex: 2;">
                                <label class="input-label">Country</label>
                                <input type="text" id="ob-country" class="text-input" placeholder="e.g. USA" value="${wizardState.country}">
                            </div>
                        </div>
                        <div>
                            <label class="input-label">State / Province (Optional)</label>
                            <input type="text" id="ob-state" class="text-input" placeholder="e.g. New York" value="${wizardState.state}">
                        </div>
                        <div>
                            <label class="input-label">Current Status</label>
                            <select id="ob-education" class="text-input" style="background-color: #0d1e36;">
                                <option value="">Select Status...</option>
                                ${[
                                    "Middle School", "High School Freshman", "High School Sophomore", "High School Junior", "High School Senior",
                                    "Trade School Student", "College Freshman", "College Sophomore", "College Junior", "College Senior",
                                    "Graduate Student", "College Graduate", "Working Full-Time", "Working Part-Time", "Self-Employed",
                                    "Career Change", "Other"
                                ].map(status => `
                                    <option value="${status}" ${wizardState.education === status ? 'selected' : ''}>${status}</option>
                                `).join('')}
                            </select>
                        </div>
                    </div>

                    <div class="onboarding-nav-btns">
                        <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                        <button class="onboarding-btn onboarding-btn-primary" id="btn-next" ${wizardState.firstName && wizardState.age && wizardState.country && wizardState.education ? '' : 'disabled'}>Next</button>
                    </div>
                </div>
            `,
            // Step 2 - Dream Career Selector
            () => `
                <div class="onboarding-card">
                    <div class="onboarding-step-indicator">
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                    </div>
                    <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 2 — Dream Career</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 24px;">What career are you working toward?</p>
                    
                    <div class="onboarding-form">
                        <div class="autocomplete-container">
                            <label class="input-label">Target Career</label>
                            <input type="text" id="ob-career-search" class="text-input" placeholder="Search career (e.g. Comic Creator, Architecture...)" autocomplete="off" value="${wizardState.career ? (wizardState.career === 'architecture' ? 'Architecture' : 'Comic Creator') : ''}">
                            <div class="autocomplete-dropdown" id="ob-career-dropdown"></div>
                            <div class="validation-warning" id="ob-unsupported-warning" style="display: none;">
                                ⚠️ This career is coming soon.
                            </div>
                        </div>
                    </div>

                    <div class="onboarding-nav-btns">
                        <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                        <button class="onboarding-btn onboarding-btn-primary" id="btn-next" ${wizardState.career ? '' : 'disabled'}>Next</button>
                    </div>
                </div>
            `,
            // Step 3 (Q1) - Experience level selector
            () => `
                <div class="onboarding-card">
                    <div class="onboarding-step-indicator">
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                        <div class="step-dot active"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                        <div class="step-dot"></div>
                    </div>
                    <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 3 — Experience Level</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 24px;">What best describes your experience with ${wizardState.career === 'architecture' ? 'Architecture' : 'Comic Creation'}?</p>
                    
                    <div class="onboarding-form">
                        <div class="choices-grid" style="grid-template-columns: 1fr; gap: 12px;">
                            <button class="choice-button ob-q1-btn ${wizardState.experience_status === 'new' ? 'selected' : ''}" data-val="new" style="text-align: left; padding: 16px;">
                                🌱 <strong>I'm completely new.</strong>
                            </button>
                            <button class="choice-button ob-q1-btn ${wizardState.experience_status === 'basics' ? 'selected' : ''}" data-val="basics" style="text-align: left; padding: 16px;">
                                🌿 <strong>I know the basics.</strong>
                            </button>
                            <button class="choice-button ob-q1-btn ${wizardState.experience_status === 'experienced' ? 'selected' : ''}" data-val="experienced" style="text-align: left; padding: 16px;">
                                🌳 <strong>I'm experienced.</strong> (Pivots to scheduler)
                            </button>
                            <button class="choice-button ob-q1-btn ${wizardState.experience_status === 'pro' ? 'selected' : ''}" data-val="pro" style="text-align: left; padding: 16px;">
                                🏆 <strong>I'm already creating projects professionally.</strong> (Pivots to scheduler)
                            </button>
                        </div>
                    </div>

                    <div class="onboarding-nav-btns">
                        <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                        <button class="onboarding-btn onboarding-btn-primary" id="btn-next" ${wizardState.experience_status ? '' : 'disabled'}>Next</button>
                    </div>
                </div>
            `,
            // Step 4 (Q2) - Experienced Basics Pivot
            () => {
                const options = careerFollowUpConfig ? careerFollowUpConfig.skipBasicsOptions : [];
                return `
                    <div class="onboarding-card">
                        <div class="onboarding-step-indicator">
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot"></div>
                            <div class="step-dot"></div>
                            <div class="step-dot"></div>
                        </div>
                        <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 4 — Select Objective</h2>
                        <p class="onboarding-subtitle" style="margin-bottom: 24px;">What do you actually need help with?</p>
                        
                        <div class="onboarding-form">
                            <div class="choices-grid" style="grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));">
                                ${options.map(opt => `
                                    <button class="choice-button ob-q2-btn ${wizardState.specificGoal === opt ? 'selected' : ''}" data-val="${opt}">${opt}</button>
                                `).join('')}
                            </div>
                        </div>

                        <div class="onboarding-nav-btns">
                            <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                            <button class="onboarding-btn onboarding-btn-primary" id="btn-next" ${wizardState.specificGoal ? '' : 'disabled'}>Next</button>
                        </div>
                    </div>
                `;
            },
            // Step 5 (Q3, Q4, Q5) - Project Scope
            () => {
                const isComic = wizardState.career === 'comic_creator';
                const projTypes = isComic 
                    ? ["Comic Series", "One-Shot", "Manga", "Webtoon", "Graphic Novel", "Other"]
                    : ["Residential House Design", "Commercial Plaza Redesign", "Specialized Software Course", "Academic Portfolio Compilation"];

                return `
                    <div class="onboarding-card">
                        <div class="onboarding-step-indicator">
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot"></div>
                            <div class="step-dot"></div>
                        </div>
                        <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 5 — Project Scope</h2>
                        <p class="onboarding-subtitle" style="margin-bottom: 24px;">Define the size and format of your active project.</p>
                        
                        <div class="onboarding-form">
                            <div>
                                <label class="input-label">What project are you scheduling?</label>
                                <select id="ob-q3-type" class="text-input" style="background-color: #0d1e36;">
                                    ${projTypes.map(t => `<option value="${t}" ${wizardState.project_type === t ? 'selected' : ''}>${t}</option>`).join('')}
                                </select>
                            </div>
                            <div>
                                <label class="input-label">${isComic ? 'How many chapters will your project have?' : 'How many sheets/drawings will you produce?'}</label>
                                <input type="number" id="ob-q4-count" class="text-input" placeholder="e.g. 5" value="${wizardState.chapters_count || 5}">
                            </div>
                            ${isComic ? `
                                <div>
                                    <label class="input-label">How many pages per chapter?</label>
                                    <input type="number" id="ob-q5-pages" class="text-input" placeholder="e.g. 10" value="${wizardState.pages_per_chapter || 10}">
                                </div>
                            ` : ''}
                        </div>

                        <div class="onboarding-nav-btns" style="margin-top: 16px;">
                            <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                            <button class="onboarding-btn onboarding-btn-primary" id="btn-next">Next</button>
                        </div>
                    </div>
                `;
            },
            // Step 6 (Q6) - Finished Parts Checklist
            () => {
                const isComic = wizardState.career === 'comic_creator';
                const stagesList = isComic
                    ? ["Story outline", "World building", "Character descriptions", "Character designs", "Character reference sheets", "Chapter outlines", "Chapter dialogue", "Thumbnails", "Sketches", "Line art", "Coloring", "Lettering", "Cover", "Marketing assets"]
                    : ["Site analysis zoning", "Site mapping", "Conceptual massing forms", "Revit grids and levels", "Basic floor plan layouts", "Section wall details", "3D renderings", "Presentation sheets"];

                return `
                    <div class="onboarding-card">
                        <div class="onboarding-step-indicator">
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot"></div>
                        </div>
                        <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 6 — Finished Parts</h2>
                        <p class="onboarding-subtitle" style="margin-bottom: 24px;">Which parts are already finished? (AI will bypass these stages)</p>
                        
                        <div class="onboarding-form" style="max-height: 320px; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            ${stagesList.map(st => {
                                const isChecked = wizardState.completed_stages.includes(st);
                                return `
                                    <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer; color: white;">
                                        <input type="checkbox" class="ob-q6-check" value="${st}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--secondary);">
                                        <span>${st}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>

                        <div class="onboarding-nav-btns" style="margin-top: 16px;">
                            <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                            <button class="onboarding-btn onboarding-btn-primary" id="btn-next">Next</button>
                        </div>
                    </div>
                `;
            },
            // Step 7 (Q7) - Remaining Stages to Schedule
            () => {
                const isComic = wizardState.career === 'comic_creator';
                const stagesList = isComic
                    ? ["Story outline", "World building", "Character descriptions", "Character designs", "Character reference sheets", "Chapter outlines", "Chapter dialogue", "Thumbnails", "Sketches", "Line art", "Coloring", "Lettering", "Cover", "Marketing assets"]
                    : ["Site analysis zoning", "Site mapping", "Conceptual massing forms", "Revit grids and levels", "Basic floor plan layouts", "Section wall details", "3D renderings", "Presentation sheets"];

                const remainingStages = stagesList.filter(s => !wizardState.completed_stages.includes(s));
                
                return `
                    <div class="onboarding-card">
                        <div class="onboarding-step-indicator">
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                            <div class="step-dot active"></div>
                        </div>
                        <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 7 — Schedule Stages</h2>
                        <p class="onboarding-subtitle" style="margin-bottom: 24px;">Which remaining stages would you like the AI to schedule?</p>
                        
                        <div class="onboarding-form" style="max-height: 320px; overflow-y: auto; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            ${remainingStages.map(st => {
                                const isChecked = wizardState.scheduled_stages.includes(st) || wizardState.scheduled_stages.length === 0;
                                return `
                                    <label style="display: flex; align-items: center; gap: 10px; font-size: 13px; cursor: pointer; color: white;">
                                        <input type="checkbox" class="ob-q7-check" value="${st}" ${isChecked ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: var(--primary);">
                                        <span>${st}</span>
                                    </label>
                                `;
                            }).join('')}
                        </div>

                        <div class="onboarding-nav-btns" style="margin-top: 16px;">
                            <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                            <button class="onboarding-btn onboarding-btn-primary" id="btn-next">Next</button>
                        </div>
                    </div>
                `;
            },
            // Step 7.5 (NEW) - Planning Depth Selection
            () => `
                <div class="onboarding-card">
                    <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 7.5 — Planning Depth</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 24px;">How granular should the AI scheduling be?</p>
                    
                    <div class="onboarding-form">
                        <div class="choices-grid" style="grid-template-columns: 1fr; gap: 10px;">
                            <button class="choice-button ob-q75-btn ${wizardState.planning_depth === '1' ? 'selected' : ''}" data-val="1" style="text-align: left; padding: 12px 18px;">
                                <strong>Level 1 — Goal Only</strong>
                                <span style="display: block; font-size: 11px; color: var(--text-muted); margin-top: 4px;">Broad milestone indicators only ("Finish my comic").</span>
                            </button>
                            <button class="choice-button ob-q75-btn ${wizardState.planning_depth === '2' ? 'selected' : ''}" data-val="2" style="text-align: left; padding: 12px 18px;">
                                <strong>Level 2 — Weekly Planner</strong>
                                <span style="display: block; font-size: 11px; color: var(--text-muted); margin-top: 4px;">Work blocks divided by weeks.</span>
                            </button>
                            <button class="choice-button ob-q75-btn ${wizardState.planning_depth === '3' ? 'selected' : ''}" data-val="3" style="text-align: left; padding: 12px 18px;">
                                <strong>Level 3 — Daily Planner</strong>
                                <span style="display: block; font-size: 11px; color: var(--text-muted); margin-top: 4px;">Specific tasks scheduled for every work day.</span>
                            </button>
                            <button class="choice-button ob-q75-btn ${wizardState.planning_depth === '4' ? 'selected' : ''}" data-val="4" style="text-align: left; padding: 12px 18px;">
                                <strong>Level 4 — Production Manager (Recommended)</strong>
                                <span style="display: block; font-size: 11px; color: var(--text-muted); margin-top: 4px;">Granular dependency-linked tracking (Drafting, Revisions, Proofreading).</span>
                            </button>
                        </div>
                    </div>

                    <div class="onboarding-nav-btns" style="margin-top: 16px;">
                        <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                        <button class="onboarding-btn onboarding-btn-primary" id="btn-next">Next</button>
                    </div>
                </div>
            `,
            // Step 8 (Q8) - Chapter rate / Pacing targets
            () => `
                <div class="onboarding-card">
                    <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 8 — Pacing Rate</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 24px;">How many chapters/sheets would you like to finish each week?</p>
                    
                    <div class="onboarding-form">
                        <div class="choices-grid">
                            <button class="choice-button ob-q8-btn ${wizardState.pacing_rate === '1' ? 'selected' : ''}" data-val="1">1 per week</button>
                            <button class="choice-button ob-q8-btn ${wizardState.pacing_rate === '2' ? 'selected' : ''}" data-val="2">2 per week</button>
                            <button class="choice-button ob-q8-btn ${wizardState.pacing_rate === '3' ? 'selected' : ''}" data-val="3">3 per week</button>
                            <button class="choice-button ob-q8-btn ${wizardState.pacing_rate === 'custom' ? 'selected' : ''}" data-val="custom">Custom target</button>
                        </div>
                    </div>

                    <div class="onboarding-nav-btns">
                        <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                        <button class="onboarding-btn onboarding-btn-primary" id="btn-next">Next</button>
                    </div>
                </div>
            `,
            // Step 9 (Q9) & Step 10 (Q10) - Working Hours & Working Days Selector
            () => `
                <div class="onboarding-card">
                    <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Steps 9 & 10 — Work Days</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 24px;">Define your daily focus hours and preferred working days.</p>
                    
                    <div class="onboarding-form">
                        <div style="margin-bottom: 16px;">
                            <label class="input-label">Daily Available Hours</label>
                            <input type="number" id="ob-q9-hours" class="text-input" placeholder="e.g. 3" value="${wizardState.daily_hours || 3}">
                        </div>

                        <label class="input-label">Which days do you usually work?</label>
                        <div class="choices-grid" style="grid-template-columns: repeat(4, 1fr);">
                            ${["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                                const isSelected = wizardState.work_days.includes(day);
                                return `<button class="choice-button ob-q10-btn ${isSelected ? 'selected' : ''}" data-val="${day}" style="padding: 8px 4px; font-size: 12px;">${day.substring(0,3)}</button>`;
                            }).join('')}
                        </div>
                    </div>

                    <div class="onboarding-nav-btns" style="margin-top: 16px;">
                        <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                        <button class="onboarding-btn onboarding-btn-primary" id="btn-next" ${wizardState.work_days.length > 0 ? '' : 'disabled'}>Next</button>
                    </div>
                </div>
            `,
            // Step 11 (Q11) & Step 12 (Q12) - Start & End Date picker & validator warning
            () => `
                <div class="onboarding-card">
                    <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Steps 11 & 12 — Project Timeline</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 24px;">When would you like to start and finish this project?</p>
                    
                    <div class="onboarding-form">
                        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                            <div style="flex: 1;">
                                <label class="input-label">Start Date</label>
                                <input type="date" id="ob-q11-start" class="text-input" value="${wizardState.start_date}">
                            </div>
                            <div style="flex: 1;">
                                <label class="input-label">Target End Date</label>
                                <input type="date" id="ob-q12-end" class="text-input" value="${wizardState.desired_deadline}">
                            </div>
                        </div>

                        <div class="timeline-explanation-card" id="ob-deadline-warning-card" style="display: ${wizardState.deadline_warning_active ? 'block' : 'none'}; border-color: var(--warning); background: rgba(245, 158, 11, 0.05);">
                            <strong style="color: var(--warning); font-size: 15px; display: block; margin-bottom: 4px;">⚠️ Burnout Warning: Deadline is Tight</strong>
                            <p style="font-size: 13px;" id="ob-deadline-warning-text"></p>
                            <div style="display: flex; gap: 12px; margin-top: 12px;">
                                <button class="onboarding-btn onboarding-btn-primary" id="btn-use-rec-deadline" style="padding: 8px 16px; font-size: 12px; background: var(--warning); border: none;">Use Recommended Date</button>
                                <button class="onboarding-btn" id="btn-keep-original-deadline" style="padding: 8px 16px; font-size: 12px; background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border);">Keep Original Date</button>
                            </div>
                        </div>
                    </div>

                    <div class="onboarding-nav-btns" style="margin-top: 16px;">
                        <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                        <button class="onboarding-btn onboarding-btn-primary" id="btn-next" ${wizardState.start_date && wizardState.desired_deadline ? '' : 'disabled'}>Next</button>
                    </div>
                </div>
            `,
            // Step 13 (Q13) - Unavailable dates
            () => `
                <div class="onboarding-card">
                    <h2 class="onboarding-title" style="font-size: 28px; margin-bottom: 8px;">Step 13 — Unavailable Dates</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 24px;">Are there any dates you cannot work? (e.g. school, exams, vacations)</p>
                    
                    <div class="onboarding-form">
                        <div class="choices-grid" style="grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px;">
                            ${["Vacation", "School", "Exams", "Travel", "Holidays"].map(r => {
                                const isChecked = wizardState.unavailable_reasons.includes(r);
                                return `
                                    <button class="choice-button ob-q13-reason-btn ${isChecked ? 'selected' : ''}" data-val="${r}">${r}</button>
                                `;
                            }).join('')}
                        </div>
                        <div>
                            <label class="input-label">Custom Unavailable Dates (Comma-separated YYYY-MM-DD)</label>
                            <input type="text" id="ob-q13-custom-dates" class="text-input" placeholder="e.g. 2026-08-20, 2026-08-25" value="${wizardState.unavailable_dates_custom}">
                        </div>
                    </div>

                    <div class="onboarding-nav-btns" style="margin-top: 24px;">
                        <button class="onboarding-btn onboarding-btn-secondary" id="btn-back">Back</button>
                        <button class="onboarding-btn onboarding-btn-primary" id="btn-next">Generate Plan</button>
                    </div>
                </div>
            `,
            // Step 14 - AI Generation loading
            () => `
                <div class="onboarding-card" style="text-align: center;">
                    <div style="font-size: 48px; margin-bottom: 24px; animation: spin 2s linear infinite; display: inline-block;">⚙️</div>
                    <h2 class="onboarding-title" style="font-size: 26px;">Generating Your Custom Project OS</h2>
                    <p class="onboarding-subtitle" style="margin-bottom: 16px;">AI is scheduling daily pipeline tasks, inserting buffer rest days, and checking dependencies...</p>
                    
                    <div class="loading-steps-container" id="loading-steps">
                        <div class="loading-step-item active" id="loading-step-1">
                            <div class="loading-spinner-small"></div>
                            <span>Excluding completed phases...</span>
                        </div>
                        <div class="loading-step-item" id="loading-step-2">
                            <div style="width: 16px; height: 16px;"></div>
                            <span>Mapping daily schedule, skipping holidays & exam dates...</span>
                        </div>
                        <div class="loading-step-item" id="loading-step-3">
                            <div style="width: 16px; height: 16px;"></div>
                            <span>Structuring topological dependencies...</span>
                        </div>
                        <div class="loading-step-item" id="loading-step-4">
                            <div style="width: 16px; height: 16px;"></div>
                            <span>Finalizing dashboard workspace...</span>
                        </div>
                    </div>
                </div>
            `
        ];

        const renderStep = () => {
            container.innerHTML = steps[wizardState.step]();
            attachListeners();
        };

        const attachListeners = () => {
            const startBtn = document.getElementById('btn-start');
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    wizardState.step = 1;
                    renderStep();
                });
            }

            const nextBtn = document.getElementById('btn-next');
            const backBtn = document.getElementById('btn-back');

            // Step 1 check inputs listener
            const firstNameInput = document.getElementById('ob-first-name');
            const ageInput = document.getElementById('ob-age');
            const countryInput = document.getElementById('ob-country');
            const eduSelect = document.getElementById('ob-education');

            if (firstNameInput && ageInput && countryInput && eduSelect) {
                const checkInputs = () => {
                    const first = firstNameInput.value.trim();
                    const age = ageInput.value.trim();
                    const country = countryInput.value.trim();
                    const edu = eduSelect.value;
                    if (first && age && country && edu) {
                        nextBtn.disabled = false;
                    } else {
                        nextBtn.disabled = true;
                    }
                };
                firstNameInput.addEventListener('input', checkInputs);
                ageInput.addEventListener('input', checkInputs);
                countryInput.addEventListener('input', checkInputs);
                eduSelect.addEventListener('change', checkInputs);
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', async () => {
                    if (wizardState.step === 1) {
                        wizardState.firstName = document.getElementById('ob-first-name').value.trim();
                        wizardState.age = parseInt(document.getElementById('ob-age').value);
                        wizardState.country = document.getElementById('ob-country').value.trim();
                        wizardState.state = document.getElementById('ob-state').value.trim();
                        wizardState.education = document.getElementById('ob-education').value;
                        wizardState.step = 2;
                    } else if (wizardState.step === 2) {
                        careerFollowUpConfig = await getCareerConfig(wizardState.career, 'follow_up_questions');
                        wizardState.step = 3; // Q1
                    } else if (wizardState.step === 3) {
                        if (wizardState.experience_status === 'experienced' || wizardState.experience_status === 'pro') {
                            wizardState.step = 4; // Skip basics (Q2)
                        } else {
                            wizardState.journeyType = 'long';
                            wizardState.specificGoal = 'Become professional';
                            wizardState.step = 9; // Jump directly to Goals (Step 9 pacing rate index in array)
                        }
                    } else if (wizardState.step === 4) {
                        wizardState.journeyType = 'short';
                        wizardState.step = 5; 
                    } else if (wizardState.step === 5) {
                        wizardState.project_type = document.getElementById('ob-q3-type').value;
                        wizardState.chapters_count = parseInt(document.getElementById('ob-q4-count').value) || 5;
                        const pageInput = document.getElementById('ob-q5-pages');
                        if (pageInput) {
                            wizardState.pages_per_chapter = parseInt(pageInput.value) || 10;
                        }
                        wizardState.step = 6; 
                    } else if (wizardState.step === 6) {
                        wizardState.completed_stages = [];
                        document.querySelectorAll('.ob-q6-check:checked').forEach(cb => {
                            wizardState.completed_stages.push(cb.value);
                        });
                        
                        const isComic = wizardState.career === 'comic_creator';
                        const stagesList = isComic
                            ? ["Story outline", "World building", "Character descriptions", "Character designs", "Character reference sheets", "Chapter outlines", "Chapter dialogue", "Thumbnails", "Sketches", "Line art", "Coloring", "Lettering", "Cover", "Marketing assets"]
                            : ["Site analysis zoning", "Site mapping", "Conceptual massing forms", "Revit grids and levels", "Basic floor plan layouts", "Section wall details", "3D renderings", "Presentation sheets"];
                        wizardState.scheduled_stages = stagesList.filter(s => !wizardState.completed_stages.includes(s));
                        
                        wizardState.step = 7;
                    } else if (wizardState.step === 7) {
                        wizardState.scheduled_stages = [];
                        document.querySelectorAll('.ob-q7-check:checked').forEach(cb => {
                            wizardState.scheduled_stages.push(cb.value);
                        });
                        wizardState.step = 8; // Step 7.5 Planning depth (index 8)
                    } else if (wizardState.step === 8) {
                        // Depth captured. Step 9 is pacing rate
                        wizardState.step = 9;
                    } else if (wizardState.step === 9) {
                        wizardState.step = 10; 
                    } else if (wizardState.step === 10) {
                        wizardState.daily_hours = parseInt(document.getElementById('ob-q9-hours').value) || 3;
                        wizardState.weeklyHours = wizardState.daily_hours * wizardState.work_days.length;
                        wizardState.step = 11; 
                    } else if (wizardState.step === 11) {
                        wizardState.start_date = document.getElementById('ob-q11-start').value;
                        wizardState.desired_deadline = document.getElementById('ob-q12-end').value;
                        wizardState.step = 12;
                    } else if (wizardState.step === 12) {
                        wizardState.unavailable_dates_custom = document.getElementById('ob-q13-custom-dates').value;
                        wizardState.step = 13; // Loading screen
                    }
                    
                    renderStep();
                    
                    if (wizardState.step === 13) {
                        this.simulateAIGeneration(wizardState);
                    }
                });
            }

            if (backBtn) {
                backBtn.addEventListener('click', () => {
                    if (wizardState.step === 4) {
                        wizardState.step = 3;
                    } else if (wizardState.step === 5) {
                        wizardState.step = 4;
                    } else if (wizardState.step === 6) {
                        wizardState.step = 5;
                    } else if (wizardState.step === 7) {
                        wizardState.step = 6;
                    } else if (wizardState.step === 8) {
                        wizardState.step = 7;
                    } else if (wizardState.step === 9) {
                        if (wizardState.experience_status === 'experienced' || wizardState.experience_status === 'pro') {
                            wizardState.step = 8; // Back to Step 7.5 Planning depth
                        } else {
                            wizardState.step = 3; 
                        }
                    } else if (wizardState.step === 10) {
                        wizardState.step = 9;
                    } else if (wizardState.step === 11) {
                        wizardState.step = 10;
                    } else if (wizardState.step === 12) {
                        wizardState.step = 11;
                    } else if (wizardState.step === 13) {
                        wizardState.step = 12;
                    } else {
                        wizardState.step--;
                    }
                    renderStep();
                });
            }

            // Q2 - Target Goal click listeners
            document.querySelectorAll('.ob-q2-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.ob-q2-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    wizardState.specificGoal = btn.getAttribute('data-val');
                    nextBtn.disabled = false;
                });
            });

            // Q1 - Experience level select
            document.querySelectorAll('.ob-q1-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.ob-q1-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    wizardState.experience_status = btn.getAttribute('data-val');
                    nextBtn.disabled = false;
                });
            });

            // Q7.5 - Planning depth selection
            document.querySelectorAll('.ob-q75-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.ob-q75-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    wizardState.planning_depth = btn.getAttribute('data-val');
                });
            });

            // Q8 - Pacing rate selection
            document.querySelectorAll('.ob-q8-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.ob-q8-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    wizardState.pacing_rate = btn.getAttribute('data-val');
                });
            });

            // Q10 - Working Days toggle selection
            document.querySelectorAll('.ob-q10-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const day = btn.getAttribute('data-val');
                    btn.classList.toggle('selected');
                    if (btn.classList.contains('selected')) {
                        if (!wizardState.work_days.includes(day)) wizardState.work_days.push(day);
                    } else {
                        wizardState.work_days = wizardState.work_days.filter(d => d !== day);
                    }
                    if (wizardState.work_days.length > 0) {
                        nextBtn.disabled = false;
                    } else {
                        nextBtn.disabled = true;
                    }
                });
            });

            // Q12 - Start & End date pickers with validation
            const startInput = document.getElementById('ob-q11-start');
            const endInput = document.getElementById('ob-q12-end');
            const warningCard = document.getElementById('ob-deadline-warning-card');
            const warningText = document.getElementById('ob-deadline-warning-text');
            const useRecBtn = document.getElementById('btn-use-rec-deadline');
            const keepOrigBtn = document.getElementById('btn-keep-original-deadline');

            if (startInput && endInput) {
                const validateTimeline = () => {
                    if (!startInput.value || !endInput.value) return;
                    
                    const startD = new Date(startInput.value);
                    const endD = new Date(endInput.value);
                    const diffTime = endD - startD;
                    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

                    let totalHours = 40;
                    if (wizardState.career === 'comic_creator') {
                        const ch = wizardState.chapters_count;
                        const pg = wizardState.pages_per_chapter;
                        totalHours = ch * pg * 4; 
                    } else {
                        const sheets = wizardState.chapters_count;
                        totalHours = sheets * 12; 
                    }

                    const totalStages = wizardState.career === 'comic_creator' ? 14 : 8;
                    const deductionPct = wizardState.completed_stages.length / totalStages;
                    totalHours = Math.max(10, Math.round(totalHours * (1 - deductionPct * 0.8)));

                    const weeklyAvailability = wizardState.daily_hours * wizardState.work_days.length;
                    const weeksRequired = Math.ceil(totalHours / weeklyAvailability);

                    const recDate = new Date(startD);
                    recDate.setDate(recDate.getDate() + (weeksRequired * 7));
                    wizardState.realistic_deadline = recDate.toISOString().split('T')[0];

                    if (diffWeeks < weeksRequired) {
                        wizardState.deadline_warning_active = true;
                        warningText.innerHTML = `This project pipeline contains roughly <strong>${totalHours} hours</strong> of practice and detailing tasks. 
                        At your focus commitment of <strong>${weeklyAvailability}h/week</strong>, it will take at least <strong>${weeksRequired} weeks</strong>.
                        <br><br>Your chosen target timeline is only <strong>${diffWeeks} weeks</strong>. We recommend adjusting your deadline to <strong>${wizardState.realistic_deadline}</strong>.`;
                        warningCard.style.display = 'block';
                    } else {
                        wizardState.deadline_warning_active = false;
                        warningCard.style.display = 'none';
                    }
                };

                startInput.addEventListener('change', () => {
                    wizardState.start_date = startInput.value;
                    validateTimeline();
                    if (wizardState.start_date && wizardState.desired_deadline) {
                        nextBtn.disabled = false;
                    } else {
                        nextBtn.disabled = true;
                    }
                });
                endInput.addEventListener('change', () => {
                    wizardState.desired_deadline = endInput.value;
                    validateTimeline();
                    if (wizardState.start_date && wizardState.desired_deadline) {
                        nextBtn.disabled = false;
                    } else {
                        nextBtn.disabled = true;
                    }
                });

                if (useRecBtn) {
                    useRecBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        endInput.value = wizardState.realistic_deadline;
                        wizardState.desired_deadline = wizardState.realistic_deadline;
                        warningCard.style.display = 'none';
                        wizardState.deadline_warning_active = false;
                        nextBtn.disabled = false;
                    });
                }
                if (keepOrigBtn) {
                    keepOrigBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        warningCard.style.display = 'none';
                        wizardState.deadline_warning_active = false;
                        nextBtn.disabled = false;
                    });
                }
            }

            // Q13 - Unavailable dates checklist
            document.querySelectorAll('.ob-q13-reason-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const reason = btn.getAttribute('data-val');
                    btn.classList.toggle('selected');
                    if (btn.classList.contains('selected')) {
                        if (!wizardState.unavailable_reasons.includes(reason)) wizardState.unavailable_reasons.push(reason);
                    } else {
                        wizardState.unavailable_reasons = wizardState.unavailable_reasons.filter(r => r !== reason);
                    }
                });
            });

            // Autocomplete Selector for Step 2
            const searchInput = document.getElementById('ob-career-search');
            const dropdown = document.getElementById('ob-career-dropdown');
            const unsupportedWarning = document.getElementById('ob-unsupported-warning');

            if (searchInput) {
                const careersList = [
                    { name: 'Architecture', id: 'architecture' },
                    { name: 'Comic Creator', id: 'comic_creator' },
                    { name: 'Doctor', id: 'doctor', unsupported: true },
                    { name: 'Lawyer', id: 'lawyer', unsupported: true },
                    { name: 'Software Engineer', id: 'software_engineer', unsupported: true },
                    { name: 'Game Developer', id: 'game_developer', unsupported: true },
                    { name: 'Animator', id: 'animator', unsupported: true },
                    { name: 'Film Director', id: 'film_director', unsupported: true }
                ];

                searchInput.addEventListener('input', () => {
                    const q = searchInput.value.toLowerCase().trim();
                    if (!q) {
                        dropdown.style.display = 'none';
                        unsupportedWarning.style.display = 'none';
                        nextBtn.disabled = true;
                        return;
                    }

                    const matches = careersList.filter(c => c.name.toLowerCase().includes(q));
                    
                    if (matches.length > 0) {
                        dropdown.innerHTML = matches.map(c => `
                            <div class="autocomplete-item" data-id="${c.id}" data-unsupported="${c.unsupported ? 'true' : 'false'}">
                                ${c.name} ${c.unsupported ? '<span style="color: var(--warning); font-size: 11px;">(Soon)</span>' : ''}
                            </div>
                        `).join('');
                        dropdown.style.display = 'block';
                    } else {
                        dropdown.innerHTML = `
                            <div class="autocomplete-item" data-id="other" data-unsupported="true">
                                "${searchInput.value}" <span style="color: var(--warning); font-size: 11px;">(Coming Soon)</span>
                            </div>
                        `;
                        dropdown.style.display = 'block';
                    }
                });

                dropdown.addEventListener('click', (e) => {
                    const item = e.target.closest('.autocomplete-item');
                    if (item) {
                        const name = item.textContent.replace('(Soon)', '').trim();
                        const isUnsupported = item.getAttribute('data-unsupported') === 'true';
                        
                        searchInput.value = name;
                        dropdown.style.display = 'none';

                        if (isUnsupported) {
                            unsupportedWarning.style.display = 'block';
                            nextBtn.disabled = true;
                        } else {
                            unsupportedWarning.style.display = 'none';
                            wizardState.career = item.getAttribute('data-id');
                            nextBtn.disabled = false;
                        }
                    }
                });
            }
        };

        renderStep();
    }

    calculateJourneyRecommendation(state) {
        if (state.experience_status === 'new') {
            return {
                type: 'long',
                explanation: `Based on your selection (Completely new), we recommend a **Long-Term Journey** to systematically build your skills over several multi-year stages.`
            };
        }
        return {
            type: 'short',
            explanation: `Based on your selection (Experienced) and goal (**${state.specificGoal}**), we recommend a **Short-Term Journey** focusing heavily on calendar scheduling and project execution.`
        };
    }

    simulateAIGeneration(state) {
        const setStepState = (stepIndex, status) => {
            const el = document.getElementById(`loading-step-${stepIndex}`);
            if (!el) return;
            
            if (status === 'active') {
                el.classList.add('active');
                el.querySelector('div').className = 'loading-spinner-small';
            } else if (status === 'completed') {
                el.classList.remove('active');
                el.classList.add('completed');
                el.querySelector('div').className = 'loading-checkmark-small';
                el.querySelector('div').innerText = '✓';
            }
        };

        setTimeout(async () => {
            setStepState(1, 'completed');
            setStepState(2, 'active');
            
            setTimeout(async () => {
                setStepState(2, 'completed');
                setStepState(3, 'active');
                
                await generateCalendarSchedule(state);
                
                setTimeout(() => {
                    setStepState(3, 'completed');
                    setStepState(4, 'active');
                    
                    setTimeout(() => {
                        setStepState(4, 'completed');
                        
                        saveUserOnboarding(state);
                        
                        document.getElementById('onboarding-container').style.display = 'none';
                        document.querySelector('.app-container').style.display = 'flex';
                        this.init(); 

                    }, 1200);
                }, 1200);
            }, 1200);
        }, 1200);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
