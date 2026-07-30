import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = {
  title: "Treino — N1 e N2",
};

export default function TreinoPage() {
  return <Dashboard />;
}
