"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { cmsData } from "@/data/admin/cmsData";
import { LOGIN_PATH } from "@/lib/auth/config";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { authorize } from "@/lib/auth/session";
import { expireContent } from "@/lib/cache/revalidate";
import { parseEntity } from "@/lib/validation/cms";
import { deleteEntity, entityTags, isEntity, moveEntity, saveEntity, toggleEntity } from "@/services/admin/cms";
import { listMedia } from "@/services/admin/media";
import { audit } from "@/lib/server/audit";

/**
 * Content CMS Server Actions (B5).
 * Every action authorizes itself (content:write) and treats its arguments as untrusted:
 * the entity key is checked against the registry, ids are validated in the service,
 * values go through zod (lib/validation/cms.js). A successful write expires the cache
 * tags of every public page that shows that content (updateTag → read-your-own-writes).
 */

const E = cmsData.errors;
const ID_RE = /^[a-f0-9]{24}$/;

/** Content entities need content:write; SEO entities declare seo:write in cmsData. */
const permissionFor = (entity) => cmsData.entities[entity]?.permission ?? PERMISSIONS.contentWrite;

/** @returns the signed-in user when allowed, else null (401 → login page). */
async function guard(entity) {
  const auth = await authorize(entity ? permissionFor(entity) : PERMISSIONS.contentWrite);
  if (auth.status === 401) redirect(`${LOGIN_PATH}?reason=expired`);
  return auth.ok ? auth.user : null;
}

/** DB/IO errors become a friendly message instead of the error page. */
async function safely(fn) {
  try {
    return await fn();
  } catch (err) {
    console.error("[cms action]", err?.message);
    return { ok: false, code: "server" };
  }
}

function failure(res) {
  switch (res.code) {
    case "invalid":
      return { ok: false, message: E.invalid, fieldErrors: res.fieldErrors ?? {} };
    case "conflict":
      return { ok: false, message: E.conflict, conflict: true };
    case "notFound":
      return { ok: false, message: E.notFound };
    case "missing":
      return { ok: false, message: cmsData.common.missing };
    case "inUse":
      return { ok: false, message: E.inUse(res.count, res.noun) };
    default:
      return { ok: false, message: E.server };
  }
}

const validId = (id) => typeof id === "string" && ID_RE.test(id);

/**
 * Create or update. `id` null = create (singletons ignore it).
 * @returns {{ ok: true, id, version } | { ok: false, message, fieldErrors?, conflict? }}
 */
export async function saveEntityAction(entity, id, version, values) {
  if (!isEntity(entity)) return failure({ code: "server" });
  const user = await guard(entity);
  if (!user) return failure({ code: "server" });
  if (id !== null && !validId(id)) return failure({ code: "notFound" });

  const singleton = Boolean(cmsData.entities[entity].singleton);
  const isNew = !singleton && id === null;
  const parsed = parseEntity(entity, values, { isNew });
  if (!parsed.ok) return failure({ code: "invalid", fieldErrors: parsed.fieldErrors });

  const res = await safely(() => saveEntity(entity, isNew ? null : id, typeof version === "string" ? version : "", parsed.data));
  if (!res.ok) return failure(res);
  expireContent(...entityTags(entity));
  await audit({
    action: res.created ? "content.create" : "content.update",
    user,
    target: { type: entity, id: res.id, label: res.label },
    meta: { fields: Object.keys(parsed.data) },
  });
  return { ok: true, id: res.id, version: res.version };
}

export async function deleteEntityAction(entity, id) {
  if (!isEntity(entity)) return failure({ code: "server" });
  const user = await guard(entity);
  if (!user) return failure({ code: "server" });
  if (!validId(id)) return failure({ code: "notFound" });
  const res = await safely(() => deleteEntity(entity, id));
  if (!res.ok) return failure(res);
  expireContent(...entityTags(entity));
  await audit({ action: "content.delete", user, target: { type: entity, id, label: res.label } });
  refresh();
  return { ok: true };
}

export async function moveEntityAction(entity, id, dir, tab) {
  if (!isEntity(entity)) return failure({ code: "server" });
  const user = await guard(entity);
  if (!user) return failure({ code: "server" });
  if (!validId(id)) return failure({ code: "notFound" });
  const res = await safely(() => moveEntity(entity, id, dir === -1 ? -1 : 1, typeof tab === "string" ? tab : undefined));
  if (!res.ok) return failure(res);
  if (res.changed) {
    expireContent(...entityTags(entity));
    await audit({ action: "content.reorder", user, target: { type: entity, id }, meta: { dir: dir === -1 ? "up" : "down" } });
  }
  refresh();
  return { ok: true };
}

export async function toggleEntityAction(entity, id) {
  if (!isEntity(entity)) return failure({ code: "server" });
  const user = await guard(entity);
  if (!user) return failure({ code: "server" });
  if (!validId(id)) return failure({ code: "notFound" });
  const res = await safely(() => toggleEntity(entity, id));
  if (!res.ok) return failure(res);
  expireContent(...entityTags(entity));
  await audit({ action: "content.toggle", user, target: { type: entity, id, label: res.label }, meta: { [res.field]: res.value } });
  refresh();
  return { ok: true };
}

/** Media picker inside the editors (library page by page). */
export async function listMediaAction(page) {
  if (!(await guard())) return { ok: false, message: E.server };
  const res = await safely(() => listMedia({ page: Number(page) || 1 }));
  if (res.ok === false) return { ok: false, message: E.server };
  return { ok: true, ...res };
}
