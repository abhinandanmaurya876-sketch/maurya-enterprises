// Maurya Enterprises - Automatic Firebase Data Seeding Script
const firebaseSeedConfig = {
  apiKey: "AIzaSyCcfJ7lqOA95b1dqlrQETvAAPooifKAy1g",
  authDomain: "mauryaenterprises-84287.firebaseapp.com",
  projectId: "mauryaenterprises-84287",
  storageBucket: "mauryaenterprises-84287.firebasestorage.app",
  messagingSenderId: "763643637248",
  appId: "1:763643637248:web:3cbfe9ea8b68bebc4132e5",
  measurementId: "G-EK8B6BRLC3"
};

// Initialize Firebase for Seeding
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseSeedConfig);
}
const seedDB = firebase.firestore();

// 11 Categories and Premium Sample Products Data Matrix
const sampleProducts = [
    // 1. Construction Materials
    { name: "UltraTech Cement (50kg)", price: 440, mainCategory: "Construction Materials", subCategory: "Cement", image: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=500" },
    { name: "TMT Steel Bars (12mm per ton)", price: 52000, mainCategory: "Construction Materials", subCategory: "Steel", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?q=80&w=500" },
    
    // 2. Electricals
    { name: "Finolex 1.5 Sqmm Wire (90m)", price: 1450, mainCategory: "Electricals", subCategory: "Wires", image: "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=500" },
    { name: "Schneider 16A MCB Single Pole", price: 280, mainCategory: "Electricals", subCategory: "Switches & MCB", image: "https://images.unsplash.com/photo-1620288627223-53302f4e8c74?q=80&w=500" },

    // 3. Paints
    { name: "Asian Paints Apex Weatherproof (20L)", price: 5600, mainCategory: "Paints", subCategory: "Exterior Paints", image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=500" },
    { name: "Berger Luxury Interior Emulsion (4L)", price: 1250, mainCategory: "Paints", subCategory: "Interior Paints", image: "https://images.unsplash.com/photo-1585713181935-d5f622cc2415?q=80&w=500" },

    // 4. Hardware
    { name: "Godrej Mortise Door Lock", price: 1850, mainCategory: "Hardware", subCategory: "Locks", image: "https://images.unsplash.com/photo-1510766314828-3ca917a0943e?q=80&w=500" },
    { name: "Stainless Steel Door Hinges (4 inch)", price: 95, mainCategory: "Hardware", subCategory: "Fittings", image: "https://images.unsplash.com/photo-1534224039826-c7a0dea0e66a?q=80&w=500" },

    // 5. Plumbing
    { name: "Astral PVC Pipe 1 inch (6m)", price: 320, mainCategory: "Plumbing", subCategory: "Pipes", image: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=500" },
    { name: "Supreme CPVC Brass Elbow 1/2 inch", price: 85, mainCategory: "Plumbing", subCategory: "Fittings", image: "https://images.unsplash.com/photo-1542013936693-8848e57423e1?q=80&w=500" },

    // 6. Lighting & Fans
    { name: "Havells 1200mm Ceiling Fan", price: 2400, mainCategory: "Lighting & Fans", subCategory: "Fans", image: "https://images.unsplash.com/photo-1618941716939-550fc41679ff?q=80&w=500" },
    { name: "Philips 9W LED Bulb (Pack of 4)", price: 350, mainCategory: "Lighting & Fans", subCategory: "LED Bulbs", image: "https://images.unsplash.com/photo-1550537687-c91072c4792d?q=80&w=500" },

    // 7. Bathroom
    { name: "Jaquar Chrome Basin Tap", price: 3200, mainCategory: "Bathroom", subCategory: "Faucets & Taps", image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=500" },
    { name: "Cera Western Commode Toilet", price: 6500, mainCategory: "Bathroom", subCategory: "Sanitaryware", image: "https://images.unsplash.com/photo-1564540574859-0dfb63985953?q=80&w=500" },

    // 8. Plywood & Laminates
    { name: "CenturyPly Waterproof Plywood 19mm", price: 4200, mainCategory: "Plywood & Laminates", subCategory: "Plywood", image: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=500" },

    // 9. Power & Hand Tools
    { name: "Bosch 13mm Impact Drill Machine", price: 2999, mainCategory: "Power & Hand Tools", subCategory: "Power Tools", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=500" },

    // 10. Appliances
    { name: "Crompton 15L Storage Geyser", price: 6800, mainCategory: "Appliances", subCategory: "Geysers", image: "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?q=80&w=500" },

    // 11. Kitchen
    { name: "Faber 3 Burner Glass Cooktop", price: 5499, mainCategory: "Kitchen", subCategory: "Cooktops", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=500" }
];

// Execution Pipeline Engine
async function seedDatabase() {
    console.log("Starting Firebase Data Upload for Maurya Enterprises...");
    
    for (const product of sampleProducts) {
        try {
            await seedDB.collection("products").add(product);
            console.log(`Successfully uploaded: ${product.name}`);
        } catch (error) {
            console.error(`Error uploading ${product.name}:`, error);
        }
    }
    
    console.log("🔥 SUCCESS! All categories and products are live in your Firebase Firestore Database.");
    alert("Firebase Database Upload Complete! You can now remove the upload-data.js script line from index.html.");
}

// Run the seed scripta
seedDatabase();
