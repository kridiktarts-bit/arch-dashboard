import { getRoadmap, updateSkillProgress, getUserOnboarding } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'learning-path-view';

        const onboarding = getUserOnboarding() || { journeyType: 'long' };
        const pageTitle = onboarding.journeyType === 'short' ? 'Project Roadmap' : 'Learning Path';
        const pageSubtitle = onboarding.journeyType === 'short' 
            ? 'Master key project milestones and complete phases.' 
            : 'Master stages of core skills and complete learning exercises.';

        container.innerHTML = `
            <style>
                .stages-list { display: flex; flex-direction: column; gap: 32px; margin-top: 24px; }
                .stage-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
                .stage-card-header { border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
                .stage-title { font-size: 22px; font-weight: 700; color: white; }
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
            </style>

            <div>
                <h2>${pageTitle}</h2>
                <p class="text-muted">${pageSubtitle}</p>
            </div>

            <div class="stages-list" id="stages-list-container">
                <div style="text-align: center; color: var(--text-muted);">Loading stages...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const container = document.getElementById('stages-list-container');
        const onboarding = getUserOnboarding() || { journeyType: 'long' };
        
        const renderPath = async () => {
            const roadmap = await getRoadmap();
            
            if (!roadmap.stages || roadmap.stages.length === 0) {
                container.innerHTML = '<div style="color: var(--text-muted);">No stages configured for this career path yet.</div>';
                return;
            }

            container.innerHTML = roadmap.stages.map((stage, idx) => {
                const prefixLabel = onboarding.journeyType === 'short' ? 'Phase' : 'Stage';
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
                            
                            <div class="skill-details-section">
                                <strong>Recommended Resources:</strong>
                                <ul class="skill-details-list">
                                    ${skill.resources.map(r => `<li>${r}</li>`).join('')}
                                </ul>
                            </div>
                            
                            <div class="skill-details-section">
                                <strong>Practice Exercises:</strong>
                                <ul class="skill-details-list">
                                    ${skill.exercises.map(e => `<li>${e}</li>`).join('')}
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
                                <h3 class="stage-title">${prefixLabel} ${idx + 1}: ${stage.name}</h3>
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
        };

        await renderPath();
    }
};
