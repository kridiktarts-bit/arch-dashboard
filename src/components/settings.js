import { getUserOnboarding, saveUserOnboarding } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'settings-view';

        const profile = getUserOnboarding() || { firstName: 'User', age: 18, education: 'Other', career: 'architecture', goals: [] };

        container.innerHTML = `
            <style>
                .settings-grid { display: flex; flex-direction: column; gap: 24px; max-width: 600px; margin-top: 24px; }
                .settings-section { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }
                .settings-section h3 { margin-bottom: 16px; font-size: 18px; color: white; display: flex; align-items: center; gap: 8px; }
                .settings-form { display: flex; flex-direction: column; gap: 16px; }
                .settings-group { display: flex; flex-direction: column; gap: 8px; }
                .settings-group label { font-size: 13px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; }
                .settings-group input, .settings-group select { padding: 12px; background: rgba(0,0,0,0.3); border: 1px solid var(--border); border-radius: 8px; color: white; }
                .settings-group input:focus { border-color: var(--primary); outline: none; }
            </style>

            <div>
                <h2>Settings</h2>
                <p class="text-muted">Manage your profile, change your target career, or restart onboarding.</p>
            </div>

            <div class="settings-grid">
                <div class="settings-section">
                    <h3>👤 Edit Profile</h3>
                    <div class="settings-form">
                        <div class="settings-group">
                            <label>First Name</label>
                            <input type="text" id="settings-name" value="${profile.firstName}">
                        </div>
                        <div class="settings-group">
                            <label>Age</label>
                            <input type="number" id="settings-age" value="${profile.age}">
                        </div>
                        <div class="settings-group">
                            <label>Education</label>
                            <select id="settings-education">
                                <option value="Middle School" ${profile.education === 'Middle School' ? 'selected' : ''}>Middle School</option>
                                <option value="High School" ${profile.education === 'High School' ? 'selected' : ''}>High School</option>
                                <option value="College Freshman" ${profile.education === 'College Freshman' ? 'selected' : ''}>College Freshman</option>
                                <option value="Sophomore" ${profile.education === 'Sophomore' ? 'selected' : ''}>Sophomore</option>
                                <option value="Junior" ${profile.education === 'Junior' ? 'selected' : ''}>Junior</option>
                                <option value="Senior" ${profile.education === 'Senior' ? 'selected' : ''}>Senior</option>
                                <option value="Trade School" ${profile.education === 'Trade School' ? 'selected' : ''}>Trade School</option>
                                <option value="Already Working" ${profile.education === 'Already Working' ? 'selected' : ''}>Already Working</option>
                                <option value="Other" ${profile.education === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <button class="btn btn-primary" id="save-settings-btn" style="margin-top: 8px; align-self: flex-start;">Save Changes</button>
                    </div>
                </div>

                <div class="settings-section" style="border-color: rgba(239, 68, 68, 0.3);">
                    <h3 style="color: var(--danger);">⚠️ Danger Zone</h3>
                    <p class="text-muted" style="font-size: 14px; margin-bottom: 16px;">Change your career track or completely reset your local data. This will clear your current tasks, portfolio checklists, and milestones.</p>
                    <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                        <button class="btn" id="change-career-btn" style="background: rgba(239, 68, 68, 0.1); border: 1px solid var(--danger); color: #f87171;">Change Career Track</button>
                        <button class="btn" id="reset-app-btn" style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text-muted);">Reset All Local Data</button>
                    </div>
                </div>
            </div>
        `;

        return container;
    },

    onMount: () => {
        document.getElementById('save-settings-btn').addEventListener('click', () => {
            const profile = getUserOnboarding();
            if (profile) {
                profile.firstName = document.getElementById('settings-name').value.trim() || profile.firstName;
                profile.age = parseInt(document.getElementById('settings-age').value) || profile.age;
                profile.education = document.getElementById('settings-education').value;
                saveUserOnboarding(profile);
                alert("Profile changes saved! Reloading...");
                window.location.reload();
            }
        });

        document.getElementById('change-career-btn').addEventListener('click', () => {
            if (confirm("Are you sure you want to change your career? Your current milestones and tasks will be reset.")) {
                localStorage.removeItem('user_onboarding');
                window.location.reload();
            }
        });

        document.getElementById('reset-app-btn').addEventListener('click', () => {
            if (confirm("DANGER: This will completely delete ALL your saved progress, checklist items, and profile details. Are you sure?")) {
                localStorage.clear();
                window.location.reload();
            }
        });
    }
};
