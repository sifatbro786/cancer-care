"use client";

import { useState } from "react";
import { shopData } from "@/data/shopData";
import { whatsappLink } from "@/lib/site";
import { useSite } from "@/components/providers/SiteProvider";
import Button from "@/components/ui/Button";
import PrescriptionUploadModal from "@/components/shop/PrescriptionUploadModal";
import { WhatsappIcon } from "@/components/icons/BrandIcons";

/** Client island for the product detail page — the rest of the page stays a server component. */
export default function ProductActions({ product }) {
  const [open, setOpen] = useState(false);
  const C = shopData.card;
  const whatsappHref = whatsappLink(useSite().contact);

  return (
    <div className="flex flex-wrap gap-3">
      {product.inStock ? (
        <Button size="lg" withArrow onClick={() => setOpen(true)}>
          {product.requiresPrescription ? C.orderRx : C.order}
        </Button>
      ) : (
        <p className="rounded-xl bg-paper-deep px-5 py-3.5 font-medium text-ink-muted">{C.outOfStock}</p>
      )}
      <Button href={whatsappHref} variant="secondary" size="lg" icon={WhatsappIcon}>
        {shopData.detail.whatsapp}
      </Button>
      <PrescriptionUploadModal open={open} product={product} onClose={() => setOpen(false)} />
    </div>
  );
}
