import { NextResponse } from 'next/server';
import { getAvailableCourses } from '@/lib/courseLibrary';

export async function GET() {
  try {
    const courses = await getAvailableCourses();
    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to load courses' }, { status: 500 });
  }
}
