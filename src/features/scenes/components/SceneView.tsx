import { View, useWindowDimensions } from "react-native";
import { useCallback } from "react";
import { SceneHotspotButton } from "./SceneHotspotButton";
import * as ttsService from "@/features/tts/ttsService";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import { getSymbolImageUrl } from "@/features/symbols/arasaacApi";
import type { Scene, SceneHotspot, SentenceSymbol } from "@/shared/types";

interface SceneViewProps {
  scene: Scene;
}

export function SceneView({ scene }: SceneViewProps) {
  const { width, height } = useWindowDimensions();
  const addSymbol = useSentenceStore((s) => s.addSymbol);

  const sceneHeight = height - 160; // account for header, sentence strip, tab bar
  const sceneWidth = width - 24; // horizontal padding

  const handleHotspotPress = useCallback(
    (hotspot: SceneHotspot) => {
      const text = hotspot.vocalization ?? hotspot.label;
      ttsService.speak(text);

      const sentenceSymbol: SentenceSymbol = {
        symbolId: hotspot.id,
        label: hotspot.label,
        vocalization: text,
        imagePath: getSymbolImageUrl(hotspot.arasaacId),
      };
      addSymbol(sentenceSymbol);
    },
    [addSymbol]
  );

  return (
    <View
      style={{
        width: sceneWidth,
        height: sceneHeight,
        backgroundColor: scene.backgroundColor,
        borderRadius: 20,
        alignSelf: "center",
        overflow: "hidden",
      }}
    >
      {scene.hotspots.map((hotspot) => (
        <SceneHotspotButton
          key={hotspot.id}
          hotspot={hotspot}
          onPress={handleHotspotPress}
        />
      ))}
    </View>
  );
}
