import { NextResponse } from 'next/server';
import { getAvailableCourses } from '@/lib/courseLibrary';

// Disable caching to always get fresh course list
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = await getAvailableCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to load courses' }, { status: 500 });
  }
}
