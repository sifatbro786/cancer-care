"use client";

import { m } from "framer-motion";

/**
 * Gentle fade-up on first scroll into view.
 * Server components can be passed as children — only this wrapper is client JS.
 * `delay` lets siblings stagger without a parent orchestrator.
 */
export default function Reveal({ as = "div", delay = 0, y = 18, className, children, ...props }) {
  const Tag = m[as] ?? m.div;
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
}
