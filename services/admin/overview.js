import "server-only";
import { connectDB, isDbConfigured } from "@/lib/db/connect";
import { Appointment, Message, Order } from "@/lib/db/models";

/** Dashboard counters — each is an indexed countDocuments; run in parallel. */
export async function getOverviewCounts() {
  if (!isDbConfigured()) return null;
  await connectDB();

  const notEmailed = { "notification.clinicEmailed": false };
  const [appointments, orders, messages, ...unsent] = await Promise.all([
    Appointment.countDocuments({ status: "new" }),
    Order.countDocuments({ status: "new" }),
    Message.countDocuments({ status: "unread" }),
    Appointment.countDocuments(notEmailed),
    Order.countDocuments(notEmailed),
    Message.countDocuments(notEmailed),
  ]);

  return { appointments, orders, messages, unsent: unsent.reduce((a, b) => a + b, 0) };
}
