import { notFound } from "next/navigation";
import TicketTriage from "@/components/TicketTriage";
import { TICKETS, getTicket } from "@/content/tickets";

export function generateStaticParams() {
  return TICKETS.map((t) => ({ ticketId: t.id }));
}

export default async function TicketPage({
  params,
}: {
  params: Promise<{ ticketId: string }>;
}) {
  const { ticketId } = await params;
  const ticket = getTicket(ticketId);
  if (!ticket) notFound();
  return <TicketTriage ticket={ticket} />;
}
