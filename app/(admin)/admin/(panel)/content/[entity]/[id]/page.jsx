import { notFound } from "next/navigation";
import { cmsData } from "@/data/admin/cmsData";
import { isDbConfigured } from "@/lib/db/connect";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { requireUser } from "@/lib/auth/session";
import { getEditable, getFieldOptions, isEntity } from "@/services/admin/cms";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import EntityForm from "@/components/admin/cms/EntityForm";
import { BackLink } from "@/components/admin/inbox/bits";
import { FormAlert } from "@/components/ui/Field";

/** /admin/content/:entity/new and /admin/content/:entity/:id — create / edit one record. */

const titleOf = (values, noun) => values.title || values.name || values.label || values.q || noun;

export async function generateMetadata({ params }) {
  const { entity, id } = await params;
  if (!isEntity(entity)) return {};
  const cfg = cmsData.entities[entity];
  return { title: id === "new" ? cmsData.common.newItem(cfg.noun) : `${cmsData.common.edit} ${cfg.noun}` };
}

export default async function ContentItemPage({ params, searchParams }) {
  const { entity, id } = await params;
  if (!isEntity(entity) || cmsData.entities[entity].singleton) notFound();
  await requireUser(cmsData.entities[entity].permission ?? PERMISSIONS.contentWrite);

  const cfg = cmsData.entities[entity];
  const C = cmsData.common;
  const back = `/admin/content/${entity}`;

  if (!isDbConfigured()) {
    return (
      <>
        <BackLink href={back} />
        <FormAlert tone="info">{C.dbOff}</FormAlert>
      </>
    );
  }

  const isNew = id === "new";
  if (isNew && cfg.noCreate) notFound();
  const [item, options] = await Promise.all([isNew ? null : getEditable(entity, id), getFieldOptions(entity)]);
  if (!isNew && !item) notFound();

  const sp = await searchParams;
  const values = isNew ? structuredClone(cfg.defaults ?? {}) : item.values;
  const isPublic = values.active !== false && (entity !== "blog" || values.status === "published");
  const view = !isNew && isPublic && cfg.viewPath ? cfg.viewPath(values) : null;

  return (
    <>
      <BackLink href={back} />
      <AdminPageHeader
        eyebrow={cfg.title}
        title={isNew ? C.newItem(cfg.noun) : item.label || titleOf(values, cfg.noun)}
        description={
          view ? (
            <a href={view} target="_blank" rel="noopener" className="font-semibold text-brand-700 hover:text-brand-900">
              {C.viewOnSite} ↗
            </a>
          ) : undefined
        }
      />
      <EntityForm
        key={item?.version ?? "new"}
        entity={entity}
        id={isNew ? null : item.id}
        version={item?.version}
        initialValues={values}
        options={options}
        created={sp.created === "1"}
      />
    </>
  );
}
