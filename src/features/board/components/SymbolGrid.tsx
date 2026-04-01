import { FlatList, useWindowDimensions, View } from "react-native";
import { useMemo, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { SymbolButton } from "@/shared/components/SymbolButton";
import { useBoardStore } from "@/shared/hooks/useBoardStore";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import { useProfileStore } from "@/shared/hooks/useProfileStore";
import { recordSymbolUsage } from "@/db/queries/usageQueries";
import type { SentenceSymbol } from "@/shared/types";
import type { ButtonWithImage } from "@/db/queries/buttonQueries";
import * as ttsService from "@/features/tts/ttsService";

const SENTENCE_STRIP_HEIGHT = 72;
const CATEGORY_BAR_HEIGHT = 48;
const TAB_BAR_HEIGHT = 50;
const GRID_PADDING = 8;

export function SymbolGrid() {
  const { width, height } = useWindowDimensions();
  const buttons = useBoardStore((s) => s.buttons);
  const currentBoard = useBoardStore((s) => s.currentBoard);
  const addSymbol = useSentenceStore((s) => s.addSymbol);
  const profile = useProfileStore((s) => s.activeProfile);

  const gridCols = profile?.gridCols ?? currentBoard?.gridCols ?? 5;
  const gridRows = profile?.gridRows ?? currentBoard?.gridRows ?? 3;

  const availableHeight =
    height - SENTENCE_STRIP_HEIGHT - CATEGORY_BAR_HEIGHT - TAB_BAR_HEIGHT - GRID_PADDING * 2;
  const availableWidth = width - GRID_PADDING * 2;

  const buttonSize = useMemo(() => {
    const maxByWidth = Math.floor((availableWidth - (gridCols - 1) * 6) / gridCols);
    const maxByHeight = Math.floor((availableHeight - (gridRows - 1) * 6) / gridRows);
    return Math.min(maxByWidth, maxByHeight, 140);
  }, [availableWidth, availableHeight, gridCols, gridRows]);

  const handlePress = useCallback(
    (button: ButtonWithImage) => {
      if (button.action === "speak") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const sentenceSymbol: SentenceSymbol = {
          symbolId: button.symbolId ?? button.id,
          label: button.label,
          vocalization: button.vocalization ?? button.label,
          imagePath: button.imagePath,
        };
        addSymbol(sentenceSymbol);
        ttsService.speak(button.vocalization ?? button.label);
        recordSymbolUsage(button.symbolId ?? button.id).catch(() => {});
      }
    },
    [addSymbol]
  );

  return (
    <View style={{ flex: 1, padding: GRID_PADDING }}>
      <FlatList
        data={buttons}
        numColumns={gridCols}
        key={`grid-${gridCols}`}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 6 }}
        columnWrapperStyle={{ gap: 6 }}
        renderItem={({ item }) => (
          <SymbolButton
            label={item.label}
            imagePath={(item as ButtonWithImage).imagePath ?? null}
            bgColor={item.bgColor}
            size={buttonSize}
            onPress={() => handlePress(item as ButtonWithImage)}
          />
        )}
        getItemLayout={(_, index) => ({
          length: buttonSize + 6,
          offset: (buttonSize + 6) * Math.floor(index / gridCols),
          index,
        })}
      />
    </View>
  );
}
