import { View, ScrollView, ActivityIndicator, Text, TextInput, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import { SentenceStrip } from "@/features/sentence-builder/components/SentenceStrip";
import { CategoryRow } from "./CategoryRow";
import { getDatabase } from "@/db/database";
import { getAllCategories } from "@/db/queries/categoryQueries";
import { getBoardsByCategoryId } from "@/db/queries/boardQueries";
import { getButtonsByBoardId, searchButtons, type ButtonWithImage } from "@/db/queries/buttonQueries";
import { getTopUsedButtons } from "@/db/queries/usageQueries";
import { useColors } from "@/shared/hooks/useColors";
import type { Category } from "@/shared/types";

interface CategoryWithButtons {
  category: Category;
  buttons: ButtonWithImage[];
}

export function BoardScreen() {
  const colors = useColors();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryRows, setCategoryRows] = useState<CategoryWithButtons[]>([]);
  const [favorites, setFavorites] = useState<ButtonWithImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ButtonWithImage[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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

      const topUsed = await getTopUsedButtons(12);
      setFavorites(topUsed);

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllCategories();
  }, [loadAllCategories]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchButtons(query.trim());
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  }, []);

  const refreshFavorites = useCallback(async () => {
    try {
      const topUsed = await getTopUsedButtons(12);
      setFavorites(topUsed);
    } catch {}
  }, []);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={{ marginTop: 12, color: colors.textSecondary, fontSize: 16 }}>
          Loading board...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, gap: 8 }}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.card,
            borderRadius: 10,
            paddingHorizontal: 10,
            height: 36,
          }}
        >
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            placeholder="Search symbols..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            style={{
              flex: 1,
              marginLeft: 6,
              fontSize: 14,
              color: colors.text,
              padding: 0,
            }}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {isSearching ? (
          searchResults.length > 0 ? (
            <CategoryRow
              category={{ id: "search", name: "Search Results", icon: "search", color: "#9E9E9E", sortOrder: -1 }}
              buttons={searchResults}
            />
          ) : (
            <View style={{ padding: 24, alignItems: "center" }}>
              <Text style={{ color: colors.textTertiary, fontSize: 16 }}>
                {`No symbols found for "${searchQuery}"`}
              </Text>
            </View>
          )
        ) : (
          <>
            {favorites.length > 0 && (
              <CategoryRow
                category={{ id: "favorites", name: "Favorites", icon: "star", color: "#FFB300", sortOrder: -1 }}
                buttons={favorites}
                onSymbolTap={refreshFavorites}
              />
            )}
            {categoryRows.map(({ category, buttons }) => (
              <CategoryRow
                key={category.id}
                category={category}
                buttons={buttons}
                onSymbolTap={refreshFavorites}
              />
            ))}
          </>
        )}
      </ScrollView>
      <SentenceStrip />
    </SafeAreaView>
  );
}
