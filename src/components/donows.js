import { getTasks, addTask, updateTaskStatus } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'donows-view';

        container.innerHTML = `
            <style>
                .planner-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px; }
                .task-list { display: flex; flex-direction: column; gap: 12px; }
                .task-item { background: rgba(0,0,0,0.2); border: 1px solid var(--border); padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 16px; transition: var(--transition); }
                .task-item:hover { border-color: var(--primary); background: rgba(10, 25, 47, 0.4); }
                .task-item.completed .task-text { text-decoration: line-through; color: var(--text-muted); }
                .task-checkbox { width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--primary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
                .task-item.completed .task-checkbox { background: var(--primary); }
                
                .timer-card { text-align: center; padding: 40px 20px; }
                .timer-display { font-size: 64px; font-weight: 700; font-variant-numeric: tabular-nums; margin: 20px 0; color: var(--primary); text-shadow: 0 0 20px var(--primary-glow); }
                
                /* Form Styles */
                .new-task-form { background: rgba(10, 25, 47, 0.6); padding: 20px; border-radius: 12px; border: 1px solid var(--primary); margin-top: 16px; margin-bottom: 24px; display: none; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 8px; font-size: 14px; color: var(--text-muted); }
                .form-group input { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px; color: white; }
                .form-group input:focus { outline: none; border-color: var(--primary); }
            </style>

            <div class="planner-grid">
                <div class="glass-card" style="background: linear-gradient(rgba(10, 25, 47, 0.8), rgba(10, 25, 47, 0.9)), url('assets/media__1778714721711.jpg') center/cover; border: 1px solid rgba(45, 212, 191, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3 style="color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Action Plan</h3>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="btn" id="import-plan-btn" style="background: rgba(255,255,255,0.1); padding: 6px 12px; font-size: 12px; border: 1px solid var(--border); color: white;">📥 Import College Plan</button>
                            <button class="btn btn-primary" id="new-task-btn" style="padding: 6px 12px; font-size: 12px;">+ Add Task</button>
                        </div>
                    </div>

                    <!-- New Task Form -->
                    <div class="new-task-form" id="new-task-form">
                        <div class="form-group">
                            <label>Task Description</label>
                            <input type="text" id="task-title" placeholder="e.g. Draft First Studio Project Concept">
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn btn-primary" id="save-task-btn">Save Task</button>
                            <button class="btn" id="cancel-task-btn" style="background: transparent; border: 1px solid var(--border);">Cancel</button>
                        </div>
                    </div>

                    <div class="task-list" id="task-list-container">
                        <div style="text-align: center; color: var(--text-muted);">Loading tasks from cloud...</div>
                    </div>
                </div>

                <div class="glass-card timer-card">
                    <h3>Focus Session</h3>
                    <p class="text-muted" style="margin-top: 8px; font-size: 14px;">Pomodoro timer for studio work.</p>
                    <div class="timer-display" id="timer-display">25:00</div>
                    <div style="display: flex; gap: 12px; justify-content: center;">
                        <button class="btn btn-primary" id="timer-start">Start</button>
                        <button class="btn" id="timer-reset" style="background: rgba(255,255,255,0.1);">Reset</button>
                    </div>
                </div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const listContainer = document.getElementById('task-list-container');
        const form = document.getElementById('new-task-form');
        const newBtn = document.getElementById('new-task-btn');
        const saveBtn = document.getElementById('save-task-btn');
        const cancelBtn = document.getElementById('cancel-task-btn');

        const loadAndRenderTasks = async () => {
            const tasks = await getTasks();
            
            // Sort: pending first, then completed
            tasks.sort((a, b) => {
                if (a.status === 'completed' && b.status !== 'completed') return 1;
                if (a.status !== 'completed' && b.status === 'completed') return -1;
                return 0;
            });

            listContainer.innerHTML = tasks.map(t => `
                <div class="task-item ${t.status === 'completed' ? 'completed' : ''}" data-id="${t.id}" data-status="${t.status}">
                    <div class="task-checkbox">${t.status === 'completed' ? '✓' : ''}</div>
                    <div>
                        <div class="task-text">${t.title}</div>
                        ${t.month ? `<div style="font-size: 12px; color: var(--primary); margin-top: 4px;">${t.month}</div>` : ''}
                    </div>
                </div>
            `).join('');

            // Add click listeners to checkboxes
            document.querySelectorAll('.task-item').forEach(item => {
                const checkbox = item.querySelector('.task-checkbox');
                checkbox.addEventListener('click', async () => {
                    const id = item.getAttribute('data-id');
                    const currentStatus = item.getAttribute('data-status');
                    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
                    
                    // Optimistic update
                    item.classList.toggle('completed');
                    item.setAttribute('data-status', newStatus);
                    checkbox.innerHTML = newStatus === 'completed' ? '✓' : '';
                    
                    await updateTaskStatus(id, newStatus);
                });
            });
        };

        newBtn.addEventListener('click', () => { form.style.display = 'block'; });
        cancelBtn.addEventListener('click', () => { form.style.display = 'none'; });

        saveBtn.addEventListener('click', async () => {
            const title = document.getElementById('task-title').value || 'Untitled Task';
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            await addTask({
                title,
                month: 'Current Month',
                status: 'pending'
            });

            saveBtn.textContent = 'Save Task';
            saveBtn.disabled = false;
            form.style.display = 'none';
            document.getElementById('task-title').value = '';

            await loadAndRenderTasks();
        });

        const importBtn = document.getElementById('import-plan-btn');
        if (importBtn) {
            importBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                importBtn.textContent = 'Importing...';
                importBtn.disabled = true;

                const collegePlan = [
                    { title: "Learn Revit Daily (Walls, roofs, build a modern house)", month: "Month 1 (Summer)", status: "pending" },
                    { title: "Study Real Architecture (ArchDaily, Floor Plans)", month: "Month 1 (Summer)", status: "pending" },
                    { title: "Begin Portfolio Projects (Tiny house, redesigns)", month: "Month 2 (Summer)", status: "pending" },
                    { title: "Learn Presentation Skills (Photoshop, InDesign)", month: "Month 2 (Summer)", status: "pending" },
                    { title: "Organize Portfolio, Resume, and LinkedIn", month: "Month 3 (Summer)", status: "pending" },
                    { title: "Become Technically Strong in Revit/Drafting", month: "Freshman Fall", status: "pending" },
                    { title: "Build Relationships with Professors/Peers", month: "Freshman Fall", status: "pending" },
                    { title: "Save and Organize ALL Studio Work", month: "Freshman Fall", status: "pending" },
                    { title: "Improve portfolio and apply for internships", month: "Freshman Winter", status: "pending" },
                    { title: "Seek part-time office/drafting help", month: "Freshman Spring", status: "pending" },
                    { title: "Land an Architecture Internship or Revit role", month: "Summer after Freshman", status: "pending" },
                    { title: "Start NCARB Record officially", month: "Sophomore Year", status: "pending" },
                    { title: "Secure Part-Time Architecture Job", month: "Sophomore Year", status: "pending" },
                    { title: "Learn Real Construction & Codes", month: "Sophomore Year", status: "pending" },
                    { title: "Build network and polish portfolio for job offer", month: "Junior/Senior", status: "pending" }
                ];

                for (const task of collegePlan) {
                    await addTask(task);
                }

                importBtn.style.display = 'none'; // Hide button after import
                await loadAndRenderTasks();
            });
        }

        await loadAndRenderTasks();

        // Timer Logic (Client-side only)
        let timerInterval;
        let timeLeft = 25 * 60;
        let isRunning = false;
        const display = document.getElementById('timer-display');

        const updateDisplay = () => {
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            display.textContent = `${m}:${s}`;
        };

        document.getElementById('timer-start').addEventListener('click', (e) => {
            if (isRunning) {
                clearInterval(timerInterval);
                e.target.textContent = 'Resume';
                isRunning = false;
            } else {
                isRunning = true;
                e.target.textContent = 'Pause';
                timerInterval = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        updateDisplay();
                    } else {
                        clearInterval(timerInterval);
                        alert('Focus session complete! Take a 5 minute break.');
                    }
                }, 1000);
            }
        });

        document.getElementById('timer-reset').addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
            timeLeft = 25 * 60;
            updateDisplay();
            document.getElementById('timer-start').textContent = 'Start';
        });
    }
};
