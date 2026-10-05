import "server-only";
import { isValidObjectId } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { BlogPost, Doctor, Media, Product, Service, SiteSettings } from "@/lib/db/models";
import { toPlain } from "@/lib/db/serialize";
import { SLOT_KEYS, slotDefaults } from "@/lib/media/slots";
import { processImage, removeMediaFile, saveMediaFile } from "@/lib/server/media";

/**
 * Media library + image slots (DAL). Callers (Route Handlers / Server Actions)
 * MUST have run authorize(PERMISSIONS.contentWrite) first.
 */

const PER_PAGE = 36;

/**
 * Slot overrides are a tiny array (≤ one entry per slot) on the SiteSettings singleton.
 * Every change is a read → transform → $set of the whole array: one code path, and it
 * behaves the same on MongoDB and Mongo-compatible engines (no $pull-by-condition / arrayFilters).
 */
async function writeOverrides(transform) {
  const settings = await SiteSettings.findOne({ key: "site" }).select("imageOverrides").lean();
  if (!settings) return { ok: false, code: "noSettings" };
  const before = settings.imageOverrides ?? [];
  const after = transform(before);
  if (after !== before) await SiteSettings.updateOne({ key: "site" }, { $set: { imageOverrides: after } });
  return { ok: true, changed: after !== before, before };
}

const sameId = (a, b) => String(a) === String(b);

const itemDTO = (m) => {
  const p = toPlain(m);
  return {
    id: p.id,
    url: p.url,
    alt: p.alt ?? "",
    originalName: p.originalName ?? "",
    width: p.width,
    height: p.height,
    size: p.size,
    createdAt: p.createdAt,
  };
};

export async function listMedia({ page = 1 } = {}) {
  await connectDB();
  const total = await Media.countDocuments();
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const current = Math.min(Math.max(1, Math.floor(Number(page)) || 1), pages);
  const docs = await Media.find()
    .sort({ createdAt: -1, _id: -1 })
    .skip((current - 1) * PER_PAGE)
    .limit(PER_PAGE)
    .lean();
  return { items: docs.map(itemDTO), total, page: current, pages };
}

/** Upload → transcode → store → record. Removes the file again if the DB insert fails. */
export async function createMedia({ file, alt = "", userId }) {
  const img = await processImage(file);
  if (!img.ok) return img;

  await connectDB();
  const stored = await saveMediaFile(img.buffer);
  try {
    const doc = await Media.create({
      url: stored.url,
      path: stored.path,
      alt: alt.trim().slice(0, 200),
      originalName: typeof file.name === "string" ? file.name.replace(/[^\w.\- ]+/g, "").slice(0, 160) : undefined,
      size: img.size,
      width: img.width,
      height: img.height,
      uploadedBy: userId,
    });
    return { ok: true, item: itemDTO(doc.toObject()) };
  } catch (err) {
    await removeMediaFile(stored.path);
    throw err;
  }
}

/** Alt text lives on the media item; slot snapshots using it are updated too. */
export async function updateMediaAlt(id, alt) {
  if (!isValidObjectId(id)) return { ok: false, code: "notFound" };
  await connectDB();
  const updated = await Media.updateOne({ _id: id }, { $set: { alt } });
  if (!updated.matchedCount) return { ok: false, code: "notFound" };
  // Refresh the alt snapshot on any slot using this image
  const slots = await writeOverrides((list) =>
    list.some((o) => sameId(o.media, id)) ? list.map((o) => (sameId(o.media, id) ? { ...o, alt } : o)) : list
  );
  return { ok: true, slotsChanged: Boolean(slots.changed) };
}

/** Where is this file used? Slots are listed separately because deleting can reset them safely. */
export async function findMediaUsage(media) {
  const [settings, doctors, services, products, posts] = await Promise.all([
    SiteSettings.findOne({ key: "site" }).select("imageOverrides").lean(),
    Doctor.find({ "photo.src": media.url }).select("name").lean(),
    Service.find({ "image.src": media.url }).select("title").lean(),
    Product.find({ "image.src": media.url }).select("name").lean(),
    BlogPost.find({ "cover.src": media.url }).select("title").lean(),
  ]);
  return {
    slots: (settings?.imageOverrides ?? []).filter((o) => String(o.media) === String(media._id)).map((o) => o.key),
    entities: [
      ...doctors.map((d) => d.name),
      ...services.map((s) => s.title),
      ...products.map((p) => p.name),
      ...posts.map((p) => p.title),
    ],
  };
}

/**
 * Delete: refused while content (doctor/service/product/post) uses the file;
 * site slots using it are reset to their Unsplash default, then the file is unlinked.
 */
export async function deleteMedia(id) {
  if (!isValidObjectId(id)) return { ok: false, code: "notFound" };
  await connectDB();
  const media = await Media.findById(id).lean();
  if (!media) return { ok: false, code: "notFound" };

  const usage = await findMediaUsage(media);
  if (usage.entities.length) return { ok: false, code: "inUse", usedBy: usage.entities };

  if (usage.slots.length) {
    await writeOverrides((list) => list.filter((o) => !sameId(o.media, media._id)));
  }
  await Media.deleteOne({ _id: media._id });
  await removeMediaFile(media.path); // after the DB delete: a stray file is harmless, a dangling record isn't
  return { ok: true, slotsReset: usage.slots };
}

export async function getSlotStates() {
  await connectDB();
  const settings = await SiteSettings.findOne({ key: "site" }).select("imageOverrides").lean();
  const defaults = slotDefaults();
  const overrides = new Map((settings?.imageOverrides ?? []).map((o) => [o.key, o]));
  return {
    ready: Boolean(settings),
    slots: SLOT_KEYS.map((key) => {
      const o = overrides.get(key);
      return {
        key,
        default: { src: defaults[key].src, alt: defaults[key].alt },
        current: o ? { src: o.src, alt: o.alt || defaults[key].alt } : null,
        mediaId: o ? String(o.media) : null,
      };
    }),
  };
}

export async function setSlotImage(key, mediaId) {
  if (!SLOT_KEYS.includes(key) || !isValidObjectId(mediaId)) return { ok: false, code: "invalid" };
  await connectDB();
  const media = await Media.findById(mediaId).lean();
  if (!media) return { ok: false, code: "notFound" };

  const entry = { key, media: media._id, src: media.url, alt: media.alt, width: media.width, height: media.height };
  // One override per slot: replace any existing entry for this key
  const res = await writeOverrides((list) => [...list.filter((o) => o.key !== key), entry]);
  return res.ok ? { ok: true } : res;
}

export async function resetSlotImage(key) {
  if (!SLOT_KEYS.includes(key)) return { ok: false, code: "invalid" };
  await connectDB();
  const res = await writeOverrides((list) => (list.some((o) => o.key === key) ? list.filter((o) => o.key !== key) : list));
  return res.ok ? { ok: true } : res;
}
