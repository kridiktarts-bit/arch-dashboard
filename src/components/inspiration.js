export default {
    render: () => {
        const container = document.createElement('div');
        container.className = 'inspiration-view fade-in';

        container.innerHTML = `
            <style>
                .vault-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; }
                
                .randomizer-card { background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(45, 212, 191, 0.1)); border: 1px solid var(--accent); padding: 32px; border-radius: 16px; text-align: center; margin-bottom: 32px; backdrop-filter: blur(10px); }
                .prompt-display { font-size: 24px; font-family: var(--font-heading); color: white; margin: 24px 0; min-height: 80px; display: flex; align-items: center; justify-content: center; font-style: italic; }
                
                .moodboard-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 16px; }
                .mood-item { background: rgba(0,0,0,0.4); border-radius: 12px; overflow: hidden; aspect-ratio: 1; position: relative; border: 1px solid var(--border); transition: var(--transition); cursor: pointer; }
                .mood-item:hover { border-color: var(--primary); transform: scale(1.02); }
                .mood-item img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transition: var(--transition); }
                .mood-item:hover img { opacity: 1; }
                .mood-caption { position: absolute; bottom: 0; left: 0; right: 0; padding: 16px; background: linear-gradient(transparent, rgba(0,0,0,0.9)); color: white; font-size: 13px; font-weight: 600; }
                
                .manifesto-box { background: rgba(0,0,0,0.2); border-left: 3px solid var(--primary); padding: 24px; font-size: 16px; font-style: italic; color: #cbd5e1; margin-bottom: 32px; border-radius: 0 12px 12px 0; }
                
                .lightbox-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(10px); z-index: 2000; display: none; align-items: center; justify-content: center; cursor: zoom-out; }
                .lightbox-overlay.active { display: flex; animation: fadeIn 0.2s ease; }
                .lightbox-img { max-width: 90vw; max-height: 90vh; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); object-fit: contain; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>

            <div class="vault-header">
                <div>
                    <h2 style="text-shadow: 0 2px 4px rgba(0,0,0,0.5);">✨ Inspiration Vault</h2>
                    <p class="text-muted" style="margin-top: 8px;">Break through designer's block and save your favorite references.</p>
                </div>
            </div>

            <!-- The Manifesto -->
            <div class="manifesto-box">
                "I chose architecture because I believe space shapes human emotion. When the studio gets too intense, I will remember that I am learning how to build the future."
            </div>

            <!-- AI Randomizer -->
            <div class="randomizer-card">
                <h3 style="color: var(--accent); margin-bottom: 8px;">🎲 Concept Randomizer</h3>
                <p class="text-muted" style="font-size: 13px;">Stuck on a project? Generate a hyper-specific architectural concept to practice detailing.</p>
                
                <div class="prompt-display" id="prompt-display">
                    "Design a minimalist concrete bench that appears to float above a water feature."
                </div>
                
                <button class="btn" id="randomize-btn" style="background: var(--accent); color: white; border: none; padding: 12px 32px; font-size: 15px; font-weight: 600; border-radius: 24px; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.4);">Generate New Concept</button>
            </div>

            <h3 style="color: white; margin-bottom: 16px;">Moodboard</h3>
            <div class="moodboard-grid" id="moodboard-grid">
                <!-- Placeholders for aesthetics -->
                <div class="mood-item">
                    <img src="assets/tadao.png" alt="Reference">
                    <div class="mood-caption">Tadao Ando - Light</div>
                </div>
                <div class="mood-item">
                    <img src="assets/parametric.png" alt="Reference">
                    <div class="mood-caption">Parametric Facade Study</div>
                </div>
                <!-- Dynamic images will load here -->
                
                <div class="mood-item" id="add-mood-btn" style="background: rgba(45, 212, 191, 0.1); display: flex; align-items: center; justify-content: center; flex-direction: column;">
                    <span style="font-size: 32px; color: var(--primary); margin-bottom: 8px;">+</span>
                    <span style="color: var(--text-muted); font-size: 13px; font-weight: 600;">Add Image</span>
                </div>
                <input type="file" id="mood-upload" accept="image/*" style="display:none;">
            </div>

            <!-- Lightbox -->
            <div class="lightbox-overlay" id="lightbox">
                <img src="" alt="Expanded View" class="lightbox-img" id="lightbox-img">
            </div>
        `;

        return container;
    },

    onMount: async () => {
        const btn = document.getElementById('randomize-btn');
        const display = document.getElementById('prompt-display');

        const actions = ["Design", "Detail", "Conceptualize", "Sketch", "Model", "Draft"];
        const typologies = [
            "a tiny minimalist cafe", "a brutalist bus stop shelter", "a suspended pedestrian bridge", 
            "an underground meditation pavilion", "a floating sauna", "a zero-waste botanical greenhouse", 
            "a modular affordable housing unit", "an off-grid artists' retreat", "a public reading room", 
            "a kinetic observation tower", "a hidden speakeasy", "a community seed bank", 
            "a disaster-relief shelter", "a vertical urban farm", "an outdoor amphitheater"
        ];
        const materials = [
            "built entirely from repurposed shipping containers", "featuring a facade of charred timber (Shou Sugi Ban)", 
            "using massive rammed-earth walls", "with a translucent polycarbonate envelope", 
            "focusing heavily on exposed board-formed concrete", "utilizing parametric brickwork", 
            "supported by an intricate bamboo structural lattice", "featuring a folded corten steel roof", 
            "with zero visible structural fasteners", "incorporating a living green wall system"
        ];
        const contexts = [
            "in a dense, noisy urban plaza.", "cantilevered over a steep rocky cliff.", 
            "nestled seamlessly into a snowy alpine forest.", "bridging a narrow, fast-flowing river.", 
            "floating on a calm, isolated lake.", "in a scorching, arid desert landscape.", 
            "retrofitted inside an abandoned industrial warehouse.", "on a tiny, awkwardly shaped street corner.",
            "hidden underneath a busy highway overpass.", "partially submerged underwater."
        ];

        // Load saved concept if it exists
        const savedConcept = localStorage.getItem('current_concept');
        if (savedConcept) {
            display.textContent = savedConcept;
        }

        btn.addEventListener('click', () => {
            // Simple flip animation
            display.style.opacity = '0';
            display.style.transform = 'translateY(10px)';
            
            setTimeout(() => {
                const act = actions[Math.floor(Math.random() * actions.length)];
                const typ = typologies[Math.floor(Math.random() * typologies.length)];
                const mat = materials[Math.floor(Math.random() * materials.length)];
                const ctx = contexts[Math.floor(Math.random() * contexts.length)];
                
                const newConcept = `"${act} ${typ} ${mat} ${ctx}"`;
                display.textContent = newConcept;
                localStorage.setItem('current_concept', newConcept);
                
                display.style.transition = 'all 0.3s ease';
                display.style.opacity = '1';
                display.style.transform = 'translateY(0)';
            }, 300);
        });

        // Moodboard Upload Logic
        const addBtn = document.getElementById('add-mood-btn');
        const fileInput = document.getElementById('mood-upload');
        const grid = document.getElementById('moodboard-grid');

        // Lightbox Logic
        const lightbox = document.getElementById('lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        
        lightbox.addEventListener('click', () => {
            lightbox.classList.remove('active');
        });

        const bindLightbox = (element) => {
            if (element.id === 'add-mood-btn') return;
            element.addEventListener('click', () => {
                const img = element.querySelector('img');
                if (img) {
                    lightboxImg.src = img.src;
                    lightbox.classList.add('active');
                }
            });
        };

        // Bind statically rendered items
        document.querySelectorAll('.mood-item').forEach(bindLightbox);

        // Load existing
        const loadMoodboard = () => {
            const saved = JSON.parse(localStorage.getItem('moodboard') || '[]');
            saved.forEach(imgData => {
                const div = document.createElement('div');
                div.className = 'mood-item';
                div.innerHTML = `<img src="${imgData}" alt="User Reference"><div class="mood-caption">Personal Reference</div>`;
                bindLightbox(div);
                grid.insertBefore(div, addBtn);
            });
        };
        loadMoodboard();

        addBtn.addEventListener('click', () => fileInput.click());

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    // Compress image to save localStorage space
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600;
                    const scaleSize = MAX_WIDTH / img.width;
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    
                    // Save
                    const saved = JSON.parse(localStorage.getItem('moodboard') || '[]');
                    saved.push(dataUrl);
                    
                    try {
                        localStorage.setItem('moodboard', JSON.stringify(saved));
                        // Render
                        const div = document.createElement('div');
                        div.className = 'mood-item';
                        div.innerHTML = `<img src="${dataUrl}" alt="User Reference"><div class="mood-caption">Personal Reference</div>`;
                        bindLightbox(div);
                        grid.insertBefore(div, addBtn);
                    } catch (err) {
                        alert("Storage limit reached! We need to connect Firebase Storage to save more images.");
                    }
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }
};
