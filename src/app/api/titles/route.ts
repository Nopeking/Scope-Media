import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'titles.json');

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialTitles = ['Tech Conferences', 'Cooking Shows', 'Music Events'];
    fs.writeFileSync(DB_PATH, JSON.stringify(initialTitles, null, 2));
  }
}

// GET - Fetch all custom titles
export async function GET() {
  try {
    console.log('📥 Fetching custom titles from file database...');
    ensureDataDir();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const titles = JSON.parse(data);
    console.log(`✅ Fetched ${titles.length} custom titles`);
    return NextResponse.json(titles);
  } catch (error: any) {
    console.error('❌ Error reading titles:', error);
    return NextResponse.json(['Tech Conferences', 'Cooking Shows', 'Music Events'], { status: 500 });
  }
}

// POST - Add a new title
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    const { title } = await request.json();
    console.log('📝 Adding new custom title:', title);
    
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const titles = JSON.parse(data);
    
    if (!titles.includes(title)) {
      titles.push(title);
      fs.writeFileSync(DB_PATH, JSON.stringify(titles, null, 2));
      console.log('✅ Custom title added successfully');
    } else {
      console.log('⚠️ Title already exists');
    }
    
    return NextResponse.json(titles, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error adding title:', error);
    return NextResponse.json({ error: 'Failed to add title' }, { status: 500 });
  }
}

// DELETE - Delete a title
export async function DELETE(request: NextRequest) {
  try {
    ensureDataDir();
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');
    
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    console.log('🗑️ Deleting custom title:', title);
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const titles = JSON.parse(data);
    const filteredTitles = titles.filter((t: string) => t !== title);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(filteredTitles, null, 2));
    console.log('✅ Custom title deleted successfully');
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Error deleting title:', error);
    return NextResponse.json({ error: 'Failed to delete title' }, { status: 500 });
  }
}
