// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  // Navigation
  "house.fill": "home",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.up": "expand-less",
  "chevron.down": "expand-more",

  // Actions
  "paperplane.fill": "send",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "plus": "add",
  "minus": "remove",
  "pencil": "edit",
  "trash": "delete",
  "square.and.arrow.up": "share",
  "arrow.clockwise": "refresh",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",

  // Media / Audio
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "stop.fill": "stop",
  "backward.fill": "fast-rewind",
  "forward.fill": "fast-forward",
  "speaker.wave.2.fill": "volume-up",
  "speaker.slash.fill": "volume-off",
  "music.note": "music-note",

  // Contenu
  "heart": "favorite-border",
  "heart.fill": "favorite",
  "star": "star-border",
  "star.fill": "star",
  "bookmark": "bookmark-border",
  "bookmark.fill": "bookmark",
  "bell": "notifications-none",
  "bell.fill": "notifications",
  "bell.slash": "notifications-off",

  // Recherche & Filtres
  "magnifyingglass": "search",
  "line.3.horizontal.decrease.circle": "filter-list",
  "slider.horizontal.3": "tune",

  // Sécurité & Profil
  "lock.fill": "lock",
  "lock.open.fill": "lock-open",
  "person.fill": "person",
  "person.circle.fill": "account-circle",
  "gear": "settings",
  "info.circle": "info",
  "questionmark.circle": "help-outline",

  // Santé & Bien-être
  "moon.fill": "nightlight-round",
  "sun.max.fill": "wb-sunny",
  "leaf.fill": "eco",
  "flame.fill": "local-fire-department",
  "waveform": "graphic-eq",
  "lungs.fill": "air",
  "brain.head.profile": "psychology",

  // Calendrier & Temps
  "calendar": "calendar-today",
  "clock": "access-time",
  "clock.fill": "access-time-filled",
  "timer": "timer",

  // Divers
  "chart.bar.fill": "bar-chart",
  "chart.line.uptrend.xyaxis": "trending-up",
  "list.bullet": "list",
  "square.grid.2x2": "grid-view",
  "photo": "photo",
  "camera.fill": "camera-alt",
  "mic.fill": "mic",
  "wifi": "wifi",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "ellipsis": "more-horiz",
  "ellipsis.circle": "more-vert",
};

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 *
 * Includes a safe fallback: if the icon name is not mapped, renders "help-outline" instead of crashing.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  const mappedName = MAPPING[name] ?? "help-outline";
  return <MaterialIcons color={color} size={size} name={mappedName} style={style} />;
}
