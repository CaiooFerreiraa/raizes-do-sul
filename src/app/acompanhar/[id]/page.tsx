import { prisma } from "@/infrastructure/database/prisma";
import { notFound } from "next/navigation";
import OrderTrackingClient from "./order-tracking-client";

export default async function TrackOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  const serializedOrder = JSON.parse(JSON.stringify(order));
  return <OrderTrackingClient order={serializedOrder} />;
}
