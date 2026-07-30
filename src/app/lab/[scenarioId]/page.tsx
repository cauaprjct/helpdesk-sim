import { notFound } from "next/navigation";
import LabRunner from "@/components/LabRunner";
import { SCENARIOS, getScenario } from "@/content/scenarios";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ scenarioId: s.id }));
}

export default async function LabPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  const scenario = getScenario(scenarioId);
  if (!scenario) notFound();
  return <LabRunner scenario={scenario} />;
}
