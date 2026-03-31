import type { UserProfile } from "../../shared/types/profile";
import { getDatabase } from "../database";

interface ProfileRow {
  id: string;
  name: string;
  age_group: string;
  complexity_level: string;
  grid_rows: number;
  grid_cols: number;
  is_active: number;
}

function rowToProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    ageGroup: row.age_group as UserProfile["ageGroup"],
    complexityLevel: row.complexity_level as UserProfile["complexityLevel"],
    gridRows: row.grid_rows,
    gridCols: row.grid_cols,
    isActive: row.is_active === 1,
  };
}

export async function getActiveProfile(): Promise<UserProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<ProfileRow>(
    "SELECT * FROM user_profiles WHERE is_active = 1 LIMIT 1"
  );
  if (!row) return null;
  return rowToProfile(row);
}

export async function insertProfile(profile: UserProfile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "INSERT INTO user_profiles (id, name, age_group, complexity_level, grid_rows, grid_cols, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [
      profile.id,
      profile.name,
      profile.ageGroup,
      profile.complexityLevel,
      profile.gridRows,
      profile.gridCols,
      profile.isActive ? 1 : 0,
    ]
  );
}

export async function getAllProfiles(): Promise<UserProfile[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<ProfileRow>(
    "SELECT * FROM user_profiles ORDER BY name ASC"
  );
  return rows.map(rowToProfile);
}

export async function setActiveProfile(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("UPDATE user_profiles SET is_active = 0 WHERE is_active = 1");
  await db.runAsync("UPDATE user_profiles SET is_active = 1 WHERE id = ?", [id]);
}

export async function updateProfile(profile: UserProfile): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    "UPDATE user_profiles SET name = ?, age_group = ?, complexity_level = ?, grid_rows = ?, grid_cols = ? WHERE id = ?",
    [profile.name, profile.ageGroup, profile.complexityLevel, profile.gridRows, profile.gridCols, profile.id]
  );
}

export async function deleteProfile(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM user_profiles WHERE id = ?", [id]);
}
