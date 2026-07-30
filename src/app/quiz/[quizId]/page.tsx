import { notFound } from "next/navigation";
import QuizRunner from "@/components/QuizRunner";
import { QUIZZES, getQuiz } from "@/content/quizzes";

export function generateStaticParams() {
  return QUIZZES.map((q) => ({ quizId: q.id }));
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  const quiz = getQuiz(quizId);
  if (!quiz) notFound();
  return <QuizRunner quiz={quiz} />;
}
