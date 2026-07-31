import type { Metadata } from "next";
import Sandbox from "@/components/Sandbox";

export const metadata: Metadata = {
  title: "Terminal livre — prompt do Windows simulado",
  description:
    "Escolha uma máquina quebrada e investigue no prompt de comando. Sem cadastro, sem gabarito: o mesmo motor dos laboratórios, solto.",
};

export default function TerminalPage() {
  return <Sandbox />;
}
