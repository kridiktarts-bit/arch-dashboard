import { getRoadmap, updateSkillProgress, getUserOnboarding, getTasks, updateTaskStatus } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'learning-path-view fade-in';

        const onboarding = getUserOnboarding() || { journeyType: 'long' };
        const isProfessional = onboarding.journeyType === 'short';

        const pageTitle = isProfessional ? '🛠️ Production Tracker' : '🗺️ Learning Path';
        const pageSubtitle = isProfessional 
            ? 'Monitor feature sprints, production phases, and project milestones.' 
            : 'Master stages of core skills and complete learning exercises.';

        container.innerHTML = `
            <style>
                .stages-list { display: flex; flex-direction: column; gap: 32px; margin-top: 24px; }
                .stage-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
                .stage-card-header { border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
                .stage-title { font-size: 20px; font-weight: 700; color: white; }
                .stage-timeframe { font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); font-weight: 600; }
                
                .skills-grid { display: grid; grid-template-columns: 1fr; gap: 24px; }
                @media (min-width: 768px) {
                    .skills-grid { grid-template-columns: repeat(2, 1fr); }
                }
                
                .skill-box { background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; transition: var(--transition); }
                .skill-box:hover { border-color: rgba(45, 212, 191, 0.4); }
                .skill-box-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .skill-title { font-size: 16px; font-weight: 600; color: white; }
                
                .progress-row { display: flex; justify-content: space-between; font-size: 13px; color: var(--text-muted); margin-bottom: 8px; }
                .progress-bar-container { height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; margin-bottom: 16px; }
                .progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--primary), var(--secondary)); border-radius: 3px; transition: width 0.3s ease; }
                
                .skill-details-section { font-size: 13px; color: var(--text-muted); margin-bottom: 12px; line-height: 1.5; }
                .skill-details-section strong { color: #cbd5e1; }
                .skill-details-list { list-style: none; margin-top: 4px; padding-left: 0; }
                .skill-details-list li { position: relative; padding-left: 14px; margin-bottom: 4px; }
                .skill-details-list li::before { content: '•'; position: absolute; left: 0; color: var(--secondary); }
                
                .skill-actions-row { display: flex; gap: 8px; margin-top: auto; }

                /* Production styles */
                .prod-task-row { display: flex; align-items: center; justify-content: space-between; background: rgba(0,0,0,0.2); border: 1px solid var(--border); padding: 14px 18px; border-radius: 8px; margin-bottom: 10px; transition: var(--transition); }
                .prod-task-row:hover { border-color: var(--primary); }
                .prod-task-row.completed { border-color: var(--success); opacity: 0.7; }
                .prod-task-row.completed .prod-task-title { text-decoration: line-through; color: var(--text-muted); }
                .prod-task-title { font-weight: 600; font-size: 14px; color: white; }
                .prod-task-meta { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; }
            </style>

            <div>
                <h2>${pageTitle}</h2>
                <p class="text-muted">${pageSubtitle}</p>
            </div>

            <div class="stages-list" id="stages-list-container">
                <div style="text-align: center; color: var(--text-muted); padding: 40px 0;">Loading dashboard roadmap...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const container = document.getElementById('stages-list-container');
        const onboarding = getUserOnboarding() || { journeyType: 'long' };
        const isProfessional = onboarding.journeyType === 'short';

        const renderPath = async () => {
            if (isProfessional) {
                // PROFESSIONAL PRODUCTION TRACKER
                const tasks = await getTasks();
                
                // Group tasks by phaseName
                const groupedPhases = {};
                tasks.forEach(t => {
                    if (t.type === 'personal' || t.type === 'reminder') return; // Hide non-AI tasks
                    const phase = t.phaseName || "Project Pipeline";
                    if (!groupedPhases[phase]) groupedPhases[phase] = [];
                    groupedPhases[phase].push(t);
                });

                const phasesKeys = Object.keys(groupedPhases);
                if (phasesKeys.length === 0) {
                    container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 40px 0;">No production tasks scheduled yet. Open Calendar to get started!</div>';
                    return;
                }

                container.innerHTML = phasesKeys.map((phase, idx) => {
                    const phaseTasks = groupedPhases[phase];
                    const completedCount = phaseTasks.filter(t => t.status === 'completed').length;
                    const percent = Math.round((completedCount / phaseTasks.length) * 100);

                    const tasksHtml = phaseTasks.map(t => {
                        const isComp = t.status === 'completed';
                        return `
                            <div class="prod-task-row ${isComp ? 'completed' : ''}" data-id="${t.id}">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <input type="checkbox" class="prod-task-check" data-id="${t.id}" ${isComp ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer; accent-color: var(--success);">
                                    <span class="prod-task-title">${t.title}</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <span style="font-size: 12px; color: var(--text-muted);">⏱️ ${t.durationHours} hrs</span>
                                    <span class="prod-task-meta" style="color: ${isComp ? 'var(--success)' : 'var(--primary)'};">${t.status}</span>
                                </div>
                            </div>
                        `;
                    }).join('');

                    return `
                        <div class="stage-card">
                            <div class="stage-card-header">
                                <div>
                                    <h3 class="stage-title">Phase ${idx + 1}: ${phase}</h3>
                                    <p class="text-muted" style="margin-top: 4px; font-size: 13px;">Production roadmap progress and feature deliverables.</p>
                                </div>
                                <div style="text-align: right;">
                                    <div class="stage-timeframe" style="color: var(--success);">${percent}% Completed</div>
                                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 4px;">${completedCount} / ${phaseTasks.length} tasks</div>
                                </div>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 8px;">
                                ${tasksHtml}
                            </div>
                        </div>
                    `;
                }).join('');

                // Connect checkboxes
                document.querySelectorAll('.prod-task-check').forEach(cb => {
                    cb.addEventListener('change', async () => {
                        const id = cb.getAttribute('data-id');
                        const status = cb.checked ? 'completed' : 'pending';
                        await updateTaskStatus(id, status);
                        await renderPath();
                    });
                });

            } else {
                // BEGINNER STUDY ROADMAP
                const roadmap = await getRoadmap();
                
                if (!roadmap.stages || roadmap.stages.length === 0) {
                    container.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 40px 0;">No stages configured for this career path yet.</div>';
                    return;
                }

                container.innerHTML = roadmap.stages.map((stage, idx) => {
                    const skillsHtml = stage.skills.map(skill => {
                        const progress = skill.progress || 0;
                        const percent = Math.round((progress / skill.lessons) * 100);
                        
                        return `
                            <div class="skill-box" data-stage="${stage.id}" data-skill="${skill.name}">
                                <div class="skill-box-header">
                                    <div class="skill-title">${skill.name}</div>
                                </div>
                                <div class="progress-row">
                                    <span>Progress</span>
                                    <strong>${progress} / ${skill.lessons} Units (${percent}%)</strong>
                                </div>
                                <div class="progress-bar-container">
                                    <div class="progress-bar-fill" style="width: ${percent}%;"></div>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; margin-top: 10px; border-bottom: 1px solid var(--border); padding-bottom: 10px; margin-bottom: 10px;">
                                    <div><span style="color: var(--text-muted);">⏱️ Est. Duration:</span> <strong style="color: white;">${skill.estimatedHours || '40 Hours'}</strong></div>
                                    <div><span style="color: var(--text-muted);">🏆 Milestone:</span> <strong style="color: var(--secondary);">${skill.relatedMilestone || 'Coursework Completion'}</strong></div>
                                </div>
                                
                                <div class="skill-details-section">
                                    <strong>Recommended Resources:</strong>
                                    <ul class="skill-details-list">
                                        ${(skill.resources || []).map(r => `<li>${r}</li>`).join('')}
                                    </ul>
                                </div>
                                
                                <div class="skill-details-section">
                                    <strong>Practice Exercises:</strong>
                                    <ul class="skill-details-list">
                                        ${(skill.exercises || []).map(e => `<li>${e}</li>`).join('')}
                                    </ul>
                                </div>

                                <div class="skill-actions-row">
                                    <button class="btn btn-primary add-lesson-btn" style="padding: 6px 12px; font-size: 12px;">+1 Unit</button>
                                    <button class="btn sub-lesson-btn" style="padding: 6px 12px; font-size: 12px; background: rgba(255,255,255,0.05); border: 1px solid var(--border);" ${progress <= 0 ? 'disabled' : ''}>-1 Unit</button>
                                </div>
                            </div>
                        `;
                    }).join('');

                    return `
                        <div class="stage-card">
                            <div class="stage-card-header">
                                <div>
                                    <h3 class="stage-title">Stage ${idx + 1}: ${stage.name}</h3>
                                    <p class="text-muted" style="margin-top: 4px; font-size: 14px;">${stage.description}</p>
                                </div>
                                <div class="stage-timeframe">${stage.timeframe || ''}</div>
                            </div>
                            <div class="skills-grid">
                                ${skillsHtml}
                            </div>
                        </div>
                    `;
                }).join('');

                document.querySelectorAll('.skill-box').forEach(box => {
                    const stageId = box.getAttribute('data-stage');
                    const skillName = box.getAttribute('data-skill');
                    const addBtn = box.querySelector('.add-lesson-btn');
                    const subBtn = box.querySelector('.sub-lesson-btn');

                    addBtn.addEventListener('click', async () => {
                        await updateSkillProgress(stageId, skillName, 1);
                        await renderPath();
                    });

                    subBtn.addEventListener('click', async () => {
                        await updateSkillProgress(stageId, skillName, -1);
                        await renderPath();
                    });
                });
            }
        };

        await renderPath();
    }
};
