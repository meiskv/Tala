import { FlatList, View } from "react-native";
import { CategoryChip } from "@/shared/components/CategoryChip";
import { useBoardStore } from "@/shared/hooks/useBoardStore";

export function CategoryBar() {
  const categories = useBoardStore((s) => s.categories);
  const selectedCategoryId = useBoardStore((s) => s.selectedCategoryId);
  const selectCategory = useBoardStore((s) => s.selectCategory);

  return (
    <View style={{ height: 48, paddingVertical: 4 }}>
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item }) => (
          <CategoryChip
            name={item.name}
            icon={item.icon ?? "ellipse"}
            color={item.color}
            isActive={selectedCategoryId === item.id}
            onPress={() => selectCategory(item.id)}
          />
        )}
      />
    </View>
  );
}
