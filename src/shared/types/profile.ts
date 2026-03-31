export type ComplexityLevel = "emergent" | "core" | "advanced";
export type AgeGroup = "child" | "teen" | "adult";

export interface UserProfile {
  id: string;
  name: string;
  ageGroup: AgeGroup;
  complexityLevel: ComplexityLevel;
  gridRows: number;
  gridCols: number;
  isActive: boolean;
}
