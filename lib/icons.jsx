import {
  Activity,
  Ambulance,
  CalendarCheck,
  ClipboardList,
  HeartPulse,
  Hospital,
  Leaf,
  Pill,
  ShieldCheck,
  Stethoscope,
  Syringe,
  Truck,
  Video,
  HandHeart,
  Image as ImageIcon,
  LayoutDashboard,
  Mail,
  Ribbon,
  UserRound,
} from "lucide-react";

/**
 * String → Lucide component map.
 * Data files (and the future API) store icon *keys*, never components,
 * so the payload stays JSON-serialisable.
 */
const iconMap = {
  activity: Activity,
  ambulance: Ambulance,
  calendar: CalendarCheck,
  clipboard: ClipboardList,
  heart: HeartPulse,
  hospital: Hospital,
  leaf: Leaf,
  pill: Pill,
  shield: ShieldCheck,
  stethoscope: Stethoscope,
  syringe: Syringe,
  truck: Truck,
  video: Video,
  care: HandHeart,
  ribbon: Ribbon,
  // admin
  layout: LayoutDashboard,
  image: ImageIcon,
  mail: Mail,
  user: UserRound,
};

export function getIcon(key) {
  return iconMap[key] ?? HeartPulse;
}

/** Render an icon by key — preferred inside components (lint-safe, stable identity). */
export function IconByKey({ name, ...props }) {
  const Component = Object.hasOwn(iconMap, name) ? iconMap[name] : HeartPulse;
  return <Component {...props} />;
}
