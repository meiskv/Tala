import { FlatList, Text, View, useWindowDimensions } from "react-native";
import { useCallback, useMemo } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SymbolButton } from "@/shared/components/SymbolButton";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import type { Category, SentenceSymbol } from "@/shared/types";
import type { ButtonWithImage } from "@/db/queries/buttonQueries";
import * as ttsService from "@/features/tts/ttsService";

interface CategoryRowProps {
  category: Category;
  buttons: ButtonWithImage[];
}

const CARD_GAP = 8;
const ROW_PADDING_H = 12;
const LABEL_HEIGHT = 32;

function toLightTint(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  // Mix with white at ~75% to get a 200-scale pastel
  const lr = Math.round(r + (255 - r) * 0.75);
  const lg = Math.round(g + (255 - g) * 0.75);
  const lb = Math.round(b + (255 - b) * 0.75);
  return `rgb(${lr}, ${lg}, ${lb})`;
}

export function CategoryRow({ category, buttons }: CategoryRowProps) {
  const { height } = useWindowDimensions();
  const addSymbol = useSentenceStore((s) => s.addSymbol);

  // Calculate card size based on fitting ~3 rows in the visible area
  const lightBg = useMemo(() => toLightTint(category.color), [category.color]);

  const cardSize = useMemo(() => {
    const availableHeight = height - 72 - 60; // minus sentence strip and tab bar
    const rowHeight = (availableHeight - LABEL_HEIGHT * 3) / 3;
    return Math.min(Math.floor(rowHeight - CARD_GAP), 88);
  }, [height]);

  const handlePress = useCallback(
    (button: ButtonWithImage) => {
      if (button.action === "speak") {
        const sentenceSymbol: SentenceSymbol = {
          symbolId: button.symbolId ?? button.id,
          label: button.label,
          vocalization: button.vocalization ?? button.label,
          imagePath: button.imagePath,
        };
        addSymbol(sentenceSymbol);
        ttsService.speak(button.vocalization ?? button.label);
      }
    },
    [addSymbol]
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
            color: "#444",
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
