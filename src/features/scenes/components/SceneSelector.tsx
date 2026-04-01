import { FlatList, Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Scene } from "@/shared/types";

interface SceneSelectorProps {
  scenes: Scene[];
  activeSceneId: string;
  onSelect: (scene: Scene) => void;
}

export function SceneSelector({
  scenes,
  activeSceneId,
  onSelect,
}: SceneSelectorProps) {
  return (
    <FlatList
      horizontal
      data={scenes}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
      renderItem={({ item }) => {
        const isActive = item.id === activeSceneId;
        return (
          <Pressable
            onPress={() => onSelect(item)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              backgroundColor: isActive ? item.backgroundColor : "#F0F0F0",
              borderWidth: isActive ? 2 : 0,
              borderColor: isActive ? "#666" : "transparent",
            }}
          >
            <Ionicons
              name={item.icon as any}
              size={18}
              color={isActive ? "#333" : "#888"}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: 13,
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#333" : "#888",
              }}
            >
              {item.name}
            </Text>
          </Pressable>
        );
      }}
    />
  );
}
