import { FlatList, Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import { useTTS } from "@/features/tts/hooks/useTTS";

export function SentenceStrip() {
  const symbols = useSentenceStore((s) => s.symbols);
  const removeLastSymbol = useSentenceStore((s) => s.removeLastSymbol);
  const clear = useSentenceStore((s) => s.clear);
  const { speakSentence } = useTTS();

  return (
    <View
      style={{
        flexDirection: "row",
        height: 72,
        backgroundColor: "#FAFAFA",
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
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
        renderItem={({ item }) => (
          <View
            style={{
              alignItems: "center",
              width: 56,
              height: 60,
              justifyContent: "center",
              backgroundColor: "#FFF",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: "#E0E0E0",
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
                  backgroundColor: "#EEE",
                  borderRadius: 6,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 14, color: "#999" }}>?</Text>
              </View>
            )}
            <Text
              numberOfLines={1}
              style={{ fontSize: 9, color: "#666", marginTop: 1 }}
            >
              {item.label}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={{ color: "#BBB", fontSize: 16, paddingLeft: 8 }}>
            Tap symbols to build a sentence...
          </Text>
        }
      />

      <View style={{ flexDirection: "row", gap: 8, marginLeft: 8 }}>
        <ActionButton
          icon="volume-high"
          color="#4CAF50"
          onPress={speakSentence}
          label="Speak sentence"
          disabled={symbols.length === 0}
        />
        <ActionButton
          icon="backspace"
          color="#FF9800"
          onPress={removeLastSymbol}
          label="Delete last"
          disabled={symbols.length === 0}
        />
        <ActionButton
          icon="trash"
          color="#F44336"
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
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: disabled ? "#E0E0E0" : color,
        alignItems: "center",
        justifyContent: "center",
      }}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Ionicons name={icon as any} size={24} color="#FFF" />
    </Pressable>
  );
}
