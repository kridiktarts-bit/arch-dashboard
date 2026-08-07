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
                
                .timer-card { text-align: center; padding: 24px 16px; }
                .timer-display { font-weight: 700; font-variant-numeric: tabular-nums; color: var(--primary); text-shadow: 0 0 20px var(--primary-glow); }
                
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
                    <h3>Focus & Relax Sessions</h3>
                    <p class="text-muted" style="margin-top: 8px; font-size: 13px; margin-bottom: 20px;">Procure steady intervals with calm ambient noise.</p>
                    
                    <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 24px;">
                        <!-- Focus Timer Column -->
                        <div style="flex: 1; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 12px;">
                            <div style="font-weight: 600; font-size: 12px; color: var(--primary);">⏱️ Focus Timer</div>
                            <div class="timer-display" id="focus-timer-display" style="font-size: 32px; margin: 10px 0;">25:00</div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px;">
                                <span>Length:</span>
                                <input type="number" id="focus-duration-input" value="25" min="1" max="180" style="width: 45px; padding: 4px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 4px; color: white; text-align: center; font-size: 11px;">
                                <span>m</span>
                            </div>
                        </div>

                        <!-- Relax Timer Column -->
                        <div style="flex: 1; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 12px;">
                            <div style="font-weight: 600; font-size: 12px; color: var(--success);">🌱 Relax Break</div>
                            <div class="timer-display" id="relax-timer-display" style="font-size: 32px; margin: 10px 0; color: var(--success); text-shadow: 0 0 10px rgba(16, 185, 129, 0.3);">05:00</div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 4px; font-size: 11px;">
                                <span>Length:</span>
                                <input type="number" id="relax-duration-input" value="5" min="1" max="180" style="width: 45px; padding: 4px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 4px; color: white; text-align: center; font-size: 11px;">
                                <span>m</span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; gap: 12px; justify-content: center; margin-bottom: 24px;">
                        <button class="btn btn-primary" id="timer-start" style="padding: 8px 20px; font-size: 13px;">Start Focus</button>
                        <button class="btn" id="timer-reset" style="background: rgba(255,255,255,0.1); padding: 8px 16px; font-size: 13px;">Reset</button>
                    </div>

                    <!-- Ambient Sound Machine -->
                    <div style="border-top: 1px solid var(--border); padding-top: 16px; margin-top: 16px;">
                        <h4 style="font-size: 13px; color: white; margin-bottom: 12px; font-weight: 600;">🎧 Calm Ambient Sounds</h4>
                        <div style="display: flex; justify-content: center; gap: 8px;">
                            <button class="nav-week-btn" id="btn-sound-rain" style="padding: 6px 10px; font-size: 11px;">🌧️ Rain</button>
                            <button class="nav-week-btn" id="btn-sound-ocean" style="padding: 6px 10px; font-size: 11px;">🌊 Ocean</button>
                            <button class="nav-week-btn" id="btn-sound-mute" style="padding: 6px 10px; font-size: 11px; background: rgba(239, 68, 68, 0.15); color: var(--danger); border-color: rgba(239,68,68,0.3);">🔇 Mute</button>
                        </div>
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

            // Filter tasks active on dateCursor
            const dailyTasks = tasks.filter(t => t.startDate === targetDateStr || (t.startDate <= targetDateStr && t.endDate >= targetDateStr));

            let html = '';
            if (dailyTasks.length === 0) {
                html = '<div style="text-align: center; color: var(--text-muted); padding: 40px 20px;">No scheduled tasks for this day. Enjoy your rest!</div>';
            } else {
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

        // Day Navigation
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

        // FOCUS & RELAX TIMER ENGINE
        let timerInterval;
        let activeTimer = 'focus'; // 'focus' | 'relax'
        let isRunning = false;
        
        const focusDisplay = document.getElementById('focus-timer-display');
        const relaxDisplay = document.getElementById('relax-timer-display');
        const focusInput = document.getElementById('focus-duration-input');
        const relaxInput = document.getElementById('relax-duration-input');
        const startBtn = document.getElementById('timer-start');

        let focusTimeLeft = (parseInt(focusInput.value) || 25) * 60;
        let relaxTimeLeft = (parseInt(relaxInput.value) || 5) * 60;

        const updateTimerDisplays = () => {
            const fmt = (secs) => {
                const m = Math.floor(secs / 60).toString().padStart(2, '0');
                const s = (secs % 60).toString().padStart(2, '0');
                return `${m}:${s}`;
            };
            focusDisplay.textContent = fmt(focusTimeLeft);
            relaxDisplay.textContent = fmt(relaxTimeLeft);
        };

        const syncInputs = () => {
            if (!isRunning) {
                focusTimeLeft = (parseInt(focusInput.value) || 25) * 60;
                relaxTimeLeft = (parseInt(relaxInput.value) || 5) * 60;
                updateTimerDisplays();
            }
        };

        focusInput.addEventListener('change', syncInputs);
        focusInput.addEventListener('input', syncInputs);
        relaxInput.addEventListener('change', syncInputs);
        relaxInput.addEventListener('input', syncInputs);

        startBtn.addEventListener('click', () => {
            if (isRunning) {
                // Pause
                clearInterval(timerInterval);
                isRunning = false;
                startBtn.textContent = activeTimer === 'focus' ? 'Resume Focus' : 'Resume Relax';
                focusInput.disabled = false;
                relaxInput.disabled = false;
            } else {
                // Start
                isRunning = true;
                focusInput.disabled = true;
                relaxInput.disabled = true;
                startBtn.textContent = 'Pause';

                timerInterval = setInterval(() => {
                    if (activeTimer === 'focus') {
                        if (focusTimeLeft > 0) {
                            focusTimeLeft--;
                            updateTimerDisplays();
                        } else {
                            clearInterval(timerInterval);
                            isRunning = false;
                            alert('Focus Session complete! Time for a short relax break.');
                            activeTimer = 'relax';
                            startBtn.textContent = 'Start Relax';
                            focusInput.disabled = false;
                            relaxInput.disabled = false;
                        }
                    } else {
                        if (relaxTimeLeft > 0) {
                            relaxTimeLeft--;
                            updateTimerDisplays();
                        } else {
                            clearInterval(timerInterval);
                            isRunning = false;
                            alert('Relax Break complete! Let\'s focus again.');
                            activeTimer = 'focus';
                            // Reset both to input defaults
                            focusTimeLeft = (parseInt(focusInput.value) || 25) * 60;
                            relaxTimeLeft = (parseInt(relaxInput.value) || 5) * 60;
                            updateTimerDisplays();
                            startBtn.textContent = 'Start Focus';
                            focusInput.disabled = false;
                            relaxInput.disabled = false;
                        }
                    }
                }, 1000);
            }
        });

        document.getElementById('timer-reset').addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
            activeTimer = 'focus';
            focusTimeLeft = (parseInt(focusInput.value) || 25) * 60;
            relaxTimeLeft = (parseInt(relaxInput.value) || 5) * 60;
            updateTimerDisplays();
            startBtn.textContent = 'Start Focus';
            focusInput.disabled = false;
            relaxInput.disabled = false;
        });

        updateTimerDisplays();


        // WEB AUDIO procedurual sound machine
        let audioCtx = null;
        let rainSource = null;
        let oceanSource = null;
        let masterGain = null;

        const initAudio = () => {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                masterGain = audioCtx.createGain();
                masterGain.gain.value = 0.5;
                masterGain.connect(audioCtx.destination);
            }
        };

        const stopAllAudio = () => {
            if (rainSource) {
                try { rainSource.stop(); } catch(e) {}
                rainSource = null;
            }
            if (oceanSource) {
                try { oceanSource.stop(); } catch(e) {}
                oceanSource = null;
            }
        };

        const playRain = () => {
            initAudio();
            stopAllAudio();

            const bufferSize = audioCtx.sampleRate * 2;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, audioCtx.currentTime);

            source.connect(filter);
            filter.connect(masterGain);
            source.start();
            rainSource = source;
        };

        const playOcean = () => {
            initAudio();
            stopAllAudio();

            const bufferSize = audioCtx.sampleRate * 2;
            const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = buffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const source = audioCtx.createBufferSource();
            source.buffer = buffer;
            source.loop = true;

            const filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(450, audioCtx.currentTime);

            const waveGain = audioCtx.createGain();
            waveGain.gain.setValueAtTime(0.2, audioCtx.currentTime);

            source.connect(filter);
            filter.connect(waveGain);
            waveGain.connect(masterGain);
            source.start();

            let dir = 1;
            const modulate = setInterval(() => {
                if (!audioCtx || audioCtx.state === 'closed' || !oceanSource) {
                    clearInterval(modulate);
                    return;
                }
                let val = waveGain.gain.value;
                if (dir === 1) {
                    val += 0.04;
                    if (val >= 0.75) dir = -1;
                } else {
                    val -= 0.04;
                    if (val <= 0.1) dir = 1;
                }
                waveGain.gain.setValueAtTime(val, audioCtx.currentTime);
            }, 300);

            oceanSource = {
                stop: () => {
                    source.stop();
                    clearInterval(modulate);
                }
            };
        };

        document.getElementById('btn-sound-rain').addEventListener('click', () => {
            playRain();
            document.getElementById('btn-sound-rain').style.borderColor = 'var(--primary)';
            document.getElementById('btn-sound-ocean').style.borderColor = 'var(--border)';
        });

        document.getElementById('btn-sound-ocean').addEventListener('click', () => {
            playOcean();
            document.getElementById('btn-sound-rain').style.borderColor = 'var(--border)';
            document.getElementById('btn-sound-ocean').style.borderColor = 'var(--primary)';
        });

        document.getElementById('btn-sound-mute').addEventListener('click', () => {
            stopAllAudio();
            document.getElementById('btn-sound-rain').style.borderColor = 'var(--border)';
            document.getElementById('btn-sound-ocean').style.borderColor = 'var(--border)';
        });

        // Stop audio when navigating away
        window.addEventListener('hashchange', stopAllAudio);
    }
};
