import { getOpportunities, updateOpportunityStatus, deleteOpportunity, addOpportunity, getActiveCareer } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'opportunities-view';

        container.innerHTML = `
            <style>
                .kanban-board { display: flex; gap: 24px; margin-top: 24px; overflow-x: auto; padding-bottom: 16px; }
                .kanban-column { flex: 1; min-width: 300px; background: rgba(10, 25, 47, 0.4); border-radius: 12px; padding: 16px; border: 1px solid var(--border); display: flex; flex-direction: column; gap: 16px; min-height: 200px; }
                .kanban-column.drag-over { border-color: var(--primary); background: rgba(10, 25, 47, 0.6); }
                .column-header { font-weight: 600; color: var(--primary); display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
                .kanban-card { background: var(--glass-bg); backdrop-filter: blur(8px); padding: 16px; border-radius: 8px; border: 1px solid var(--glass-border); cursor: grab; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); animation: popIn 0.5s ease-out backwards; }
                .kanban-card:active { cursor: grabbing; transform: scale(0.98); }
                .kanban-card.dragging { opacity: 0.5; transform: scale(0.95); box-shadow: 0 10px 20px rgba(0,0,0,0.5); }
                .kanban-card:hover { border-color: var(--primary); transform: translateY(-4px) scale(1.02); box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2); z-index: 2; }
                .card-tag { font-size: 10px; text-transform: uppercase; padding: 4px 8px; border-radius: 4px; background: var(--primary-glow); color: var(--primary); display: inline-block; margin-bottom: 8px; font-weight: 700; letter-spacing: 1px; }
                .card-title { font-weight: 600; margin-bottom: 8px; }
                .card-meta { font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 4px; }
                .card-notes { font-size: 12px; color: #cbd5e1; margin-top: 8px; line-height: 1.4; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 8px; }
                
                .agent-toast { position: fixed; bottom: 24px; right: 24px; background: rgba(45, 212, 191, 0.2); border: 1px solid var(--primary); padding: 16px; border-radius: 8px; color: white; display: flex; align-items: center; gap: 12px; z-index: 1000; animation: slideIn 0.5s ease forwards; }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                
                /* Modal Styles */
                .opp-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); display: none; align-items: center; justify-content: center; z-index: 100; }
                .opp-modal { background: var(--bg-surface); padding: 32px; border-radius: 16px; border: 1px solid var(--border); width: 100%; max-width: 500px; }
                .opp-modal.active { display: block; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 8px; font-size: 14px; color: var(--text-muted); }
                .form-group input, .form-group select, .form-group textarea { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px; color: white; }
                .form-group input:focus, .form-group select:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); }
                
                .discover-btn { background: rgba(139, 92, 246, 0.2); color: var(--accent); border: 1px solid var(--accent); padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: var(--transition); }
                .discover-btn:hover { background: var(--accent); color: white; }
            </style>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2>Opportunities Board</h2>
                    <p class="text-muted" style="margin-top: 8px;">Personalized opportunities and programs. Drag and drop to organize!</p>
                </div>
                <div style="display: flex; gap: 12px;">
                    <button class="discover-btn" id="discover-opps-btn">✨ Discover Opportunities</button>
                    <button class="btn btn-primary" id="add-opportunity-btn">+ Add Opportunity</button>
                </div>
            </div>

            <div class="opp-modal-overlay" id="opp-modal">
                <div class="opp-modal">
                    <h3 style="margin-bottom: 24px; color: white;">Add Opportunity</h3>
                    <div class="form-group">
                        <label>Title</label>
                        <input type="text" id="opp-title" placeholder="e.g. Wacom Creator Grant">
                    </div>
                    <div style="display: flex; gap: 16px;">
                        <div class="form-group" style="flex: 1;">
                            <label>Type</label>
                            <select id="opp-type">
                                <option value="Scholarship">Scholarship</option>
                                <option value="Internship">Internship</option>
                                <option value="Mentorship">Mentorship</option>
                                <option value="Competition">Competition</option>
                                <option value="Convention">Convention</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex: 1;">
                            <label>Organization</label>
                            <input type="text" id="opp-org" placeholder="e.g. Wacom Foundation">
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Deadline</label>
                        <input type="text" id="opp-deadline" placeholder="e.g. April 15, 2027">
                    </div>
                    <div class="form-group">
                        <label>Notes</label>
                        <textarea id="opp-notes" placeholder="Why are you applying? What are the requirements?" rows="3"></textarea>
                    </div>
                    <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
                        <button class="btn" id="cancel-opp-btn" style="background: transparent; border: 1px solid var(--border);">Cancel</button>
                        <button class="btn btn-primary" id="save-opp-btn">Save to Board</button>
                    </div>
                </div>
            </div>

            <div class="kanban-board" id="kanban-board-container">
                <div style="text-align: center; width: 100%; color: var(--text-muted);">Loading opportunities...</div>
            </div>
            
            <div id="agent-toast-container"></div>
        `;

        return container;
    },

    onMount: async () => {
        let draggedCardId = null;
        const career = getActiveCareer();

        // Recommendations lists depending on chosen career
        const getRecommendations = () => {
            if (career === 'architecture') {
                return [
                    { title: "NOMA Foundation Fellowship", type: "Mentorship", org: "NOMA", deadline: "February 28", notes: "National - Provides design research experience. Must-do for minority students.", status: "optional" },
                    { title: "Gensler Brinkmann Scholarship", type: "Scholarship", org: "Gensler", deadline: "March 15", notes: "National - Extremely competitive B.Arch study funding.", status: "optional" },
                    { title: "SOM Foundation Robert L. Wesley Award", type: "Scholarship", org: "SOM", deadline: "November 1", notes: "Supports BIPOC undergraduate students enrolled in architecture.", status: "optional" },
                    { title: "AIA New York Mentorship Program", type: "Mentorship", org: "AIA NY", deadline: "Rolling", notes: "Local NYC - Connects student members to Manhattan mentors.", status: "optional" }
                ];
            } else {
                return [
                    { title: "Image Comics Talent Search", type: "Competition", org: "Image Comics", deadline: "Rolling", notes: "Submit portfolio page layouts for publisher review search program.", status: "optional" },
                    { title: "BOOM! Studios Editorial Internship", type: "Internship", org: "BOOM! Studios", deadline: "April 30", notes: "Valuable in-studio assistant training for structural scripting.", status: "optional" },
                    { title: "AIGA Design Contest", type: "Competition", org: "AIGA", deadline: "August 15", notes: "National design contest with dedicated graphic storytelling categories.", status: "optional" },
                    { title: "Scholastic Art Awards Portfolio Scholarship", type: "Scholarship", org: "Scholastic Foundation", deadline: "December 1", notes: "National scholarship award for graduating high school portfolio sheets.", status: "optional" }
                ];
            }
        };

        const loadOpportunities = async () => {
            let opps = await getOpportunities();
            
            const due = opps.filter(o => o.status === 'due');
            const mustDo = opps.filter(o => o.status === 'mustDo');
            const optional = opps.filter(o => o.status === 'optional');

            const renderCard = (opp, index) => {
                const isBlue = opp.type === 'Mentorship' || opp.type === 'Internship';
                const isPurple = opp.type === 'Competition' || opp.type === 'Convention';
                
                let tagStyle = '';
                if (isBlue) {
                    tagStyle = 'background: rgba(139, 92, 246, 0.2); color: var(--accent);';
                } else if (isPurple) {
                    tagStyle = 'background: rgba(45, 212, 191, 0.2); color: var(--secondary);';
                }

                return `
                    <div class="kanban-card" draggable="true" data-id="${opp.id}" style="animation-delay: ${index * 0.05}s;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <span class="card-tag" style="${tagStyle}">${opp.type}</span>
                            <button class="delete-opp-btn" data-id="${opp.id}" style="background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 12px;">✕</button>
                        </div>
                        <div class="card-title">${opp.title}</div>
                        <div class="card-meta">🏢 ${opp.org}</div>
                        <div class="card-meta" style="margin-top: 4px; color: var(--warning);">📅 Deadline: ${opp.deadline}</div>
                        <div class="card-notes">${opp.notes}</div>
                    </div>
                `;
            };

            const renderColumn = (title, id, items) => `
                <div class="kanban-column" data-status="${id}">
                    <div class="column-header">
                        <span>${title}</span>
                        <span style="background: var(--bg-surface-elevated); padding: 2px 8px; border-radius: 12px; font-size: 12px; color: white;">${items.length}</span>
                    </div>
                    ${items.length > 0 ? items.map((item, idx) => renderCard(item, idx)).join('') : '<div style="text-align: center; color: var(--text-muted); font-size: 14px; margin-top: 24px; animation: popIn 0.3s;">Empty column</div>'}
                </div>
            `;

            document.getElementById('kanban-board-container').innerHTML = `
                ${renderColumn('Due Soon', 'due', due)}
                ${renderColumn('Must Do', 'mustDo', mustDo)}
                ${renderColumn('Optional', 'optional', optional)}
            `;

            setupDragAndDrop();
            attachDeleteListeners();
        };

        const setupDragAndDrop = () => {
            const cards = document.querySelectorAll('.kanban-card');
            const columns = document.querySelectorAll('.kanban-column');

            cards.forEach(card => {
                card.addEventListener('dragstart', (e) => {
                    draggedCardId = card.getAttribute('data-id');
                    card.classList.add('dragging');
                });

                card.addEventListener('dragend', () => {
                    card.classList.remove('dragging');
                    draggedCardId = null;
                });
            });

            columns.forEach(column => {
                column.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    column.classList.add('drag-over');
                });

                column.addEventListener('dragleave', () => {
                    column.classList.remove('drag-over');
                });

                column.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    column.classList.remove('drag-over');
                    
                    if (draggedCardId) {
                        const newStatus = column.getAttribute('data-status');
                        document.getElementById('kanban-board-container').innerHTML = '<div style="text-align: center; width: 100%; color: var(--text-muted);">Moving opportunity...</div>';
                        await updateOpportunityStatus(draggedCardId, newStatus);
                        await loadOpportunities();
                    }
                });
            });
        };

        const attachDeleteListeners = () => {
            document.querySelectorAll('.delete-opp-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const id = btn.getAttribute('data-id');
                    if (confirm("Are you sure you want to remove this opportunity?")) {
                        await deleteOpportunity(id);
                        await loadOpportunities();
                    }
                });
            });
        };

        await loadOpportunities();

        // Modal Logic
        const modal = document.getElementById('opp-modal');
        document.getElementById('add-opportunity-btn').addEventListener('click', () => {
            modal.style.display = 'flex';
        });
        document.getElementById('cancel-opp-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });

        document.getElementById('save-opp-btn').addEventListener('click', async () => {
            const saveBtn = document.getElementById('save-opp-btn');
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            const newOpp = {
                title: document.getElementById('opp-title').value || 'Untitled',
                type: document.getElementById('opp-type').value,
                org: document.getElementById('opp-org').value || 'Unknown',
                deadline: document.getElementById('opp-deadline').value || 'Rolling',
                notes: document.getElementById('opp-notes').value || '',
                status: 'optional'
            };

            await addOpportunity(newOpp);
            
            modal.style.display = 'none';
            saveBtn.textContent = 'Save to Board';
            saveBtn.disabled = false;
            
            // Clear inputs
            document.getElementById('opp-title').value = '';
            document.getElementById('opp-org').value = '';
            document.getElementById('opp-deadline').value = '';
            document.getElementById('opp-notes').value = '';

            await loadOpportunities();
        });

        // Auto-Discovery Logic
        const discoverBtn = document.getElementById('discover-opps-btn');
        discoverBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            discoverBtn.textContent = 'Scanning...';
            discoverBtn.disabled = true;
            
            const currentOpps = await getOpportunities();
            const currentTitles = currentOpps.map(o => o.title.toLowerCase().trim());

            const recommendations = getRecommendations();
            const newOpps = recommendations.filter(p => !currentTitles.includes(p.title.toLowerCase().trim()));

            for (const opp of newOpps) {
                await addOpportunity(opp);
            }

            discoverBtn.style.display = 'none';
            await loadOpportunities();

            const toastContainer = document.getElementById('agent-toast-container');
            if (toastContainer) {
                toastContainer.innerHTML = `<div class="agent-toast">🤖 Discovery run complete! Added ${newOpps.length} new matching recommendations.</div>`;
                setTimeout(() => toastContainer.innerHTML = '', 4000);
            }
        });
    }
};
