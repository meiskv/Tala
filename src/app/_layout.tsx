import "../global.css";

import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as ScreenOrientation from "expo-screen-orientation";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useColorScheme, View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "react-native-reanimated";
import { getDatabase } from "@/db/database";
import { needsSeeding, seedDatabase, markAsSeeded } from "@/db/seed";
import { useProfileStore } from "@/shared/hooks/useProfileStore";
import { getActiveProfile } from "@/db/queries/profileQueries";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const [seedProgress, setSeedProgress] = useState("");
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);

  useEffect(() => {
    ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.LANDSCAPE
    );
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        await getDatabase();

        if (needsSeeding()) {
          setSeedProgress("Setting up your communication board...");
          await seedDatabase((done, total) => {
            setSeedProgress(`Downloading symbols... ${done}/${total}`);
          });
          markAsSeeded();
        }

        const profile = await getActiveProfile();
        if (profile) {
          setActiveProfile(profile);
        }

        setIsReady(true);
      } catch (error) {
        console.error("Initialization error:", error);
        setIsReady(true);
      }
    }

    initialize();
  }, [setActiveProfile]);

  if (!isReady) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF",
          }}
        >
          <ActivityIndicator size="large" color="#4FC3F7" />
          <Text style={{ marginTop: 16, fontSize: 18, color: "#333", fontWeight: "600" }}>
            AAC
          </Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: "#999" }}>
            {seedProgress || "Initializing..."}
          </Text>
        </View>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="board/[id]" options={{ headerShown: true }} />
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
