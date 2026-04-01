import { useLocalSearchParams, Stack } from "expo-router";
import { View, ActivityIndicator, FlatList, useWindowDimensions } from "react-native";
import { useEffect, useState, useCallback, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { SymbolButton } from "@/shared/components/SymbolButton";
import { SentenceStrip } from "@/features/sentence-builder/components/SentenceStrip";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import { useProfileStore } from "@/shared/hooks/useProfileStore";
import { useColors } from "@/shared/hooks/useColors";
import { getBoardById } from "@/db/queries/boardQueries";
import { getButtonsByBoardId, type ButtonWithImage } from "@/db/queries/buttonQueries";
import { getCategoryById } from "@/db/queries/categoryQueries";
import { recordSymbolUsage } from "@/db/queries/usageQueries";
import * as ttsService from "@/features/tts/ttsService";
import type { Board, Category, SentenceSymbol } from "@/shared/types";

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width, height } = useWindowDimensions();
  const colors = useColors();
  const addSymbol = useSentenceStore((s) => s.addSymbol);
  const profile = useProfileStore((s) => s.activeProfile);

  const [board, setBoard] = useState<Board | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [buttons, setButtons] = useState<ButtonWithImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const b = await getBoardById(id);
      if (b) {
        setBoard(b);
        const btns = await getButtonsByBoardId(b.id);
        setButtons(btns);
        if (b.categoryId) {
          const cat = await getCategoryById(b.categoryId);
          setCategory(cat);
        }
      }
      setIsLoading(false);
    }
    load();
  }, [id]);

  const gridCols = profile?.gridCols ?? board?.gridCols ?? 5;
  const gridRows = profile?.gridRows ?? board?.gridRows ?? 3;

  const buttonSize = useMemo(() => {
    const availableWidth = width - 32;
    const availableHeight = height - 180;
    const maxByWidth = Math.floor((availableWidth - (gridCols - 1) * 8) / gridCols);
    const maxByHeight = Math.floor((availableHeight - (gridRows - 1) * 8) / gridRows);
    return Math.min(maxByWidth, maxByHeight, 140);
  }, [width, height, gridCols, gridRows]);

  const handlePress = useCallback(
    (button: ButtonWithImage) => {
      if (button.action === "speak") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const sentenceSymbol: SentenceSymbol = {
          symbolId: button.symbolId ?? button.id,
          label: button.label,
          vocalization: button.vocalization ?? button.label,
          imagePath: button.imagePath,
          categoryColor: category?.color,
        };
        addSymbol(sentenceSymbol);
        ttsService.speak(button.vocalization ?? button.label);
        recordSymbolUsage(button.symbolId ?? button.id).catch(() => {});
      }
    },
    [addSymbol, category]
  );

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ title: "Board", headerShown: true }} />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: board?.name ?? "Board",
          headerShown: true,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["left", "right"]}>
        <View style={{ flex: 1, padding: 16 }}>
          <FlatList
            data={buttons}
            numColumns={gridCols}
            key={`detail-grid-${gridCols}`}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 8 }}
            columnWrapperStyle={{ gap: 8 }}
            renderItem={({ item }) => (
              <SymbolButton
                label={item.label}
                imagePath={item.imagePath}
                bgColor={item.bgColor}
                size={buttonSize}
                onPress={() => handlePress(item)}
              />
            )}
          />
        </View>
        <SentenceStrip />
      </SafeAreaView>
    </>
  );
}
