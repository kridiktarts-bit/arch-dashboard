import { getProjects, addProject, updateProjectTitle, updateProjectStatus, getActiveCareer } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'projects-view';

        const career = getActiveCareer();
        let placeholderName = 'e.g. Project Title';
        let placeholderTools = 'e.g. Tools, Software, Materials';
        let pageSubtitle = 'Curate and manage your deliverables and project submissions.';

        if (career === 'architecture') {
            placeholderName = 'e.g. 110th St Plaza Memorial Design';
            placeholderTools = 'e.g. Sketching, Rhino, AutoCAD';
            pageSubtitle = 'Curate your studio designs. Support for up to 5 documentation images per project.';
        } else if (career === 'comic_creator') {
            placeholderName = 'e.g. Character Sheet: Turnaround';
            placeholderTools = 'e.g. Clip Studio Paint, Photoshop, ink';
            pageSubtitle = 'Curate your pages, character turnaround sheets, and illustrations.';
        } else if (career === 'doctor') {
            placeholderName = 'e.g. AMCAS Application Portfolio';
            placeholderTools = 'e.g. ERAS Portal, Personal Statement, Recommendation Letters';
            pageSubtitle = 'Curate your medical applications, personal statements, shadowing logs, and recommendation dossier.';
        } else if (career === 'entrepreneur') {
            placeholderName = 'e.g. Pitch Deck / Business Canvas';
            placeholderTools = 'e.g. Pitch, Canva, Excel Financial Model';
            pageSubtitle = 'Curate and upload your startup pitch decks, competitor analysis sheets, financial projection canvases, and business registration logs.';
        } else {
            placeholderName = 'e.g. Professional Milestone Deliverable';
            placeholderTools = 'e.g. Certification, Document PDF, Logs';
            pageSubtitle = 'Curate and review your professional deliverables and milestones.';
        }

        container.innerHTML = `
            <style>
                .projects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; margin-top: 24px; }
                .project-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; transition: var(--transition); }
                .project-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.3); border-color: var(--primary); }
                
                .project-image-placeholder { height: 160px; background: url('assets/media__1778714721711.jpg') center/cover; position: relative; }
                
                .project-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
                .project-title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
                .project-meta { font-size: 13px; color: var(--text-muted); display: flex; justify-content: space-between; margin-bottom: 16px; }
                
                .image-uploads { display: flex; gap: 8px; margin-top: 12px; }
                .img-upload-slot { width: 48px; height: 48px; border-radius: 8px; border: 1px dashed var(--border); display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--text-muted); cursor: pointer; transition: var(--transition); }
                .img-upload-slot:hover { border-color: var(--primary); color: var(--primary); background: rgba(59, 130, 246, 0.1); }
                
                /* Form Styles */
                .new-project-form { background: rgba(10, 25, 47, 0.6); padding: 20px; border-radius: 12px; border: 1px solid var(--primary); margin-top: 24px; display: none; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 8px; font-size: 14px; color: var(--text-muted); }
                .form-group input, .form-group select { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px; color: white; }
                .form-group input:focus { outline: none; border-color: var(--primary); }
            </style>

            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h2>Portfolio & Deliverables</h2>
                    <p class="text-muted" style="margin-top: 8px;">${pageSubtitle}</p>
                </div>
                <button class="btn btn-primary" id="new-project-btn">+ Add Item</button>
            </div>

            <!-- New Project Form -->
            <div class="new-project-form" id="new-project-form">
                <h3 style="margin-bottom: 16px;">Create Portfolio Item</h3>
                <div class="form-group">
                    <label>Item Name / Title</label>
                    <input type="text" id="proj-name" placeholder="${placeholderName}">
                </div>
                <div style="display: flex; gap: 16px;">
                    <div class="form-group" style="flex: 1;">
                        <label>Date Created</label>
                        <input type="text" id="proj-date" placeholder="e.g. Fall 2026 or Dec 15th">
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label>Primary Media / Tools</label>
                        <input type="text" id="proj-tools" placeholder="${placeholderTools}">
                    </div>
                </div>
                <div style="display: flex; gap: 12px; margin-top: 8px;">
                    <button class="btn btn-primary" id="save-project-btn">Save Item</button>
                    <button class="btn" id="cancel-project-btn" style="background: transparent; border: 1px solid var(--border);">Cancel</button>
                </div>
            </div>

            <div class="projects-grid" id="projects-grid">
                <div style="text-align: center; width: 100%; color: var(--text-muted); grid-column: 1 / -1;">Loading portfolio items...</div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const grid = document.getElementById('projects-grid');
        const form = document.getElementById('new-project-form');
        const newBtn = document.getElementById('new-project-btn');
        const saveBtn = document.getElementById('save-project-btn');
        const cancelBtn = document.getElementById('cancel-project-btn');
        
        const loadAndRenderProjects = async () => {
            const projects = await getProjects();
            
            grid.innerHTML = projects.map(p => `
                <div class="project-card" data-id="${p.id}">
                    <div class="project-image-placeholder">
                        <div style="position: absolute; bottom: 8px; right: 8px; font-size: 12px; background: rgba(0,0,0,0.7); padding: 4px 8px; border-radius: 4px; backdrop-filter: blur(4px);">
                            ${p.status || 'In Progress'}
                        </div>
                    </div>
                    <div class="project-content">
                        <div class="project-title" style="display: flex; justify-content: space-between; align-items: center;">
                            <span class="title-text" style="flex: 1;">${p.title}</span>
                            <input type="text" class="title-edit-input" value="${p.title}" style="display: none; flex: 1; margin-right: 8px; padding: 4px; background: rgba(0,0,0,0.3); border: 1px solid var(--primary); color: white; border-radius: 4px;">
                            <button class="btn edit-title-btn" style="padding: 2px 6px; font-size: 10px; background: transparent; border: 1px solid var(--border); color: var(--text-muted);">Edit</button>
                            <button class="btn save-title-btn" style="display: none; padding: 2px 6px; font-size: 10px; background: var(--primary); color: white; border: none;">Save</button>
                        </div>
                        <div class="project-meta">
                            <div>🗓️ ${p.date}</div>
                            <div>🛠️ ${p.software}</div>
                            <button class="btn btn-primary toggle-status-btn" data-id="${p.id}" data-status="${p.status || 'In Progress'}" style="padding: 4px 8px; font-size: 11px; margin-left: auto;">
                                Mark ${p.status === 'Completed' ? 'In Progress' : 'Completed'}
                            </button>
                        </div>
                        <div style="margin-top: auto; padding-top: 16px; border-top: 1px solid var(--border);">
                            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">Documentation (Max 5)</div>
                            <div class="image-uploads">
                                <div class="img-upload-slot" title="Upload Image 1">+</div>
                                <div class="img-upload-slot" title="Upload Image 2">+</div>
                                <div class="img-upload-slot" title="Upload Image 3">+</div>
                                <div class="img-upload-slot" title="Upload Image 4">+</div>
                                <div class="img-upload-slot" title="Upload Image 5">+</div>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');

            // Add listener to upload slots
            document.querySelectorAll('.img-upload-slot').forEach(slot => {
                slot.addEventListener('click', () => {
                    alert('Cloud upload coming soon! Drag and drop files to your workspace for now.');
                });
            });

            // Add listeners for editing titles
            document.querySelectorAll('.project-card').forEach(card => {
                const id = card.getAttribute('data-id');
                const editBtn = card.querySelector('.edit-title-btn');
                const saveBtn = card.querySelector('.save-title-btn');
                const titleText = card.querySelector('.title-text');
                const titleInput = card.querySelector('.title-edit-input');

                editBtn.addEventListener('click', () => {
                    titleText.style.display = 'none';
                    editBtn.style.display = 'none';
                    titleInput.style.display = 'block';
                    saveBtn.style.display = 'inline-block';
                    titleInput.focus();
                });

                saveBtn.addEventListener('click', async () => {
                    const newTitle = titleInput.value.trim() || 'Untitled Item';
                    saveBtn.textContent = '...';
                    await updateProjectTitle(id, newTitle);
                    await loadAndRenderProjects();
                });
            });

            // Status Toggle Listeners
            document.querySelectorAll('.toggle-status-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    const currentStatus = e.target.getAttribute('data-status');
                    const newStatus = currentStatus === 'In Progress' ? 'Completed' : 'In Progress';
                    
                    e.target.disabled = true;
                    e.target.textContent = 'Updating...';
                    
                    await updateProjectStatus(id, newStatus);
                    await loadAndRenderProjects();
                });
            });
        };

        newBtn.addEventListener('click', () => { form.style.display = 'block'; });
        cancelBtn.addEventListener('click', () => { form.style.display = 'none'; });

        saveBtn.addEventListener('click', async () => {
            const title = document.getElementById('proj-name').value || 'Untitled Item';
            const date = document.getElementById('proj-date').value || 'TBD';
            const software = document.getElementById('proj-tools').value || 'Digital Paint';
            
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            await addProject({
                title,
                date,
                software,
                status: 'In Progress',
                images: []
            });

            saveBtn.textContent = 'Save Item';
            saveBtn.disabled = false;
            form.style.display = 'none';
            document.getElementById('proj-name').value = '';
            document.getElementById('proj-date').value = '';
            document.getElementById('proj-tools').value = '';

            await loadAndRenderProjects();
        });

        await loadAndRenderProjects();
    }
};
