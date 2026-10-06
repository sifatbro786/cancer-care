import { notFound } from "next/navigation";
import { cmsData } from "@/data/admin/cmsData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { getEditable, getFieldOptions, isEntity, listEntity } from "@/services/admin/cms";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EntityForm from "@/components/admin/cms/EntityForm";
import EntityList from "@/components/admin/cms/EntityList";
import { FormAlert } from "@/components/ui/Field";

/**
 * /admin/content/:entity — the list for collections, the editor itself for singletons
 * (site settings, doctor profile). Unknown keys 404 inside the admin.
 */

export async function generateMetadata({ params }) {
  const { entity } = await params;
  return { title: isEntity(entity) ? cmsData.entities[entity].title : cmsData.common.eyebrow };
}

export default async function ContentEntityPage({ params, searchParams }) {
  const { entity } = await params;
  if (!isEntity(entity)) notFound();
  await requireUser(cmsData.entities[entity].permission ?? PERMISSIONS.contentWrite);

  const cfg = cmsData.entities[entity];
  const C = cmsData.common;
  const header = <AdminPageHeader eyebrow={C.eyebrow} title={cfg.title} highlight={cfg.highlight} description={cfg.intro} />;

  if (!isDbConfigured()) {
    return (
      <>
        {header}
        <FormAlert tone="info">{C.dbOff}</FormAlert>
      </>
    );
  }

  if (cfg.singleton) {
    const [item, options] = await Promise.all([getEditable(entity), getFieldOptions(entity)]);
    return (
      <>
        {header}
        {item ? (
          <EntityForm key={item.version} entity={entity} id={item.id} version={item.version} initialValues={item.values} options={options} />
        ) : (
          <FormAlert tone="info">{C.missing}</FormAlert>
        )}
      </>
    );
  }

  const sp = await searchParams;
  const list = await listEntity(entity, { page: sp.page, q: sp.q, tab: sp.tab });

  return (
    <>
      {header}
      <EntityList entity={entity} list={list} />
    </>
  );
}
