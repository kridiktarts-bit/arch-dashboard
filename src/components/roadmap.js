import { getRoadmapCheckpoints, saveRoadmapCheckpoint } from '../db.js';

const ROADMAP_DATA = [
    {
        id: "phase-1",
        timeframe: "MAY → MID JUNE 2026",
        title: "Revit Foundation",
        details: [
            "Spend 1–3 hours daily on Revit.",
            "Learn walls, floors, stairs, windows, sheets, sections, rendering basics.",
            "Goal: Create one complete modern house project from scratch (not tutorial copying)."
        ]
    },
    {
        id: "phase-2",
        timeframe: "MID JUNE → MID JULY 2026",
        title: "Portfolio Projects & Presentation Skills",
        details: [
            "Make: Small modern house, Apartment redesign, Small café/store concept.",
            "Include floor plans, exterior/interior renders, simple diagrams.",
            "Spend 30m–1hr daily on Presentation (Photoshop, InDesign): clean layouts, typography."
        ]
    },
    {
        id: "phase-3",
        timeframe: "MID JULY → AUGUST 2026",
        title: "Organize Professionally",
        details: [
            "Create resume, LinkedIn, portfolio PDF, and folders for all projects.",
            "Research CCNY architecture culture, studio expectations, and student portfolios."
        ]
    },
    {
        id: "phase-4",
        timeframe: "FALL SEMESTER (AUG → DEC 2026)",
        title: "Adapt to Architecture School",
        details: [
            "Focus on time management, improving workflow, and getting comfortable in studio.",
            "Continue improving Revit, rendering, diagrams (extra 3–6 hrs/week).",
            "Begin Soft Networking: talk to professors, upperclassmen, studio classmates."
        ]
    },
    {
        id: "phase-5",
        timeframe: "WINTER BREAK (DEC 2026 → JAN 2027)",
        title: "Portfolio Polish & Early Applications",
        details: [
            "Spend 2–5 weeks improving portfolio (add best freshman projects, cleaner presentation).",
            "Apply to small internships, drafting help, office assistant roles (even if underqualified)."
        ]
    },
    {
        id: "phase-6",
        timeframe: "SPRING SEMESTER (JAN → MAY 2027)",
        title: "Internship Search & Skill Building",
        details: [
            "Apply to small architecture firms, local studios, drafting positions (Aim for 10–30 apps).",
            "Ensure proficiency in Revit, rendering, Photoshop, and diagrams."
        ]
    },
    {
        id: "phase-7",
        timeframe: "SUMMER 2027",
        title: "First Architecture Internship",
        details: [
            "Get real office exposure (drafting workflow, sheet setup, office communication).",
            "This matters heavily even if part-time or initially unpaid."
        ]
    },
    {
        id: "phase-8",
        timeframe: "SOPHOMORE YEAR (2027-2028)",
        title: "Part-Time Work & NCARB Record",
        details: [
            "Create NCARB Record officially to let your work hours count toward licensure.",
            "Goal: Secure a part-time firm job (10-20 hrs/week during semesters).",
            "Learn real construction (wall assemblies, codes, details)."
        ]
    },
    {
        id: "phase-9",
        timeframe: "SUMMER 2028",
        title: "Bigger Internship",
        details: [
            "Bigger internship or continued firm work.",
            "Firms will trust you with more real work since you know Revit, workflow, and basic construction drawings."
        ]
    },
    {
        id: "phase-10",
        timeframe: "JUNIOR YEAR (2028-2029)",
        title: "Become Professionally Solid",
        details: [
            "Focus on technical drawings, construction details, code knowledge, and real project workflow.",
            "Aim for consistent internships, repeat employers, and references."
        ]
    },
    {
        id: "phase-11",
        timeframe: "SENIOR YEAR (2029-2031)",
        title: "Graduate Strong",
        details: [
            "Graduate with a strong portfolio, industry experience, and substantial AXP progress.",
            "Ideally have a full-time offer lined up before graduation."
        ]
    },
    {
        id: "phase-12",
        timeframe: "1-3 YEARS AFTER SCHOOL",
        title: "Licensure & Beyond",
        details: [
            "Finish remaining AXP hours.",
            "Pass ARE exams and become a licensed architect.",
            "Future: Own studio, architecture firm, or development business."
        ]
    }
];

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
                <h2 style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">Career Roadmap</h2>
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
        const checkpoints = await getRoadmapCheckpoints();

        // Render Timeline
        container.innerHTML = `<div class="timeline-line"></div>` + ROADMAP_DATA.map(phase => {
            const cp = checkpoints[phase.id] || {};
            const hasData = cp.link || cp.notes;
            
            return `
                <div class="timeline-node" data-id="${phase.id}">
                    <div class="timeline-dot"><div class="timeline-dot-inner"></div></div>
                    <div class="timeline-content">
                        <div class="phase-time">${phase.timeframe}</div>
                        <div class="phase-title">${phase.title}</div>
                        <ul class="phase-details">
                            ${phase.details.map(d => `<li>${d}</li>`).join('')}
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
                            <textarea class="portfolio-notes" placeholder="Notes (e.g. Added 3 modern house renders to PDF...)">${cp.notes || ''}</textarea>
                            
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
                
                // Re-render is easiest, or just optimistic update. For simplicity, reload view.
                window.app.renderView(); 
            });
        });
    }
};
