import { Pressable, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CategoryChipProps {
  name: string;
  icon: string;
  color: string;
  isActive: boolean;
  onPress: () => void;
}

export function CategoryChip({
  name,
  icon,
  color,
  isActive,
  onPress,
}: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        backgroundColor: isActive ? color : "#F0F0F0",
        borderWidth: isActive ? 0 : 1,
        borderColor: "#E0E0E0",
      }}
      accessibilityLabel={`${name} category`}
      accessibilityRole="button"
      accessibilityState={{ selected: isActive }}
    >
      <Ionicons
        name={icon as any}
        size={18}
        color={isActive ? "#FFF" : "#666"}
        style={{ marginRight: 6 }}
      />
      <Text
        style={{
          fontSize: 14,
          fontWeight: "600",
          color: isActive ? "#FFF" : "#333",
        }}
      >
        {name}
      </Text>
    </Pressable>
  );
}
