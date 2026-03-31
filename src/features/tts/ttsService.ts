import * as Speech from "expo-speech";
import { storage, StorageKeys } from "@/db/storage";

export interface TTSOptions {
  rate?: number;
  pitch?: number;
  language?: string;
}

function getStoredOptions(): TTSOptions {
  return {
    rate: storage.getNumber(StorageKeys.TTS_RATE) ?? 1.0,
    pitch: storage.getNumber(StorageKeys.TTS_PITCH) ?? 1.0,
    language: storage.getString(StorageKeys.TTS_LANGUAGE) ?? "en-US",
  };
}

export function speak(text: string, options?: TTSOptions): void {
  const stored = getStoredOptions();
  const merged = { ...stored, ...options };

  Speech.speak(text, {
    rate: merged.rate,
    pitch: merged.pitch,
    language: merged.language,
  });
}

export function speakSymbols(
  vocalizations: string[],
  options?: TTSOptions
): void {
  const sentence = vocalizations.join(" ");
  if (sentence.trim()) {
    speak(sentence, options);
  }
}

export function stop(): void {
  Speech.stop();
}

export async function getAvailableVoices(): Promise<Speech.Voice[]> {
  return Speech.getAvailableVoicesAsync();
}

export function isSpeaking(): Promise<boolean> {
  return Speech.isSpeakingAsync();
}
