import { View, ScrollView, ActivityIndicator, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { SentenceStrip } from "@/features/sentence-builder/components/SentenceStrip";
import { CategoryRow } from "./CategoryRow";
import { getDatabase } from "@/db/database";
import { getAllCategories } from "@/db/queries/categoryQueries";
import { getBoardsByCategoryId } from "@/db/queries/boardQueries";
import { getButtonsByBoardId, type ButtonWithImage } from "@/db/queries/buttonQueries";
import type { Category } from "@/shared/types";

interface CategoryWithButtons {
  category: Category;
  buttons: ButtonWithImage[];
}

export function BoardScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [categoryRows, setCategoryRows] = useState<CategoryWithButtons[]>([]);

  const loadAllCategories = useCallback(async () => {
    try {
      await getDatabase();
      const categories = await getAllCategories();

      const rows: CategoryWithButtons[] = [];
      for (const category of categories) {
        const boards = await getBoardsByCategoryId(category.id);
        if (boards.length > 0) {
          const buttons = await getButtonsByBoardId(boards[0].id);
          rows.push({ category, buttons });
        }
      }

      setCategoryRows(rows);
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllCategories();
  }, [loadAllCategories]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFF",
        }}
      >
        <ActivityIndicator size="large" color="#4FC3F7" />
        <Text style={{ marginTop: 12, color: "#666", fontSize: 16 }}>
          Loading board...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }} edges={["top", "left", "right"]}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {categoryRows.map(({ category, buttons }) => (
          <CategoryRow
            key={category.id}
            category={category}
            buttons={buttons}
          />
        ))}
      </ScrollView>
      <SentenceStrip />
    </SafeAreaView>
  );
}
