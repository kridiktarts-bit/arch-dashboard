import { getTasks, addTask, updateTaskStatus, deleteTask, getActiveCareer } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'donows-view';

        container.innerHTML = `
            <style>
                .planner-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-top: 24px; }
                .task-list { display: flex; flex-direction: column; gap: 12px; }
                .task-item { background: rgba(0,0,0,0.2); border: 1px solid var(--border); padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 16px; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); animation: popIn 0.4s ease-out backwards; }
                .task-item:hover { transform: scale(1.01) translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); background: rgba(10, 25, 47, 0.8) !important; border-color: rgba(59, 130, 246, 0.4) !important; z-index: 2; }
                .task-item.completed .task-text { text-decoration: line-through; color: var(--text-muted); }
                .task-checkbox { width: 24px; height: 24px; border-radius: 6px; border: 2px solid var(--primary); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: var(--transition); }
                .task-checkbox:hover { background: rgba(59, 130, 246, 0.2); }
                .task-item.completed .task-checkbox { background: var(--primary); }
                
                .timer-card { text-align: center; padding: 40px 20px; }
                .timer-display { font-size: 64px; font-weight: 700; font-variant-numeric: tabular-nums; margin: 20px 0; color: var(--primary); text-shadow: 0 0 20px var(--primary-glow); }
                
                /* Form Styles */
                .new-task-form { background: rgba(10, 25, 47, 0.6); padding: 20px; border-radius: 12px; border: 1px solid var(--primary); margin-top: 16px; margin-bottom: 24px; display: none; }
                .form-group { margin-bottom: 16px; }
                .form-group label { display: block; margin-bottom: 8px; font-size: 14px; color: var(--text-muted); }
                .form-group input, .form-group textarea { width: 100%; padding: 10px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 6px; color: white; }
                .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); }
                
                .task-header { display: flex; justify-content: space-between; align-items: center; width: 100%; cursor: pointer; }
                .task-left { display: flex; align-items: center; gap: 16px; flex: 1; }
                .task-desc { display: none; margin-top: 12px; margin-left: 40px; padding: 12px; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 13px; color: #cbd5e1; line-height: 1.5; border-left: 2px solid var(--primary); }
                .task-desc.active { display: block; }
                .task-actions { display: flex; gap: 8px; align-items: center; }
                .expand-btn, .delete-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; border-radius: 4px; transition: var(--transition); }
                .expand-btn:hover { color: white; background: rgba(255,255,255,0.1); }
                .delete-btn:hover { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
                .expand-icon { transition: transform 0.3s ease; }
                .expand-btn.active .expand-icon { transform: rotate(180deg); }

                /* Day selector header styles */
                .day-navigation-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid var(--border);
                    padding: 12px 18px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }
                .day-nav-btn {
                    background: transparent;
                    border: none;
                    color: white;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px 8px;
                    transition: var(--transition);
                }
                .day-nav-btn:hover {
                    color: var(--primary);
                }
                .day-date-label {
                    font-weight: bold;
                    color: white;
                    font-size: 15px;
                }
            </style>

            <div class="planner-grid">
                <div class="glass-card" style="background: linear-gradient(rgba(10, 25, 47, 0.8), rgba(10, 25, 47, 0.9)), url('assets/media__1778714721711.jpg') center/cover; border: 1px solid rgba(45, 212, 191, 0.3);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3 style="color: white; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Daily Planner</h3>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn btn-primary" id="new-task-btn" style="padding: 6px 12px; font-size: 12px;">+ Add Task</button>
                        </div>
                    </div>

                    <!-- Day Navigation Header -->
                    <div class="day-navigation-header">
                        <button class="day-nav-btn" id="btn-prev-day">◀</button>
                        <span class="day-date-label" id="planner-date-label">Today</span>
                        <button class="day-nav-btn" id="btn-next-day">▶</button>
                    </div>

                    <!-- New Task Form -->
                    <div class="new-task-form" id="new-task-form">
                        <div class="form-group">
                            <label>Task Description</label>
                            <input type="text" id="task-title" placeholder="e.g. Draw character reference designs">
                        </div>
                        <div class="form-group">
                            <label>Details / Notes (Optional)</label>
                            <textarea id="task-desc" placeholder="Specific steps, links, or instructions..." rows="3"></textarea>
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <button class="btn btn-primary" id="save-task-btn">Save Task</button>
                            <button class="btn" id="cancel-task-btn" style="background: transparent; border: 1px solid var(--border);">Cancel</button>
                        </div>
                    </div>

                    <div class="task-list" id="task-list-container">
                        <div style="text-align: center; color: var(--text-muted);">Loading tasks...</div>
                    </div>
                </div>

                <div class="glass-card timer-card">
                    <h3>Focus Session</h3>
                    <p class="text-muted" style="margin-top: 8px; font-size: 14px;">Pomodoro timer for career study.</p>
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
        const dateLabel = document.getElementById('planner-date-label');

        // Set date cursor to Today
        let dateCursor = new Date();
        dateCursor.setHours(0,0,0,0);

        const formatDateString = (d) => d.toISOString().split('T')[0];

        const updateDateLabel = () => {
            const todayStr = formatDateString(new Date());
            const cursorStr = formatDateString(dateCursor);
            
            if (todayStr === cursorStr) {
                dateLabel.innerText = "Today - " + dateCursor.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
            } else {
                dateLabel.innerText = dateCursor.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
            }
        };

        const loadAndRenderTasks = async () => {
            const tasks = await getTasks();
            const targetDateStr = formatDateString(dateCursor);

            // Filter tasks that are active on the target date cursor
            const dailyTasks = tasks.filter(t => t.startDate === targetDateStr || (t.startDate <= targetDateStr && t.endDate >= targetDateStr));

            let html = '';
            if (dailyTasks.length === 0) {
                html = '<div style="text-align: center; color: var(--text-muted); padding: 40px 20px;">No scheduled tasks for this day. Enjoy your rest!</div>';
            } else {
                // Group by completed and pending
                dailyTasks.sort((a, b) => {
                    if (a.status === 'completed' && b.status !== 'completed') return 1;
                    if (a.status !== 'completed' && b.status === 'completed') return -1;
                    return 0;
                });

                html = dailyTasks.map((t, idx) => {
                    const isChecked = t.status === 'completed';
                    return `
                        <div class="task-item ${isChecked ? 'completed' : ''}" data-id="${t.id}" data-status="${t.status}" style="background: rgba(255,255,255,0.02); margin-bottom: 8px;">
                            <div class="task-header">
                                <div class="task-left">
                                    <div class="task-checkbox">${isChecked ? '✓' : ''}</div>
                                    <div class="task-text">${t.title}</div>
                                </div>
                                <div class="task-actions">
                                    ${t.description || t.notes ? `<button class="expand-btn"><div class="expand-icon">▼</div></button>` : ''}
                                    <button class="delete-btn">🗑️</button>
                                </div>
                            </div>
                            ${t.description || t.notes ? `<div class="task-desc">${t.description || t.notes}</div>` : ''}
                        </div>
                    `;
                }).join('');
            }

            listContainer.innerHTML = html;

            // Connect event listeners
            document.querySelectorAll('.task-item').forEach(item => {
                const id = item.getAttribute('data-id');
                const checkbox = item.querySelector('.task-checkbox');
                const expandBtn = item.querySelector('.expand-btn');
                const deleteBtn = item.querySelector('.delete-btn');
                const descBlock = item.querySelector('.task-desc');

                checkbox.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const currentStatus = item.getAttribute('data-status');
                    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
                    
                    item.classList.toggle('completed');
                    item.setAttribute('data-status', newStatus);
                    checkbox.innerHTML = newStatus === 'completed' ? '✓' : '';
                    
                    await updateTaskStatus(id, newStatus);
                });

                if (expandBtn) {
                    expandBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        descBlock.classList.toggle('active');
                        expandBtn.classList.toggle('active');
                    });
                }

                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        if (confirm("Are you sure you want to delete this task?")) {
                            item.style.opacity = '0.5';
                            await deleteTask(id);
                            await loadAndRenderTasks();
                        }
                    });
                }
            });
        };

        updateDateLabel();
        await loadAndRenderTasks();

        // Day Selector Button triggers
        document.getElementById('btn-prev-day').addEventListener('click', async () => {
            dateCursor.setDate(dateCursor.getDate() - 1);
            updateDateLabel();
            await loadAndRenderTasks();
        });

        document.getElementById('btn-next-day').addEventListener('click', async () => {
            dateCursor.setDate(dateCursor.getDate() + 1);
            updateDateLabel();
            await loadAndRenderTasks();
        });

        newBtn.addEventListener('click', () => { form.style.display = 'block'; });
        cancelBtn.addEventListener('click', () => { form.style.display = 'none'; });

        saveBtn.addEventListener('click', async () => {
            const title = document.getElementById('task-title').value || 'Untitled Task';
            const description = document.getElementById('task-desc').value || '';
            
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            const targetDateStr = formatDateString(dateCursor);

            // Add custom task scheduled precisely on the active dateCursor!
            await addTask({
                title,
                description,
                startDate: targetDateStr,
                endDate: targetDateStr,
                type: 'personal',
                phaseName: 'Personal'
            });

            saveBtn.textContent = 'Save Task';
            saveBtn.disabled = false;
            form.style.display = 'none';
            document.getElementById('task-title').value = '';
            document.getElementById('task-desc').value = '';

            await loadAndRenderTasks();
        });

        // Pomodoro Timer Logic
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
                        alert('Focus session complete! Rest your eyes.');
                        timeLeft = 25 * 60;
                        updateDisplay();
                        e.target.textContent = 'Start';
                        isRunning = false;
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
