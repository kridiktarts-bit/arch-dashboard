import { getRoadmap, getRoadmapCheckpoints, saveRoadmapCheckpoint } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'roadmap-view';

        container.innerHTML = `
            <style>
                .timeline-container { position: relative; padding-left: 32px; margin-top: 32px; }
                .timeline-line { position: absolute; left: 11px; top: 0; bottom: 0; width: 2px; background: rgba(45, 212, 191, 0.2); }
                
                .timeline-node { position: relative; margin-bottom: 48px; }
                .timeline-dot { position: absolute; left: -32px; top: 6px; width: 24px; height: 24px; border-radius: 50%; background: var(--glass-bg); border: 2px solid var(--primary); display: flex; align-items: center; justify-content: center; z-index: 2; transition: var(--transition); }
                .timeline-node:hover .timeline-dot { background: var(--primary); box-shadow: 0 0 15px var(--primary-glow); }
                .timeline-dot-inner { width: 8px; height: 8px; background: var(--primary); border-radius: 50%; transition: var(--transition); }
                .timeline-node:hover .timeline-dot-inner { background: white; }

                .timeline-content { background: rgba(10, 25, 47, 0.5); border: 1px solid var(--border); border-radius: 12px; padding: 24px; transition: var(--transition); backdrop-filter: blur(10px); }
                .timeline-content:hover { border-color: rgba(45, 212, 191, 0.5); transform: translateX(8px); }
                
                .phase-time { font-family: var(--font-heading); color: var(--primary); font-size: 14px; letter-spacing: 1px; font-weight: 600; margin-bottom: 8px; }
                .phase-title { font-size: 20px; font-weight: 600; color: white; margin-bottom: 16px; }
                .phase-details { list-style: none; padding: 0; margin: 0; color: var(--text-muted); font-size: 14px; line-height: 1.6; }
                .phase-details li { margin-bottom: 8px; padding-left: 20px; position: relative; }
                .phase-details li::before { content: '→'; position: absolute; left: 0; color: var(--primary); }

                .checkpoint-section { margin-top: 20px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
                .checkpoint-status { font-size: 13px; margin-bottom: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 8px; }
                
                .portfolio-link-input { width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; color: white; margin-bottom: 12px; display: none; }
                .portfolio-link-input:focus { outline: none; border-color: var(--primary); }
                .portfolio-notes { width: 100%; padding: 10px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 6px; color: white; margin-bottom: 12px; min-height: 80px; resize: vertical; display: none; }
                .portfolio-notes:focus { outline: none; border-color: var(--primary); }
                
                .link-display { display: inline-block; color: var(--primary); text-decoration: none; word-break: break-all; margin-bottom: 12px; }
                .link-display:hover { text-decoration: underline; }
                .notes-display { background: rgba(0,0,0,0.2); padding: 12px; border-radius: 6px; font-size: 13px; color: var(--text-muted); margin-bottom: 12px; white-space: pre-wrap; }
            </style>

            <div style="margin-bottom: 24px;">
                <h2 style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Career Roadmap stages</h2>
                <p class="text-muted" style="margin-top: 8px;">Your macro timeline. Track your overarching goals and attach portfolio updates to each specific phase.</p>
            </div>

            <div class="timeline-container" id="timeline-container">
                <div class="timeline-line"></div>
                <div style="text-align: center; color: var(--text-muted);">Loading roadmap...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const container = document.getElementById('timeline-container');
        const roadmap = await getRoadmap();
        const checkpoints = await getRoadmapCheckpoints();

        if (!roadmap.stages || roadmap.stages.length === 0) {
            container.innerHTML = '<div style="color: var(--text-muted); padding: 20px;">No stages configured for this career path.</div>';
            return;
        }

        // Render Timeline
        container.innerHTML = `<div class="timeline-line"></div>` + roadmap.stages.map(stage => {
            const cp = checkpoints[stage.id] || {};
            const hasData = cp.link || cp.notes;
            
            // Build visual details list
            const detailsList = [
                stage.description,
                ...stage.skills.map(s => `${s.name}: ${s.exercises.join(', ')}`)
            ];

            return `
                <div class="timeline-node" data-id="${stage.id}">
                    <div class="timeline-dot"><div class="timeline-dot-inner"></div></div>
                    <div class="timeline-content">
                        <div class="phase-time">${stage.timeframe || 'Stage Progress'}</div>
                        <div class="phase-title">${stage.name}</div>
                        <ul class="phase-details">
                            ${detailsList.map(d => `<li>${d}</li>`).join('')}
                        </ul>
                        
                        <div class="checkpoint-section">
                            <div class="checkpoint-status">
                                ${hasData ? '<span style="color: var(--success);">✓ Portfolio Checkpoint Updated</span>' : '<span>⚪ No Portfolio Checkpoint Yet</span>'}
                            </div>
                            
                            <div class="display-area" style="display: ${hasData ? 'block' : 'none'};">
                                ${cp.link ? `<a href="${cp.link}" target="_blank" class="link-display">📁 View Linked Portfolio</a>` : ''}
                                ${cp.notes ? `<div class="notes-display">${cp.notes}</div>` : ''}
                            </div>

                            <input type="text" class="portfolio-link-input" placeholder="Paste Google Drive/Portfolio link here..." value="${cp.link || ''}">
                            <textarea class="portfolio-notes" placeholder="Notes (e.g. Finished anatomy sketches turnaround sheet PDF...)">${cp.notes || ''}</textarea>
                            
                            <div style="display: flex; gap: 8px;">
                                <button class="btn update-btn" style="background: ${hasData ? 'rgba(255,255,255,0.1)' : 'var(--primary)'}; border: 1px solid var(--border); padding: 6px 12px; font-size: 12px;">${hasData ? 'Edit Update' : '+ Add Portfolio Update'}</button>
                                <button class="btn btn-primary save-btn" style="display: none; padding: 6px 12px; font-size: 12px;">Save Checkpoint</button>
                                <button class="btn cancel-btn" style="display: none; background: transparent; border: 1px solid var(--border); padding: 6px 12px; font-size: 12px;">Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach Listeners
        document.querySelectorAll('.timeline-node').forEach(node => {
            const phaseId = node.getAttribute('data-id');
            const updateBtn = node.querySelector('.update-btn');
            const saveBtn = node.querySelector('.save-btn');
            const cancelBtn = node.querySelector('.cancel-btn');
            const linkInput = node.querySelector('.portfolio-link-input');
            const notesInput = node.querySelector('.portfolio-notes');
            const displayArea = node.querySelector('.display-area');

            updateBtn.addEventListener('click', () => {
                displayArea.style.display = 'none';
                linkInput.style.display = 'block';
                notesInput.style.display = 'block';
                updateBtn.style.display = 'none';
                saveBtn.style.display = 'block';
                cancelBtn.style.display = 'block';
            });

            cancelBtn.addEventListener('click', () => {
                linkInput.style.display = 'none';
                notesInput.style.display = 'none';
                saveBtn.style.display = 'none';
                cancelBtn.style.display = 'none';
                updateBtn.style.display = 'block';
                
                const hasData = linkInput.value.trim() !== '' || notesInput.value.trim() !== '';
                displayArea.style.display = hasData ? 'block' : 'none';
            });

            saveBtn.addEventListener('click', async () => {
                const link = linkInput.value.trim();
                const notes = notesInput.value.trim();
                
                saveBtn.textContent = 'Saving...';
                saveBtn.disabled = true;

                await saveRoadmapCheckpoint(phaseId, { link, notes });
                
                // Re-render
                window.app.renderView(); 
            });
        });
    }
};
