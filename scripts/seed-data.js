const fs = require('fs');
const path = require('path');

// Create data directory if it doesn't exist
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created /data directory');
}

// Default video data
const defaultVideo = {
  id: "1728000000000",
  title: "Class 6B Novice",
  url: "https://youtube.com/live/uR2vU5AxZMk",
  thumbnail: "/equestrian-thumbnail.jpg",
  duration: "Live",
  uploadDate: "10/10/2025",
  customTitle: "Emirates Longines League - (Arena 2) Butheeb Equestrian Academy",
  month: "October 2025"
};

// Seed videos.json
const videosPath = path.join(dataDir, 'videos.json');
if (!fs.existsSync(videosPath)) {
  fs.writeFileSync(videosPath, JSON.stringify([defaultVideo], null, 2));
  console.log('✅ Created videos.json with default equestrian video');
} else {
  console.log('ℹ️  videos.json already exists, skipping...');
}

// Seed streams.json
const streamsPath = path.join(dataDir, 'streams.json');
if (!fs.existsSync(streamsPath)) {
  fs.writeFileSync(streamsPath, JSON.stringify([], null, 2));
  console.log('✅ Created streams.json');
} else {
  console.log('ℹ️  streams.json already exists, skipping...');
}

// Seed titles.json
const titlesPath = path.join(dataDir, 'titles.json');
const defaultTitles = [
  "Emirates Longines League - (Arena 2) Butheeb Equestrian Academy",
  "Tech Conferences",
  "Cooking Shows",
  "Music Events"
];

if (!fs.existsSync(titlesPath)) {
  fs.writeFileSync(titlesPath, JSON.stringify(defaultTitles, null, 2));
  console.log('✅ Created titles.json with default categories');
} else {
  console.log('ℹ️  titles.json already exists, skipping...');
}

console.log('\n🎉 Database seeded successfully!');
console.log('🚀 Run "npm run dev" to start the server');

