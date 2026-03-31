const BASE_URL = "https://api.arasaac.org/v1";
const STATIC_URL = "https://static.arasaac.org/pictograms";

export interface ArasaacPictogram {
  _id: number;
  keyword: string;
}

export function getSymbolImageUrl(arasaacId: number): string {
  return `${STATIC_URL}/${arasaacId}/${arasaacId}_500.png`;
}

export async function searchSymbols(
  keyword: string,
  locale = "en"
): Promise<ArasaacPictogram[]> {
  const response = await fetch(
    `${BASE_URL}/pictograms/${locale}/search/${encodeURIComponent(keyword)}`
  );
  if (!response.ok) {
    throw new Error(`ARASAAC search failed: ${response.status}`);
  }
  return response.json();
}
