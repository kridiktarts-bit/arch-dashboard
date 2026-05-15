import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { MOCK_DATA } from './utils/mockData.js';

const firebaseConfig = {
  apiKey: "AIzaSyAdLd2kuFjaBBXdxvlsXFYC1ScNbI7vxL4",
  authDomain: "arch-dashboard-448df.firebaseapp.com",
  projectId: "arch-dashboard-448df",
  storageBucket: "arch-dashboard-448df.firebasestorage.app",
  messagingSenderId: "473810646802",
  appId: "1:473810646802:web:b10a3e5c0e40c6e10b65cb"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Helper to seed data if empty
export async function seedDatabaseIfEmpty() {
    try {
        const oppSnapshot = await getDocs(collection(db, 'opportunities'));
        if (oppSnapshot.empty) {
            console.log("Seeding opportunities...");
            const allOpps = [
                ...MOCK_DATA.opportunities.due.map(o => ({...o, status: 'due'})),
                ...MOCK_DATA.opportunities.mustDo.map(o => ({...o, status: 'mustDo'})),
                ...MOCK_DATA.opportunities.optional.map(o => ({...o, status: 'optional'}))
            ];
            for (const opp of allOpps) {
                const {id, ...rest} = opp;
                await addDoc(collection(db, 'opportunities'), rest);
            }
        }

        const projSnapshot = await getDocs(collection(db, 'projects'));
        if (projSnapshot.empty) {
            console.log("Seeding projects...");
            for (const proj of MOCK_DATA.projects) {
                const {id, ...rest} = proj;
                await addDoc(collection(db, 'projects'), rest);
            }
        }

        const taskSnapshot = await getDocs(collection(db, 'tasks'));
        if (taskSnapshot.empty) {
            console.log("Seeding tasks...");
            for (const task of MOCK_DATA.donows) {
                const {id, ...rest} = task;
                await addDoc(collection(db, 'tasks'), rest);
            }
        }

        const axpSnapshot = await getDocs(collection(db, 'axp'));
        if (axpSnapshot.empty) {
            console.log("Seeding AXP...");
            // Seed a single document to hold the AXP categories
            await setDoc(doc(db, 'axp', 'tracker'), MOCK_DATA.axp);
        }

        console.log("Database ready!");
    } catch (e) {
        console.error("Error connecting to Firebase:", e);
    }
}

// Data fetching helpers
export async function getOpportunities() {
    const snapshot = await getDocs(collection(db, 'opportunities'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateOpportunityStatus(id, newStatus) {
    const oppRef = doc(db, 'opportunities', id);
    await updateDoc(oppRef, { status: newStatus });
}

export async function deleteOpportunity(id) {
    const oppRef = doc(db, 'opportunities', id);
    await deleteDoc(oppRef);
}

export async function getProjects() {
    const snapshot = await getDocs(collection(db, 'projects'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function updateProjectTitle(id, newTitle) {
    const projRef = doc(db, 'projects', id);
    await updateDoc(projRef, { title: newTitle });
}

export async function updateProjectStatus(id, newStatus) {
    const projRef = doc(db, 'projects', id);
    await updateDoc(projRef, { status: newStatus });
}

export async function addProject(projectData) {
    const docRef = await addDoc(collection(db, 'projects'), projectData);
    return { id: docRef.id, ...projectData };
}

// Task Helpers
export async function getTasks() {
    const snapshot = await getDocs(collection(db, 'tasks'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addTask(taskData) {
    const docRef = await addDoc(collection(db, 'tasks'), taskData);
    return { id: docRef.id, ...taskData };
}

export async function updateTaskStatus(id, newStatus) {
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, { status: newStatus });
}

// AXP Helpers
export async function getAxp() {
    const docSnap = await getDocs(collection(db, 'axp'));
    if (!docSnap.empty) {
        return docSnap.docs[0].data();
    }
    return null;
}

export async function updateAxpCategory(categoryName, newHours) {
    const axpData = await getAxp();
    if (!axpData) return;

    let total = 0;
    const updatedCategories = axpData.categories.map(cat => {
        if (cat.name === categoryName) {
            cat.current += newHours;
        }
        total += cat.current;
        return cat;
    });

    const axpRef = doc(db, 'axp', 'tracker');
    await updateDoc(axpRef, {
        categories: updatedCategories,
        currentTotal: total
    });
}

// Roadmap Helpers
export async function getRoadmapCheckpoints() {
    const snapshot = await getDocs(collection(db, 'roadmap'));
    return snapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
    }, {});
}

export async function saveRoadmapCheckpoint(phaseId, data) {
    const docRef = doc(db, 'roadmap', phaseId);
    await setDoc(docRef, data, { merge: true });
}

// Reflection Helpers
export async function getReflections() {
    const snapshot = await getDocs(collection(db, 'reflections'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function saveReflection(data) {
    const docRef = await addDoc(collection(db, 'reflections'), {
        ...data,
        timestamp: Date.now()
    });
    return { id: docRef.id, ...data };
}

export { db };
