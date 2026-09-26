import {
  ToggleLeft,
  LayoutGrid,
  ScanFace,
  Plug,
  Lightbulb,
  Lock,
  Camera,
  Blinds,
  Radio,
  Router,
  Boxes,
  Package,
  Sofa,
  BedDouble,
  CookingPot,
  Bath,
  DoorOpen,
  Trees,
  Briefcase,
} from "lucide-react";

export const CATEGORY_ICONS = {
  Interruptores: ToggleLeft,
  "Pared Táctil": LayoutGrid,
  Sensores: ScanFace,
  Accesorios: Package,
  Enchufes: Plug,
  Iluminación: Lightbulb,
  Cerraduras: Lock,
  Cámaras: Camera,
  Cortinas: Blinds,
  "Control IR": Radio,
  Hubs: Router,
  Kits: Boxes,
};

export const ROOM_ICONS = {
  sala: Sofa,
  dormitorio: BedDouble,
  cocina: CookingPot,
  bano: Bath,
  entrada: DoorOpen,
  exterior: Trees,
  oficina: Briefcase,
};

export const iconForCategory = (c) => CATEGORY_ICONS[c] ?? Package;
