import { getRoadmap, getUserOnboarding } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'resources-view fade-in';

        container.innerHTML = `
            <style>
                .resources-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; margin-top: 24px; }
                .resource-card { background: var(--glass-bg); border: 1px solid var(--border); border-radius: 12px; padding: 20px; transition: var(--transition); }
                .resource-card:hover { border-color: var(--primary); transform: translateY(-2px); }
                .resource-category { font-size: 11px; text-transform: uppercase; color: var(--secondary); font-weight: 700; letter-spacing: 1px; margin-bottom: 8px; }
                .resource-title { font-size: 16px; font-weight: 600; color: white; margin-bottom: 12px; }
                .resource-item { display: flex; align-items: center; gap: 8px; font-size: 14px; color: var(--text-muted); margin-bottom: 8px; }
                .resource-item::before { content: '🔗'; font-size: 12px; }
                
                .medical-links-section { margin-top: 40px; border-top: 1px solid var(--border); padding-top: 32px; }
                .medical-link-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border); border-radius: 8px; padding: 16px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; }
                .medical-link-card:hover { border-color: var(--primary); }
            </style>

            <div>
                <h2>Learning & Reference Resources</h2>
                <p class="text-muted">Curated books, courses, and guides for your career skills.</p>
            </div>

            <div class="resources-grid" id="resources-grid">
                <div style="text-align: center; color: var(--text-muted);">Loading resources...</div>
            </div>
            
            <div id="medical-hub-container" class="medical-links-section" style="display: none;">
                <h3 style="color: white; margin-bottom: 8px;">🏥 Official Medical Reference Hub</h3>
                <p class="text-muted" style="margin-bottom: 24px; font-size: 14px;">Direct portal links to licensing bodies, diagnostic reference calculators, and publications matching your active stage.</p>
                <div id="medical-hub-links"></div>
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const grid = document.getElementById('resources-grid');
        const hubContainer = document.getElementById('medical-hub-container');
        const hubLinks = document.getElementById('medical-hub-links');
        
        const onboarding = getUserOnboarding() || {};
        const career = onboarding.career;
        const stage = onboarding.doc_stage || 'College Junior';

        if (career === 'doctor') {
            // Render tailored Doctor database
            hubContainer.style.display = 'block';
            hubContainer.querySelector('h3').innerHTML = '🩺 Official Medical Reference Hub';
            hubContainer.querySelector('p').innerText = 'Direct portal links to licensing bodies, diagnostic reference calculators, and publications matching your active stage.';
            
            let textbookResources = [];
            let toolsResources = [];
            let orgsResources = [];
            let videoResources = [];
            let careerResources = [];

            if (stage.includes("High School") || stage.includes("College")) {
                textbookResources = ["Campbell Biology 12th Edition", "Organic Chemistry as a Second Language", "Lippincott's Illustrated Reviews: Biochemistry", "JAMA (Journal of the American Medical Association)"];
                toolsResources = ["Anki Flashcard pre-med decks", "MDCalc medical calculations (basic)", "Premed Playbook series"];
                orgsResources = ["AAMC (Association of American Medical Colleges)", "American Medical Association (AMA)", "National Pre-Health Associations"];
                videoResources = ["AnatomyZone Gross Anatomy YouTube playlist", "CrashCourse Biology & Chemistry", "MedSchoolInsiders career prep loops"];
                careerResources = ["AMCAS Medical School Application Guide", "MCAT Registration official portal", "Physician Shadowing tracker forms"];
            } else if (stage.includes("Medical School")) {
                textbookResources = ["Netter's Atlas of Human Anatomy", "Guyton & Hall Textbook of Medical Physiology", "Pathoma Pathology Fundamentals", "First Aid for the USMLE Step 1/2"];
                toolsResources = ["Anki Medical School Step Decks", "UWorld USMLE QBank access keys", "Stanford Physical Examination guidelines"];
                orgsResources = ["AMA Student Section", "AAMC Residency Explorer", "Specialty Interest national groups"];
                videoResources = ["OnlineMedEd Clinical Science coursebook videos", "SketchyMicro & SketchyPharm visual mnemonics", "NEJM Clinical Procedure videos"];
                careerResources = ["ERAS residency match application guide", "MOCK interview portals", "AMA Clinical research fellowship registries"];
            } else {
                // Resident / Physician
                textbookResources = ["Harrison's Principles of Internal Medicine", "UpToDate Clinical Decision Support Database", "NEJM (New England Journal of Medicine) Articles"];
                toolsResources = ["MDCalc clinical score calculator", "Sanford Guide to Antimicrobial Therapy", "Epocrates Drug Prescribing Reference"];
                orgsResources = ["American College of Physicians / Surgeons", "Accreditation Council for Graduate Medical Education (ACGME)", "State Licensing Boards"];
                videoResources = ["Clinical case review rounds presentations", "Advanced laparoscopic & surgical procedural loops", "Mayo Clinic Grand Rounds archives"];
                careerResources = ["MKSAP Board review question sets", "State Medical License registry portal", "CME Credit tracking tools"];
            }

            const categories = [
                { title: "Curated Books & Journals", items: textbookResources },
                { title: "Recommended Study Tools", items: toolsResources },
                { title: "Medical Organizations", items: orgsResources },
                { title: "Clinical Videos", items: videoResources }
            ];

            grid.innerHTML = categories.map(cat => `
                <div class="resource-card">
                    <div class="resource-category">Medical Database</div>
                    <div class="resource-title">${cat.title}</div>
                    <div style="display: flex; flex-direction: column;">
                        ${cat.items.map(item => `
                            <div class="resource-item">
                                <span style="color: #cbd5e1;">${item}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            // Render hub links
            hubLinks.innerHTML = careerResources.map(link => `
                <div class="medical-link-card">
                    <div>
                        <strong style="color: white; font-size: 14px;">${link}</strong>
                        <div class="text-muted" style="font-size: 12px; margin-top: 4px;">Verified stage-appropriate reference link.</div>
                    </div>
                    <a href="#" class="btn btn-primary" style="padding: 6px 16px; font-size: 12px; border-radius: 4px;">Access Portal</a>
                </div>
            `).join('');

        } else if (career === 'entrepreneur') {
            // Render tailored Business Incubator database
            hubContainer.style.display = 'block';
            hubContainer.querySelector('h3').innerHTML = '🚀 Official Founder Resource Hub';
            hubContainer.querySelector('p').innerText = 'Direct portal links to state registration systems, trademark offices, and federal licensing systems matching your active stage.';
            
            const bizType = onboarding.biz_type || 'Clothing Brand';
            
            let textbookResources = ["The Lean Startup by Eric Ries", "Zero to One by Peter Thiel", "Business Model Generation (Osterwalder)", "Harvard Business Review (HBR) Case Studies"];
            let toolsResources = ["Business Model Canvas template", "Financial Projection spreadsheets", "Competitor Analysis matrices"];
            let orgsResources = ["Y Combinator Startup School", "Techstars Founder Playbook", "Chamber of Commerce Registry", "SCORE Free Mentorship Network"];
            let videoResources = ["Y Combinator How to Start a Startup series", "Stanford Entrepreneurship lectures", "Slidebean Pitch Deck analysis"];
            let careerResources = ["IRS Employer Identification Number (EIN) register portal", "State LLC and Business Filing directory", "U.S. Patent and Trademark Office database"];

            if (bizType === 'Clothing Brand' || bizType === 'Online Store') {
                toolsResources.push("Shopify Ecommerce Setup Checklist", "Printify Integration guidelines");
                textbookResources.push("E-commerce Marketing Playbook", "Supply Chain logistics guide");
            } else if (bizType === 'Software Company' || bizType === 'AI Startup' || bizType === 'Mobile App') {
                toolsResources.push("Stripe Subscription Billing docs", "AWS Activate cloud credit program");
                textbookResources.push("Designing SaaS Products (UI/UX)", "The DevOps Handbook");
            } else if (bizType === 'Restaurant' || bizType === 'Coffee Shop') {
                toolsResources.push("Toast POS hardware guide", "Restaurant kitchen layout planner");
                textbookResources.push("FSR Magazine Menu Engineering guide", "Health Department Compliance handbook");
            }

            const categories = [
                { title: "Curated Guides & Frameworks", items: textbookResources },
                { title: "Incubator Toolkits", items: toolsResources },
                { title: "Founder Networks", items: orgsResources },
                { title: "Pitch & Strategy Videos", items: videoResources }
            ];

            grid.innerHTML = categories.map(cat => `
                <div class="resource-card">
                    <div class="resource-category">Incubator Database</div>
                    <div class="resource-title">${cat.title}</div>
                    <div style="display: flex; flex-direction: column;">
                        ${cat.items.map(item => `
                            <div class="resource-item">
                                <span style="color: #cbd5e1;">${item}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');

            // Render hub links
            hubLinks.innerHTML = careerResources.map(link => `
                <div class="medical-link-card">
                    <div>
                        <strong style="color: white; font-size: 14px;">${link}</strong>
                        <div class="text-muted" style="font-size: 12px; margin-top: 4px;">Verified stage-appropriate reference link.</div>
                    </div>
                    <a href="#" class="btn btn-primary" style="padding: 6px 16px; font-size: 12px; border-radius: 4px;">Access Portal</a>
                </div>
            `).join('');

        } else {
            // Standard dynamic load from roadmap stages
            hubContainer.style.display = 'none';
            const roadmap = await getRoadmap();
            
            if (!roadmap.stages || roadmap.stages.length === 0) {
                grid.innerHTML = '<div style="color: var(--text-muted);">No resources found.</div>';
                return;
            }

            let html = '';
            roadmap.stages.forEach(stage => {
                stage.skills.forEach(skill => {
                    if (skill.resources && skill.resources.length > 0) {
                        html += `
                            <div class="resource-card">
                                <div class="resource-category">${stage.name}</div>
                                <div class="resource-title">${skill.name} Resources</div>
                                <div style="display: flex; flex-direction: column;">
                                    ${skill.resources.map(res => `
                                        <div class="resource-item">
                                            <span style="color: #cbd5e1;">${res}</span>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        `;
                    }
                });
            });

            grid.innerHTML = html || '<div style="color: var(--text-muted);">No resources linked in current roadmap.</div>';
        }
    }
};
