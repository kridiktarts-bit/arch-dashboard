import { getTasks, updateTaskStatus, rebalanceSchedule, getUserOnboarding, addTask, deleteTask, updateTaskDetails, duplicateTask } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'schedule-view fade-in';

        container.innerHTML = `
            <style>
                .schedule-layout { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 24px; }
                @media (min-width: 992px) {
                    .schedule-layout { grid-template-columns: 3fr 1.2fr; }
                }

                .week-navigation-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .nav-week-btn { background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border); color: white; padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: var(--transition); }
                .nav-week-btn:hover { background: var(--primary-glow); border-color: var(--primary); }

                .calendar-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; }
                .calendar-day-column { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 12px; padding: 16px; min-height: 250px; display: flex; flex-direction: column; }
                .calendar-day-header { font-weight: 700; color: var(--secondary); border-bottom: 1px solid var(--border); padding-bottom: 8px; margin-bottom: 12px; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: flex; justify-content: space-between; }
                .calendar-day-date { color: var(--text-muted); font-size: 11px; }

                .calendar-task-card { background: rgba(0, 0, 0, 0.3); border: 1px solid var(--border); border-radius: 8px; padding: 10px; margin-bottom: 8px; font-size: 12px; transition: var(--transition); cursor: pointer; position: relative; }
                .calendar-task-card.completed { border-color: var(--success); background: rgba(16, 185, 129, 0.05); }
                .calendar-task-card.completed .task-title { text-decoration: line-through; color: var(--text-muted); }
                .calendar-task-card:hover { border-color: var(--primary); }

                /* Card types */
                .calendar-task-card.type-personal { border-left: 4px solid var(--success); }
                .calendar-task-card.type-reminder { border-left: 4px solid var(--warning); }
                .calendar-task-card.type-ai { border-left: 4px solid var(--primary); }

                .task-title { font-weight: 600; color: white; margin-bottom: 4px; line-height: 1.3; }
                .task-duration { font-size: 10px; color: var(--text-muted); display: flex; justify-content: space-between; align-items: center; margin-top: 4px; }
                .task-phase-tag { font-size: 9px; background: rgba(255,255,255,0.05); color: #cbd5e1; padding: 2px 4px; border-radius: 4px; display: inline-block; margin-bottom: 4px; }

                .milestones-panel { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 16px; padding: 24px; height: fit-content; }
                .milestone-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; font-size: 13px; line-height: 1.4; }
                .milestone-check { font-weight: bold; color: var(--success); font-size: 15px; }
                .milestone-pending { color: var(--text-muted); }
                
                /* Modal structures */
                .reschedule-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 3000; display: none; align-items: center; justify-content: center; backdrop-filter: blur(5px); }
                .reschedule-modal { background: #0c1524; border: 1px solid var(--border); width: 100%; max-width: 440px; padding: 24px; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.5); }
            </style>

            <div class="week-navigation-bar">
                <div>
                    <h2 id="schedule-week-heading">Weekly Schedule</h2>
                    <p class="text-muted" style="margin-top: 4px; font-size: 13px;">Manage tasks, add custom events, and rebalance timelines.</p>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <button class="nav-week-btn" id="btn-add-custom-task" style="background: var(--primary); border: none; font-weight: 600;">➕ Add Event</button>
                    <button class="nav-week-btn" id="btn-prev-week">◀ Prev</button>
                    <button class="nav-week-btn" id="btn-next-week">Next ▶</button>
                </div>
            </div>

            <div class="schedule-layout">
                <!-- Weekly Grid -->
                <div class="calendar-grid" id="calendar-days-container">
                    <!-- Dynamic Columns -->
                </div>

                <!-- Milestones Dashboard -->
                <div class="milestones-panel">
                    <h3 style="color: white; margin-bottom: 16px; font-size: 18px; border-bottom: 1px solid var(--border); padding-bottom: 12px;">🏆 Milestone Achievements</h3>
                    <div id="milestones-list-container">
                        <!-- Dynamic Milestones -->
                    </div>
                </div>
            </div>

            <!-- Task Inspector & Editor Modal -->
            <div class="reschedule-modal-overlay" id="task-inspector-modal">
                <div class="reschedule-modal">
                    <h3 style="color: white; margin-bottom: 4px;" id="inspect-title-header">Task Inspector</h3>
                    <div style="font-size: 11px; color: var(--text-muted); margin-bottom: 16px;" id="inspect-id-sub"></div>
                    
                    <div class="onboarding-form" style="gap: 12px; display: flex; flex-direction: column;">
                        <div>
                            <label class="input-label">Title</label>
                            <input type="text" id="inspect-title-input" class="text-input">
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <div style="flex: 1;">
                                <label class="input-label">Duration (Hours)</label>
                                <input type="number" id="inspect-duration-input" class="text-input">
                            </div>
                            <div style="flex: 1.2;">
                                <label class="input-label">Scheduled Date</label>
                                <input type="date" id="inspect-date-input" class="text-input">
                            </div>
                        </div>
                        <div>
                            <label class="input-label">Task Type</label>
                            <select id="inspect-type-select" class="text-input" style="background: #0d1e36;">
                                <option value="ai">AI Production Task</option>
                                <option value="personal">Personal Event</option>
                                <option value="reminder">Custom Reminder</option>
                            </select>
                        </div>
                        <div>
                            <label class="input-label">Notes & Reminders</label>
                            <textarea id="inspect-notes-input" class="text-input" style="height: 80px; resize: none;"></textarea>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <input type="checkbox" id="inspect-complete-check" style="width: 18px; height: 18px; accent-color: var(--success); cursor: pointer;">
                            <label for="inspect-complete-check" style="font-size: 13px; color: white; cursor: pointer;">Mark as Completed</label>
                        </div>
                    </div>

                    <div style="border-top: 1px solid var(--border); margin-top: 16px; padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="display: flex; gap: 6px;">
                            <button class="nav-week-btn" id="btn-inspect-dup-daily" style="padding: 6px 10px; font-size: 11px;">Copy Daily</button>
                            <button class="nav-week-btn" id="btn-inspect-dup-weekly" style="padding: 6px 10px; font-size: 11px;">Copy Weekly</button>
                            <button class="nav-week-btn" id="btn-inspect-delete" style="padding: 6px 10px; font-size: 11px; background: rgba(239,68,68,0.15); color: var(--danger); border: 1px solid rgba(239,68,68,0.3);">Delete</button>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="btn" id="btn-inspect-cancel" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border); padding: 8px 12px; font-size: 13px;">Cancel</button>
                            <button class="btn btn-primary" id="btn-inspect-save" style="padding: 8px 16px; font-size: 13px;">Save</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Add Custom Task Modal -->
            <div class="reschedule-modal-overlay" id="add-task-modal">
                <div class="reschedule-modal">
                    <h3 style="color: white; margin-bottom: 16px;">➕ Create New Event</h3>
                    
                    <div class="onboarding-form" style="gap: 12px; display: flex; flex-direction: column;">
                        <div>
                            <label class="input-label">Event Name</label>
                            <input type="text" id="add-title-input" class="text-input" placeholder="e.g. Doctor Appointment, Review Dialogue">
                        </div>
                        <div style="display: flex; gap: 12px;">
                            <div style="flex: 1;">
                                <label class="input-label">Duration (Hours)</label>
                                <input type="number" id="add-duration-input" class="text-input" value="2">
                            </div>
                            <div style="flex: 1.2;">
                                <label class="input-label">Date</label>
                                <input type="date" id="add-date-input" class="text-input">
                            </div>
                        </div>
                        <div>
                            <label class="input-label">Event Type</label>
                            <select id="add-type-select" class="text-input" style="background: #0d1e36;">
                                <option value="personal">Personal Event</option>
                                <option value="reminder">Custom Reminder</option>
                                <option value="ai">AI Task Override</option>
                            </select>
                        </div>
                        <div>
                            <label class="input-label">Notes</label>
                            <textarea id="add-notes-input" class="text-input" placeholder="Add descriptions, locations, links..." style="height: 80px; resize: none;"></textarea>
                        </div>
                    </div>

                    <div style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 12px;">
                        <button class="btn" id="btn-add-cancel" style="background: rgba(255,255,255,0.05); color: white; border: 1px solid var(--border);">Cancel</button>
                        <button class="btn btn-primary" id="btn-add-save">Create Event</button>
                    </div>
                </div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        let currentWeekOffset = 0;
        let selectedTaskId = null;
        let selectedTask = null;

        const updateHeading = (startOfWeek) => {
            const heading = document.getElementById('schedule-week-heading');
            if (!heading) return;
            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            
            const fmt = (d) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            heading.innerText = `Agenda: ${fmt(startOfWeek)} — ${fmt(endOfWeek)}`;
        };

        const renderSchedule = async () => {
            const tasks = await getTasks();
            const onboarding = getUserOnboarding() || { career: 'comic_creator' };
            const daysContainer = document.getElementById('calendar-days-container');
            const milestonesContainer = document.getElementById('milestones-list-container');
            
            if (!daysContainer) return;

            // Calculate current week dates based on offset
            const startOfWeek = new Date();
            const currentDay = startOfWeek.getDay();
            const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
            startOfWeek.setDate(startOfWeek.getDate() + distanceToMonday + (currentWeekOffset * 7));
            startOfWeek.setHours(0,0,0,0);

            updateHeading(startOfWeek);

            // Generate days list
            const weekDays = [];
            const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
            
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(startOfWeek);
                dayDate.setDate(startOfWeek.getDate() + i);
                const dateStr = dayDate.toISOString().split('T')[0];
                weekDays.push({
                    name: dayNames[i],
                    date: dateStr,
                    dateLabel: dayDate.toLocaleDateString(undefined, { day: 'numeric', month: 'numeric' }),
                    tasks: tasks.filter(t => t.startDate === dateStr || (t.startDate <= dateStr && t.endDate >= dateStr))
                });
            }

            // Render columns
            daysContainer.innerHTML = weekDays.map(day => {
                const tasksHtml = day.tasks.map(t => {
                    const isComp = t.status === 'completed';
                    const typeClass = t.type ? `type-${t.type}` : 'type-ai';
                    
                    return `
                        <div class="calendar-task-card ${isComp ? 'completed' : ''} ${typeClass}" data-id="${t.id}">
                            <div class="task-phase-tag">${t.phaseName ? t.phaseName.replace("Phase", "P") : (t.type === 'personal' ? 'Personal' : 'Reminder')}</div>
                            <div class="task-title">${t.title}</div>
                            <div class="task-duration">
                                <span>⏱️ ${t.durationHours} hrs</span>
                                ${t.notes ? '<span style="color: var(--secondary); font-size: 11px;">📝</span>' : ''}
                            </div>
                        </div>
                    `;
                }).join('');

                return `
                    <div class="calendar-day-column">
                        <div class="calendar-day-header">
                            <span>${day.name}</span>
                            <span class="calendar-day-date">${day.dateLabel}</span>
                        </div>
                        <div style="flex: 1; display: flex; flex-direction: column;">
                            ${tasksHtml}
                        </div>
                    </div>
                `;
            }).join('');

            // Calculate Milestones Achievements based on completed phases
            const phaseStatus = {};
            tasks.forEach(t => {
                const phase = t.phaseName || "Project Pipeline";
                if (!phaseStatus[phase]) {
                    phaseStatus[phase] = { total: 0, completed: 0 };
                }
                phaseStatus[phase].total++;
                if (t.status === 'completed') {
                    phaseStatus[phase].completed++;
                }
            });

            const milestonesHtml = Object.keys(phaseStatus).map(phase => {
                const st = phaseStatus[phase];
                const isComplete = st.completed === st.total && st.total > 0;
                return `
                    <div class="milestone-item">
                        <span class="milestone-check">${isComplete ? '✓' : '○'}</span>
                        <div class="${isComplete ? '' : 'milestone-pending'}">
                            <strong style="color: ${isComplete ? 'var(--success)' : 'white'};">${phase} Outline</strong>
                            <div style="font-size: 11px; color: var(--text-muted);">${st.completed} / ${st.total} tasks finished</div>
                        </div>
                    </div>
                `;
            }).join('');

            milestonesContainer.innerHTML = milestonesHtml || '<div class="text-muted">No project milestones generated.</div>';

            // Click card opens Details Inspector Modal
            document.querySelectorAll('.calendar-task-card').forEach(card => {
                card.addEventListener('click', () => {
                    const id = card.getAttribute('data-id');
                    selectedTask = tasks.find(t => t.id.toString() === id.toString());
                    if (selectedTask) {
                        selectedTaskId = id;
                        
                        document.getElementById('inspect-title-header').innerText = selectedTask.title;
                        document.getElementById('inspect-id-sub').innerText = `Task ID: ${selectedTask.id} • Type: ${selectedTask.type || 'ai'}`;
                        document.getElementById('inspect-title-input').value = selectedTask.title;
                        document.getElementById('inspect-duration-input').value = selectedTask.durationHours || 2;
                        document.getElementById('inspect-date-input').value = selectedTask.startDate;
                        document.getElementById('inspect-type-select').value = selectedTask.type || 'ai';
                        document.getElementById('inspect-notes-input').value = selectedTask.notes || '';
                        document.getElementById('inspect-complete-check').checked = selectedTask.status === 'completed';

                        document.getElementById('task-inspector-modal').style.display = 'flex';
                    }
                });
            });
        };

        await renderSchedule();

        // Add Event click triggers Add Custom Task Modal
        const addModal = document.getElementById('add-task-modal');
        document.getElementById('btn-add-custom-task').addEventListener('click', () => {
            document.getElementById('add-title-input').value = '';
            document.getElementById('add-duration-input').value = 2;
            document.getElementById('add-date-input').value = new Date().toISOString().split('T')[0];
            document.getElementById('add-type-select').value = 'personal';
            document.getElementById('add-notes-input').value = '';
            addModal.style.display = 'flex';
        });

        document.getElementById('btn-add-cancel').addEventListener('click', () => {
            addModal.style.display = 'none';
        });

        document.getElementById('btn-add-save').addEventListener('click', async () => {
            const title = document.getElementById('add-title-input').value.trim();
            const duration = parseInt(document.getElementById('add-duration-input').value) || 2;
            const date = document.getElementById('add-date-input').value;
            const type = document.getElementById('add-type-select').value;
            const notes = document.getElementById('add-notes-input').value.trim();

            if (title && date) {
                await addTask({
                    title: title,
                    durationHours: duration,
                    startDate: date,
                    type: type,
                    notes: notes,
                    phaseName: type === 'personal' ? 'Personal' : (type === 'reminder' ? 'Reminders' : 'AI Overrides')
                });
                addModal.style.display = 'none';
                await renderSchedule();
            }
        });

        // Inspector Modal actions
        const inspectModal = document.getElementById('task-inspector-modal');

        document.getElementById('btn-inspect-cancel').addEventListener('click', () => {
            inspectModal.style.display = 'none';
        });

        document.getElementById('btn-inspect-save').addEventListener('click', async () => {
            if (selectedTask) {
                const title = document.getElementById('inspect-title-input').value.trim();
                const duration = parseInt(document.getElementById('inspect-duration-input').value) || 2;
                const date = document.getElementById('inspect-date-input').value;
                const type = document.getElementById('inspect-type-select').value;
                const notes = document.getElementById('inspect-notes-input').value.trim();
                const isComplete = document.getElementById('inspect-complete-check').checked;

                const fields = {
                    title: title,
                    durationHours: duration,
                    type: type,
                    notes: notes,
                    status: isComplete ? 'completed' : 'pending'
                };

                if (date !== selectedTask.startDate) {
                    // Start date shifted -> rebalance topologically
                    await rebalanceSchedule(selectedTaskId, date);
                }

                await updateTaskDetails(selectedTaskId, fields);
                inspectModal.style.display = 'none';
                await renderSchedule();
            }
        });

        document.getElementById('btn-inspect-delete').addEventListener('click', async () => {
            if (selectedTaskId) {
                if (confirm("Are you sure you want to delete this event?")) {
                    await deleteTask(selectedTaskId);
                    inspectModal.style.display = 'none';
                    await renderSchedule();
                }
            }
        });

        document.getElementById('btn-inspect-dup-daily').addEventListener('click', async () => {
            if (selectedTaskId) {
                await duplicateTask(selectedTaskId, 'daily');
                inspectModal.style.display = 'none';
                await renderSchedule();
            }
        });

        document.getElementById('btn-inspect-dup-weekly').addEventListener('click', async () => {
            if (selectedTaskId) {
                await duplicateTask(selectedTaskId, 'weekly');
                inspectModal.style.display = 'none';
                await renderSchedule();
            }
        });

        // Week Navigation Listeners
        document.getElementById('btn-prev-week').addEventListener('click', async () => {
            currentWeekOffset--;
            await renderSchedule();
        });

        document.getElementById('btn-next-week').addEventListener('click', async () => {
            currentWeekOffset++;
            await renderSchedule();
        });
    }
};
