import { getAxp, getProjects, getTasks } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'dashboard-view';

        container.innerHTML = `
            <style>
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 24px; margin-top: 32px; }
                .stat-card { padding: 32px; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.1); display: flex; flex-direction: column; position: relative; overflow: hidden; transition: var(--transition); }
                .stat-card:hover { transform: translateY(-4px); border-color: var(--primary); box-shadow: 0 10px 30px -10px var(--primary-glow); }
                
                /* Adding the new dark overlays over the user's images for readability */
                .stat-card::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(10, 25, 47, 0.9), rgba(10, 25, 47, 0.7)); z-index: 1; pointer-events: none; }
                
                .stat-card > * { position: relative; z-index: 2; }
                .stat-icon { font-size: 24px; margin-bottom: 16px; background: rgba(59, 130, 246, 0.1); width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border-radius: 12px; color: var(--primary); border: 1px solid rgba(59, 130, 246, 0.2); }
                .stat-value { font-size: 42px; font-weight: 700; font-family: var(--font-heading); background: linear-gradient(135deg, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
                .stat-label { font-size: 14px; color: #94a3b8; font-weight: 500; letter-spacing: 0.5px; text-transform: uppercase; }
                
                .welcome-banner { background: linear-gradient(90deg, rgba(10, 25, 47, 0.8), rgba(10, 25, 47, 0)), url('assets/media__1778715516482.jpg') center/cover; border-radius: 16px; padding: 40px; border: 1px solid var(--border); margin-top: 24px; }
            </style>

            <div class="welcome-banner">
                <h1 style="font-size: 32px; margin-bottom: 8px; color: white;">Welcome back, Mariam.</h1>
                <p style="color: #cbd5e1; font-size: 18px; max-width: 600px; line-height: 1.5;">First-generation City College freshman. Future licensed architect. Ready to build the future.</p>
            </div>

            <div class="stats-grid" id="dashboard-stats-grid">
                <div style="text-align: center; width: 100%; color: var(--text-muted); grid-column: 1 / -1; padding: 40px;">Calculating live stats from cloud...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const grid = document.getElementById('dashboard-stats-grid');
        
        try {
            // Fetch all live data simultaneously
            const [axp, projects, tasks] = await Promise.all([
                getAxp(),
                getProjects(),
                getTasks()
            ]);

            const totalHours = axp ? axp.currentTotal : 0;
            const projectCount = projects.filter(p => p.status === 'In Progress').length;
            const completedProjects = projects.filter(p => p.status === 'Completed').length;
            const pendingTasks = tasks.filter(t => t.status !== 'completed').length;

            grid.innerHTML = `
                <div class="stat-card" style="background: url('assets/media__1778714671694.jpg') center/cover;">
                    <div class="stat-icon">⏱️</div>
                    <div class="stat-value">${totalHours}</div>
                    <div class="stat-label">NCARB Hours Logged</div>
                </div>
                <div class="stat-card" style="background: url('assets/media__1778714721667.jpg') center/cover;">
                    <div class="stat-icon">🏗️</div>
                    <div class="stat-value">${projectCount}</div>
                    <div class="stat-label">Projects In Progress</div>
                </div>
                <div class="stat-card" style="background: url('assets/media__1778714671703.jpg') center/cover;">
                    <div class="stat-icon">📝</div>
                    <div class="stat-value">${pendingTasks}</div>
                    <div class="stat-label">Tasks Pending</div>
                </div>
            `;

            // Milestone Moments Logic
            const checkMilestones = () => {
                const toastContainer = document.getElementById('modal-container');
                let milestoneMsg = null;
                
                if (totalHours >= 100 && !localStorage.getItem('milestone_100_axp')) {
                    milestoneMsg = "🏆 MILESTONE UNLOCKED: 100 AXP Hours! You are officially on the path to licensure.";
                    localStorage.setItem('milestone_100_axp', 'true');
                } else if (completedProjects >= 1 && !localStorage.getItem('milestone_first_proj')) {
                    milestoneMsg = "🏆 MILESTONE UNLOCKED: First Project Completed! Your portfolio is growing.";
                    localStorage.setItem('milestone_first_proj', 'true');
                }
                
                if (milestoneMsg && toastContainer) {
                    const toast = document.createElement('div');
                    toast.style.cssText = `
                        position: fixed; top: 24px; left: 50%; transform: translateX(-50%);
                        background: linear-gradient(135deg, rgba(234, 179, 8, 0.2), rgba(0,0,0,0.8));
                        border: 1px solid #eab308; padding: 16px 32px; border-radius: 24px; color: white;
                        font-weight: 600; z-index: 1000; box-shadow: 0 10px 30px rgba(234, 179, 8, 0.2);
                        backdrop-filter: blur(10px); animation: slideDown 0.5s ease forwards;
                    `;
                    toast.innerHTML = milestoneMsg;
                    toastContainer.appendChild(toast);
                    
                    // Add animation styles dynamically if not present
                    if (!document.getElementById('milestone-style')) {
                        const style = document.createElement('style');
                        style.id = 'milestone-style';
                        style.innerHTML = '@keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }';
                        document.head.appendChild(style);
                    }

                    setTimeout(() => {
                        toast.style.animation = 'slideDown 0.5s ease reverse forwards';
                        setTimeout(() => toast.remove(), 500);
                    }, 5000);
                }
            };
            
            // Check after a short delay for dramatic effect
            setTimeout(checkMilestones, 1000);

        } catch (e) {
            console.error("Failed to load dashboard stats", e);
            grid.innerHTML = '<div style="color: var(--warning); padding: 20px;">Could not load stats. Check database connection.</div>';
        }
    }
};
