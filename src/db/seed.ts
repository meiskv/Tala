import { DEFAULT_CATEGORIES } from "@/shared/constants/categories";
import { downloadSymbolBatch } from "@/features/symbols/symbolCache";
import { getDatabase } from "@/db/database";
import { insertCategory } from "@/db/queries/categoryQueries";
import { insertBoard } from "@/db/queries/boardQueries";
import { insertSymbol } from "@/db/queries/symbolQueries";
import { insertButton } from "@/db/queries/buttonQueries";
import { insertProfile } from "@/db/queries/profileQueries";
import { storage, StorageKeys } from "@/db/storage";

const SEED_SYMBOLS = [
  // Daily Routines
  { id: "sym-wakeup", label: "Wake Up", arasaacId: 8989, category: "daily" },
  { id: "sym-breakfast", label: "Breakfast", arasaacId: 4626, category: "daily" },
  { id: "sym-brushteeth", label: "Brush Teeth", arasaacId: 2326, category: "daily" },
  { id: "sym-getdressed", label: "Get Dressed", arasaacId: 6627, category: "daily" },
  { id: "sym-gooutside", label: "Go Outside", arasaacId: 5475, category: "daily" },
  { id: "sym-lunch", label: "Lunch", arasaacId: 4611, category: "daily" },
  { id: "sym-nap", label: "Nap", arasaacId: 28425, category: "daily" },
  { id: "sym-dinner", label: "Dinner", arasaacId: 4626, category: "daily" },
  { id: "sym-bath", label: "Bath", arasaacId: 2272, category: "daily" },
  { id: "sym-bedtime", label: "Bedtime", arasaacId: 6479, category: "daily" },
  { id: "sym-washhands", label: "Wash Hands", arasaacId: 9006, category: "daily" },
  { id: "sym-diaper", label: "Diaper", arasaacId: 22017, category: "daily" },

  // Phrases / Scripts (GLP gestalts)
  { id: "sym-iwant", label: "I Want", arasaacId: 5441, category: "phrases" },
  { id: "sym-myturn", label: "My Turn", arasaacId: 6006, category: "phrases" },
  { id: "sym-openit", label: "Open", arasaacId: 24825, category: "phrases" },
  { id: "sym-closeit", label: "Close", arasaacId: 30383, category: "phrases" },
  { id: "sym-helpme", label: "Help Me", arasaacId: 4570, category: "phrases" },
  { id: "sym-comehere", label: "Come Here", arasaacId: 32669, category: "phrases" },
  { id: "sym-lookatthis", label: "Look", arasaacId: 6564, category: "phrases" },
  { id: "sym-wait", label: "Wait", arasaacId: 36914, category: "phrases" },
  { id: "sym-ready", label: "Ready", arasaacId: 17000, category: "phrases" },
  { id: "sym-again", label: "Again", arasaacId: 37163, category: "phrases" },
  { id: "sym-letsgo", label: "Let's Go", arasaacId: 8142, category: "phrases" },
  { id: "sym-readysetgo", label: "Ready Set Go!", arasaacId: 17000, category: "phrases" },

  // Questions
  { id: "sym-what", label: "What?", arasaacId: 22620, category: "questions" },
  { id: "sym-where", label: "Where?", arasaacId: 7764, category: "questions" },
  { id: "sym-who", label: "Who?", arasaacId: 9853, category: "questions" },
  { id: "sym-why", label: "Why?", arasaacId: 36719, category: "questions" },
  { id: "sym-whatsthat", label: "What's That?", arasaacId: 22620, category: "questions" },
  { id: "sym-wheregoing", label: "Where Going?", arasaacId: 7764, category: "questions" },
  { id: "sym-canihave", label: "Can I Have?", arasaacId: 5441, category: "questions" },
  { id: "sym-whoisit", label: "Who Is It?", arasaacId: 9853, category: "questions" },

  // Social / Greetings
  { id: "sym-hi", label: "Hi!", arasaacId: 6522, category: "social" },
  { id: "sym-bye", label: "Bye Bye", arasaacId: 6028, category: "social" },
  { id: "sym-goodmorning", label: "Good Morning", arasaacId: 6944, category: "social" },
  { id: "sym-goodnight", label: "Good Night", arasaacId: 6942, category: "social" },
  { id: "sym-thanks", label: "Thank You", arasaacId: 8129, category: "social" },
  { id: "sym-sorry", label: "Sorry", arasaacId: 11625, category: "social" },
  { id: "sym-hug", label: "Hug", arasaacId: 4550, category: "social" },
  { id: "sym-kiss", label: "Kiss", arasaacId: 6062, category: "social" },
  { id: "sym-iloveyou", label: "I Love You", arasaacId: 37721, category: "social" },
  { id: "sym-nicejob", label: "Nice Job!", arasaacId: 4581, category: "social" },

  // People
  { id: "sym-i", label: "I / Me", arasaacId: 6632, category: "people" },
  { id: "sym-you", label: "You", arasaacId: 6625, category: "people" },
  { id: "sym-mom", label: "Mom", arasaacId: 2458, category: "people" },
  { id: "sym-dad", label: "Dad", arasaacId: 2497, category: "people" },
  { id: "sym-friend", label: "Friend", arasaacId: 25790, category: "people" },
  { id: "sym-teacher", label: "Teacher", arasaacId: 6556, category: "people" },
  { id: "sym-boy", label: "Boy", arasaacId: 7176, category: "people" },
  { id: "sym-girl", label: "Girl", arasaacId: 27509, category: "people" },
  { id: "sym-baby", label: "Baby", arasaacId: 6060, category: "people" },
  { id: "sym-family", label: "Family", arasaacId: 38351, category: "people" },
  { id: "sym-doctor", label: "Doctor", arasaacId: 6561, category: "people" },
  { id: "sym-brother", label: "Brother", arasaacId: 2423, category: "people" },
  { id: "sym-sister", label: "Sister", arasaacId: 2422, category: "people" },

  // Actions
  { id: "sym-want", label: "Want", arasaacId: 5441, category: "actions" },
  { id: "sym-go", label: "Go", arasaacId: 8142, category: "actions" },
  { id: "sym-eat", label: "Eat", arasaacId: 6456, category: "actions" },
  { id: "sym-drink", label: "Drink", arasaacId: 6061, category: "actions" },
  { id: "sym-play", label: "Play", arasaacId: 23392, category: "actions" },
  { id: "sym-help", label: "Help", arasaacId: 32648, category: "actions" },
  { id: "sym-stop", label: "Stop", arasaacId: 7196, category: "actions" },
  { id: "sym-like", label: "Like", arasaacId: 37826, category: "actions" },
  { id: "sym-see", label: "See", arasaacId: 6564, category: "actions" },
  { id: "sym-give", label: "Give", arasaacId: 28431, category: "actions" },
  { id: "sym-make", label: "Make", arasaacId: 32751, category: "actions" },
  { id: "sym-read", label: "Read", arasaacId: 7141, category: "actions" },
  { id: "sym-sleep", label: "Sleep", arasaacId: 6479, category: "actions" },
  { id: "sym-walk", label: "Walk", arasaacId: 29951, category: "actions" },

  // Food
  { id: "sym-apple", label: "Apple", arasaacId: 2462, category: "food" },
  { id: "sym-water", label: "Water", arasaacId: 32464, category: "food" },
  { id: "sym-milk", label: "Milk", arasaacId: 2445, category: "food" },
  { id: "sym-bread", label: "Bread", arasaacId: 2494, category: "food" },
  { id: "sym-banana", label: "Banana", arasaacId: 2530, category: "food" },
  { id: "sym-cookie", label: "Cookie", arasaacId: 8312, category: "food" },
  { id: "sym-juice", label: "Juice", arasaacId: 11461, category: "food" },
  { id: "sym-rice", label: "Rice", arasaacId: 6911, category: "food" },
  { id: "sym-chicken", label: "Chicken", arasaacId: 4952, category: "food" },
  { id: "sym-egg", label: "Egg", arasaacId: 2427, category: "food" },
  { id: "sym-cake", label: "Cake", arasaacId: 2502, category: "food" },
  { id: "sym-pizza", label: "Pizza", arasaacId: 2527, category: "food" },

  // Places
  { id: "sym-home", label: "Home", arasaacId: 6964, category: "places" },
  { id: "sym-school", label: "School", arasaacId: 32446, category: "places" },
  { id: "sym-park", label: "Park", arasaacId: 5379, category: "places" },
  { id: "sym-bathroom", label: "Bathroom", arasaacId: 5921, category: "places" },
  { id: "sym-store", label: "Store", arasaacId: 35695, category: "places" },
  { id: "sym-hospital", label: "Hospital", arasaacId: 36210, category: "places" },
  { id: "sym-church", label: "Church", arasaacId: 3118, category: "places" },
  { id: "sym-library", label: "Library", arasaacId: 6063, category: "places" },
  { id: "sym-car", label: "Car", arasaacId: 2339, category: "places" },
  { id: "sym-bus", label: "Bus", arasaacId: 2262, category: "places" },

  // Feelings
  { id: "sym-happy", label: "Happy", arasaacId: 35533, category: "feelings" },
  { id: "sym-sad", label: "Sad", arasaacId: 35545, category: "feelings" },
  { id: "sym-angry", label: "Angry", arasaacId: 35539, category: "feelings" },
  { id: "sym-tired", label: "Tired", arasaacId: 35537, category: "feelings" },
  { id: "sym-scared", label: "Scared", arasaacId: 35535, category: "feelings" },
  { id: "sym-sick", label: "Sick", arasaacId: 7040, category: "feelings" },
  { id: "sym-excited", label: "Excited", arasaacId: 39090, category: "feelings" },
  { id: "sym-love", label: "Love", arasaacId: 37721, category: "feelings" },
  { id: "sym-bored", label: "Bored", arasaacId: 35531, category: "feelings" },
  { id: "sym-hungry", label: "Hungry", arasaacId: 4962, category: "feelings" },

  // Descriptors
  { id: "sym-big", label: "Big", arasaacId: 4658, category: "descriptors" },
  { id: "sym-small", label: "Small", arasaacId: 4716, category: "descriptors" },
  { id: "sym-more", label: "More", arasaacId: 5508, category: "descriptors" },
  { id: "sym-yes", label: "Yes", arasaacId: 5584, category: "descriptors" },
  { id: "sym-no", label: "No", arasaacId: 5526, category: "descriptors" },
  { id: "sym-please", label: "Please", arasaacId: 8195, category: "descriptors" },
  { id: "sym-thankyou", label: "Thank You", arasaacId: 8129, category: "descriptors" },
  { id: "sym-good", label: "Good", arasaacId: 4581, category: "descriptors" },
  { id: "sym-bad", label: "Bad", arasaacId: 5504, category: "descriptors" },
  { id: "sym-hot", label: "Hot", arasaacId: 2300, category: "descriptors" },
  { id: "sym-cold", label: "Cold", arasaacId: 4652, category: "descriptors" },
  { id: "sym-alldone", label: "All Done", arasaacId: 28429, category: "descriptors" },
] as const;

export async function seedDatabase(
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  const db = await getDatabase();

  // Clear any partial seed data
  await db.runAsync("DELETE FROM buttons");
  await db.runAsync("DELETE FROM boards");
  await db.runAsync("DELETE FROM symbols");
  await db.runAsync("DELETE FROM categories");
  await db.runAsync("DELETE FROM user_profiles");

  // 1. Insert categories
  for (const cat of DEFAULT_CATEGORIES) {
    await insertCategory({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      sortOrder: cat.sortOrder,
    });
  }

  // 2. Create one board per category
  for (const cat of DEFAULT_CATEGORIES) {
    await insertBoard({
      id: `board-${cat.id}`,
      name: cat.name,
      categoryId: cat.id,
      gridRows: 3,
      gridCols: 8,
    });
  }

  // 3. Insert all symbols
  for (const sym of SEED_SYMBOLS) {
    await insertSymbol({
      id: sym.id,
      label: sym.label,
      arasaacId: sym.arasaacId,
      localCachePath: null,
      tags: [sym.category],
    });
  }

  // 4. Insert buttons — one per symbol on its category's board
  const categoryIndexes: Record<string, number> = {};
  for (const sym of SEED_SYMBOLS) {
    const position = categoryIndexes[sym.category] ?? 0;
    categoryIndexes[sym.category] = position + 1;

    await insertButton({
      id: `btn-${sym.id}`,
      boardId: `board-${sym.category}`,
      label: sym.label,
      vocalization: sym.label,
      symbolId: sym.id,
      action: "speak",
      targetBoardId: null,
      position,
      bgColor: null,
    });
  }

  // 5. Create default user profile
  await insertProfile({
    id: "default",
    name: "User",
    ageGroup: "child",
    complexityLevel: "emergent",
    gridRows: 2,
    gridCols: 5,
    isActive: true,
  });

  // 6. Download all symbol images
  const uniqueArasaacIds = [
    ...new Set(SEED_SYMBOLS.map((s) => s.arasaacId)),
  ];
  await downloadSymbolBatch(uniqueArasaacIds, onProgress);
}

export function needsSeeding(): boolean {
  return !storage.getBoolean(StorageKeys.HAS_SEEDED);
}

export function markAsSeeded(): void {
  storage.set(StorageKeys.HAS_SEEDED, true);
}
