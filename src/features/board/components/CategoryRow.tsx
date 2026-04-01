import { FlatList, Text, View, useWindowDimensions } from "react-native";
import { useCallback, useMemo } from "react";
import * as Haptics from "expo-haptics";
import { SymbolButton } from "@/shared/components/SymbolButton";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import { useColors } from "@/shared/hooks/useColors";
import { recordSymbolUsage } from "@/db/queries/usageQueries";
import type { Category, SentenceSymbol } from "@/shared/types";
import type { ButtonWithImage } from "@/db/queries/buttonQueries";
import * as ttsService from "@/features/tts/ttsService";

interface CategoryRowProps {
  category: Category;
  buttons: ButtonWithImage[];
  onSymbolTap?: () => void;
}

const CARD_GAP = 8;
const ROW_PADDING_H = 12;
const LABEL_HEIGHT = 32;

function toLightTint(hex: string): string {
  const clean = hex.startsWith("#") ? hex : "#9E9E9E";
  const r = parseInt(clean.slice(1, 3), 16);
  const g = parseInt(clean.slice(3, 5), 16);
  const b = parseInt(clean.slice(5, 7), 16);
  const lr = Math.round(r + (255 - r) * 0.75);
  const lg = Math.round(g + (255 - g) * 0.75);
  const lb = Math.round(b + (255 - b) * 0.75);
  return `rgb(${lr}, ${lg}, ${lb})`;
}

export function CategoryRow({ category, buttons, onSymbolTap }: CategoryRowProps) {
  const { height } = useWindowDimensions();
  const colors = useColors();
  const addSymbol = useSentenceStore((s) => s.addSymbol);

  const lightBg = useMemo(() => toLightTint(category.color), [category.color]);

  const cardSize = useMemo(() => {
    const availableHeight = height - 72 - 60;
    const rowHeight = (availableHeight - LABEL_HEIGHT * 3) / 3;
    return Math.min(Math.floor(rowHeight - CARD_GAP), 88);
  }, [height]);

  const handlePress = useCallback(
    (button: ButtonWithImage) => {
      if (button.action === "speak") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const sentenceSymbol: SentenceSymbol = {
          symbolId: button.symbolId ?? button.id,
          label: button.label,
          vocalization: button.vocalization ?? button.label,
          imagePath: button.imagePath,
          categoryColor: category.color,
        };
        addSymbol(sentenceSymbol);
        ttsService.speak(button.vocalization ?? button.label);
        recordSymbolUsage(button.symbolId ?? button.id).catch(() => {});
        onSymbolTap?.();
      }
    },
    [addSymbol, category.color, onSymbolTap]
  );

  return (
    <View style={{ marginBottom: 4 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: ROW_PADDING_H,
          height: LABEL_HEIGHT,
        }}
      >
        <View
          style={{
            width: 6,
            height: 20,
            borderRadius: 3,
            backgroundColor: category.color,
            marginRight: 8,
          }}
        />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          {category.name}
        </Text>
      </View>

      <FlatList
        horizontal
        data={buttons}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: ROW_PADDING_H,
          gap: CARD_GAP,
        }}
        renderItem={({ item }) => (
          <SymbolButton
            label={item.label}
            imagePath={item.imagePath}
            bgColor={lightBg}
            size={cardSize}
            onPress={() => handlePress(item)}
          />
        )}
      />
    </View>
  );
}
