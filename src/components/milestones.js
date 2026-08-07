import { getMilestones, toggleMilestoneCompleted } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'milestones-view';

        container.innerHTML = `
            <style>
                .milestones-container { display: flex; flex-direction: column; gap: 24px; margin-top: 24px; }
                .milestone-item { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; align-items: center; gap: 20px; transition: var(--transition); }
                .milestone-item.completed { border-color: var(--success); background: rgba(16, 185, 129, 0.05); }
                .milestone-icon { font-size: 32px; width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.03); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; transition: var(--transition); }
                .milestone-item.completed .milestone-icon { background: rgba(16, 185, 129, 0.2); border-color: var(--success); }
                .milestone-info { flex: 1; }
                .milestone-title { font-size: 18px; font-weight: 600; color: white; margin-bottom: 4px; }
                .milestone-desc { font-size: 14px; color: var(--text-muted); }
                .milestone-req { font-size: 12px; color: var(--secondary); font-weight: 600; margin-top: 4px; text-transform: uppercase; }
                .milestone-checkbox { width: 28px; height: 28px; border-radius: 8px; border: 2px solid var(--border); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; color: white; transition: var(--transition); }
                .milestone-checkbox:hover { border-color: var(--primary); }
                .milestone-item.completed .milestone-checkbox { background: var(--success); border-color: var(--success); }
            </style>

            <div>
                <h2>Milestones & Achievements</h2>
                <p class="text-muted">Unlock milestones as you level up and complete stage deliverables.</p>
            </div>

            <div class="milestones-container" id="milestones-list">
                <div style="text-align: center; color: var(--text-muted);">Loading milestones...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const list = document.getElementById('milestones-list');
        
        const render = async () => {
            const milestones = await getMilestones();
            if (milestones.length === 0) {
                list.innerHTML = '<div style="color: var(--text-muted);">No milestones configured for this career path.</div>';
                return;
            }

            list.innerHTML = milestones.map(m => `
                <div class="milestone-item ${m.completed ? 'completed' : ''}" data-id="${m.id}">
                    <div class="milestone-icon">${m.icon || '🏆'}</div>
                    <div class="milestone-info">
                        <div class="milestone-title">${m.title}</div>
                        <div class="milestone-desc">${m.description}</div>
                        <div class="milestone-req">Requirement: ${m.requirement}</div>
                    </div>
                    <div class="milestone-checkbox">${m.completed ? '✓' : ''}</div>
                </div>
            `).join('');

            document.querySelectorAll('.milestone-item').forEach(card => {
                const id = card.getAttribute('data-id');
                const checkbox = card.querySelector('.milestone-checkbox');

                checkbox.addEventListener('click', async () => {
                    const completed = await toggleMilestoneCompleted(id);
                    card.classList.toggle('completed', completed);
                    checkbox.innerHTML = completed ? '✓' : '';
                    
                    // Show a level up celebrate toast if milestone completed
                    if (completed) {
                        const toastContainer = document.getElementById('modal-container');
                        if (toastContainer) {
                            const toast = document.createElement('div');
                            toast.style.cssText = `
                                position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
                                background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(0,0,0,0.8));
                                border: 1px solid var(--success); padding: 16px 32px; border-radius: 24px; color: white;
                                font-weight: 600; z-index: 1000; box-shadow: 0 10px 30px rgba(16, 185, 129, 0.2);
                                backdrop-filter: blur(10px); animation: slideDown 0.5s ease forwards;
                            `;
                            toast.innerHTML = `🎉 MILESTONE COMPLETED: ${card.querySelector('.milestone-title').textContent}!`;
                            toastContainer.appendChild(toast);
                            setTimeout(() => toast.remove(), 4000);
                        }
                    }
                });
            });
        };

        await render();
    }
};
