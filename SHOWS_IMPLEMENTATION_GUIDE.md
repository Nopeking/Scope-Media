# Show Jumping Competition Management System - Complete Implementation Guide

This document contains EVERYTHING you need to implement the complete show jumping competition management system.

---

## TABLE OF CONTENTS

1. [Database Schema](#1-database-schema)
2. [TypeScript Types](#2-typescript-types)
3. [API Routes](#3-api-routes)
4. [Admin Shows Management Page](#4-admin-shows-management-page)
5. [Startlist Management Page](#5-startlist-management-page)
6. [Scoring Interface Page](#6-scoring-interface-page)
7. [Excel Upload Utility](#7-excel-upload-utility)
8. [Add Shows Tab to Admin Dashboard](#8-add-shows-tab-to-admin-dashboard)
9. [Setup Instructions](#9-setup-instructions)

---

## 1. DATABASE SCHEMA

Run this SQL in your Supabase SQL Editor:

```sql
-- ============================================================================
-- Show Jumping Competition Management System - Database Schema
-- ============================================================================

-- SHOWS TABLE
CREATE TABLE IF NOT EXISTS shows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  show_type TEXT NOT NULL CHECK (show_type IN ('national', 'international')),
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shows_start_date ON shows(start_date);
CREATE INDEX IF NOT EXISTS idx_shows_status ON shows(status);
CREATE INDEX IF NOT EXISTS idx_shows_show_type ON shows(show_type);

-- CLASSES TABLE
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  class_name TEXT NOT NULL,
  class_rule TEXT NOT NULL CHECK (class_rule IN (
    'one_round_against_clock',
    'one_round_not_against_clock',
    'optimum_time',
    'special_two_phases',
    'two_phases',
    'one_round_with_jumpoff',
    'two_rounds_with_tiebreaker',
    'two_rounds_team_with_tiebreaker',
    'accumulator',
    'speed_and_handiness',
    'six_bars'
  )),
  class_type TEXT,
  height TEXT,
  price DECIMAL(10, 2),
  class_date DATE,
  time_allowed INTEGER,
  time_allowed_round2 INTEGER,
  optimum_time INTEGER,
  max_points INTEGER DEFAULT 65,
  number_of_rounds INTEGER DEFAULT 1,
  linked_stream_id UUID REFERENCES streams(id),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_classes_show_id ON classes(show_id);
CREATE INDEX IF NOT EXISTS idx_classes_class_date ON classes(class_date);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_class_rule ON classes(class_rule);

-- STARTLIST TABLE
CREATE TABLE IF NOT EXISTS startlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  rider_name TEXT NOT NULL,
  rider_id TEXT NOT NULL,
  horse_name TEXT NOT NULL,
  horse_id TEXT,
  team_name TEXT,
  start_order INTEGER NOT NULL,
  bib_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_startlist_class_id ON startlist(class_id);
CREATE INDEX IF NOT EXISTS idx_startlist_rider_id ON startlist(rider_id);
CREATE INDEX IF NOT EXISTS idx_startlist_start_order ON startlist(start_order);

-- SCORES TABLE
CREATE TABLE IF NOT EXISTS scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  startlist_id UUID REFERENCES startlist(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER DEFAULT 1,
  time_taken DECIMAL(10, 2),
  time_faults INTEGER DEFAULT 0,
  jumping_faults INTEGER DEFAULT 0,
  total_faults INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'completed', 'cancelled', 'retired', 'eliminated', 'withdrawn'
  )),
  is_jumpoff BOOLEAN DEFAULT false,
  qualified_for_jumpoff BOOLEAN DEFAULT false,
  rank INTEGER,
  final_time DECIMAL(10, 2),
  notes TEXT,
  scored_by UUID REFERENCES auth.users(id),
  scored_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scores_startlist_id ON scores(startlist_id);
CREATE INDEX IF NOT EXISTS idx_scores_class_id ON scores(class_id);
CREATE INDEX IF NOT EXISTS idx_scores_round_number ON scores(round_number);
CREATE INDEX IF NOT EXISTS idx_scores_rank ON scores(rank);

-- TEAM SCORES TABLE
CREATE TABLE IF NOT EXISTS team_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  class_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
  team_name TEXT NOT NULL,
  round_number INTEGER DEFAULT 1,
  total_faults INTEGER DEFAULT 0,
  total_time DECIMAL(10, 2) DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_team_scores_class_id ON team_scores(class_id);
CREATE INDEX IF NOT EXISTS idx_team_scores_team_name ON team_scores(team_name);

-- ROW LEVEL SECURITY
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE startlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_scores ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to shows" ON shows;
DROP POLICY IF EXISTS "Allow public read access to classes" ON classes;
DROP POLICY IF EXISTS "Allow public read access to startlist" ON startlist;
DROP POLICY IF EXISTS "Allow public read access to scores" ON scores;
DROP POLICY IF EXISTS "Allow public read access to team_scores" ON team_scores;
DROP POLICY IF EXISTS "Admins can manage shows" ON shows;
DROP POLICY IF EXISTS "Admins can manage classes" ON classes;
DROP POLICY IF EXISTS "Admins can manage startlist" ON startlist;
DROP POLICY IF EXISTS "Admins can manage scores" ON scores;
DROP POLICY IF EXISTS "Admins can manage team_scores" ON team_scores;

-- Public read access
CREATE POLICY "Allow public read access to shows" ON shows FOR SELECT USING (true);
CREATE POLICY "Allow public read access to classes" ON classes FOR SELECT USING (true);
CREATE POLICY "Allow public read access to startlist" ON startlist FOR SELECT USING (true);
CREATE POLICY "Allow public read access to scores" ON scores FOR SELECT USING (true);
CREATE POLICY "Allow public read access to team_scores" ON team_scores FOR SELECT USING (true);

-- Admin management
CREATE POLICY "Admins can manage shows" ON shows FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND subscription_plan = 'enterprise')
);

CREATE POLICY "Admins can manage classes" ON classes FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND subscription_plan = 'enterprise')
);

CREATE POLICY "Admins can manage startlist" ON startlist FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND subscription_plan = 'enterprise')
);

CREATE POLICY "Admins can manage scores" ON scores FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND subscription_plan = 'enterprise')
);

CREATE POLICY "Admins can manage team_scores" ON team_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND subscription_plan = 'enterprise')
);

-- GRANT PERMISSIONS
GRANT SELECT ON shows TO authenticated;
GRANT SELECT ON classes TO authenticated;
GRANT SELECT ON startlist TO authenticated;
GRANT SELECT ON scores TO authenticated;
GRANT SELECT ON team_scores TO authenticated;
GRANT ALL ON shows TO service_role;
GRANT ALL ON classes TO service_role;
GRANT ALL ON startlist TO service_role;
GRANT ALL ON scores TO service_role;
GRANT ALL ON team_scores TO service_role;
```

---

## 2. TYPESCRIPT TYPES

Add these types to `src/types/index.ts` (inside the `Tables` section of the `Database` interface):

```typescript
shows: {
  Row: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
    show_type: 'national' | 'international';
    location: string | null;
    description: string | null;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    name: string;
    start_date: string;
    end_date: string;
    show_type: 'national' | 'international';
    location?: string | null;
    description?: string | null;
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    name?: string;
    start_date?: string;
    end_date?: string;
    show_type?: 'national' | 'international';
    location?: string | null;
    description?: string | null;
    status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
  };
};
classes: {
  Row: {
    id: string;
    show_id: string;
    class_name: string;
    class_rule: 'one_round_against_clock' | 'one_round_not_against_clock' | 'optimum_time' | 'special_two_phases' | 'two_phases' | 'one_round_with_jumpoff' | 'two_rounds_with_tiebreaker' | 'two_rounds_team_with_tiebreaker' | 'accumulator' | 'speed_and_handiness' | 'six_bars';
    class_type: string | null;
    height: string | null;
    price: number | null;
    class_date: string | null;
    time_allowed: number | null;
    time_allowed_round2: number | null;
    optimum_time: number | null;
    max_points: number;
    number_of_rounds: number;
    linked_stream_id: string | null;
    status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    show_id: string;
    class_name: string;
    class_rule: 'one_round_against_clock' | 'one_round_not_against_clock' | 'optimum_time' | 'special_two_phases' | 'two_phases' | 'one_round_with_jumpoff' | 'two_rounds_with_tiebreaker' | 'two_rounds_team_with_tiebreaker' | 'accumulator' | 'speed_and_handiness' | 'six_bars';
    class_type?: string | null;
    height?: string | null;
    price?: number | null;
    class_date?: string | null;
    time_allowed?: number | null;
    time_allowed_round2?: number | null;
    optimum_time?: number | null;
    max_points?: number;
    number_of_rounds?: number;
    linked_stream_id?: string | null;
    status?: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    show_id?: string;
    class_name?: string;
    class_rule?: 'one_round_against_clock' | 'one_round_not_against_clock' | 'optimum_time' | 'special_two_phases' | 'two_phases' | 'one_round_with_jumpoff' | 'two_rounds_with_tiebreaker' | 'two_rounds_team_with_tiebreaker' | 'accumulator' | 'speed_and_handiness' | 'six_bars';
    class_type?: string | null;
    height?: string | null;
    price?: number | null;
    class_date?: string | null;
    time_allowed?: number | null;
    time_allowed_round2?: number | null;
    optimum_time?: number | null;
    max_points?: number;
    number_of_rounds?: number;
    linked_stream_id?: string | null;
    status?: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
    created_at?: string;
    updated_at?: string;
  };
};
startlist: {
  Row: {
    id: string;
    class_id: string;
    rider_name: string;
    rider_id: string;
    horse_name: string;
    horse_id: string | null;
    team_name: string | null;
    start_order: number;
    bib_number: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    class_id: string;
    rider_name: string;
    rider_id: string;
    horse_name: string;
    horse_id?: string | null;
    team_name?: string | null;
    start_order: number;
    bib_number?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    class_id?: string;
    rider_name?: string;
    rider_id?: string;
    horse_name?: string;
    horse_id?: string | null;
    team_name?: string | null;
    start_order?: number;
    bib_number?: string | null;
    created_at?: string;
    updated_at?: string;
  };
};
scores: {
  Row: {
    id: string;
    startlist_id: string;
    class_id: string;
    round_number: number;
    time_taken: number | null;
    time_faults: number;
    jumping_faults: number;
    total_faults: number;
    points: number;
    status: 'pending' | 'completed' | 'cancelled' | 'retired' | 'eliminated' | 'withdrawn';
    is_jumpoff: boolean;
    qualified_for_jumpoff: boolean;
    rank: number | null;
    final_time: number | null;
    notes: string | null;
    scored_by: string | null;
    scored_at: string | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    startlist_id: string;
    class_id: string;
    round_number?: number;
    time_taken?: number | null;
    time_faults?: number;
    jumping_faults?: number;
    total_faults?: number;
    points?: number;
    status?: 'pending' | 'completed' | 'cancelled' | 'retired' | 'eliminated' | 'withdrawn';
    is_jumpoff?: boolean;
    qualified_for_jumpoff?: boolean;
    rank?: number | null;
    final_time?: number | null;
    notes?: string | null;
    scored_by?: string | null;
    scored_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    startlist_id?: string;
    class_id?: string;
    round_number?: number;
    time_taken?: number | null;
    time_faults?: number;
    jumping_faults?: number;
    total_faults?: number;
    points?: number;
    status?: 'pending' | 'completed' | 'cancelled' | 'retired' | 'eliminated' | 'withdrawn';
    is_jumpoff?: boolean;
    qualified_for_jumpoff?: boolean;
    rank?: number | null;
    final_time?: number | null;
    notes?: string | null;
    scored_by?: string | null;
    scored_at?: string | null;
    created_at?: string;
    updated_at?: string;
  };
};
team_scores: {
  Row: {
    id: string;
    class_id: string;
    team_name: string;
    round_number: number;
    total_faults: number;
    total_time: number;
    rank: number | null;
    created_at: string;
    updated_at: string;
  };
  Insert: {
    id?: string;
    class_id: string;
    team_name: string;
    round_number?: number;
    total_faults?: number;
    total_time?: number;
    rank?: number | null;
    created_at?: string;
    updated_at?: string;
  };
  Update: {
    id?: string;
    class_id?: string;
    team_name?: string;
    round_number?: number;
    total_faults?: number;
    total_time?: number;
    rank?: number | null;
    created_at?: string;
    updated_at?: string;
  };
};
```

Then add export types at the bottom of the file (after other export types):

```typescript
// Show types
export type Show = Database['public']['Tables']['shows']['Row'];
export type ShowInsert = Database['public']['Tables']['shows']['Insert'];
export type ShowUpdate = Database['public']['Tables']['shows']['Update'];

export type Class = Database['public']['Tables']['classes']['Row'];
export type ClassInsert = Database['public']['Tables']['classes']['Insert'];
export type ClassUpdate = Database['public']['Tables']['classes']['Update'];

export type StartlistEntry = Database['public']['Tables']['startlist']['Row'];
export type StartlistEntryInsert = Database['public']['Tables']['startlist']['Insert'];
export type StartlistEntryUpdate = Database['public']['Tables']['startlist']['Update'];

export type Score = Database['public']['Tables']['scores']['Row'];
export type ScoreInsert = Database['public']['Tables']['scores']['Insert'];
export type ScoreUpdate = Database['public']['Tables']['scores']['Update'];

export type TeamScore = Database['public']['Tables']['team_scores']['Row'];
export type TeamScoreInsert = Database['public']['Tables']['team_scores']['Insert'];
export type TeamScoreUpdate = Database['public']['Tables']['team_scores']['Update'];
```

---

## 3. API ROUTES

### 3.1 Shows API - `src/app/api/shows/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { data: shows, error } = await supabaseAdmin
      .from('shows')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(shows);
  } catch (error) {
    console.error('Error fetching shows:', error);
    return NextResponse.json({ error: 'Failed to fetch shows' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(show);
  } catch (error) {
    console.error('Error creating show:', error);
    return NextResponse.json({ error: 'Failed to create show' }, { status: 500 });
  }
}
```

### 3.2 Show by ID API - `src/app/api/shows/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) throw error;
    return NextResponse.json(show);
  } catch (error) {
    console.error('Error fetching show:', error);
    return NextResponse.json({ error: 'Failed to fetch show' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const { data: show, error } = await supabaseAdmin
      .from('shows')
      .update(body)
      .eq('id', params.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(show);
  } catch (error) {
    console.error('Error updating show:', error);
    return NextResponse.json({ error: 'Failed to update show' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabaseAdmin
      .from('shows')
      .delete()
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting show:', error);
    return NextResponse.json({ error: 'Failed to delete show' }, { status: 500 });
  }
}
```

### 3.3 Classes API - `src/app/api/classes/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const showId = searchParams.get('show_id');

    let query = supabaseAdmin.from('classes').select('*');

    if (showId) {
      query = query.eq('show_id', showId);
    }

    const { data: classes, error } = await query.order('class_date', { ascending: true });

    if (error) throw error;
    return NextResponse.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: classItem, error } = await supabaseAdmin
      .from('classes')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(classItem);
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json({ error: 'Failed to create class' }, { status: 500 });
  }
}
```

### 3.4 Startlist API - `src/app/api/startlist/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('class_id');

    if (!classId) {
      return NextResponse.json({ error: 'class_id is required' }, { status: 400 });
    }

    const { data: startlist, error } = await supabaseAdmin
      .from('startlist')
      .select('*')
      .eq('class_id', classId)
      .order('start_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json(startlist);
  } catch (error) {
    console.error('Error fetching startlist:', error);
    return NextResponse.json({ error: 'Failed to fetch startlist' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entries } = body; // Array of startlist entries

    if (Array.isArray(entries)) {
      // Bulk insert
      const { data: startlist, error } = await supabaseAdmin
        .from('startlist')
        .insert(entries)
        .select();

      if (error) throw error;
      return NextResponse.json(startlist);
    } else {
      // Single insert
      const { data: entry, error } = await supabaseAdmin
        .from('startlist')
        .insert(body)
        .select()
        .single();

      if (error) throw error;
      return NextResponse.json(entry);
    }
  } catch (error) {
    console.error('Error creating startlist:', error);
    return NextResponse.json({ error: 'Failed to create startlist' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('startlist')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting startlist entry:', error);
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 });
  }
}
```

### 3.5 Scores API - `src/app/api/scores/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classId = searchParams.get('class_id');
    const startlistId = searchParams.get('startlist_id');

    let query = supabaseAdmin.from('scores').select(`
      *,
      startlist (
        id,
        rider_name,
        horse_name,
        rider_id,
        start_order,
        team_name
      )
    `);

    if (classId) query = query.eq('class_id', classId);
    if (startlistId) query = query.eq('startlist_id', startlistId);

    const { data: scores, error } = await query.order('rank', { ascending: true, nullsFirst: false });

    if (error) throw error;
    return NextResponse.json(scores);
  } catch (error) {
    console.error('Error fetching scores:', error);
    return NextResponse.json({ error: 'Failed to fetch scores' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { data: score, error } = await supabaseAdmin
      .from('scores')
      .insert(body)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(score);
  } catch (error) {
    console.error('Error creating score:', error);
    return NextResponse.json({ error: 'Failed to create score' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { data: score, error } = await supabaseAdmin
      .from('scores')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(score);
  } catch (error) {
    console.error('Error updating score:', error);
    return NextResponse.json({ error: 'Failed to update score' }, { status: 500 });
  }
}
```

---

## 4. ADMIN SHOWS MANAGEMENT PAGE

File: `src/app/admin/shows/page.tsx`

This file is already created. See the file in your project.

---

## 5. STARTLIST MANAGEMENT PAGE

File: `src/app/admin/shows/[showId]/class/[classId]/startlist/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Trash2, ChevronLeft, Download } from 'lucide-react';
import { StartlistEntry, Class } from '@/types';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function StartlistPage({
  params,
}: {
  params: { showId: string; classId: string };
}) {
  const [startlist, setStartlist] = useState<StartlistEntry[]>([]);
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchClassData();
    fetchStartlist();
  }, [params.classId]);

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/classes?show_id=${params.showId}`);
      const classes = await response.json();
      const currentClass = classes.find((c: Class) => c.id === params.classId);
      setClassData(currentClass);
    } catch (error) {
      console.error('Error fetching class:', error);
    }
  };

  const fetchStartlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/startlist?class_id=${params.classId}`);
      const data = await response.json();
      setStartlist(data);
    } catch (error) {
      console.error('Error fetching startlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Map Excel columns to startlist entries
      const entries = jsonData.map((row: any, index) => ({
        class_id: params.classId,
        rider_name: row['Rider Name'] || row['rider_name'] || '',
        rider_id: row['Rider ID'] || row['rider_id'] || row['FEI ID'] || row['Licence'] || '',
        horse_name: row['Horse Name'] || row['horse_name'] || '',
        horse_id: row['Horse ID'] || row['horse_id'] || '',
        team_name: row['Team Name'] || row['team_name'] || null,
        start_order: index + 1,
        bib_number: row['Bib Number'] || row['bib_number'] || null,
      }));

      // Upload to API
      const response = await fetch('/api/startlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entries }),
      });

      if (response.ok) {
        await fetchStartlist();
        setShowUploadModal(false);
        alert(`Successfully uploaded ${entries.length} entries!`);
      } else {
        alert('Failed to upload startlist');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please check the format.');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;

    try {
      const response = await fetch(`/api/startlist?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStartlist();
        alert('Entry deleted successfully!');
      } else {
        alert('Failed to delete entry');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      alert('Error deleting entry');
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        'Rider Name': 'John Smith',
        'Rider ID': 'FEI12345 or EEF-SJR-001',
        'Horse Name': 'Thunder',
        'Horse ID': 'H12345',
        'Team Name': 'Team A (optional)',
        'Bib Number': '1 (optional)',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Startlist Template');
    XLSX.writeFile(wb, 'startlist_template.xlsx');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/shows"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Shows
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Startlist</h1>
              {classData && (
                <p className="text-slate-600 mt-1">{classData.class_name}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadTemplate}
                className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                <Download className="h-5 w-5" />
                Download Template
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
              >
                <Upload className="h-5 w-5" />
                Upload Excel
              </button>
            </div>
          </div>
        </div>

        {/* Startlist Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : startlist.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Startlist Yet</h3>
              <p className="text-slate-600 mb-4">Upload an Excel file to add riders to this class</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Startlist
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Order</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Bib</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Rider Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Rider ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Horse Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Horse ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700">Team</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {startlist.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">{entry.start_order}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{entry.bib_number || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{entry.rider_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{entry.rider_id}</td>
                      <td className="px-4 py-3 text-sm text-slate-900">{entry.horse_name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{entry.horse_id || '-'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{entry.team_name || '-'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowUploadModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6"
            >
              <h3 className="text-xl font-bold text-slate-800 mb-4">Upload Startlist</h3>

              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  Upload an Excel file (.xlsx, .xls) with the following columns:
                </p>

                <ul className="text-xs text-slate-600 list-disc list-inside space-y-1">
                  <li>Rider Name (required)</li>
                  <li>Rider ID (FEI ID or Licence, required)</li>
                  <li>Horse Name (required)</li>
                  <li>Horse ID (optional)</li>
                  <li>Team Name (optional)</li>
                  <li>Bib Number (optional)</li>
                </ul>

                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-blue-600 hover:text-blue-700 font-medium">Choose file</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-slate-500 mt-1">or drag and drop</p>
                </div>

                <button
                  onClick={downloadTemplate}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Download Template
                </button>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                className="mt-4 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 6. SCORING INTERFACE PAGE

File: `src/app/admin/shows/[showId]/class/[classId]/scoring/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Save, Trophy } from 'lucide-react';
import { StartlistEntry, Score, Class } from '@/types';
import Link from 'next/link';

export default function ScoringPage({
  params,
}: {
  params: { showId: string; classId: string };
}) {
  const [startlist, setStartlist] = useState<StartlistEntry[]>([]);
  const [scores, setScores] = useState<Record<string, any>>({});
  const [classData, setClassData] = useState<Class | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    fetchClassData();
    fetchStartlistAndScores();
  }, [params.classId]);

  const fetchClassData = async () => {
    try {
      const response = await fetch(`/api/classes?show_id=${params.showId}`);
      const classes = await response.json();
      const currentClass = classes.find((c: Class) => c.id === params.classId);
      setClassData(currentClass);
    } catch (error) {
      console.error('Error fetching class:', error);
    }
  };

  const fetchStartlistAndScores = async () => {
    try {
      setLoading(true);

      // Fetch startlist
      const startlistRes = await fetch(`/api/startlist?class_id=${params.classId}`);
      const startlistData = await startlistRes.json();
      setStartlist(startlistData);

      // Fetch existing scores
      const scoresRes = await fetch(`/api/scores?class_id=${params.classId}`);
      const scoresData = await scoresRes.json();

      // Map scores by startlist_id
      const scoresMap: Record<string, any> = {};
      scoresData.forEach((score: Score) => {
        scoresMap[score.startlist_id] = score;
      });
      setScores(scoresMap);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreChange = (startlistId: string, field: string, value: any) => {
    setScores(prev => ({
      ...prev,
      [startlistId]: {
        ...prev[startlistId],
        [field]: value,
      }
    }));
  };

  const handleSaveScore = async (startlistId: string) => {
    const scoreData = scores[startlistId];
    if (!scoreData) return;

    try {
      const payload = {
        ...scoreData,
        startlist_id: startlistId,
        class_id: params.classId,
        round_number: currentRound,
      };

      let response;
      if (scoreData.id) {
        // Update existing score
        response = await fetch('/api/scores', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // Create new score
        response = await fetch('/api/scores', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (response.ok) {
        alert('Score saved successfully!');
        await fetchStartlistAndScores();
      } else {
        alert('Failed to save score');
      }
    } catch (error) {
      console.error('Error saving score:', error);
      alert('Error saving score');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'retired': return 'bg-orange-100 text-orange-700';
      case 'eliminated': return 'bg-red-100 text-red-700';
      case 'withdrawn': return 'bg-slate-100 text-slate-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/admin/shows"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Shows
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Live Scoring</h1>
              {classData && (
                <p className="text-slate-600 mt-1">{classData.class_name}</p>
              )}
            </div>

            <div className="flex gap-2">
              <select
                value={currentRound}
                onChange={(e) => setCurrentRound(parseInt(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Round 1</option>
                <option value="2">Round 2</option>
                {classData?.class_rule.includes('jumpoff') && (
                  <option value="3">Jump-off</option>
                )}
              </select>
            </div>
          </div>
        </div>

        {/* Scoring Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            </div>
          ) : startlist.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-slate-800 mb-2">No Startlist</h3>
              <p className="text-slate-600">Please add a startlist before scoring</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Order</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Rider</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Horse</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Time (s)</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Faults</th>
                    <th className="px-3 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                    <th className="px-3 py-3 text-center text-xs font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {startlist.map((entry) => {
                    const score = scores[entry.id] || {};

                    return (
                      <tr key={entry.id} className="hover:bg-slate-50">
                        <td className="px-3 py-3 text-sm text-slate-900">{entry.start_order}</td>
                        <td className="px-3 py-3 text-sm font-medium text-slate-900">{entry.rider_name}</td>
                        <td className="px-3 py-3 text-sm text-slate-900">{entry.horse_name}</td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={score.time_taken || ''}
                            onChange={(e) => handleScoreChange(entry.id, 'time_taken', parseFloat(e.target.value) || null)}
                            className="w-20 px-2 py-1 border border-slate-300 rounded text-sm"
                            placeholder="0.00"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={score.jumping_faults || ''}
                            onChange={(e) => handleScoreChange(entry.id, 'jumping_faults', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 border border-slate-300 rounded text-sm"
                            placeholder="0"
                          />
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={score.status || 'pending'}
                            onChange={(e) => handleScoreChange(entry.id, 'status', e.target.value)}
                            className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(score.status || 'pending')}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="retired">Retired</option>
                            <option value="eliminated">Eliminated</option>
                            <option value="withdrawn">Withdrawn</option>
                          </select>
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => handleSaveScore(entry.id)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <Save className="h-3 w-3" />
                            Save
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Box */}
        {classData && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Class Information</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {classData.time_allowed && (
                <div>
                  <span className="text-blue-700">Time Allowed:</span>
                  <span className="ml-2 font-medium text-blue-900">{classData.time_allowed}s</span>
                </div>
              )}
              {classData.height && (
                <div>
                  <span className="text-blue-700">Height:</span>
                  <span className="ml-2 font-medium text-blue-900">{classData.height}</span>
                </div>
              )}
              <div>
                <span className="text-blue-700">Rule:</span>
                <span className="ml-2 font-medium text-blue-900">{classData.class_rule.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 7. EXCEL UPLOAD UTILITY

Install the required package:

```bash
npm install xlsx
```

The Excel upload functionality is already included in the Startlist page above.

---

## 8. ADD SHOWS TAB TO ADMIN DASHBOARD

Open `src/app/admin/dashboard/page.tsx` and add to the tabs array (around line 93-100):

```typescript
const tabs = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'live-streams', label: 'Live Streams', icon: Play },
  { id: 'archived-videos', label: 'Archived Videos', icon: Pause },
  { id: 'custom-titles', label: 'Custom Titles', icon: Settings },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'personal-library', label: 'Personal Library', icon: Upload },
  { id: 'shows', label: 'Shows', icon: Trophy }, // ADD THIS LINE
];
```

Then add the shows section in the content area (around line 1100, after the personal-library section):

```typescript
{/* Shows Tab */}
{activeTab === 'shows' && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="text-center py-8">
        <Trophy className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-800 mb-2">Show Management</h3>
        <p className="text-slate-600 mb-6">Manage show jumping competitions, classes, startlists, and scoring</p>
        <Link
          href="/admin/shows"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Trophy className="h-5 w-5" />
          Go to Shows Management
        </Link>
      </div>
    </div>
  </motion.div>
)}
```

Don't forget to import Trophy at the top:

```typescript
import { Plus, Edit, Trash2, Play, Pause, Upload, Users, Eye, Settings, Archive, Search, Trophy } from 'lucide-react';
```

---

## 9. SETUP INSTRUCTIONS

### Step 1: Run Database Schema
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy the entire SQL from Section 1
4. Paste and click "Run"

### Step 2: Update TypeScript Types
1. Open `src/types/index.ts`
2. Add the types from Section 2 inside the `Database['public']['Tables']` object
3. Add the export types at the bottom of the file

### Step 3: Create API Routes
Create these files with the code from Section 3:
- `src/app/api/shows/route.ts`
- `src/app/api/shows/[id]/route.ts`
- `src/app/api/classes/route.ts`
- `src/app/api/startlist/route.ts`
- `src/app/api/scores/route.ts`

### Step 4: Create Pages
The shows management page is already created at:
- `src/app/admin/shows/page.tsx`

Create these additional pages from Sections 5-6:
- `src/app/admin/shows/[showId]/class/[classId]/startlist/page.tsx`
- `src/app/admin/shows/[showId]/class/[classId]/scoring/page.tsx`

### Step 5: Install Dependencies
```bash
npm install xlsx
```

### Step 6: Update Admin Dashboard
Follow Section 8 to add the Shows tab to your admin dashboard.

### Step 7: Test
1. Go to `/admin/dashboard`
2. Click "Shows" tab
3. Click "Go to Shows Management"
4. Create a new show
5. Add classes to the show
6. Upload startlist via Excel
7. Start live scoring

---

## EXCEL FILE FORMAT

When uploading startlist, the Excel file should have these columns:

| Rider Name | Rider ID | Horse Name | Horse ID | Team Name | Bib Number |
|------------|----------|------------|----------|-----------|------------|
| John Smith | FEI12345 | Thunder    | H12345   | Team A    | 1          |
| Jane Doe   | EEF-001  | Lightning  | H67890   |           | 2          |

**Required columns:**
- Rider Name
- Rider ID (FEI ID or Licence Number)
- Horse Name

**Optional columns:**
- Horse ID
- Team Name
- Bib Number

You can download the template from the Startlist page.

---

## FEATURES SUMMARY

✅ **Shows Management:**
- Create/Edit/Delete shows
- National/International types
- Status tracking (upcoming, ongoing, completed, cancelled)

✅ **Classes Management:**
- Add classes to shows
- 11 different class rules supported
- Custom pricing, heights, time allowed

✅ **Startlist Management:**
- Excel upload
- Manual entry
- Team support
- Start order management

✅ **Live Scoring:**
- Real-time scoring interface
- Status tracking (completed, cancelled, retired, eliminated, withdrawn)
- Multiple rounds support
- Jump-off support
- Time and fault tracking

✅ **All Class Rules Supported:**
1. One Round Against the Clock
2. One Round Not Against the Clock
3. Optimum Time
4. Special Two Phases
5. Two Phases
6. One Round with Jump-off
7. Two Rounds with Tie-Breaker
8. Two Rounds Team with Tie-Breaker
9. Accumulator
10. Speed and Handiness
11. 6 Bars

---

**That's everything! All code is in one document. Just copy and paste each section into the appropriate files.**
