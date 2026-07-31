import type { Metadata } from "next";
import Review from "@/components/Review";

export const metadata: Metadata = {
  title: "Revisão — o que você errou",
  description:
    "As questões que você errou voltam misturadas, fora da trilha de origem. Sai da fila só o que você acerta.",
};

export default function RevisaoPage() {
  return <Review />;
}
