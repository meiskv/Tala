import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({ id: "aac-preferences" });

export const StorageKeys = {
  ACTIVE_PROFILE_ID: "activeProfileId",
  TTS_RATE: "ttsRate",
  TTS_PITCH: "ttsPitch",
  TTS_LANGUAGE: "ttsLanguage",
  TTS_VOICE: "ttsVoice",
  LAST_BOARD_ID: "lastBoardId",
  HAS_SEEDED: "hasSeeded",
  HAS_ONBOARDED: "hasOnboarded",
  DARK_MODE: "darkMode",
  ORIENTATION_LOCK: "orientationLock",
} as const;
