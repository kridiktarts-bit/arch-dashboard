const admin = require('firebase-admin');
const Parser = require('rss-parser');

async function run() {
    console.log("🚀 Starting Architecture Opportunity Scraper...");

    // 1. Initialize Firebase Admin
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        console.error("❌ ERROR: Missing FIREBASE_SERVICE_ACCOUNT environment variable.");
        process.exit(1);
    }

    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log("✅ Successfully connected to Firebase.");
    } catch (error) {
        console.error("❌ ERROR parsing FIREBASE_SERVICE_ACCOUNT:", error.message);
        process.exit(1);
    }

    const db = admin.firestore();
    const parser = new Parser();

    try {
        // 2. Fetch Existing Opportunities to prevent duplicates
        console.log("📥 Fetching existing opportunities from database...");
        const snapshot = await db.collection('opportunities').get();
        const existingTitles = new Set();
        snapshot.forEach(doc => {
            existingTitles.add(doc.data().title.trim());
        });

        // 3. Scrape Bustler RSS Feed
        console.log("📡 Scraping Bustler Competitions RSS feed...");
        const feed = await parser.parseURL('https://bustler.net/competitions/rss');
        
        let newItemsAdded = 0;

        for (const item of feed.items) {
            const title = item.title.trim();
            
            // Only add if it doesn't already exist
            if (!existingTitles.has(title)) {
                // Determine Deadline (Bustler titles often don't contain deadlines, but we will put 'Rolling' and let the user update it)
                const newOpp = {
                    title: title,
                    type: "Competition",
                    org: "Bustler Discovery",
                    deadline: "Check Link",
                    notes: `Auto-Scraped via GitHub Actions.\\n\\nLink: ${item.link}\\n\\nDetails: ${item.contentSnippet ? item.contentSnippet.substring(0, 150) + '...' : 'Visit link for details.'}`,
                    status: "optional"
                };

                await db.collection('opportunities').add(newOpp);
                console.log(`✨ Added new opportunity: ${title}`);
                newItemsAdded++;
                
                // Don't overwhelm the board, stop after adding 3 new items max per run
                if (newItemsAdded >= 3) {
                    console.log("🛑 Reached max 3 new items for this run to keep board clean.");
                    break;
                }
            }
        }

        console.log(`🎉 Scraper finished successfully. Added ${newItemsAdded} new opportunities.`);
        process.exit(0);

    } catch (error) {
        console.error("❌ Fatal Error during scraping process:", error);
        process.exit(1);
    }
}

run();
