import { getAxp, getTasks, saveReflection, getUserOnboarding } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'reset-view fade-in';

        container.innerHTML = `
            <style>
                .wellness-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
                .focus-card { background: linear-gradient(rgba(10, 25, 47, 0.9), rgba(10, 25, 47, 0.95)), url('assets/media__1778714721711.jpg') center/cover; border: 1px solid var(--primary); padding: 40px; border-radius: 16px; text-align: center; }
                .focus-timer { font-size: 80px; font-weight: 700; color: var(--primary); text-shadow: 0 0 30px var(--primary-glow); font-variant-numeric: tabular-nums; margin: 20px 0; letter-spacing: -2px; }
                
                .timer-presets { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
                .preset-btn { background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; cursor: pointer; transition: var(--transition); }
                .preset-btn.active, .preset-btn:hover { background: var(--primary); border-color: var(--primary); color: #0a192f; }
                
                .custom-timer-row { display: flex; justify-content: center; gap: 8px; margin-bottom: 24px; }
                .custom-timer-input { width: 80px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); color: white; border-radius: 4px; padding: 6px; text-align: center; }

                .audio-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 16px; }
                .audio-btn { background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 12px; font-size: 13px; color: #cbd5e1; cursor: pointer; text-align: left; display: flex; align-items: center; gap: 8px; transition: var(--transition); }
                .audio-btn.playing { border-color: var(--secondary); background: rgba(100, 255, 218, 0.1); color: var(--secondary); }
                
                .reflection-card { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); padding: 32px; border-radius: 16px; }
                .reflect-input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px; color: white; padding: 12px; margin-bottom: 16px; min-height: 70px; resize: vertical; font-size: 14px; }
                .reflect-input:focus { outline: none; border-color: var(--primary); background: rgba(0,0,0,0.4); }
                .reflect-label { font-weight: 600; color: var(--primary); font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }
                
                .burnout-signal { background: rgba(239, 68, 68, 0.1); border-left: 3px solid #ef4444; padding: 16px; border-radius: 4px 8px 8px 4px; margin-bottom: 24px; font-size: 14px; color: #fca5a5; display: none; align-items: center; gap: 12px; }
                .burnout-signal.active { display: flex; }

                .break-overlay { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 25, 47, 0.98); z-index: 1000; justify-content: center; align-items: center; flex-direction: column; text-align: center; }
                .break-prompt { font-size: 32px; color: var(--secondary); font-weight: 600; margin-bottom: 16px; max-width: 600px; padding: 0 20px; line-height: 1.3; }
                .break-countdown { font-size: 96px; font-weight: 700; color: white; font-variant-numeric: tabular-nums; margin-bottom: 32px; }
            </style>

            <div style="margin-bottom: 24px;">
                <h2 style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">🧘 Focus & Wellness Hub</h2>
                <p class="text-muted" style="margin-top: 8px;">Maintain focus, prevent burnout, and manage breaks effectively during study and work blocks.</p>
            </div>

            <div class="burnout-signal" id="burnout-signal">
                <span style="font-size: 20px;">🔥</span>
                <span id="burnout-text">You've logged significant study blocks recently. A recovery evening is highly recommended to prevent academic burnout.</span>
            </div>

            <div class="wellness-grid">
                <!-- Focus Mode & Audio -->
                <div class="focus-card">
                    <h3 style="color: white; margin-bottom: 8px;" id="focus-card-title">Focus Session</h3>
                    <p class="text-muted" style="font-size: 13px; margin-bottom: 20px;">Minimize distractions. Select duration below:</p>
                    
                    <div class="timer-presets">
                        <button class="preset-btn" data-time="25">25 Min</button>
                        <button class="preset-btn active" data-time="45">45 Min</button>
                        <button class="preset-btn" data-time="60">60 Min</button>
                        <button class="preset-btn" data-time="90">90 Min</button>
                    </div>

                    <div class="custom-timer-row">
                        <input type="number" class="custom-timer-input" id="custom-minutes" placeholder="Mins">
                        <button class="btn" id="apply-custom-btn" style="padding: 6px 12px; font-size: 12px;">Apply</button>
                    </div>
                    
                    <div class="focus-timer" id="deep-timer">45:00</div>
                    
                    <div style="display: flex; justify-content: center; gap: 16px; margin-bottom: 24px;">
                        <button class="btn btn-primary" id="start-deep-btn" style="padding: 12px 32px; font-size: 16px; border-radius: 24px;">Enter Flow</button>
                        <button class="btn" id="reset-deep-btn" style="background: rgba(255,255,255,0.1); border: 1px solid var(--border); padding: 12px 24px; border-radius: 24px;">Reset</button>
                        <button class="btn btn-secondary" id="trigger-break-btn" style="padding: 12px 24px; border-radius: 24px;">Start Break</button>
                    </div>

                    <h4 style="color: white; text-align: left; font-size: 14px; margin-bottom: 12px;">🎵 Ambient Soundscapes</h4>
                    <div class="audio-grid">
                        <button class="audio-btn" data-src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3">🌧️ Rain</button>
                        <button class="audio-btn" data-src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3">🌊 Ocean Waves</button>
                        <button class="audio-btn" data-src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3">🌲 Forest wind</button>
                        <button class="audio-btn" data-src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3">🔥 Fireplace crackle</button>
                        <button class="audio-btn" data-src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3">💨 White Noise</button>
                        <button class="audio-btn" data-src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3">☕ Café Ambience</button>
                        <button class="audio-btn" data-src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3">🎹 Soft Piano</button>
                        <button class="audio-btn" data-src="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3">🧘 Ambient Zen</button>
                    </div>
                </div>

                <!-- Reflection & Wellness Wrap-up -->
                <div class="reflection-card">
                    <h3 style="color: white; margin-bottom: 8px;">Wrap-Up Reflection</h3>
                    <p class="text-muted" style="font-size: 13px; margin-bottom: 24px;">Acknowledge achievements and track wellness trends.</p>

                    <div>
                        <label class="reflect-label">What was the biggest focus obstacle today?</label>
                        <textarea class="reflect-input" id="ref-frustration" placeholder="e.g. Phone notifications, lack of sleep, complex biochemistry mechanism review..."></textarea>
                    </div>
                    
                    <div>
                        <label class="reflect-label">Main priority for the next study/work session?</label>
                        <textarea class="reflect-input" id="ref-win" placeholder="e.g. Finish gross anatomy cardiovascular diagram, practice timed QBank block..."></textarea>
                    </div>
                    
                    <div>
                        <label class="reflect-label">How is your overall energy level? (1-10)</label>
                        <input type="text" class="reflect-input" id="ref-improve" placeholder="e.g. 7 - feeling slightly tired but accomplished.">
                    </div>

                    <div style="text-align: right; margin-top: 8px;">
                        <button class="btn btn-primary" id="save-reflect-btn">Log Reflection</button>
                    </div>
                </div>
            </div>

            <!-- Fullscreen Break Overlay -->
            <div class="break-overlay" id="break-overlay">
                <div style="font-size: 48px; margin-bottom: 20px;">🧘</div>
                <div class="break-prompt" id="break-prompt-text">Rest your eyes: Look at something 20 feet away for 20 seconds.</div>
                <div class="break-countdown" id="break-timer-display">05:00</div>
                <button class="btn btn-primary" id="skip-break-btn" style="padding: 12px 36px; border-radius: 24px;">Return to Work</button>
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
                
                if (pendingTasks >= 12) {
                    signalText.textContent = `You have ${pendingTasks} active items scheduled on your planner. Take a focused break or delegate minor tasks.`;
                    signal.classList.add('active');
                } else {
                    const hrs = localStorage.getItem('weeklyHours_doctor') || 20;
                    if (hrs > 25) {
                        signalText.textContent = `You have scheduled ${hrs} focus hours this week. Ensure to take microbreaks to maintain mental focus.`;
                        signal.classList.add('active');
                    }
                }
            } catch(e) {}
        };
        checkBurnout();

        // Timer Logic
        let timerInterval;
        let timeLeft = 45 * 60; // default 45 mins
        let isRunning = false;
        const display = document.getElementById('deep-timer');
        const startBtn = document.getElementById('start-deep-btn');
        const resetBtn = document.getElementById('reset-deep-btn');
        const triggerBreakBtn = document.getElementById('trigger-break-btn');

        const updateDisplay = () => {
            const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
            const s = (timeLeft % 60).toString().padStart(2, '0');
            display.textContent = `${m}:${s}`;
        };

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                timeLeft = parseInt(btn.getAttribute('data-time')) * 60;
                updateDisplay();
                if (isRunning) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startBtn.textContent = 'Enter Flow';
                }
            });
        });

        // Apply Custom mins
        const applyCustomBtn = document.getElementById('apply-custom-btn');
        const customMinsInput = document.getElementById('custom-minutes');
        applyCustomBtn.addEventListener('click', () => {
            const val = parseInt(customMinsInput.value);
            if (val > 0 && val <= 180) {
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                timeLeft = val * 60;
                updateDisplay();
                if (isRunning) {
                    clearInterval(timerInterval);
                    isRunning = false;
                    startBtn.textContent = 'Enter Flow';
                }
            }
        });

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
                        isRunning = false;
                        startBtn.textContent = 'Enter Flow';
                        triggerBreak();
                    }
                }, 1000);
            }
        });

        resetBtn.addEventListener('click', () => {
            clearInterval(timerInterval);
            isRunning = false;
            startBtn.textContent = 'Enter Flow';
            const activePreset = document.querySelector('.preset-btn.active');
            timeLeft = activePreset ? parseInt(activePreset.getAttribute('data-time')) * 60 : 45 * 60;
            updateDisplay();
        });

        // Audio controls
        let activeAudio = null;
        document.querySelectorAll('.audio-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const src = btn.getAttribute('data-src');
                
                if (btn.classList.contains('playing')) {
                    if (activeAudio) {
                        activeAudio.pause();
                    }
                    btn.classList.remove('playing');
                    activeAudio = null;
                } else {
                    document.querySelectorAll('.audio-btn').forEach(b => b.classList.remove('playing'));
                    if (activeAudio) {
                        activeAudio.pause();
                    }
                    
                    btn.classList.add('playing');
                    activeAudio = new Audio(src);
                    activeAudio.loop = true;
                    activeAudio.volume = 0.5;
                    activeAudio.play().catch(e => console.log('Audio autoplay blocked by browser permissions'));
                }
            });
        });

        // Break mode logic
        const breakOverlay = document.getElementById('break-overlay');
        const breakPromptText = document.getElementById('break-prompt-text');
        const breakTimerDisplay = document.getElementById('break-timer-display');
        const skipBreakBtn = document.getElementById('skip-break-btn');

        const breakPrompts = [
            "Stretch: Stand up and roll your shoulders back. Stretch your arms overhead.",
            "Stay Hydrated: Go grab a fresh glass of cold water.",
            "Rest your eyes: Look at an object 20 feet away for 20 seconds (20-20-20 rule).",
            "Take a walk: Step outside or walk around your room for a minute.",
            "Breathe: Close your eyes and take 5 slow, deep breaths."
        ];

        let breakInterval;
        let breakTimeLeft = 5 * 60; // 5 minute breaks

        const triggerBreak = () => {
            if (activeAudio) {
                activeAudio.pause();
            }
            document.querySelectorAll('.audio-btn').forEach(b => b.classList.remove('playing'));
            
            // Random prompt
            const randPrompt = breakPrompts[Math.floor(Math.random() * breakPrompts.length)];
            breakPromptText.textContent = randPrompt;
            
            breakOverlay.style.display = 'flex';
            breakTimeLeft = 5 * 60;
            
            // Load a relaxing ambient song for the break
            activeAudio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3');
            activeAudio.loop = true;
            activeAudio.volume = 0.4;
            activeAudio.play().catch(e => {});

            const updateBreakDisplay = () => {
                const m = Math.floor(breakTimeLeft / 60).toString().padStart(2, '0');
                const s = (breakTimeLeft % 60).toString().padStart(2, '0');
                breakTimerDisplay.textContent = `${m}:${s}`;
            };
            
            updateBreakDisplay();
            
            breakInterval = setInterval(() => {
                if (breakTimeLeft > 0) {
                    breakTimeLeft--;
                    updateBreakDisplay();
                    // Rotate prompts every 60 seconds
                    if (breakTimeLeft % 60 === 0) {
                        breakPromptText.textContent = breakPrompts[Math.floor(Math.random() * breakPrompts.length)];
                    }
                } else {
                    clearInterval(breakInterval);
                    if (activeAudio) {
                        activeAudio.pause();
                        activeAudio = null;
                    }
                    breakOverlay.style.display = 'none';
                    alert('Break complete! Let\'s lock back in.');
                }
            }, 1000);
        };

        triggerBreakBtn.addEventListener('click', triggerBreak);

        skipBreakBtn.addEventListener('click', () => {
            clearInterval(breakInterval);
            if (activeAudio) {
                activeAudio.pause();
                activeAudio = null;
            }
            breakOverlay.style.display = 'none';
        });

        // Save reflection notes
        const saveReflectBtn = document.getElementById('save-reflect-btn');
        if (saveReflectBtn) {
            saveReflectBtn.addEventListener('click', async () => {
                const frustration = document.getElementById('ref-frustration').value;
                const win = document.getElementById('ref-win').value;
                const improve = document.getElementById('ref-improve').value;
                
                await saveReflection({
                    frustration,
                    win,
                    improve,
                    timestamp: new Date().toISOString()
                });
                alert('Wellness reflection logged successfully!');
                document.getElementById('ref-frustration').value = '';
                document.getElementById('ref-win').value = '';
                document.getElementById('ref-improve').value = '';
            });
        }
    }
};
