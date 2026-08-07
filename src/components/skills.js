import { getRoadmap } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'skills-view';

        container.innerHTML = `
            <style>
                .skills-grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 24px; }
                .skill-progress-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; height: 180px; transition: var(--transition); }
                .skill-progress-card:hover { transform: translateY(-4px); border-color: var(--secondary); box-shadow: 0 8px 24px rgba(45, 212, 191, 0.15); }
                .skill-card-title { font-size: 18px; font-weight: 600; color: white; margin-bottom: 8px; }
                .skill-card-subtitle { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 16px; }
                .progress-percent { font-size: 28px; font-weight: 700; color: var(--secondary); margin-bottom: 8px; font-family: var(--font-heading); }
            </style>

            <div>
                <h2>Skills Dashboard</h2>
                <p class="text-muted">High-level view of your core competency progress across all stages.</p>
            </div>

            <div class="skills-grid-view" id="skills-grid-view">
                <div style="text-align: center; color: var(--text-muted);">Loading skills...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const grid = document.getElementById('skills-grid-view');
        const roadmap = await getRoadmap();

        if (!roadmap.stages || roadmap.stages.length === 0) {
            grid.innerHTML = '<div style="color: var(--text-muted);">No skills setup yet.</div>';
            return;
        }

        let html = '';
        roadmap.stages.forEach(stage => {
            stage.skills.forEach(skill => {
                const progress = skill.progress || 0;
                const percent = Math.round((progress / skill.lessons) * 100);
                html += `
                    <div class="skill-progress-card">
                        <div>
                            <div class="skill-card-title">${skill.name}</div>
                            <div class="skill-card-subtitle">Part of: ${stage.name}</div>
                        </div>
                        <div>
                            <div class="progress-percent">${percent}%</div>
                            <div class="progressbar-bg" style="height: 6px;">
                                <div class="progressbar-fill" style="width: ${percent}%;"></div>
                            </div>
                        </div>
                    </div>
                `;
            });
        });

        grid.innerHTML = html || '<div style="color: var(--text-muted);">No skills found.</div>';
    }
};
