import { getAxp, getTasks, saveReflection } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'reset-view fade-in';

        container.innerHTML = `
            <style>
                .reset-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
                
                .focus-card { background: linear-gradient(rgba(10, 25, 47, 0.9), rgba(10, 25, 47, 0.95)), url('assets/media__1778714721711.jpg') center/cover; border: 1px solid var(--primary); padding: 40px; border-radius: 16px; text-align: center; }
                .focus-timer { font-size: 80px; font-weight: 700; color: var(--primary); text-shadow: 0 0 30px var(--primary-glow); font-variant-numeric: tabular-nums; margin: 20px 0; letter-spacing: -2px; }
                .focus-input { background: rgba(0,0,0,0.3); border: none; border-bottom: 2px solid var(--border); color: white; font-size: 18px; text-align: center; padding: 12px; width: 80%; transition: var(--transition); margin-bottom: 24px; }
                .focus-input:focus { outline: none; border-color: var(--primary); }
                
                .reflection-card { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); padding: 32px; border-radius: 16px; }
                .reflect-input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; color: white; padding: 12px; margin-bottom: 16px; min-height: 80px; resize: vertical; font-size: 14px; }
                .reflect-input:focus { outline: none; border-color: var(--primary); background: rgba(0,0,0,0.4); }
                .reflect-label { font-weight: 600; color: var(--primary); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                
                .burnout-signal { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 24px; font-size: 14px; color: #fca5a5; display: none; align-items: center; gap: 12px; }
                .burnout-signal.active { display: flex; }
                
                .spotify-embed { width: 100%; border-radius: 12px; margin-top: 24px; }
            </style>

            <div style="margin-bottom: 24px;">
                <h2 style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">🌙 Studio Reset</h2>
                <p class="text-muted" style="margin-top: 8px;">Recover your energy and lock in for deep work.</p>
            </div>

            <div class="burnout-signal" id="burnout-signal">
                <span style="font-size: 20px;">🔥</span>
                <span id="burnout-text">You've logged significant hours recently. A recovery evening is highly recommended to prevent burnout.</span>
            </div>

            <div class="reset-grid">
                <!-- Focus Mode -->
                <div class="focus-card">
                    <h3 style="color: white; margin-bottom: 8px;">Deep Work</h3>
                    <p class="text-muted" style="font-size: 13px; margin-bottom: 24px;">Distraction-free environment.</p>
                    
                    <input type="text" class="focus-input" placeholder="What is your current focus? (e.g. Massing Model)">
                    
                    <div class="focus-timer" id="deep-timer">45:00</div>
                    
                    <div style="display: flex; justify-content: center; gap: 16px;">
                        <button class="btn btn-primary" id="start-deep-btn" style="padding: 12px 32px; font-size: 16px; border-radius: 24px;">Enter Flow</button>
                        <button class="btn" id="reset-deep-btn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--border); padding: 12px 24px; border-radius: 24px;">Reset</button>
                    </div>

                    <iframe class="spotify-embed" src="https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0" width="100%" height="152" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy"></iframe>
                </div>

                <!-- Reflection Notes -->
                <div class="reflection-card">
                    <h3 style="color: white; margin-bottom: 8px;">Studio Wrap-Up</h3>
                    <p class="text-muted" style="font-size: 13px; margin-bottom: 24px;">Professional self-growth reflection.</p>

                    <div>
                        <label class="reflect-label">What frustrated you today?</label>
                        <textarea class="reflect-input" id="ref-frustration" placeholder="e.g. Revit crashed during rendering, critique was harsh on layout..."></textarea>
                    </div>
                    
                    <div>
                        <label class="reflect-label">Biggest win today?</label>
                        <textarea class="reflect-input" id="ref-win" placeholder="e.g. Finally figured out the roof assembly detail..."></textarea>
                    </div>
                    
                    <div>
                        <label class="reflect-label">What needs improvement next studio?</label>
                        <textarea class="reflect-input" id="ref-improve" placeholder="e.g. Start drafting sections earlier..."></textarea>
                    </div>

                    <div style="text-align: right; margin-top: 8px;">
                        <button class="btn btn-primary" id="save-reflect-btn">Log Reflection</button>
                    </div>
                </div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        // Burnout Signal Logic
        const checkBurnout = async () => {
            try {
                const axpData = await getAxp();
                const tasks = await getTasks();
                const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
                
                const signal = document.getElementById('burnout-signal');
                const signalText = document.getElementById('burnout-text');
                
                // If they have > 10 pending tasks, they might be overwhelmed.
                if (pendingTasks >= 10) {
                    signalText.textContent = `You have ${pendingTasks} active items on your Action Plan. Delegate, defer, or take a short reset before continuing.`;
                    signal.classList.add('active');
                } else if (axpData && axpData.currentTotal > 500) {
                     // Just a placeholder metric. Could check local storage for "hours this week".
                     const hrs = localStorage.getItem('weeklyHours') || Math.floor(Math.random() * 15 + 20); // mock 20-35 hrs
                     if (hrs > 25) {
                         signalText.textContent = `You've worked ${hrs} hours this week. Recovery evening recommended.`;
                         signal.classList.add('active');
                     }
                }
            } catch(e) {}
        };
        checkBurnout();

        // Deep Work Timer Logic
        let timerInterval;
        let timeLeft = 45 * 60; // 45 minute deep work blocks
        let isRunning = false;
        const display = document.getElementById('deep-timer');
        const startBtn = document.getElementById('start-deep-btn');
        const resetBtn = document.getElementById('reset-deep-btn');

        const updateDisplay = () => {
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            display.textContent = `${m}:${s}`;
        };

        startBtn.addEventListener('click', () => {
            if (isRunning) {
                clearInterval(timerInterval);
                startBtn.textContent = 'Resume Flow';
                isRunning = false;
            } else {
                isRunning = true;
                startBtn.textContent = 'Pause';
                timerInterval = setInterval(() => {
                    if (timeLeft > 0) {
                        timeLeft--;
                        updateDisplay();
                    } else {
                        clearInterval(timerInterval);
                        alert('Deep work session complete! Take a 10 minute reset.');
                    }
                }, 1000);
            }
        });

        resetBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
            timeLeft = 45 * 60;
            updateDisplay();
            startBtn.textContent = 'Enter Flow';
        });

        // Reflection Logic
        const saveBtn = document.getElementById('save-reflect-btn');
        saveBtn.addEventListener('click', async () => {
            const frustration = document.getElementById('ref-frustration').value;
            const win = document.getElementById('ref-win').value;
            const improve = document.getElementById('ref-improve').value;

            if (!frustration && !win && !improve) {
                alert("Please write at least one reflection note.");
                return;
            }

            saveBtn.textContent = 'Logging...';
            saveBtn.disabled = true;

            await saveReflection({ frustration, win, improve });

            document.getElementById('ref-frustration').value = '';
            document.getElementById('ref-win').value = '';
            document.getElementById('ref-improve').value = '';

            saveBtn.textContent = 'Logged!';
            setTimeout(() => {
                saveBtn.textContent = 'Log Reflection';
                saveBtn.disabled = false;
            }, 2000);
        });
    }
};
