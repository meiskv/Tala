import type { ComplexityLevel } from "../types/profile";

export const GRID_PRESETS: Record<ComplexityLevel, { rows: number; cols: number }> = {
  emergent: { rows: 2, cols: 5 },
  core: { rows: 3, cols: 8 },
  advanced: { rows: 4, cols: 10 },
};
