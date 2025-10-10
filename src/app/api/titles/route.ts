import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'titles.json');

// Default titles data (fallback for Netlify/serverless)
const DEFAULT_TITLES = [
  "Emirates Longines League - (Arena 2) Butheeb Equestrian Academy",
  "Tech Conferences",
  "Cooking Shows",
  "Music Events"
];

// In-memory storage for serverless environments
let memoryTitles: string[] = [...DEFAULT_TITLES];

// Ensure data directory exists (only works on writable filesystems)
function ensureDataDir() {
  try {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_TITLES, null, 2));
    }
    return true;
  } catch (error) {
    console.log('⚠️  Running in serverless environment (read-only filesystem)');
    return false;
  }
}

// GET - Fetch all custom titles
export async function GET() {
  try {
    console.log('📥 Fetching custom titles...');
    
    // Try to read from file first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const titles = JSON.parse(data);
        console.log(`✅ Fetched ${titles.length} custom titles from file`);
        return NextResponse.json(titles);
      } catch (fileError) {
        console.log('⚠️  Could not read file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    console.log(`✅ Fetched ${memoryTitles.length} custom titles from memory`);
    return NextResponse.json(memoryTitles);
  } catch (error: any) {
    console.error('❌ Error reading titles:', error);
    return NextResponse.json(DEFAULT_TITLES, { status: 200 });
  }
}

// POST - Add a new title
export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();
    console.log('📝 Adding new custom title:', title);
    
    // Try file system first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const titles = JSON.parse(data);
        
        if (!titles.includes(title)) {
          titles.push(title);
          fs.writeFileSync(DB_PATH, JSON.stringify(titles, null, 2));
          console.log('✅ Custom title added to file successfully');
        }
        return NextResponse.json(titles, { status: 201 });
      } catch (fileError) {
        console.log('⚠️  Could not write to file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    if (!memoryTitles.includes(title)) {
      memoryTitles.push(title);
      console.log('✅ Custom title added to memory (temporary - will not persist)');
    }
    return NextResponse.json(memoryTitles, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding title:', error);
    return NextResponse.json({ error: 'Failed to add title' }, { status: 500 });
  }
}

// DELETE - Delete a title
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting custom title:', title);
    
    // Try file system first (local development)
    if (ensureDataDir()) {
      try {
        const data = fs.readFileSync(DB_PATH, 'utf-8');
        const titles = JSON.parse(data);
        const filteredTitles = titles.filter((t: string) => t !== title);
        fs.writeFileSync(DB_PATH, JSON.stringify(filteredTitles, null, 2));
        console.log('✅ Custom title deleted from file successfully');
        return NextResponse.json({ success: true });
      } catch (fileError) {
        console.log('⚠️  Could not write to file, using memory storage');
      }
    }
    
    // Fallback to memory storage (Netlify/serverless)
    memoryTitles = memoryTitles.filter((t: string) => t !== title);
    console.log('✅ Custom title deleted from memory (temporary)');
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting title:', error);
    return NextResponse.json({ error: 'Failed to delete title' }, { status: 500 });
  }
}
