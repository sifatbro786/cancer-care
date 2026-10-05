"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";

/**
 * LazyMotion + `m.*` components ship only the DOM animation features we use
 * (~15kb instead of the full ~34kb bundle). `strict` makes accidental use of
 * the heavy `motion.*` API throw in dev.
 * `reducedMotion="user"` honours the OS "reduce motion" setting site-wide.
 */
export default function MotionProvider({ children }) {
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
