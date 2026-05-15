import { getAxp, updateAxpCategory } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'axp-view';

        container.innerHTML = `
            <style>
                .axp-card { background: linear-gradient(rgba(10, 25, 47, 0.8), rgba(10, 25, 47, 0.9)), url('assets/media__1778714671694.jpg') center/cover; border-radius: 16px; padding: 32px; border: 1px solid rgba(45, 212, 191, 0.3); margin-top: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
                .progress-container { background: rgba(255,255,255,0.1); height: 12px; border-radius: 6px; overflow: hidden; margin: 16px 0; border: 1px solid rgba(255,255,255,0.1); }
                .progress-bar { height: 100%; background: linear-gradient(90deg, var(--primary), var(--accent)); transition: width 1s ease-in-out; }
                .axp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; margin-top: 32px; }
                .axp-category { background: rgba(0,0,0,0.4); padding: 20px; border-radius: 12px; border: 1px solid var(--border); backdrop-filter: blur(10px); }
                .category-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 12px; }
                .category-title { font-weight: 600; color: white; }
                .category-stats { font-size: 14px; color: var(--primary); font-family: var(--font-heading); }
                
                .log-hours-form { display: flex; gap: 12px; margin-top: 16px; align-items: center; }
                .log-hours-input { width: 80px; padding: 6px 10px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 4px; color: white; }
            </style>

            <div class="axp-card" id="axp-container">
                <div style="text-align: center; color: var(--text-muted);">Loading AXP from cloud...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const loadAndRenderAxp = async () => {
            const data = await getAxp();
            if (!data) return;

            const percent = Math.round((data.currentTotal / data.totalRequired) * 100) || 0;

            document.getElementById('axp-container').innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 style="color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">NCARB AXP Requirements</h2>
                    <div style="font-family: var(--font-heading); font-size: 24px; color: var(--primary); text-shadow: 0 0 10px var(--primary-glow);">${data.currentTotal} / ${data.totalRequired} Hrs</div>
                </div>
                
                <div class="progress-container">
                    <div class="progress-bar" style="width: ${percent}%"></div>
                </div>
                <div style="text-align: right; font-size: 14px; color: var(--text-muted);">${percent}% Complete</div>

                <div class="axp-grid">
                    ${data.categories.map(cat => {
                        const catPercent = Math.min(100, Math.round((cat.current / cat.required) * 100));
                        return `
                            <div class="axp-category">
                                <div class="category-header">
                                    <div class="category-title">${cat.name}</div>
                                    <div class="category-stats">${cat.current} / ${cat.required}</div>
                                </div>
                                <div class="progress-container" style="height: 6px; margin: 8px 0;">
                                    <div class="progress-bar" style="width: ${catPercent}%; background: ${catPercent >= 100 ? 'var(--success)' : 'var(--primary)'}"></div>
                                </div>
                                <div class="log-hours-form">
                                    <input type="number" class="log-hours-input" min="1" placeholder="Hours" data-cat="${cat.name}">
                                    <button class="btn btn-primary log-btn" style="padding: 4px 12px; font-size: 12px;" data-cat="${cat.name}">Log Hours</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;

            // Attach listeners to log buttons
            document.querySelectorAll('.log-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const catName = e.target.getAttribute('data-cat');
                    const input = document.querySelector(`input[data-cat="${catName}"]`);
                    const hours = parseInt(input.value);

                    if (hours > 0) {
                        e.target.textContent = '...';
                        await updateAxpCategory(catName, hours);
                        await loadAndRenderAxp();
                    }
                });
            });
        };

        await loadAndRenderAxp();
    }
};
