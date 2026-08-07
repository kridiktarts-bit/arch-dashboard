import { getRoadmap, getMilestones, getTasks, getUserOnboarding, updateTaskStatus, getCareerConfig } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'dashboard-view';

        container.innerHTML = `
            <style>
                .welcome-banner { 
                    background: linear-gradient(90deg, rgba(10, 25, 47, 0.9), rgba(10, 25, 47, 0.5)), url('assets/media__1778715516482.jpg') center/cover; 
                    border-radius: 16px; 
                    padding: 32px; 
                    border: 1px solid var(--border); 
                    margin-top: 24px; 
                    position: relative;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                }
                
                .welcome-banner::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(6, 14, 23, 0.85), rgba(6, 14, 23, 0.4));
                    z-index: 1;
                }
                
                .welcome-banner > * {
                    position: relative;
                    z-index: 2;
                }
                
                .dashboard-grid-layout {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 20px;
                    margin-top: 24px;
                }
                
                @media (min-width: 768px) {
                    .dashboard-grid-layout {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
                
                @media (min-width: 1200px) {
                    .dashboard-grid-layout {
                        grid-template-columns: repeat(3, 1fr);
                    }
                }
                
                .panel-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--border);
                    border-radius: 12px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: var(--shadow);
                    backdrop-filter: blur(10px);
                }
                
                .panel-header {
                    font-size: 16px;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    padding-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .stat-value {
                    font-size: 32px;
                    font-weight: 800;
                    color: white;
                    margin: 8px 0;
                    font-family: var(--font-heading);
                    text-shadow: 0 2px 10px rgba(45, 212, 191, 0.2);
                }
                
                .stat-label {
                    font-size: 12px;
                    color: var(--text-muted);
                    text-transform: uppercase;
                    font-weight: 600;
                    letter-spacing: 0.5px;
                }
                
                .tasks-checklist {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .task-item-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--border);
                    padding: 10px 14px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: var(--transition);
                }
                
                .task-item-row:hover {
                    border-color: var(--primary);
                    background: rgba(255,255,255,0.02);
                }
                
                .task-item-row.checked {
                    opacity: 0.6;
                    border-color: var(--success);
                }
                
                .task-item-row.checked span {
                    text-decoration: line-through;
                    color: var(--text-muted);
                }
                
                .task-checkbox-bubble {
                    width: 18px;
                    height: 18px;
                    border: 2px solid var(--border);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: var(--success);
                    font-weight: bold;
                    transition: var(--transition);
                }
                
                .task-item-row.checked .task-checkbox-bubble {
                    border-color: var(--success);
                    background: rgba(45, 212, 191, 0.1);
                }
                
                .skill-badge {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 12px;
                    background: rgba(0,0,0,0.2);
                    border-radius: 6px;
                    margin-bottom: 8px;
                    font-size: 13px;
                }
                
                .progress-capsule {
                    height: 6px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-top: 12px;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, var(--primary), var(--secondary));
                }
            </style>

            <div class="welcome-banner" id="dashboard-welcome-banner">
                <h1 style="font-size: 28px; margin-bottom: 6px; color: white;" id="welcome-title">Loading OS Workspace...</h1>
                <p style="color: #cbd5e1; font-size: 16px; max-width: 600px; line-height: 1.4;" id="welcome-subtitle"></p>
            </div>

            <div class="dashboard-grid-layout" id="dashboard-widgets-container">
                <!-- Dynamically assembled cards based on survey profile -->
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const onboarding = getUserOnboarding();
        if (!onboarding) return;

        const career = onboarding.career;
        const isProfessional = onboarding.experience_status === 'experienced' || onboarding.experience_status === 'pro';
        const navKey = isProfessional ? 'professional' : 'beginner';

        const tasks = await getTasks();
        const roadmap = await getRoadmap();
        const welcomeTitle = document.getElementById('welcome-title');
        const welcomeSubtitle = document.getElementById('welcome-subtitle');

        const careerNames = {
            comic_creator: 'Comic Creator',
            architecture: 'Architect',
            software_engineer: 'Software Engineer',
            game_developer: 'Game Developer',
            animator: 'Animator',
            film_director: 'Film Director',
            doctor: 'Doctor',
            lawyer: 'Lawyer'
        };
        const cName = careerNames[career] || career;

        if (welcomeTitle) {
            if (career === 'doctor') {
                welcomeTitle.innerText = `Medical OS: Dr. ${onboarding.firstName}`;
            } else {
                welcomeTitle.innerText = `OS Workspace: ${onboarding.firstName}`;
            }
        }
        if (welcomeSubtitle) {
            if (career === 'doctor') {
                welcomeSubtitle.innerHTML = `<strong>Stage:</strong> ${onboarding.doc_stage || 'College Junior'} | <strong>Specialty:</strong> ${onboarding.doc_specialty || 'General Practice'} | <strong>Goal:</strong> ${onboarding.doc_goal === 'specific_goal' ? onboarding.doc_specific : 'Become licensed MD'} | <strong>Target:</strong> ${onboarding.desired_deadline}`;
            } else {
                welcomeSubtitle.innerText = isProfessional
                    ? `Active Production: ${onboarding.specificGoal || 'Finish Project Roadmap'}`
                    : `${cName} Study Tracker: Foundations & Fundamentals`;
            }
        }

        const getCareerUnitLabel = (c) => {
            const units = {
                comic_creator: 'chapters',
                architecture: 'sheets',
                software_engineer: 'features',
                game_developer: 'levels',
                animator: 'scenes',
                film_director: 'scenes',
                doctor: 'rotations',
                lawyer: 'briefs'
            };
            return units[c] || 'tasks';
        };

        const getCareerSubUnitLabel = (c) => {
            const units = {
                comic_creator: 'pages',
                architecture: 'details',
                software_engineer: 'tests',
                game_developer: 'mechanics',
                animator: 'frames',
                film_director: 'shots',
                doctor: 'exam study days',
                lawyer: 'source documents'
            };
            return units[c] || 'units';
        };

        const careerOnboardingConfig = await getCareerConfig(career, 'onboarding');
        let widgetList = [];
        if (career === 'doctor') {
            widgetList = ["Practice Tracker", "Skill Tree", "Calendar", "Deadline Countdown", "Milestone Tracker", "AI Coach"];
        } else if (careerOnboardingConfig && careerOnboardingConfig.dashboardWidgets && careerOnboardingConfig.dashboardWidgets[navKey]) {
            widgetList = careerOnboardingConfig.dashboardWidgets[navKey];
        } else {
            widgetList = ["Calendar", "Milestones", "AI Coach"];
        }

        // Calculations
        const pipelineTasks = tasks.filter(t => t.title !== "Rest & Catch-up Day");
        const completedTasks = pipelineTasks.filter(t => t.status === 'completed');
        const pendingTasks = pipelineTasks.filter(t => t.status === 'pending');
        const progressPct = pipelineTasks.length > 0 ? Math.round((completedTasks.length / pipelineTasks.length) * 100) : 0;

        const startD = onboarding.start_date ? new Date(onboarding.start_date) : new Date();
        const endD = onboarding.desired_deadline ? new Date(onboarding.desired_deadline) : new Date();
        const diffTime = endD - new Date();
        const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

        const widgetsContainer = document.getElementById('dashboard-widgets-container');
        widgetsContainer.innerHTML = '';

        // Block Assembly Engine
        widgetList.forEach(widgetName => {
            const card = document.createElement('div');
            card.className = 'panel-card';

            switch (widgetName) {
                case "Learning Tracker":
                    card.innerHTML = `
                        <div class="panel-header">📚 Learning Tracker</div>
                        <div class="stat-label">Video courses and practice logged</div>
                        <div class="stat-value">28 Hours</div>
                        <div class="stat-label">Fundamentals Milestone</div>
                        <div class="progress-capsule">
                            <div class="progress-fill" style="width: 45%;"></div>
                        </div>
                    `;
                    break;
                case "Skill Tree":
                    {
                        const skillBadgesList = [];
                        if (roadmap && roadmap.stages) {
                            roadmap.stages.forEach(st => {
                                if (st.skills) {
                                    st.skills.forEach(sk => {
                                        if (skillBadgesList.length < 3) {
                                            const progress = sk.progress || 0;
                                            const percent = Math.round((progress / sk.lessons) * 100);
                                            skillBadgesList.push({ name: sk.name, percent });
                                        }
                                    });
                                }
                            });
                        }
                        
                        if (skillBadgesList.length === 0) {
                            skillBadgesList.push({ name: "Core Knowledge", percent: 0 });
                            skillBadgesList.push({ name: "Applied Practice", percent: 0 });
                            skillBadgesList.push({ name: "Project Completion", percent: 0 });
                        }

                        const badgesColors = ["var(--primary)", "var(--secondary)", "var(--success)"];
                        const badgesHtml = skillBadgesList.map((sk, idx) => `
                            <div class="skill-badge">
                                <span>${sk.name}</span>
                                <strong style="color: ${badgesColors[idx % 3]};">${sk.percent}%</strong>
                            </div>
                        `).join('');

                        card.innerHTML = `
                            <div class="panel-header">🌳 Competency Badges</div>
                            ${badgesHtml}
                        `;
                    }
                    break;
                case "Practice Tracker":
                    card.innerHTML = `
                        <div class="panel-header">⚡ Daily Practice Log</div>
                        <div class="stat-label">Focus execution today</div>
                        <div class="stat-value">${onboarding.daily_hours || 3} Hours</div>
                        <div class="stat-label">Required weekly focus: ${onboarding.weeklyHours || 15} hours</div>
                    `;
                    break;
                case "Habit Tracker":
                    card.innerHTML = `
                        <div class="panel-header">🎯 Routine Consistency</div>
                        <div style="display: flex; gap: 8px; margin-top: 12px;">
                            ${["M","T","W","T","F","S","S"].map((day, idx) => `
                                <div style="flex: 1; text-align: center; background: rgba(0,0,0,0.2); border: 1px solid var(--border); padding: 8px 4px; border-radius: 4px;">
                                    <div style="font-size: 11px; color: var(--text-muted);">${day}</div>
                                    <div style="font-size: 14px; margin-top: 4px; color: ${idx < 5 ? 'var(--success)' : 'var(--text-muted)'};">${idx < 5 ? '✓' : '○'}</div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                    break;
                case "Production Tracker":
                    {
                        const chFinished = Math.round(completedTasks.length / 3);
                        const chTotal = onboarding.chapters_count || 5;
                        const unitLabel = getCareerUnitLabel(career);
                        card.innerHTML = `
                            <div class="panel-header">⚙️ Project Pipeline</div>
                            <div class="stat-label">Active ${unitLabel} Completed</div>
                            <div class="stat-value">${chFinished} / ${chTotal}</div>
                            <div class="stat-label">Remaining target: ${Math.max(0, chTotal - chFinished)} ${unitLabel}</div>
                        `;
                    }
                    break;
                case "Chapter Progress":
                    {
                        const unitLabel = getCareerUnitLabel(career);
                        card.innerHTML = `
                            <div class="panel-header">📘 ${unitLabel} Status</div>
                            <div class="skill-badge">
                                <span>${unitLabel.substring(0, unitLabel.length - 1)} 1 (Execution)</span>
                                <strong style="color: var(--success);">90%</strong>
                            </div>
                            <div class="skill-badge">
                                <span>${unitLabel.substring(0, unitLabel.length - 1)} 2 (Review)</span>
                                <strong style="color: var(--primary);">40%</strong>
                            </div>
                            <div class="skill-badge">
                                <span>${unitLabel.substring(0, unitLabel.length - 1)} 3 (Delivery)</span>
                                <strong style="color: var(--warning);">10%</strong>
                            </div>
                        `;
                    }
                    break;
                case "Remaining Pages":
                    {
                        const pgTotal = (onboarding.chapters_count || 5) * (onboarding.pages_per_chapter || 10);
                        const pgRemaining = Math.max(0, Math.round(pgTotal * (1 - progressPct / 100)));
                        const subUnitLabel = getCareerSubUnitLabel(career);
                        card.innerHTML = `
                            <div class="panel-header">📄 ${subUnitLabel} Workflow</div>
                            <div class="stat-label">${subUnitLabel} remaining to complete</div>
                            <div class="stat-value">${pgRemaining} ${subUnitLabel}</div>
                            <div class="stat-label">Total scope: ${pgTotal} ${subUnitLabel}</div>
                        `;
                    }
                    break;
                case "Deadline Countdown":
                    card.innerHTML = `
                        <div class="panel-header">⏳ Timeline Deadline</div>
                        <div class="stat-label">Days remaining to target</div>
                        <div class="stat-value">${daysLeft} Days</div>
                        <div class="stat-label">Due: ${onboarding.desired_deadline}</div>
                    `;
                    break;
                case "Production Calendar":
                case "Calendar":
                    card.innerHTML = `
                        <div class="panel-header">📅 Today's Actions</div>
                        <div class="tasks-checklist" id="widget-checklist-container">
                            <!-- Checklist priorities -->
                        </div>
                    `;
                    break;
                case "Milestone Tracker":
                    card.innerHTML = `
                        <div class="panel-header">🏆 Achievements</div>
                        <div class="stat-label">Roadmap Progress</div>
                        <div class="stat-value">${progressPct}%</div>
                        <div class="progress-capsule">
                            <div class="progress-fill" style="width: ${progressPct}%;"></div>
                        </div>
                    `;
                    break;
                case "AI Coach":
                    {
                        const coachTips = {
                            comic_creator: "Try batching panel thumbnail layout sketching on Mondays!",
                            architecture: "Try reviewing local building zoning regulations on Mondays!",
                            software_engineer: "Try writing automated unit mock tests early in your sprints!",
                            game_developer: "Try greyboxing geometry levels layouts before coding physics!",
                            animator: "Try pencil testing rough keys bounce motions before rigging details!",
                            film_director: "Try blocking camera shot lists layouts before rehearsals!",
                            doctor: "Try reviews of clinical pharmacology interaction lists on Mondays!",
                            lawyer: "Try sorting key supreme court case precedents early in research!"
                        };
                        const tip = coachTips[career] || "Keep focus hours consistent across your tasks!";
                        card.innerHTML = `
                            <div class="panel-header">🤖 Mentor Guidance</div>
                            <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">Based on your focus pacing of <strong>${onboarding.daily_hours || 3}h/day</strong>, you are currently on track to reach your goals. ${tip}</p>
                        `;
                    }
                    break;
                case "AXP Tracker":
                    card.innerHTML = `
                        <div class="panel-header">⏱️ AXP Hour Progress</div>
                        <div class="skill-badge">
                            <span>Practice Management</span>
                            <strong>24 / 160h</strong>
                        </div>
                        <div class="skill-badge">
                            <span>Project Planning</span>
                            <strong>12 / 60h</strong>
                        </div>
                        <div class="skill-badge">
                            <span>Project Execution</span>
                            <strong>8 / 120h</strong>
                        </div>
                    `;
                    break;
                case "ARE Prep Tracker":
                    card.innerHTML = `
                        <div class="panel-header">📚 ARE Prep Progress</div>
                        <div class="skill-badge">
                            <span>Practice Management (PcM)</span>
                            <strong style="color: var(--success);">Passed</strong>
                        </div>
                        <div class="skill-badge">
                            <span>Project Management (PjM)</span>
                            <strong style="color: var(--primary);">45% study</strong>
                        </div>
                    `;
                    break;
                case "Applications Tracker":
                    card.innerHTML = `
                        <div class="panel-header">💼 Firms Job Hunt</div>
                        <div class="stat-label">Applications Sent</div>
                        <div class="stat-value">4 Logged</div>
                        <div class="stat-label">Interviews scheduled: 1 offer</div>
                    `;
                    break;
                default:
                    card.innerHTML = `<div class="panel-header">${widgetName}</div><p class="text-muted">Module details under construction.</p>`;
            }

            widgetsContainer.appendChild(card);
        });

        // Hydrate priorities checklist inside the Calendar widget if available
        const checklist = document.getElementById('widget-checklist-container');
        if (checklist) {
            if (pendingTasks.length === 0) {
                checklist.innerHTML = '<div style="color: var(--success); font-size: 13px; font-weight: 600;">✓ Priorities completed!</div>';
            } else {
                const todayStr = pendingTasks[0].startDate;
                const dailyTasks = tasks.filter(t => t.startDate === todayStr);
                checklist.innerHTML = dailyTasks.slice(0, 3).map(t => {
                    const isChecked = t.status === 'completed';
                    return `
                        <div class="task-item-row ${isChecked ? 'checked' : ''}" data-id="${t.id}">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <div class="task-checkbox-bubble">${isChecked ? '✓' : ''}</div>
                                <span style="font-size: 12px; color: white;">${t.title}</span>
                            </div>
                        </div>
                    `;
                }).join('');

                // Connect checkbox trigger refresh
                checklist.querySelectorAll('.task-item-row').forEach(row => {
                    row.addEventListener('click', async () => {
                        const id = row.getAttribute('data-id');
                        const task = tasks.find(item => item.id.toString() === id.toString());
                        if (task) {
                            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                            await updateTaskStatus(id, newStatus);
                            window.location.reload();
                        }
                    });
                });
            }
        }
    }
};
