import { View, useWindowDimensions } from "react-native";
import { useCallback } from "react";
import * as Haptics from "expo-haptics";
import { SceneHotspotButton } from "./SceneHotspotButton";
import * as ttsService from "@/features/tts/ttsService";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import { recordSymbolUsage } from "@/db/queries/usageQueries";
import { getSymbolImageUrl } from "@/features/symbols/arasaacApi";
import type { Scene, SceneHotspot, SentenceSymbol } from "@/shared/types";

interface SceneViewProps {
  scene: Scene;
}

export function SceneView({ scene }: SceneViewProps) {
  const { width, height } = useWindowDimensions();
  const addSymbol = useSentenceStore((s) => s.addSymbol);

  const sceneHeight = height - 160;
  const sceneWidth = width - 24;

  const handleHotspotPress = useCallback(
    (hotspot: SceneHotspot) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const text = hotspot.vocalization ?? hotspot.label;
      ttsService.speak(text);

      const sentenceSymbol: SentenceSymbol = {
        symbolId: hotspot.id,
        label: hotspot.label,
        vocalization: text,
        imagePath: getSymbolImageUrl(hotspot.arasaacId),
      };
      addSymbol(sentenceSymbol);
      recordSymbolUsage(hotspot.id).catch(() => {});
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
