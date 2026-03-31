import { useCallback } from "react";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import * as ttsService from "../ttsService";

export function useTTS() {
  const getSentenceText = useSentenceStore((s) => s.getSentenceText);

  const speakText = useCallback((text: string) => {
    ttsService.speak(text);
  }, []);

  const speakSentence = useCallback(() => {
    const text = getSentenceText();
    if (text.trim()) {
      ttsService.speak(text);
    }
  }, [getSentenceText]);

  const stopSpeaking = useCallback(() => {
    ttsService.stop();
  }, []);

  return { speakText, speakSentence, stopSpeaking };
}
