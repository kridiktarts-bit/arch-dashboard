import { getActiveCareer } from '../db.js';

export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'inspiration-view fade-in';

        container.innerHTML = `
            <style>
                .vault-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
                
                .randomizer-card { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(45, 212, 191, 0.1)); border: 1px solid var(--accent); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 32px; backdrop-filter: blur(10px); }
                .prompt-display { font-size: 20px; font-family: var(--font-heading); color: white; margin: 24px 0; min-height: 80px; display: flex; align-items: center; justify-content: center; font-style: italic; line-height: 1.5; }
                
                .moodboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
                .mood-item { background: rgba(0,0,0,0.3); border-radius: 12px; padding: 24px; min-height: 180px; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid var(--border); transition: var(--transition); cursor: pointer; }
                .mood-item:hover { border-color: var(--primary); transform: scale(1.02); background: rgba(255,255,255,0.02); }
                .mood-item-title { font-weight: bold; color: var(--primary); font-size: 15px; margin-bottom: 8px; }
                .mood-item-text { font-size: 12px; color: var(--text-muted); line-height: 1.4; }
                
                .manifesto-box { background: rgba(0,0,0,0.2); border-left: 3px solid var(--primary); padding: 24px; font-size: 16px; font-style: italic; color: #cbd5e1; margin-bottom: 32px; border-radius: 0 12px 12px 0; }
            </style>

            <div class="vault-header">
                <div>
                    <h2 style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">✨ Inspiration & Reference</h2>
                    <p class="text-muted" style="margin-top: 8px;">Break through designer's block and explore structured workflow strategies.</p>
                </div>
            </div>

            <!-- The Manifesto -->
            <div class="manifesto-box" id="manifesto-box">
                <!-- Dynamic manifesto will load here -->
            </div>

            <!-- AI Randomizer -->
            <div class="randomizer-card">
                <h3 style="color: var(--accent); margin-bottom: 8px;">🎲 Concept Generator</h3>
                <p class="text-muted" style="font-size: 13px;" id="randomizer-subtitle">Generate a hyper-specific project concept to practice details.</p>
                
                <div class="prompt-display" id="prompt-display">
                    <!-- Dynamic prompt will load here -->
                </div>
                
                <button class="btn" id="randomize-btn" style="background: var(--accent); color: white; border: none; padding: 12px 32px; font-size: 15px; font-weight: 600; border-radius: 24px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);">Generate New Concept</button>
            </div>

            <h3 style="color: white; margin-bottom: 16px;">Reference Cards</h3>
            <div class="moodboard-grid" id="reference-cards-grid">
                <!-- Dynamic reference cards will load here -->
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const career = getActiveCareer();
        const manifestoBox = document.getElementById('manifesto-box');
        const randSubtitle = document.getElementById('randomizer-subtitle');
        const display = document.getElementById('prompt-display');
        const cardsGrid = document.getElementById('reference-cards-grid');

        const contentMap = {
            architecture: {
                manifesto: `"I chose architecture because I believe space shapes human emotion. When the studio gets too intense, I will remember that I am learning how to build the future."`,
                sub: "Generate a hyper-specific architectural concept to practice detailing.",
                actions: ["Design", "Detail", "Conceptualize", "Sketch", "Model", "Draft"],
                typos: ["a tiny minimalist cafe", "a brutalist bus stop shelter", "a suspended pedestrian bridge", "an underground meditation pavilion", "a floating sauna"],
                mats: ["built entirely from repurposed shipping containers", "featuring a facade of Shou Sugi Ban timber", "using massive rammed-earth walls", "with a translucent polycarbonate envelope"],
                ctxs: ["in a dense, noisy urban plaza.", "cantilevered over a steep rocky cliff.", "nestled into a snowy alpine forest.", "floating on a calm, isolated lake."],
                cards: [
                    { title: "Grid Alignment", desc: "Always align grids early in Revit or Rhino. Maintain consistent structure columns distribution." },
                    { title: "Zoning & Egress", desc: "Verify local building code zoning laws, maximum height restrictions, and emergency exit clearance routes." },
                    { title: "Material Palette", desc: "Limit details to 3 core materials (e.g. exposed concrete, glass, light oak) to maintain design coherence." }
                ]
            },
            comic_creator: {
                manifesto: `"I chose storytelling because visual worlds carry deep truths. When the pages pile up, I will remember that I am creating characters and lore that will live forever."`,
                sub: "Generate a storyboard panel composition prompt to sketch.",
                actions: ["Sketch", "Write dialogue for", "Storyboard", "Character design", "Paint a panel of"],
                typos: ["a cyborg warrior in a neon alleyway", "an ancient spellcaster in a library of scrolls", "two rivals arguing over a relic", "a detective investigating slick docks"],
                mats: ["using dynamic comic paneling layouts", "in high-contrast inks with heavy shadows", "featuring expressive manga speed lines", "using a limited retro three-color palette"],
                ctxs: ["during a tense, silent stand-off.", "in the middle of a chaotic chase scene.", "under a gorgeous cosmic sky.", "while a thunderstorm rages outside."],
                cards: [
                    { title: "Golden Grid Rule", desc: "Use the rule of thirds or diagonal grid flow to guide readers' eyes through panels logically." },
                    { title: "Lettering Fit", desc: "Leave 20-30% empty space inside raw panels to fit speech bubbles and narrative captions comfortably." },
                    { title: "Contrast Index", desc: "Check thumbnail silhouettes in grayscale. Ensure foreground elements separate clearly from backgrounds." }
                ]
            },
            software_engineer: {
                manifesto: `"I chose software engineering because code turns ideas into functional reality. When the debugger fails, I will remember that I am building the logical architecture of tomorrow."`,
                sub: "Generate a custom side project system architecture idea.",
                actions: ["Implement", "Design a system architecture for", "Build a lightweight daemon for", "Refactor the database layout of", "Write a microservice for"],
                typos: ["a real-time chat gateway", "a custom git-like version tracker", "an automated task scheduler", "a peer-to-peer file sharing protocol", "an in-memory caching engine"],
                mats: ["using modular clean hexagonal architecture", "written in pure dependency-free Rust/Go", "secured with standard public-key cryptography", "featuring fully documented REST and gRPC endpoints"],
                ctxs: ["packaged inside a minimal Docker container.", "running on a serverless edge network.", "resilient to database outages.", "fully observable with Prometheus logs."],
                cards: [
                    { title: "DRY Principle", desc: "Don't Repeat Yourself. Abstract repetitive utility loops into reusable Helper libraries." },
                    { title: "Observe & Trace", desc: "Instrument critical execution scopes with structural logs. Capture latency bottlenecks early." },
                    { title: "DB Indexing", desc: "Write database indices for common filter columns to keep query latency low under heavy loads." }
                ]
            },
            game_developer: {
                manifesto: `"I chose game development because games are interactive art. When the physics engine breaks, I will remember that I am crafting rules and playgrounds for players to experience."`,
                sub: "Generate a game mechanics prototype concept to script.",
                actions: ["Code a prototype for", "Design a level layout for", "Create a kinetic mechanic for", "Implement an AI controller for"],
                typos: ["a gravity-shifting platformer game", "a deck-building roguelike card game", "a procedural stealth infiltration simulator", "a rhythmic hacking puzzle game", "a physics-based grappling platformer"],
                mats: ["built in clean low-poly 3D visual style", "using expressive 2D hand-drawn sprite sheets", "incorporating satisfying screen-shake feedback", "utilizing robust state machine architectures"],
                ctxs: ["where the level collapses behind the player.", "with a strict 60-second time loop limit.", "where enemies only move when the player moves.", "optimized to run smoothly on mobile screens."],
                cards: [
                    { title: "Game Feel / Juice", desc: "Apply immediate visual feedback (particles, screen shake, hit pause) to make controls feel extremely satisfying." },
                    { title: "Greyboxing First", desc: "Test levels with simple geometric cubes before adding detailed art assets. Focus entirely on fun factor." },
                    { title: "State Separation", desc: "Keep player physics/collision calculations separated from visual model rendering nodes to maintain stable framerates." }
                ]
            },
            animator: {
                manifesto: `"I chose animation because movement is life. When the frame-by-frame takes hours, I will remember that I am breathing soul and emotion into static art."`,
                sub: "Generate an animation visual exercise to test your frame pacing.",
                actions: ["Animate", "Create a storyboard transition for", "Pencil test a cycle of", "Detail keyframes for", "Animate a motion path for"],
                typos: ["a character picking up a heavy iron safe", "a fluid transformation from water to gas", "a dynamic parkour jump over a wall", "a character expressing deep sadness to joy", "a flapping bird taking flight in slow motion"],
                mats: ["using clean 2D traditional hand-drawn frames", "in a stylized 3D keyframed visual aesthetic", "incorporating exaggeration and squash-and-stretch principles", "maintaining solid volume consistency throughout"],
                ctxs: ["at a cinematic 24 frames per second.", "with a dramatic, sudden slow-motion impact.", "looping seamlessly as a character study.", "under intense backlighting."],
                cards: [
                    { title: "Timing & Spacing", desc: "Keep spacing tight for slow build-ups and wide for fast impacts. Frame counts dictate the sense of weight." },
                    { title: "Arcs of Motion", desc: "Track joint rotations (elbows, knees, hips) on key motion curves. Linear transitions look stiff." },
                    { title: "Silhouette Read", desc: "Turn off details and review frames in solid black. Ensure the character pose reads clearly in silhouette." }
                ]
            },
            film_director: {
                manifesto: `"I chose filmmaking because cinema connects human souls. When the shoot gets exhausting, I will remember that I am capturing fleeting moments that capture the human experience."`,
                sub: "Generate a visual shot storyboard prompt to direct.",
                actions: ["Block a scene featuring", "Draw a shot list for", "Design camera lighting for", "Storyboard a transition for"],
                typos: ["a tense interrogation between two former allies", "a silent character discovering a long-lost secret", "a rapid, high-stakes debate in a boardroom", "a lonely traveler arriving at a foreign station", "a dramatic confession of love in a crowd"],
                mats: ["shot in a cinematic low-key lighting setup", "using a single, continuous tracking shot", "with extreme close-up shots for emotional weight", "incorporating a limited neo-noir color scheme"],
                ctxs: ["with rain falling heavily outside a window.", "during a golden hour sunset silhouette.", "with ambient city sounds echoing in the background.", "revealing a sudden twist in character perspective."],
                cards: [
                    { title: "180-Degree Rule", desc: "Never cross the axis line between two interacting characters to avoid disorienting screen directions." },
                    { title: "Motivated Lighting", desc: "Ensure key light directions align with visible in-scene light sources (e.g. windows, lamps, fireplaces)." },
                    { title: "Audio Capture", desc: "Prioritize crisp audio recordings. Audiences will tolerate average visuals, but bad audio ruins immersion." }
                ]
            },
            doctor: {
                manifesto: `"I chose medicine because healing is a noble duty. When the study load gets heavy, I will remember that I am learning how to save lives."`,
                sub: "Generate a clinical study scenario for case diagnostics practice.",
                actions: ["Analyze", "Diagnose a patient presenting", "Prepare a clinical review of", "Draft a study sheet on"],
                typos: ["a case of persistent atypical chest pain", "an acute neurological symptom profile", "a multi-system inflammatory response pattern", "a genetic metabolic pathway disorder"],
                mats: ["using evidence-based diagnostic protocols", "referencing the latest clinical guidelines", "mapping out potential drug interaction vectors", "detailing differential diagnosis options"],
                ctxs: ["in a high-pressure emergency triage setting.", "during a complex pediatric consult.", "requiring quick, decisive medical reasoning.", "presenting with obscure initial lab results."],
                cards: [
                    { title: "Differential First", desc: "Always list out diagnostic alternatives from most critical to least likely. Test methodically." },
                    { title: "Patient Charting", desc: "Record symptoms using standard SOAP notation structures: Subjective, Objective, Assessment, Plan." },
                    { title: "Ethics Codes", desc: "Respect patient autonomy, prioritize non-maleficence, and protect confidential medical files data." }
                ]
            },
            lawyer: {
                manifesto: `"I chose law because justice holds society together. When the case briefings feel endless, I will remember that I am learning how to defend rights and truth."`,
                sub: "Generate a mock case trial scenario to structure defense briefs.",
                actions: ["Draft a legal brief for", "Outline a defense argument for", "Analyze a contract dispute involving", "Prepare cross-examination points for"],
                typos: ["a breach of copyright in digital media", "a complex corporate zoning conflict", "a public interest civil rights dispute", "a whistle-blower employment case"],
                mats: ["referencing relevant federal case precedents", "structured with standard IRAC analysis style", "highlighting key logical loopholes in opposition arguments", "maintaining a highly objective, rigorous tone"],
                ctxs: ["before a federal appellate court panel.", "during intense pre-trial negotiations.", "where the stakes for human rights are high.", "involving multiple conflicting state statutes."],
                cards: [
                    { title: "IRAC Method", desc: "Deconstruct arguments logically: Issue, Rule of Law, Analysis Application, and final Conclusion." },
                    { title: "Precedent Scopes", desc: "Double check jurisdictional scopes of referenced case decisions. Prioritize binding circuit rulings." },
                    { title: "Evidence Audit", desc: "Establish chains of custody for all physical artifacts early. Scan document records carefully." }
                ]
            }
        };

        const config = contentMap[career] || contentMap.architecture;

        // Apply content
        manifestoBox.innerHTML = config.manifesto;
        randSubtitle.innerText = config.sub;

        const renderPrompt = () => {
            const act = config.actions[Math.floor(Math.random() * config.actions.length)];
            const typ = config.typos[Math.floor(Math.random() * config.typos.length)];
            const mat = config.mats[Math.floor(Math.random() * config.mats.length)];
            const ctx = config.ctxs[Math.floor(Math.random() * config.ctxs.length)];
            display.innerText = `"${act} ${typ} ${mat} ${ctx}"`;
        };

        renderPrompt();

        document.getElementById('randomize-btn').addEventListener('click', () => {
            display.style.opacity = '0';
            display.style.transform = 'translateY(10px)';
            setTimeout(() => {
                renderPrompt();
                display.style.transition = 'all 0.3s ease';
                display.style.opacity = '1';
                display.style.transform = 'translateY(0)';
            }, 300);
        });

        // Render reference cards
        cardsGrid.innerHTML = config.cards.map((c, idx) => `
            <div class="mood-item" style="cursor: default; animation: popIn 0.3s ease-out backwards; animation-delay: ${idx * 0.1}s;">
                <div>
                    <div class="mood-item-title">${c.title}</div>
                    <div class="mood-item-text">${c.desc}</div>
                </div>
                <div style="font-size: 10px; color: var(--text-muted); text-transform: uppercase; font-weight: bold; margin-top: 16px;">Core Guideline</div>
            </div>
        `).join('');
    }
};
