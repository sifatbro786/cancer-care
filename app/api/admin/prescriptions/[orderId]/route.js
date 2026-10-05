import { isValidObjectId } from "mongoose";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { withAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { Order } from "@/lib/db/models";
import { readPrivateFile } from "@/lib/server/storage";

const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };
const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });

/**
 * GET /api/admin/prescriptions/:orderId[?download=1]
 * The ONLY way a prescription file leaves the server: signed-in staff with inbox:read.
 * Patient data → never cached, never sniffed, sandboxed if rendered inline.
 */
export const GET = withAdmin(PERMISSIONS.inboxRead, async (request, { params }, user) => {
  const { orderId } = await params;
  if (!isValidObjectId(orderId)) return notFound();

  await connectDB();
  const order = await Order.findById(orderId).select("reference prescription.file").lean();
  const file = order?.prescription?.file;
  if (!file?.path) return notFound();

  const body = await readPrivateFile(file.path, file.sha256);
  if (!body) return notFound();

  const download = new URL(request.url).searchParams.get("download") === "1";
  const filename = `prescription-${order.reference}.${EXT[file.mime] ?? "bin"}`;
  console.info(`[prescription] ${order.reference} viewed by user ${user.id}`);

  const headers = {
    "Content-Type": EXT[file.mime] ? file.mime : "application/octet-stream",
    "Content-Length": String(body.length),
    "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
  };
  // Images rendered inline: sandboxed, no scripts/network. PDFs are left to the browser's own
  // sandboxed viewer (a `sandbox` CSP would block Chrome's PDF viewer entirely).
  if (file.mime !== "application/pdf") {
    headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox";
  }

  return new Response(body, { headers });
});
