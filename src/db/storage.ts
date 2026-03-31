import { createMMKV } from "react-native-mmkv";

export const storage = createMMKV({ id: "aac-preferences" });

export const StorageKeys = {
  ACTIVE_PROFILE_ID: "activeProfileId",
  TTS_RATE: "ttsRate",
  TTS_PITCH: "ttsPitch",
  TTS_LANGUAGE: "ttsLanguage",
  LAST_BOARD_ID: "lastBoardId",
  HAS_SEEDED: "hasSeeded",
} as const;
