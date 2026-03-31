// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { SymbolWeight, SymbolViewProps } from "expo-symbols";
import { ComponentProps } from "react";
import { OpaqueColorValue, type StyleProp, type TextStyle } from "react-native";

type IconMapping = Record<SymbolViewProps["name"], ComponentProps<typeof MaterialIcons>["name"]>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * SF Symbols to Material Icons mappings for Yoya Wellness app.
 */
const MAPPING = {
  // Navigation tabs
  "house.fill": "home",
  "sparkles": "auto-awesome",
  "book.fill": "menu-book",
  "chart.bar.fill": "bar-chart",
  "person.fill": "person",
  // Common actions
  "paperplane.fill": "send",
  "chevron.left.forwardslash.chevron.right": "code",
  "chevron.right": "chevron-right",
  "chevron.left": "chevron-left",
  "chevron.down": "expand-more",
  "chevron.up": "expand-less",
  "xmark": "close",
  "xmark.circle.fill": "cancel",
  "checkmark": "check",
  "checkmark.circle.fill": "check-circle",
  "plus": "add",
  "minus": "remove",
  // Wellness specific
  "heart.fill": "favorite",
  "heart": "favorite-border",
  "moon.fill": "nightlight-round",
  "sun.max.fill": "wb-sunny",
  "wind": "air",
  "leaf.fill": "eco",
  "flame.fill": "local-fire-department",
  "star.fill": "star",
  "star": "star-border",
  "bolt.fill": "bolt",
  // Media player
  "play.fill": "play-arrow",
  "pause.fill": "pause",
  "backward.fill": "skip-previous",
  "forward.fill": "skip-next",
  "speaker.wave.2.fill": "volume-up",
  "speaker.slash.fill": "volume-off",
  // Misc
  "magnifyingglass": "search",
  "bell.fill": "notifications",
  "bell": "notifications-none",
  "gear": "settings",
  "lock.fill": "lock",
  "arrow.right": "arrow-forward",
  "arrow.left": "arrow-back",
  "square.and.arrow.up": "share",
  "trash.fill": "delete",
  "pencil": "edit",
  "info.circle": "info",
  "questionmark.circle": "help",
  "exclamationmark.triangle.fill": "warning",
  "bubble.left.fill": "chat-bubble",
  "calendar": "calendar-today",
  "clock.fill": "access-time",
  "timer": "timer",
  "waveform": "graphic-eq",
  "music.note": "music-note",
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
