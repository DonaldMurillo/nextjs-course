import fs from "fs";
import path from "path";
import { Suspense } from "react";
import CourseClient from "./CourseClient";
import { Skeleton } from "@/components/ui/skeleton";

// Generate static params for all courses at build time
export async function generateStaticParams() {
  const coursesDir = path.join(process.cwd(), "content", "courses");

  if (!fs.existsSync(coursesDir)) {
    return [];
  }

  const courseFolders = fs
    .readdirSync(coursesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const params: { id: string }[] = [];

  for (const folder of courseFolders) {
    const metadataPath = path.join(coursesDir, folder, "metadata.json");
    if (fs.existsSync(metadataPath)) {
      try {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf-8"));
        params.push({ id: metadata.id });
      } catch (error) {
        console.error(`Error reading metadata for ${folder}:`, error);
      }
    }
  }

  return params;
}

function CourseLoading() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function CoursePage() {
  return (
    <Suspense fallback={<CourseLoading />}>
      <CourseClient />
    </Suspense>
  );
}
