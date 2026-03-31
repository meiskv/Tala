import { Paths, Directory, File } from "expo-file-system";
import { getSymbolImageUrl } from "./arasaacApi";

const symbolsDir = new Directory(Paths.document, "symbols");

export function getLocalSymbolPath(arasaacId: number): string {
  return new File(symbolsDir, `${arasaacId}.png`).uri;
}

export function ensureSymbolsCacheDir(): void {
  if (!symbolsDir.exists) {
    symbolsDir.create();
  }
}

export function isSymbolCached(arasaacId: number): boolean {
  const file = new File(symbolsDir, `${arasaacId}.png`);
  return file.exists;
}

export async function downloadSymbol(arasaacId: number): Promise<string> {
  ensureSymbolsCacheDir();
  const url = getSymbolImageUrl(arasaacId);
  const destination = new Directory(symbolsDir);
  const file = await File.downloadFileAsync(url, destination);
  return file.uri;
}

export async function downloadSymbolBatch(
  arasaacIds: number[],
  onProgress?: (done: number, total: number) => void
): Promise<void> {
  ensureSymbolsCacheDir();
  const total = arasaacIds.length;
  let done = 0;
  const batchSize = 5;

  for (let i = 0; i < total; i += batchSize) {
    const batch = arasaacIds.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (id) => {
        try {
          const cached = isSymbolCached(id);
          if (!cached) {
            await downloadSymbol(id);
          }
        } catch (error) {
          console.warn(`Failed to download symbol ${id}:`, error);
        }
        done++;
        onProgress?.(done, total);
      })
    );
  }
}
