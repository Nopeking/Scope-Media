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
    ensureDataDir();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const titles = JSON.parse(data);
    return NextResponse.json(titles);
  } catch (error) {
    console.error('Error reading titles:', error);
    return NextResponse.json([], { status: 500 });
  }
}

// POST - Add a new title
export async function POST(request: NextRequest) {
  try {
    ensureDataDir();
    const { title } = await request.json();
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const titles = JSON.parse(data);
    
    if (!titles.includes(title)) {
      titles.push(title);
      fs.writeFileSync(DB_PATH, JSON.stringify(titles, null, 2));
    }
    
    return NextResponse.json(titles, { status: 201 });
  } catch (error) {
    console.error('Error adding title:', error);
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
    
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const titles = JSON.parse(data);
    const filteredTitles = titles.filter((t: string) => t !== title);
    
    fs.writeFileSync(DB_PATH, JSON.stringify(filteredTitles, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting title:', error);
    return NextResponse.json({ error: 'Failed to delete title' }, { status: 500 });
  }
}

