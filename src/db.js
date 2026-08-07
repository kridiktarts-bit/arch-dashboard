// Dynamic database layer with LocalStorage persistence and modular career configuration loading.

export function getActiveCareer() {
    const onboarding = localStorage.getItem('user_onboarding');
    if (onboarding) {
        try {
            const parsed = JSON.parse(onboarding);
            return parsed.career || 'architecture';
        } catch (e) {
            return 'architecture';
        }
    }
    return 'architecture';
}

export function getUserOnboarding() {
    const onboarding = localStorage.getItem('user_onboarding');
    return onboarding ? JSON.parse(onboarding) : null;
}

export function saveUserOnboarding(data) {
    localStorage.setItem('user_onboarding', JSON.stringify(data));
}

async function fetchCareerConfig(career, filename) {
    try {
        const res = await fetch(`/careers/${career}/${filename}`);
        if (!res.ok) {
            throw new Error(`Failed to load ${filename}`);
        }
        return await res.json();
    } catch (e) {
        console.error(`Error loading configuration /careers/${career}/${filename}:`, e);
        return null;
    }
}

// Seeding placeholder
export async function seedDatabaseIfEmpty() {
    // No-op for Firebase since we use local dynamic career storage
    console.log("Universal Career storage initialized.");
}

// ROADMAP
export async function getRoadmap() {
    const career = getActiveCareer();
    const key = `career_roadmap_${career}`;
    let data = localStorage.getItem(key);
    if (!data) {
        const fetched = await fetchCareerConfig(career, 'roadmap.json');
        if (fetched) {
            localStorage.setItem(key, JSON.stringify(fetched));
            return fetched;
        }
        return { career: "Unknown", stages: [] };
    }
    return JSON.parse(data);
}

export async function updateSkillProgress(stageId, skillName, lessonsDelta) {
    const roadmap = await getRoadmap();
    const stage = roadmap.stages.find(s => s.id === stageId);
    if (stage) {
        const skill = stage.skills.find(s => s.name === skillName);
        if (skill) {
            skill.progress = Math.min((skill.progress || 0) + lessonsDelta, skill.lessons);
            const career = getActiveCareer();
            localStorage.setItem(`career_roadmap_${career}`, JSON.stringify(roadmap));
            // Trigger custom event to notify components
            window.dispatchEvent(new Event('careerDataUpdated'));
            return true;
        }
    }
    return false;
}

// MILESTONES
export async function getMilestones() {
    const career = getActiveCareer();
    const key = `career_milestones_${career}`;
    let data = localStorage.getItem(key);
    if (!data) {
        const fetched = await fetchCareerConfig(career, 'milestones.json');
        if (fetched) {
            // Add status field to track completion
            const initialized = fetched.map(m => ({ ...m, completed: false }));
            localStorage.setItem(key, JSON.stringify(initialized));
            return initialized;
        }
        return [];
    }
    return JSON.parse(data);
}

export async function toggleMilestoneCompleted(milestoneId) {
    const milestones = await getMilestones();
    const m = milestones.find(item => item.id === milestoneId);
    if (m) {
        m.completed = !m.completed;
        const career = getActiveCareer();
        localStorage.setItem(`career_milestones_${career}`, JSON.stringify(milestones));
        window.dispatchEvent(new Event('careerDataUpdated'));
        return m.completed;
    }
    return false;
}

// TASKS (Daily Planner)
export async function getTasks() {
    const career = getActiveCareer();
    const key = `career_tasks_${career}`;
    let data = localStorage.getItem(key);
    if (!data) {
        const onboarding = getUserOnboarding();
        if (onboarding && (onboarding.experience_status === 'experienced' || onboarding.experience_status === 'pro')) {
            return [];
        }
        const fetched = await fetchCareerConfig(career, 'tasks.json');
        if (fetched) {
            localStorage.setItem(key, JSON.stringify(fetched));
            return fetched;
        }
        return [];
    }
    return JSON.parse(data);
}

export async function addTask(taskData) {
    const tasks = await getTasks();
    const newId = `task-${Date.now()}`;
    const newTask = {
        id: newId,
        title: taskData.title,
        description: taskData.description || '',
        status: taskData.status || 'pending',
        startDate: taskData.startDate || new Date().toISOString().split('T')[0],
        endDate: taskData.endDate || taskData.startDate || new Date().toISOString().split('T')[0],
        durationHours: parseInt(taskData.durationHours) || 2,
        phaseName: taskData.phaseName || 'Personal',
        type: taskData.type || 'personal',
        notes: taskData.notes || ''
    };
    tasks.push(newTask);
    const career = getActiveCareer();
    localStorage.setItem(`career_tasks_${career}`, JSON.stringify(tasks));
    window.dispatchEvent(new Event('careerDataUpdated'));
    return newTask;
}

export async function updateTaskDetails(id, fields) {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id.toString() === id.toString());
    if (task) {
        Object.assign(task, fields);
        const career = getActiveCareer();
        localStorage.setItem(`career_tasks_${career}`, JSON.stringify(tasks));
        window.dispatchEvent(new Event('careerDataUpdated'));
    }
}

export async function duplicateTask(id, recurrence) {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id.toString() === id.toString());
    if (!task) return;

    const newTasks = [];
    const dateCursor = new Date(task.startDate + 'T00:00:00');
    
    if (recurrence === 'weekly') {
        for (let w = 1; w <= 4; w++) {
            const nextDate = new Date(dateCursor);
            nextDate.setDate(dateCursor.getDate() + (w * 7));
            const dateStr = nextDate.toISOString().split('T')[0];
            
            newTasks.push({
                ...task,
                id: `task-${Date.now()}-${w}-${Math.random().toString(36).substr(2, 5)}`,
                startDate: dateStr,
                endDate: dateStr,
                status: 'pending'
            });
        }
    } else if (recurrence === 'daily') {
        for (let d = 1; d <= 7; d++) {
            const nextDate = new Date(dateCursor);
            nextDate.setDate(dateCursor.getDate() + d);
            const dateStr = nextDate.toISOString().split('T')[0];
            
            newTasks.push({
                ...task,
                id: `task-${Date.now()}-${d}-${Math.random().toString(36).substr(2, 5)}`,
                startDate: dateStr,
                endDate: dateStr,
                status: 'pending'
            });
        }
    } else {
        newTasks.push({
            ...task,
            id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            status: 'pending'
        });
    }

    tasks.push(...newTasks);
    const career = getActiveCareer();
    localStorage.setItem(`career_tasks_${career}`, JSON.stringify(tasks));
    window.dispatchEvent(new Event('careerDataUpdated'));
}

export async function updateTaskStatus(id, newStatus) {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id.toString() === id.toString());
    if (task) {
        task.status = newStatus;
        const career = getActiveCareer();
        localStorage.setItem(`career_tasks_${career}`, JSON.stringify(tasks));
        window.dispatchEvent(new Event('careerDataUpdated'));
    }
}

export async function updateTaskMonth(id, newMonth) {
    const tasks = await getTasks();
    const task = tasks.find(t => t.id.toString() === id.toString());
    if (task) {
        task.month = newMonth;
        const career = getActiveCareer();
        localStorage.setItem(`career_tasks_${career}`, JSON.stringify(tasks));
        window.dispatchEvent(new Event('careerDataUpdated'));
    }
}

export async function deleteTask(id) {
    let tasks = await getTasks();
    tasks = tasks.filter(t => t.id.toString() !== id.toString());
    const career = getActiveCareer();
    localStorage.setItem(`career_tasks_${career}`, JSON.stringify(tasks));
    window.dispatchEvent(new Event('careerDataUpdated'));
}

// PORTFOLIO (Projects)
export async function getProjects() {
    const career = getActiveCareer();
    const key = `career_portfolio_${career}`;
    let data = localStorage.getItem(key);
    if (!data) {
        // Initialize with default mock project
        const defaults = [
            {
                id: "proj-1",
                title: career === 'architecture' ? "110th St Plaza Memorial Design" : "Character Sheet: The Wanderer",
                date: "Current Season",
                software: career === 'architecture' ? "Sketching, Rhino, AutoCAD" : "Clip Studio Paint, Photoshop",
                status: "In Progress",
                images: []
            }
        ];
        localStorage.setItem(key, JSON.stringify(defaults));
        return defaults;
    }
    return JSON.parse(data);
}

export async function addProject(projectData) {
    const projects = await getProjects();
    const newId = `proj-${Date.now()}`;
    const newProj = {
        id: newId,
        ...projectData,
        images: projectData.images || []
    };
    projects.push(newProj);
    const career = getActiveCareer();
    localStorage.setItem(`career_portfolio_${career}`, JSON.stringify(projects));
    window.dispatchEvent(new Event('careerDataUpdated'));
    return newProj;
}

export async function updateProjectTitle(id, newTitle) {
    const projects = await getProjects();
    const proj = projects.find(p => p.id.toString() === id.toString());
    if (proj) {
        proj.title = newTitle;
        const career = getActiveCareer();
        localStorage.setItem(`career_portfolio_${career}`, JSON.stringify(projects));
        window.dispatchEvent(new Event('careerDataUpdated'));
    }
}

export async function updateProjectStatus(id, newStatus) {
    const projects = await getProjects();
    const proj = projects.find(p => p.id.toString() === id.toString());
    if (proj) {
        proj.status = newStatus;
        const career = getActiveCareer();
        localStorage.setItem(`career_portfolio_${career}`, JSON.stringify(projects));
        window.dispatchEvent(new Event('careerDataUpdated'));
    }
}

// OPPORTUNITIES
export async function getOpportunities() {
    const career = getActiveCareer();
    const key = `career_opps_${career}`;
    let data = localStorage.getItem(key);
    if (!data) {
        const fetched = await fetchCareerConfig(career, 'opportunities.json');
        if (fetched) {
            localStorage.setItem(key, JSON.stringify(fetched));
            return fetched;
        }
        return [];
    }
    return JSON.parse(data);
}

export async function addOpportunity(oppData) {
    const opps = await getOpportunities();
    const newId = `opp-${Date.now()}`;
    const newOpp = {
        id: newId,
        ...oppData
    };
    opps.push(newOpp);
    const career = getActiveCareer();
    localStorage.setItem(`career_opps_${career}`, JSON.stringify(opps));
    window.dispatchEvent(new Event('careerDataUpdated'));
    return newOpp;
}

export async function updateOpportunityStatus(id, newStatus) {
    const opps = await getOpportunities();
    const opp = opps.find(o => o.id.toString() === id.toString());
    if (opp) {
        opp.status = newStatus;
        const career = getActiveCareer();
        localStorage.setItem(`career_opps_${career}`, JSON.stringify(opps));
        window.dispatchEvent(new Event('careerDataUpdated'));
    }
}

export async function deleteOpportunity(id) {
    let opps = await getOpportunities();
    opps = opps.filter(o => o.id.toString() !== id.toString());
    const career = getActiveCareer();
    localStorage.setItem(`career_opps_${career}`, JSON.stringify(opps));
    window.dispatchEvent(new Event('careerDataUpdated'));
}

// ROADMAP CHECKPOINTS
export async function getRoadmapCheckpoints() {
    const career = getActiveCareer();
    const key = `career_checkpoints_${career}`;
    let data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {};
}

export async function saveRoadmapCheckpoint(phaseId, checkpointData) {
    const checkpoints = await getRoadmapCheckpoints();
    checkpoints[phaseId] = checkpointData;
    const career = getActiveCareer();
    localStorage.setItem(`career_checkpoints_${career}`, JSON.stringify(checkpoints));
    window.dispatchEvent(new Event('careerDataUpdated'));
}

// REFLECTIONS
export async function getReflections() {
    const data = localStorage.getItem('career_reflections');
    return data ? JSON.parse(data) : [];
}

export async function saveReflection(reflectionData) {
    const reflections = await getReflections();
    const newReflection = {
        id: `ref-${Date.now()}`,
        ...reflectionData,
        timestamp: Date.now()
    };
    reflections.push(newReflection);
    localStorage.setItem('career_reflections', JSON.stringify(reflections));
    window.dispatchEvent(new Event('careerDataUpdated'));
    return newReflection;
}

// AXP backward-compatibility exports
export async function getAxp() {
    try {
        const roadmap = await getRoadmap();
        const completedLessons = roadmap.stages.reduce((acc, stage) => {
            return acc + (stage.skills ? stage.skills.reduce((sAcc, s) => sAcc + (s.progress || 0), 0) : 0);
        }, 0);
        return {
            currentTotal: completedLessons * 2.5,
            categories: [
                { name: "Practice Management", required: 160, current: completedLessons * 0.5 },
                { name: "Project Management", required: 360, current: completedLessons * 0.5 },
                { name: "Programming & Analysis", required: 260, current: completedLessons * 0.5 },
                { name: "Project Planning & Design", required: 1080, current: completedLessons * 0.5 },
                { name: "Project Development & Documentation", required: 1520, current: completedLessons * 0.5 },
                { name: "Construction & Evaluation", required: 360, current: completedLessons * 0.5 }
            ]
        };
    } catch (e) {
        return { currentTotal: 0, categories: [] };
    }
}

export async function updateAxpCategory(categoryName, newHours) {
    console.log("Mock updateAxpCategory:", categoryName, newHours);
}

// Config loaders and calendar scheduling engine
export async function getCareerConfig(career, configType) {
    try {
        const response = await fetch(`careers/${career}/${configType}.json`);
        if (!response.ok) return null;
        return await response.json();
    } catch(e) {
        return null;
    }
}

export async function generateCalendarSchedule(onboarding) {
    const career = onboarding.career;
    
    // Clear career-specific caches to force fresh load
    localStorage.removeItem(`career_roadmap_${career}`);
    localStorage.removeItem(`career_milestones_${career}`);
    localStorage.removeItem(`career_tasks_${career}`);
    localStorage.removeItem(`career_opps_${career}`);
    localStorage.removeItem(`career_portfolio_${career}`);
    localStorage.removeItem(`career_checkpoints_${career}`);

    // Load config files
    const templates = await getCareerConfig(career, 'project_templates');
    const calendarRules = await getCareerConfig(career, 'calendar_rules');
    
    if (!templates || !calendarRules) {
        console.warn("Missing templates or calendar rules for scheduling.");
        return;
    }

    const preferredWorkDays = onboarding.work_days || ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"];
    const dailyHoursMax = onboarding.daily_hours || 3;
    const weeklyHours = dailyHoursMax * preferredWorkDays.length;
    localStorage.setItem(`weeklyHours_${career}`, weeklyHours);
    localStorage.setItem(`dailyHours_${career}`, dailyHoursMax);
    localStorage.setItem(`preferredDays_${career}`, JSON.stringify(preferredWorkDays));

    // Parse unavailable dates custom list
    let unavailableDates = [];
    if (onboarding.unavailable_dates_custom) {
        unavailableDates = onboarding.unavailable_dates_custom.split(',').map(d => d.trim()).filter(d => d.match(/^\d{4}-\d{2}-\d{2}$/));
    }
    localStorage.setItem(`unavailableDates_${career}`, JSON.stringify(unavailableDates));

    // Stage skip filter helper
    const isTaskCompleted = (title, completedStages) => {
        if (!completedStages || completedStages.length === 0) return false;
        const tLower = title.toLowerCase();
        return completedStages.some(st => {
            const sLower = st.toLowerCase();
            if (sLower.includes("story outline") && (tLower.includes("concept") || tLower.includes("synopsis") || tLower.includes("summary") || tLower.includes("outline"))) return true;
            if (sLower.includes("world building") && (tLower.includes("world") || tLower.includes("lore") || tLower.includes("locations") || tLower.includes("setting"))) return true;
            if (sLower.includes("character description") && (tLower.includes("personality") || tLower.includes("description"))) return true;
            if (sLower.includes("character design") && (tLower.includes("design") || tLower.includes("turnaround"))) return true;
            if (sLower.includes("character reference") && tLower.includes("reference")) return true;
            if (sLower.includes("dialogue") && (tLower.includes("dialogue") || tLower.includes("script"))) return true;
            if (sLower.includes("thumbnail") && (tLower.includes("thumbnail") || tLower.includes("panel") || tLower.includes("layout"))) return true;
            if (sLower.includes("sketch") && (tLower.includes("sketch") || tLower.includes("rough") || tLower.includes("pencil"))) return true;
            if (sLower.includes("line art") && tLower.includes("line art")) return true;
            if (sLower.includes("coloring") && (tLower.includes("color") || tLower.includes("flat") || tLower.includes("render"))) return true;
            if (sLower.includes("lettering") && tLower.includes("lettering")) return true;
            if (sLower.includes("cover") && tLower.includes("cover")) return true;
            if (sLower.includes("marketing") && (tLower.includes("promo") || tLower.includes("marketing") || tLower.includes("teaser") || tLower.includes("social"))) return true;
            
            if (sLower.includes("zoning") && tLower.includes("zoning")) return true;
            if (sLower.includes("site mapping") && (tLower.includes("map") || tLower.includes("photo") || tLower.includes("site"))) return true;
            if (sLower.includes("massing") && (tLower.includes("massing") || tLower.includes("envelope"))) return true;
            if (sLower.includes("grids") && (tLower.includes("grid") || tLower.includes("level"))) return true;
            if (sLower.includes("floor plan") && tLower.includes("floor plan")) return true;
            if (sLower.includes("wall") && tLower.includes("wall")) return true;
            if (sLower.includes("render") && tLower.includes("render")) return true;
            if (sLower.includes("presentation") && (tLower.includes("presentation") || tLower.includes("sheets") || tLower.includes("indesign"))) return true;
            
            return false;
        });
    };

    // Build pipeline tasks
    let pipelineTasks = [];
    let taskIdCounter = 1;
    
    if (onboarding.journeyType === 'short' && onboarding.career === 'comic_creator') {
        const chaptersCount = parseInt(onboarding.chapters_count) || 5;
        templates.phases.forEach((phase) => {
            const isPerChapter = phase.name.includes("Script") || phase.name.includes("Thumbnail") || 
                                 phase.name.includes("Line") || phase.name.includes("Color") || 
                                 phase.name.includes("Letter") || phase.name.includes("Edit");
            
            if (isPerChapter) {
                for (let ch = 1; ch <= chaptersCount; ch++) {
                    phase.tasks.forEach(t => {
                        const titleWithCh = `${t.title} - Ch ${ch}`;
                        if (!isTaskCompleted(titleWithCh, onboarding.completed_stages)) {
                            pipelineTasks.push({
                                id: `task-${Date.now()}-${taskIdCounter++}`,
                                title: titleWithCh,
                                durationHours: t.durationHours || 2,
                                dependencyId: t.dependencyId ? `${t.dependencyId} - Ch ${ch}` : "",
                                phaseName: phase.name,
                                status: 'pending',
                                chapter: ch
                            });
                        }
                    });
                }
            } else {
                phase.tasks.forEach(t => {
                    if (!isTaskCompleted(t.title, onboarding.completed_stages)) {
                        pipelineTasks.push({
                            id: `task-${Date.now()}-${taskIdCounter++}`,
                            title: t.title,
                            durationHours: t.durationHours || 2,
                            dependencyId: t.dependencyId,
                            phaseName: phase.name,
                            status: 'pending'
                        });
                    }
                });
            }
        });
    } else if (onboarding.journeyType === 'short' && onboarding.career === 'architecture') {
        const scaleLevels = parseInt(onboarding.scale_levels) || 5;
        templates.phases.forEach((phase) => {
            const isPerSheet = phase.name.includes("Design Development") || phase.name.includes("Render");
            if (isPerSheet) {
                for (let sh = 1; sh <= scaleLevels; sh++) {
                    phase.tasks.forEach(t => {
                        const titleWithSh = `${t.title} - Sheet ${sh}`;
                        if (!isTaskCompleted(titleWithSh, onboarding.completed_stages)) {
                            pipelineTasks.push({
                                id: `task-${Date.now()}-${taskIdCounter++}`,
                                title: titleWithSh,
                                durationHours: t.durationHours || 2,
                                dependencyId: t.dependencyId ? `${t.dependencyId} - Sheet ${sh}` : "",
                                phaseName: phase.name,
                                status: 'pending',
                                sheet: sh
                            });
                        }
                    });
                }
            } else {
                phase.tasks.forEach(t => {
                    if (!isTaskCompleted(t.title, onboarding.completed_stages)) {
                        pipelineTasks.push({
                            id: `task-${Date.now()}-${taskIdCounter++}`,
                            title: t.title,
                            durationHours: t.durationHours || 2,
                            dependencyId: t.dependencyId,
                            phaseName: phase.name,
                            status: 'pending'
                        });
                    }
                });
            }
        });
    } else {
        templates.phases.forEach((phase) => {
            phase.tasks.forEach(t => {
                if (!isTaskCompleted(t.title, onboarding.completed_stages)) {
                    pipelineTasks.push({
                        id: `task-${Date.now()}-${taskIdCounter++}`,
                        title: t.title,
                        durationHours: t.durationHours || 2,
                        dependencyId: t.dependencyId,
                        phaseName: phase.name,
                        status: 'pending'
                    });
                }
            });
        });
    }

    // Filter pipelineTasks based on planning depth!
    let finalPipelineTasks = [];
    if (onboarding.planning_depth === '1') {
        // Level 1: Goal Only (Broad milestones only)
        const phaseNames = [];
        pipelineTasks.forEach(t => {
            if (!phaseNames.includes(t.phaseName)) phaseNames.push(t.phaseName);
        });
        phaseNames.forEach((p, idx) => {
            finalPipelineTasks.push({
                id: `milestone-goal-${idx}`,
                title: `${p} Phase Milestone Target`,
                durationHours: 2,
                phaseName: p,
                status: 'pending'
            });
        });
    } else if (onboarding.planning_depth === '2') {
        // Level 2: Weekly Planner (Aggregate by week blocks)
        const phaseNames = [];
        pipelineTasks.forEach(t => {
            if (!phaseNames.includes(t.phaseName)) phaseNames.push(t.phaseName);
        });
        phaseNames.forEach((p) => {
            const phaseTasks = pipelineTasks.filter(t => t.phaseName === p);
            const totalHours = phaseTasks.reduce((sum, t) => sum + (t.durationHours || 2), 0);
            const weeksNeeded = Math.ceil(totalHours / weeklyHours);
            for (let w = 1; w <= weeksNeeded; w++) {
                finalPipelineTasks.push({
                    id: `weekly-block-${p}-${w}`,
                    title: `${p} Tasks - Week ${w}`,
                    durationHours: Math.min(weeklyHours, totalHours - ((w - 1) * weeklyHours)),
                    phaseName: p,
                    status: 'pending'
                });
            }
        });
    } else {
        // Level 3 (Daily) & Level 4 (Production Manager)
        finalPipelineTasks = pipelineTasks;
    }

    // Set starting date
    let dateCursor = onboarding.start_date ? new Date(onboarding.start_date) : new Date();
    dateCursor.setHours(0,0,0,0);
    
    let scheduledTasks = [];
    
    const isPreferredDay = (date) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = days[date.getDay()];
        return preferredWorkDays.includes(dayName);
    };

    const isDateUnavailable = (date) => {
        const str = date.toISOString().split('T')[0];
        return unavailableDates.includes(str);
    };

    const getNextPreferredDate = (date) => {
        let d = new Date(date);
        do {
            d.setDate(d.getDate() + 1);
        } while (!isPreferredDay(d) || isDateUnavailable(d));
        return d;
    };

    if (!isPreferredDay(dateCursor) || isDateUnavailable(dateCursor)) {
        dateCursor = getNextPreferredDate(dateCursor);
    }
    
    let dailyHoursUsed = 0;
    let workDaysCount = 0;

    finalPipelineTasks.forEach(task => {
        let earliestStart = onboarding.start_date ? new Date(onboarding.start_date) : new Date();
        earliestStart.setHours(0,0,0,0);
        
        if (task.dependencyId) {
            const depTask = scheduledTasks.find(t => t.title === task.dependencyId || t.title.startsWith(task.dependencyId));
            if (depTask && depTask.endDate) {
                earliestStart = new Date(depTask.endDate);
                earliestStart.setDate(earliestStart.getDate() + 1);
            }
        }
        
        if (dateCursor < earliestStart) {
            dateCursor = new Date(earliestStart);
            if (!isPreferredDay(dateCursor) || isDateUnavailable(dateCursor)) {
                dateCursor = getNextPreferredDate(dateCursor);
            }
            dailyHoursUsed = 0;
        }

        let remainingHours = task.durationHours;
        let taskStartDate = new Date(dateCursor);
        let taskEndDate = new Date(dateCursor);

        while (remainingHours > 0) {
            const availableHoursToday = Math.max(0, dailyHoursMax - dailyHoursUsed);
            
            if (availableHoursToday <= 0) {
                dateCursor = getNextPreferredDate(dateCursor);
                workDaysCount++;
                
                // Every 6 days of work, insert a Catch-up / Rest Day
                if (workDaysCount % 6 === 0) {
                    const catchupStr = dateCursor.toISOString().split('T')[0];
                    scheduledTasks.push({
                        id: `catchup-${Date.now()}-${taskIdCounter++}`,
                        title: "Rest & Catch-up Day",
                        durationHours: 0,
                        startDate: catchupStr,
                        endDate: catchupStr,
                        phaseName: "Buffer / Rest",
                        status: 'completed'
                    });
                    dateCursor = getNextPreferredDate(dateCursor);
                }
                
                dailyHoursUsed = 0;
                continue;
            }

            const hoursToSchedule = Math.min(remainingHours, availableHoursToday);
            remainingHours -= hoursToSchedule;
            dailyHoursUsed += hoursToSchedule;
            taskEndDate = new Date(dateCursor);

            if (remainingHours > 0) {
                dateCursor = getNextPreferredDate(dateCursor);
                workDaysCount++;
                if (workDaysCount % 6 === 0) {
                    const catchupStr = dateCursor.toISOString().split('T')[0];
                    scheduledTasks.push({
                        id: `catchup-${Date.now()}-${taskIdCounter++}`,
                        title: "Rest & Catch-up Day",
                        durationHours: 0,
                        startDate: catchupStr,
                        endDate: catchupStr,
                        phaseName: "Buffer / Rest",
                        status: 'completed'
                    });
                    dateCursor = getNextPreferredDate(dateCursor);
                }
                dailyHoursUsed = 0;
            }
        }

        const formatDateString = (d) => d.toISOString().split('T')[0];

        scheduledTasks.push({
            ...task,
            startDate: formatDateString(taskStartDate),
            endDate: formatDateString(taskEndDate)
        });
    });

    localStorage.setItem(`career_tasks_${career}`, JSON.stringify(scheduledTasks));
    window.dispatchEvent(new Event('careerDataUpdated'));
}

export async function rebalanceSchedule(changedTaskId, newStartDate) {
    const career = getActiveCareer();
    let tasks = await getTasks();
    
    const taskIndex = tasks.findIndex(t => t.id.toString() === changedTaskId.toString());
    if (taskIndex === -1) return;

    // Load constraints
    const preferredWorkDays = JSON.parse(localStorage.getItem(`preferredDays_${career}`)) || ["Monday", "Tuesday", "Wednesday", "Friday", "Saturday"];
    const dailyHoursMax = parseInt(localStorage.getItem(`dailyHours_${career}`)) || 3;
    const unavailableDates = JSON.parse(localStorage.getItem(`unavailableDates_${career}`)) || [];

    const isPreferredDay = (date) => {
        const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = days[date.getDay()];
        return preferredWorkDays.includes(dayName);
    };

    const isDateUnavailable = (date) => {
        const str = date.toISOString().split('T')[0];
        return unavailableDates.includes(str);
    };

    const getNextPreferredDate = (date) => {
        let d = new Date(date);
        do {
            d.setDate(d.getDate() + 1);
        } while (!isPreferredDay(d) || isDateUnavailable(d));
        return d;
    };

    const formatDateString = (d) => d.toISOString().split('T')[0];

    const calculateTaskDates = (startDateStr, durationHours) => {
        let dateCursor = new Date(startDateStr);
        if (!isPreferredDay(dateCursor) || isDateUnavailable(dateCursor)) {
            dateCursor = getNextPreferredDate(dateCursor);
        }
        
        let remainingHours = durationHours;
        let taskStartDate = new Date(dateCursor);
        let taskEndDate = new Date(dateCursor);
        let dailyHoursUsed = 0;

        while (remainingHours > 0) {
            const availableHoursToday = Math.max(0, dailyHoursMax - dailyHoursUsed);
            const hoursToSchedule = Math.min(remainingHours, availableHoursToday);
            remainingHours -= hoursToSchedule;
            dailyHoursUsed += hoursToSchedule;
            taskEndDate = new Date(dateCursor);

            if (remainingHours > 0) {
                dateCursor = getNextPreferredDate(dateCursor);
                dailyHoursUsed = 0;
            }
        }

        return {
            startDate: formatDateString(taskStartDate),
            endDate: formatDateString(taskEndDate)
        };
    };

    const changedTask = tasks[taskIndex];
    const newDates = calculateTaskDates(newStartDate, changedTask.durationHours);
    changedTask.startDate = newDates.startDate;
    changedTask.endDate = newDates.endDate;

    let shiftedAny = true;
    while (shiftedAny) {
        shiftedAny = false;
        tasks.forEach(t => {
            if (t.dependencyId && t.title !== "Rest & Catch-up Day") {
                const dep = tasks.find(depT => depT.title === t.dependencyId || depT.title.startsWith(t.dependencyId));
                if (dep && dep.endDate) {
                    const earliestStart = new Date(dep.endDate);
                    earliestStart.setDate(earliestStart.getDate() + 1);
                    
                    const currentStart = new Date(t.startDate);
                    if (currentStart < earliestStart) {
                        const shiftedDates = calculateTaskDates(formatDateString(earliestStart), t.durationHours);
                        t.startDate = shiftedDates.startDate;
                        t.endDate = shiftedDates.endDate;
                        shiftedAny = true;
                    }
                }
            }
        });
    }

    localStorage.setItem(`career_tasks_${career}`, JSON.stringify(tasks));
    window.dispatchEvent(new Event('careerDataUpdated'));
}
