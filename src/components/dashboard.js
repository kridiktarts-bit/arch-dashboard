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
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 24px;
                    margin-top: 32px;
                }

                .panel-card {
                    background: var(--glass-bg);
                    border: 1px solid var(--border);
                    border-radius: 16px;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    transition: var(--transition);
                }
                .panel-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                }
                .panel-header {
                    font-size: 16px;
                    font-weight: 600;
                    color: white;
                    border-bottom: 1px solid var(--border);
                    padding-bottom: 12px;
                    margin-bottom: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .tasks-checklist {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }
                .task-item-row {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: rgba(0,0,0,0.2);
                    border: 1px solid var(--border);
                    border-radius: 8px;
                    cursor: pointer;
                    transition: var(--transition);
                }
                .task-item-row:hover {
                    border-color: var(--primary-glow);
                }
                .task-item-row.checked {
                    border-color: var(--success);
                    background: rgba(16, 185, 129, 0.03);
                }
                .task-item-row.checked span {
                    text-decoration: line-through;
                    color: var(--text-muted);
                }
                .task-checkbox-bubble {
                    width: 18px;
                    height: 18px;
                    border: 2px solid var(--primary);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: bold;
                    color: var(--primary);
                }
                .task-item-row.checked .task-checkbox-bubble {
                    background: var(--success);
                    border-color: var(--success);
                    color: black;
                }

                .stat-value {
                    font-size: 32px;
                    font-weight: bold;
                    color: white;
                    font-family: var(--font-heading);
                    margin: 8px 0;
                }
                .stat-label {
                    font-size: 12px;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .skill-badge {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid var(--border);
                    padding: 8px 12px;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    font-size: 13px;
                }

                .progress-capsule {
                    height: 6px;
                    background: var(--border);
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
        const welcomeTitle = document.getElementById('welcome-title');
        const welcomeSubtitle = document.getElementById('welcome-subtitle');

        if (welcomeTitle) welcomeTitle.innerText = `OS Workspace: ${onboarding.firstName}`;
        if (welcomeSubtitle) {
            welcomeSubtitle.innerText = isProfessional
                ? `Active Production: ${onboarding.specificGoal || 'Finish Chapter Roadmap'}`
                : `Career Study Tracker: Foundations & Fundamentals`;
        }

        // Get list of widgets from onboarding config
        const careerOnboardingConfig = await getCareerConfig(career, 'onboarding');
        let widgetList = [];
        if (careerOnboardingConfig && careerOnboardingConfig.dashboardWidgets && careerOnboardingConfig.dashboardWidgets[navKey]) {
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
                    card.innerHTML = `
                        <div class="panel-header">🌳 Competency Badges</div>
                        <div class="skill-badge">
                            <span>Anatomy Foundations</span>
                            <strong style="color: var(--primary);">40%</strong>
                        </div>
                        <div class="skill-badge">
                            <span>Perspective Grids</span>
                            <strong style="color: var(--secondary);">60%</strong>
                        </div>
                        <div class="skill-badge">
                            <span>Story Scripting</span>
                            <strong style="color: var(--success);">25%</strong>
                        </div>
                    `;
                    break;
                case "Practice Tracker":
                    card.innerHTML = `
                        <div class="panel-header">⚡ Daily Practice Log</div>
                        <div class="stat-label">Drawing execution today</div>
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
                    const chFinished = Math.round(completedTasks.length / 3);
                    const chTotal = onboarding.chapters_count || 5;
                    card.innerHTML = `
                        <div class="panel-header">⚙️ Comic Production</div>
                        <div class="stat-label">Active Chapters Completed</div>
                        <div class="stat-value">${chFinished} / ${chTotal}</div>
                        <div class="stat-label">Remaining target: ${Math.max(0, chTotal - chFinished)} chapters</div>
                    `;
                    break;
                case "Chapter Progress":
                    card.innerHTML = `
                        <div class="panel-header">📘 Chapter Status</div>
                        <div class="skill-badge">
                            <span>Chapter 1 (Coloring)</span>
                            <strong style="color: var(--success);">90%</strong>
                        </div>
                        <div class="skill-badge">
                            <span>Chapter 2 (Inking)</span>
                            <strong style="color: var(--primary);">40%</strong>
                        </div>
                        <div class="skill-badge">
                            <span>Chapter 3 (Dialogue)</span>
                            <strong style="color: var(--warning);">10%</strong>
                        </div>
                    `;
                    break;
                case "Remaining Pages":
                    const pgTotal = (onboarding.chapters_count || 5) * (onboarding.pages_per_chapter || 10);
                    const pgRemaining = Math.max(0, Math.round(pgTotal * (1 - progressPct / 100)));
                    card.innerHTML = `
                        <div class="panel-header">📄 Page Workflow</div>
                        <div class="stat-label">Pages remaining to draw</div>
                        <div class="stat-value">${pgRemaining} Pages</div>
                        <div class="stat-label">Total scope: ${pgTotal} pages</div>
                    `;
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
                    card.innerHTML = `
                        <div class="panel-header">🤖 Mentor Guidance</div>
                        <p style="font-size: 13px; color: var(--text-muted); line-height: 1.4;">Based on your focus pacing of <strong>${onboarding.daily_hours || 3}h/day</strong>, you are currently on track to reach your goals. Try batching dialogue writing tasks on Mondays!</p>
                    `;
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
