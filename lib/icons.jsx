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
  Settings,
  Quote,
  CircleQuestionMark,
  Newspaper,
  Package,
  Tags,
  Search,
  Users,
  ScrollText,
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
  settings: Settings,
  quote: Quote,
  help: CircleQuestionMark,
  newspaper: Newspaper,
  package: Package,
  tags: Tags,
  search: Search,
  users: Users,
  history: ScrollText,
};

/** Keys an admin can pick for a service card (public-facing icons only). */
export const CONTENT_ICON_KEYS = Object.freeze([
  "syringe",
  "stethoscope",
  "video",
  "pill",
  "heart",
  "activity",
  "care",
  "hospital",
  "clipboard",
  "calendar",
  "shield",
  "leaf",
  "truck",
  "ambulance",
  "ribbon",
]);

export function getIcon(key) {
  return iconMap[key] ?? HeartPulse;
}

/** Render an icon by key — preferred inside components (lint-safe, stable identity). */
export function IconByKey({ name, ...props }) {
  const Component = Object.hasOwn(iconMap, name) ? iconMap[name] : HeartPulse;
  return <Component {...props} />;
}
