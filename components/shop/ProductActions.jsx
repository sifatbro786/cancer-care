"use client";

import { useState } from "react";
import { shopData } from "@/data/shopData";
import { whatsappLink } from "@/lib/site";
import { useSite } from "@/components/providers/SiteProvider";
import Button from "@/components/ui/Button";
import OrderModal from "@/components/shop/OrderModal";
import { WhatsappIcon } from "@/components/icons/BrandIcons";

/**
 * Client island for the product detail page — the rest of the page stays a server component.
 * `orderable` (in stock + not expired) and `paymentMethods` are decided on the server.
 */
export default function ProductActions({ product, orderable, expired, paymentMethods }) {
  const [open, setOpen] = useState(false);
  const C = shopData.card;
  const whatsappHref = whatsappLink(useSite().contact);

  return (
    <div className="flex flex-wrap gap-3">
      {orderable ? (
        <Button size="lg" withArrow onClick={() => setOpen(true)}>
          {C.order}
        </Button>
      ) : (
        <p className="rounded-xl bg-paper-deep px-5 py-3.5 font-medium text-ink-muted">{expired ? C.expired : C.outOfStock}</p>
      )}
      <Button href={whatsappHref} variant="secondary" size="lg" icon={WhatsappIcon}>
        {shopData.detail.whatsapp}
      </Button>
      <OrderModal open={open} product={product} paymentMethods={paymentMethods} onClose={() => setOpen(false)} />
    </div>
  );
}
