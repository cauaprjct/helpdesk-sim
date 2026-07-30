import { notFound } from "next/navigation";
import LessonView from "@/components/LessonView";
import { LESSONS, getLesson } from "@/content/lessons";

export function generateStaticParams() {
  return LESSONS.map((l) => ({ lessonId: l.id }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) notFound();
  return <LessonView lesson={lesson} />;
}
