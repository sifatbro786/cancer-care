/**
 * Renders schema.org structured data.
 * `<` is escaped to < so CMS-authored strings (Phase 2) can never
 * break out of the <script> tag (XSS hardening, per Next.js guidance).
 */
export default function JsonLd({ data }) {
  const payload = Array.isArray(data) ? data : [data];
  return payload.map((item, i) => (
    <script
      key={item["@id"] ?? `${item["@type"]}-${i}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
    />
  ));
}
