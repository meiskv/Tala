export interface SceneHotspot {
  id: string;
  label: string;
  vocalization?: string;
  arasaacId: number;
  /** Position as percentage of scene width/height (0-100) */
  x: number;
  y: number;
}

export interface Scene {
  id: string;
  name: string;
  icon: string;
  backgroundColor: string;
  hotspots: SceneHotspot[];
}
