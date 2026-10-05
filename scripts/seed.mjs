/**
 * npm run seed            → insert content that is missing (safe to re-run; never overwrites admin edits)
 * npm run seed -- --overwrite   → reset content records to data/*.js values (matched by slug/key)
 * npm run seed -- --fresh       → wipe CONTENT collections, then insert (refuses in production without --yes)
 *
 * Always ensures indexes on every collection.
 * Never touches: users, appointments, orders, messages, uploaded media.
 * Site images are NOT seeded: data/media.js stays the default for every slot until an
 * admin assigns an upload (B3).
 */
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "@/lib/db/connect";
import { fromDhakaDay } from "@/lib/db/serialize";
import * as models from "@/lib/db/models";
import { siteConfig } from "@/data/siteConfig";
import { seoData } from "@/data/seoData";
import { doctorData } from "@/data/doctorData";
import { servicesData, careJourney } from "@/data/servicesData";
import { productsData, productCategories } from "@/data/productsData";
import { blogsData, blogCategories } from "@/data/blogsData";
import { testimonialsData, ratingSummary } from "@/data/testimonialsData";
import { faqData } from "@/data/faqData";

const args = new Set(process.argv.slice(2));
const MODE = args.has("--fresh") ? "fresh" : args.has("--overwrite") ? "overwrite" : "missing";

if (MODE === "fresh" && process.env.NODE_ENV === "production" && !args.has("--yes")) {
  console.error("Refusing --fresh in production without --yes.");
  process.exit(1);
}

const strip = ({ id: _id, ...rest }) => rest;

/** [Model, naturalKeyField, docs[]] */
const plan = [
  [
    models.SiteSettings,
    "key",
    [
      {
        key: "site",
        name: siteConfig.name,
        shortName: siteConfig.shortName,
        tagline: siteConfig.tagline,
        locale: siteConfig.locale,
        contact: siteConfig.contact,
        address: siteConfig.address,
        hours: siteConfig.hours,
        emergencyNote: siteConfig.emergencyNote,
        social: siteConfig.social,
        footer: { about: siteConfig.footer.about, disclaimer: siteConfig.footer.disclaimer },
        careJourney,
        ratingSummary,
      },
    ],
  ],
  [models.Doctor, "key", [{ key: "primary", ...doctorData }]],
  [models.Service, "slug", servicesData.map((s, i) => ({ ...strip(s), order: i }))],
  [
    models.ProductCategory,
    "key",
    productCategories.filter((c) => c.key !== "all").map((c, i) => ({ ...c, order: i })),
  ],
  [models.Product, "slug", productsData.map((p, i) => ({ ...strip(p), sku: p.id, order: i }))],
  [models.BlogCategory, "key", blogCategories.map((c, i) => ({ ...c, order: i }))],
  [
    models.BlogPost,
    "slug",
    blogsData.map((b) => ({ ...strip(b), status: "published", publishedAt: fromDhakaDay(b.publishedAt) })),
  ],
  [models.Testimonial, "quote", testimonialsData.map((t, i) => ({ ...strip(t), approved: true, order: i }))],
  [models.Faq, "q", faqData.map((f, i) => ({ ...f, order: i, active: true }))],
  [
    models.PageSeo,
    "key",
    Object.entries(seoData).map(([key, v]) => ({ key, ...v })),
  ],
];

async function seedCollection(Model, keyField, docs) {
  // bulkWrite skips schema validators → validate every doc up front, fail loudly with context
  for (const doc of docs) {
    try {
      await new Model(doc).validate();
    } catch (err) {
      throw new Error(`${Model.modelName} "${doc[keyField]}": ${err.message}`);
    }
  }

  if (MODE === "fresh") await Model.deleteMany({});

  const op = MODE === "overwrite" ? "$set" : "$setOnInsert";
  const res = await Model.bulkWrite(
    docs.map((doc) => ({
      updateOne: { filter: { [keyField]: doc[keyField] }, update: { [op]: doc }, upsert: true },
    })),
    { ordered: true }
  );
  return { inserted: res.upsertedCount, updated: MODE === "overwrite" ? res.modifiedCount : 0 };
}

async function main() {
  await connectDB();
  const { host, name } = mongoose.connection;
  console.log(`\nSeeding ${name} @ ${host} — mode: ${MODE}\n`);

  for (const [Model, key, docs] of plan) {
    const r = await seedCollection(Model, key, docs);
    console.log(
      `  ${Model.modelName.padEnd(16)} ${String(docs.length).padStart(3)} in source · ${r.inserted} inserted` +
        (MODE === "overwrite" ? ` · ${r.updated} updated` : "")
    );
  }

  // B1 seeded stock photos into the media library; since B3 the library holds uploads only.
  const legacy = await models.Media.collection.deleteMany({ source: "remote" });
  if (legacy.deletedCount) console.log(`\n  Removed ${legacy.deletedCount} legacy stock-photo media records (now defaults in data/media.js)`);
  await models.Media.collection.dropIndex("key_1").catch(() => {}); // B1 index, field no longer exists

  console.log("\nEnsuring indexes…");
  for (const Model of Object.values(models)) {
    await Model.createIndexes();
    console.log(`  ✓ ${Model.modelName}`);
  }
  console.log("\nDone.\n");
}

main()
  .catch((err) => {
    console.error("\nSeed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
