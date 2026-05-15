export const MOCK_DATA = {
    profile: {
        name: "Mariam",
        role: "High School Senior, Class of 2026",
        location: "New York, NY",
        interests: "Interior/Landscape Architecture, Art, Advocacy"
    },
    axp: {
        totalRequired: 3740,
        currentTotal: 0,
        categories: [
            { name: "Practice Management", required: 160, current: 0 },
            { name: "Project Management", required: 360, current: 0 },
            { name: "Programming & Analysis", required: 260, current: 0 },
            { name: "Project Planning & Design", required: 1080, current: 0 },
            { name: "Project Development & Documentation", required: 1520, current: 0 },
            { name: "Construction & Evaluation", required: 360, current: 0 }
        ]
    },
    donows: [
        { id: 1, title: "Draft Diversity Advancement Scholarship Essay", month: "Current Month", status: "pending" },
        { id: 2, title: "Assemble Art & Design Portfolio for The New School", month: "Current Month", status: "in-progress" },
        { id: 3, title: "Research NAAB-Accredited Programs at Syracuse", month: "Current Month", status: "pending" },
        { id: 4, title: "Apply for Walter A. Hunt, Jr. Scholarship", month: "Next Month", status: "pending" }
    ],
    projects: [
        {
            id: 1,
            title: "110th St Plaza Memorial Design",
            date: "Fall 2025",
            software: "Sketching, 3D Modeling",
            status: "In Progress",
            images: []
        }
    ],
    opportunities: {
        due: [
            { id: 103, type: "Scholarship", title: "Walter A. Hunt, Jr. Scholarship", org: "AIA New York", deadline: "May 1", notes: "Specifically for NY public high school students entering architecture school. Perfect fit!" }
        ],
        mustDo: [
            { id: 101, type: "Scholarship", title: "Diversity Advancement Scholarship", org: "Architects Foundation", deadline: "January 20", notes: "For minority high school students entering NAAB-accredited programs. Multi-year support!" }
        ],
        optional: [
            { id: 102, type: "Mentorship", title: "Project Pipeline", org: "NOMA", deadline: "Rolling", notes: "Great for networking with minority architects in NYC." }
        ]
    }
};
