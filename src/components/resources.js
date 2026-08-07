import { getRoadmap } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'resources-view';

        container.innerHTML = `
            <style>
                .resources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 24px; }
                .resource-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: var(--transition); }
                .resource-card:hover { border-color: var(--primary); transform: translateY(-2px); }
                .resource-category { font-size: 11px; text-transform: uppercase; color: var(--secondary); font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; }
                .resource-title { font-size: 16px; font-weight: 600; color: white; margin-bottom: 12px; }
                .resource-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
                .resource-item::before { content: '🔗'; font-size: 12px; }
            </style>

            <div>
                <h2>Learning Resources</h2>
                <p class="text-muted">Curated books, courses, and guides for your career skills.</p>
            </div>

            <div class="resources-grid" id="resources-grid">
                <div style="text-align: center; color: var(--text-muted);">Loading resources...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const grid = document.getElementById('resources-grid');
        const roadmap = await getRoadmap();
        
        if (!roadmap.stages || roadmap.stages.length === 0) {
            grid.innerHTML = '<div style="color: var(--text-muted);">No resources found.</div>';
            return;
        }

        let html = '';
        roadmap.stages.forEach(stage => {
            stage.skills.forEach(skill => {
                if (skill.resources && skill.resources.length > 0) {
                    html += `
                        <div class="resource-card">
                            <div class="resource-category">${stage.name}</div>
                            <div class="resource-title">${skill.name} Resources</div>
                            <div style="display: flex; flex-direction: column;">
                                ${skill.resources.map(res => `
                                    <div class="resource-item">
                                        <span style="color: #cbd5e1;">${res}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `;
                }
            });
        });

        grid.innerHTML = html || '<div style="color: var(--text-muted);">No resources linked in current roadmap.</div>';
    }
};
