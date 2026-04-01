import { FlatList, Pressable, Text, View, Share } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useState, useCallback } from "react";
import * as Haptics from "expo-haptics";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import { useTTS } from "@/features/tts/hooks/useTTS";
import { useColors } from "@/shared/hooks/useColors";

export function SentenceStrip() {
  const colors = useColors();
  const symbols = useSentenceStore((s) => s.symbols);
  const removeLastSymbol = useSentenceStore((s) => s.removeLastSymbol);
  const removeAtIndex = useSentenceStore((s) => s.removeAtIndex);
  const reorder = useSentenceStore((s) => s.reorder);
  const clear = useSentenceStore((s) => s.clear);
  const saveToHistory = useSentenceStore((s) => s.saveToHistory);
  const getSentenceText = useSentenceStore((s) => s.getSentenceText);
  const { speakSentence } = useTTS();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSymbolPress = useCallback(
    (index: number) => {
      if (selectedIndex !== null && selectedIndex !== index) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        reorder(selectedIndex, index);
        setSelectedIndex(null);
      } else if (selectedIndex === index) {
        setSelectedIndex(null);
      } else {
        Haptics.selectionAsync();
        setSelectedIndex(index);
      }
    },
    [selectedIndex, reorder]
  );

  const handleSymbolLongPress = useCallback(
    (index: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      removeAtIndex(index);
      setSelectedIndex(null);
    },
    [removeAtIndex]
  );

  const handleSpeak = useCallback(() => {
    saveToHistory();
    speakSentence();
  }, [saveToHistory, speakSentence]);

  const handleShare = useCallback(async () => {
    const text = getSentenceText();
    if (!text.trim()) return;
    try {
      await Share.share({ message: text });
    } catch {}
  }, [getSentenceText]);

  return (
    <View
      style={{
        flexDirection: "row",
        height: 72,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        alignItems: "center",
        paddingHorizontal: 8,
      }}
    >
      <FlatList
        horizontal
        data={symbols}
        keyExtractor={(_, index) => `sentence-${index}`}
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center", gap: 6 }}
        renderItem={({ item, index }) => {
          const isSelected = selectedIndex === index;
          const borderColor = item.categoryColor ?? colors.border;
          return (
            <Pressable
              onPress={() => handleSymbolPress(index)}
              onLongPress={() => handleSymbolLongPress(index)}
            >
              <View
                style={{
                  alignItems: "center",
                  width: 56,
                  height: 60,
                  justifyContent: "center",
                  backgroundColor: isSelected ? `${borderColor}22` : colors.background,
                  borderRadius: 8,
                  borderWidth: 2,
                  borderColor: isSelected ? colors.accent : borderColor,
                  padding: 2,
                }}
              >
                {item.imagePath ? (
                  <Image
                    source={{ uri: item.imagePath }}
                    style={{ width: 36, height: 36 }}
                    contentFit="contain"
                  />
                ) : (
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      backgroundColor: colors.card,
                      borderRadius: 6,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 14, color: colors.textTertiary }}>?</Text>
                  </View>
                )}
                <Text
                  numberOfLines={1}
                  style={{ fontSize: 9, color: colors.textSecondary, marginTop: 1 }}
                >
                  {item.label}
                </Text>
              </View>
            </Pressable>
          );
        }}
        ListEmptyComponent={
          <Text style={{ color: colors.textTertiary, fontSize: 16, paddingLeft: 8 }}>
            Tap symbols to build a sentence...
          </Text>
        }
      />

      <View style={{ flexDirection: "row", gap: 6, marginLeft: 8 }}>
        <ActionButton
          icon="volume-high"
          color={colors.success}
          onPress={handleSpeak}
          label="Speak sentence"
          disabled={symbols.length === 0}
        />
        <ActionButton
          icon="share-outline"
          color="#2196F3"
          onPress={handleShare}
          label="Share sentence"
          disabled={symbols.length === 0}
        />
        <ActionButton
          icon="backspace"
          color={colors.warning}
          onPress={removeLastSymbol}
          label="Delete last"
          disabled={symbols.length === 0}
        />
        <ActionButton
          icon="trash"
          color={colors.danger}
          onPress={clear}
          label="Clear all"
          disabled={symbols.length === 0}
        />
      </View>
    </View>
  );
}

function ActionButton({
  icon,
  color,
  onPress,
  label,
  disabled,
}: {
  icon: string;
  color: string;
  onPress: () => void;
  label: string;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: disabled ? "#E0E0E0" : color,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Ionicons name={icon as any} size={22} color="#FFF" />
    </Pressable>
  );
}
