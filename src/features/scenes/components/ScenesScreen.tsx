import { View } from "react-native";
import { useState, useCallback } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { SceneSelector } from "./SceneSelector";
import { SceneView } from "./SceneView";
import { SentenceStrip } from "@/features/sentence-builder/components/SentenceStrip";
import { useColors } from "@/shared/hooks/useColors";
import { SCENES } from "../sceneData";
import type { Scene } from "@/shared/types";

export function ScenesScreen() {
  const colors = useColors();
  const [activeScene, setActiveScene] = useState<Scene>(SCENES[0]);

  const handleSelect = useCallback((scene: Scene) => {
    setActiveScene(scene);
  }, []);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: colors.background }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ paddingVertical: 8 }}>
          <SceneSelector
            scenes={SCENES}
            activeSceneId={activeScene.id}
            onSelect={handleSelect}
          />
        </View>

        <View style={{ flex: 1 }}>
          <SceneView scene={activeScene} />
        </View>

        <SentenceStrip />
      </View>
    </SafeAreaView>
  );
}
