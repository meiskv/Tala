import { useLocalSearchParams, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function BoardDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Board", headerShown: true }} />
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <Text className="text-lg text-gray-800 dark:text-gray-200">
          Board: {id}
        </Text>
      </View>
    </>
  );
}
