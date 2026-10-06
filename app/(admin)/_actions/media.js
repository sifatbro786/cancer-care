"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { mediaData } from "@/data/admin/mediaData";
import { LOGIN_PATH } from "@/lib/auth/config";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { authorize } from "@/lib/auth/session";
import { audit } from "@/lib/server/audit";
import { TAGS } from "@/lib/cache/tags";
import { expireContent } from "@/lib/cache/revalidate";
import { SLOT_KEYS } from "@/lib/media/slots";
import { deleteMedia, resetSlotImage, setSlotImage, updateMediaAlt } from "@/services/admin/media";

/**
 * Media Server Actions. Each one authorizes itself (content:write) — never rely on the page.
 * Slot changes call expireContent (updateTag): the public pages show the new photo on the next load;
 * refresh() redraws the admin screen itself.
 */

const E = mediaData.errors;
const objectId = z.string().regex(/^[a-f0-9]{24}$/);
const slotKey = z.enum(SLOT_KEYS);

async function guard() {
  const auth = await authorize(PERMISSIONS.contentWrite);
  if (auth.status === 401) redirect(`${LOGIN_PATH}?reason=expired`);
  return auth;
}

/** DB/IO errors become a friendly message instead of the error page. */
async function safely(fn) {
  try {
    return await fn();
  } catch (err) {
    console.error("[media action]", err?.message);
    return { ok: false, code: "server" };
  }
}

const fail = (code, extra) => ({ ok: false, message: typeof E[code] === "function" ? E[code](extra) : E[code] ?? E.server });

export async function updateAltAction(_prev, formData) {
  const auth = await guard();
  if (!auth.ok) return fail("invalid");
  const parsed = z
    .object({ id: objectId, alt: z.string().trim().max(200) })
    .safeParse({ id: formData.get("id"), alt: formData.get("alt") });
  if (!parsed.success) return fail("invalid");

  const res = await safely(() => updateMediaAlt(parsed.data.id, parsed.data.alt));
  if (!res.ok) return fail(res.code);
  if (res.slotsChanged) expireContent(TAGS.media);
  await audit({ action: "media.alt", user: auth.user, target: { type: "media", id: parsed.data.id } });
  refresh();
  return { ok: true, at: Date.now() };
}

export async function deleteMediaAction(_prev, formData) {
  const auth = await guard();
  if (!auth.ok) return fail("invalid");
  const id = objectId.safeParse(formData.get("id"));
  if (!id.success) return fail("invalid");

  const res = await safely(() => deleteMedia(id.data));
  if (!res.ok) return fail(res.code, res.usedBy?.join(", "));
  if (res.slotsReset.length) expireContent(TAGS.media);
  await audit({ action: "media.delete", user: auth.user, target: { type: "media", id: id.data }, meta: res.slotsReset.length ? { slotsReset: res.slotsReset } : undefined });
  refresh();
  return { ok: true, message: mediaData.library.deleted };
}

export async function setSlotAction(_prev, formData) {
  const auth = await guard();
  if (!auth.ok) return fail("invalid");
  const parsed = z
    .object({ key: slotKey, mediaId: objectId })
    .safeParse({ key: formData.get("key"), mediaId: formData.get("mediaId") });
  if (!parsed.success) return fail("invalid");

  const res = await safely(() => setSlotImage(parsed.data.key, parsed.data.mediaId));
  if (!res.ok) return fail(res.code);
  expireContent(TAGS.media);
  await audit({ action: "media.slot_set", user: auth.user, target: { type: "slot", id: parsed.data.mediaId, label: parsed.data.key } });
  refresh();
  return { ok: true };
}

export async function resetSlotAction(_prev, formData) {
  const auth = await guard();
  if (!auth.ok) return fail("invalid");
  const key = slotKey.safeParse(formData.get("key"));
  if (!key.success) return fail("invalid");

  const res = await safely(() => resetSlotImage(key.data));
  if (!res.ok) return fail(res.code);
  expireContent(TAGS.media);
  await audit({ action: "media.slot_reset", user: auth.user, target: { type: "slot", label: key.data } });
  refresh();
  return { ok: true };
}
