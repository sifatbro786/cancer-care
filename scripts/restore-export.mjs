/**
 * Restore a MongoDB Compass JSON export (one file per collection) into MONGODB_URI.
 *
 *   npm run restore                 → upsert every doc by _id (safe to re-run; keeps ObjectIds, dates, password hashes)
 *   npm run restore -- --drop       → empty each exported collection first (refuses in production without --yes)
 *   npm run restore -- --dir=path   → read from another folder (default: ./_export)
 *
 * File names: <db>.<collection>.json  (Compass "Export Collection → JSON" default).
 * Writes straight to the collection (no Mongoose casting/validation) so the data lands exactly as exported.
 * Run `npm run seed` afterwards: it only inserts what is missing and builds all indexes.
 */
import fs from "node:fs/promises";
import path from "node:path";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "@/lib/db/connect";

const { EJSON } = mongoose.mongo.BSON;

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const dirArg = argv.find((a) => a.startsWith("--dir="))?.slice(6);
const DIR = path.resolve(process.cwd(), dirArg || "_export");
const DROP = flag("drop");

if (DROP && process.env.NODE_ENV === "production" && !flag("yes")) {
  console.error("Refusing --drop in production without --yes.");
  process.exit(1);
}

const BATCH = 500;

async function readExport(file) {
  const raw = (await fs.readFile(path.join(DIR, file), "utf8")).trim();
  if (!raw) return [];
  // Compass exports a JSON array; mongoexport writes one doc per line — accept both
  const docs = raw.startsWith("[")
    ? EJSON.parse(raw, { relaxed: false })
    : raw.split(/\r?\n/).filter(Boolean).map((line) => EJSON.parse(line, { relaxed: false }));
  if (!Array.isArray(docs)) throw new Error(`${file}: expected a JSON array of documents`);
  const missingId = docs.findIndex((d) => !d || d._id === undefined);
  if (missingId !== -1) throw new Error(`${file}: document #${missingId} has no _id`);
  return docs;
}

async function main() {
  const files = (await fs.readdir(DIR)).filter((f) => f.endsWith(".json")).sort();
  if (!files.length) throw new Error(`No .json files in ${DIR}`);

  // Parse everything before touching the DB → a broken file aborts with nothing written
  const jobs = [];
  for (const file of files) {
    const parts = file.slice(0, -".json".length).split(".");
    const collection = parts.length > 1 ? parts.slice(1).join(".") : parts[0];
    jobs.push({ file, collection, docs: await readExport(file) });
  }

  await connectDB();
  const { db, host, name } = mongoose.connection;
  console.log(`\nRestoring ${DIR} → ${name} @ ${host}${DROP ? " (drop first)" : ""}\n`);

  for (const { collection, docs } of jobs) {
    const col = db.collection(collection);
    if (DROP) await col.deleteMany({});

    let upserted = 0;
    let replaced = 0;
    for (let i = 0; i < docs.length; i += BATCH) {
      const res = await col.bulkWrite(
        docs.slice(i, i + BATCH).map((doc) => ({
          replaceOne: { filter: { _id: doc._id }, replacement: doc, upsert: true },
        })),
        { ordered: true }
      );
      upserted += res.upsertedCount;
      replaced += res.modifiedCount;
    }
    console.log(
      `  ${collection.padEnd(18)} ${String(docs.length).padStart(4)} in file · ${upserted} inserted · ${replaced} replaced`
    );
  }
  console.log("\nDone. Next: npm run seed  (adds anything missing + builds indexes)\n");
}

main()
  .catch((err) => {
    console.error("\nRestore failed:", err.message);
    process.exitCode = 1;
  })
  .finally(disconnectDB);
