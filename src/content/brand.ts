// The BratHaus mark: the source of truth is incoming/brand/brathaus-mark-*.svg (the logo kit).
// Three parts, always rendered FILLED: the main "b" stroke, the pill and the dot.
export const MARK_VIEWBOX = "30 18 140 172";
export const MARK_PATHS = {
  main: "M34 34 A16 16 0 0 1 66 34 V84 H108 A16 16 0 0 1 108 116 H66 V143.7 A10.3 10.3 0 0 0 76.3 154 H123.7 A10.3 10.3 0 0 0 134 143.7 V122 A16 16 0 0 1 166 122 V144 A42 42 0 0 1 124 186 H76 A42 42 0 0 1 34 144 Z",
  pill: "M110 22 H134 A24 24 0 0 1 134 70 H110 A24 24 0 0 1 110 22 Z",
  dot: "M97 121 H103 A11 11 0 0 1 114 132 V138 A11 11 0 0 1 103 149 H97 A11 11 0 0 1 86 138 V132 A11 11 0 0 1 97 121 Z",
} as const;
export type MarkPart = keyof typeof MARK_PATHS;
export const MARK_GOLD = "#D4AF7C";
