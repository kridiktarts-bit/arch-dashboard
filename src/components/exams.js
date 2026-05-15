export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'exams-view';

        container.innerHTML = `
            <style>
                .exam-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-top: 24px; }
                .exam-card { background: var(--glass-bg); border: 1px solid var(--border); padding: 24px; border-radius: 12px; display: flex; align-items: center; gap: 20px; transition: var(--transition); }
                .exam-card:hover { border-color: var(--primary); background: rgba(10, 25, 47, 0.8); }
                .exam-icon { width: 48px; height: 48px; border-radius: 12px; background: var(--bg-surface-elevated); display: flex; align-items: center; justify-content: center; font-size: 20px; border: 1px solid rgba(255,255,255,0.1); }
                .exam-info { flex: 1; }
                .exam-title { font-weight: 600; font-size: 16px; margin-bottom: 4px; }
                .exam-status { font-size: 12px; color: var(--text-muted); }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
                .status-locked { background: rgba(255,255,255,0.1); color: var(--text-muted); }
            </style>

            <div class="glass-card">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div>
                        <h2>Architect Registration Examination (ARE 5.0)</h2>
                        <p class="text-muted" style="margin-top: 8px;">After you complete your B.Arch and are logging your 3,740 hours, you'll need to pass these 6 divisions to become licensed.</p>
                    </div>
                </div>

                <div class="exam-grid">
                    <div class="exam-card">
                        <div class="exam-icon">🏢</div>
                        <div class="exam-info">
                            <div class="exam-title">Practice Management (PcM)</div>
                            <div class="exam-status">80 Items • 2 hr 40 min</div>
                        </div>
                        <div class="status-badge status-locked">Locked</div>
                    </div>
                    
                    <div class="exam-card">
                        <div class="exam-icon">📋</div>
                        <div class="exam-info">
                            <div class="exam-title">Project Management (PjM)</div>
                            <div class="exam-status">75 Items • 3 hr</div>
                        </div>
                        <div class="status-badge status-locked">Locked</div>
                    </div>

                    <div class="exam-card">
                        <div class="exam-icon">📊</div>
                        <div class="exam-info">
                            <div class="exam-title">Programming & Analysis (PA)</div>
                            <div class="exam-status">75 Items • 3 hr</div>
                        </div>
                        <div class="status-badge status-locked">Locked</div>
                    </div>

                    <div class="exam-card">
                        <div class="exam-icon">📐</div>
                        <div class="exam-info">
                            <div class="exam-title">Project Planning & Design (PPD)</div>
                            <div class="exam-status">100 Items • 4 hr 5 min</div>
                        </div>
                        <div class="status-badge status-locked">Locked</div>
                    </div>

                    <div class="exam-card">
                        <div class="exam-icon">🏗️</div>
                        <div class="exam-info">
                            <div class="exam-title">Project Development (PDD)</div>
                            <div class="exam-status">100 Items • 4 hr 5 min</div>
                        </div>
                        <div class="status-badge status-locked">Locked</div>
                    </div>

                    <div class="exam-card">
                        <div class="exam-icon">🚧</div>
                        <div class="exam-info">
                            <div class="exam-title">Construction & Evaluation (CE)</div>
                            <div class="exam-status">75 Items • 3 hr</div>
                        </div>
                        <div class="status-badge status-locked">Locked</div>
                    </div>
                </div>
            </div>
        `;

        return container;
    },

    onMount: () => {}
};
