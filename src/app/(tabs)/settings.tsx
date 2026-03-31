import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Speech from "expo-speech";
import { useProfileStore } from "@/shared/hooks/useProfileStore";
import { storage, StorageKeys } from "@/db/storage";
import type { ComplexityLevel } from "@/shared/types";
import { GRID_PRESETS } from "@/shared/constants/grid";

const COMPLEXITY_OPTIONS: { level: ComplexityLevel; label: string; description: string }[] = [
  { level: "emergent", label: "Emergent", description: "2x3 grid - Large buttons, simple" },
  { level: "core", label: "Core", description: "3x5 grid - Balanced vocabulary" },
  { level: "advanced", label: "Advanced", description: "4x7 grid - Full vocabulary" },
];

export default function SettingsScreen() {
  const profile = useProfileStore((s) => s.activeProfile);
  const updateComplexity = useProfileStore((s) => s.updateComplexity);

  const [ttsRate, setTtsRate] = useState(
    storage.getNumber(StorageKeys.TTS_RATE) ?? 1.0
  );
  const [ttsPitch, setTtsPitch] = useState(
    storage.getNumber(StorageKeys.TTS_PITCH) ?? 1.0
  );

  const handleRateChange = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    setTtsRate(rounded);
    storage.set(StorageKeys.TTS_RATE, rounded);
  };

  const handlePitchChange = (value: number) => {
    const rounded = Math.round(value * 10) / 10;
    setTtsPitch(rounded);
    storage.set(StorageKeys.TTS_PITCH, rounded);
  };

  const testVoice = () => {
    Speech.speak("Hello, I am your communication assistant.", {
      rate: ttsRate,
      pitch: ttsPitch,
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#FFF" }}
      contentContainerStyle={{ padding: 24 }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 24, color: "#333" }}>
        Settings
      </Text>

      {/* Complexity Level */}
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12, color: "#333" }}>
        Grid Complexity
      </Text>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        {COMPLEXITY_OPTIONS.map((option) => {
          const isActive = profile?.complexityLevel === option.level;
          return (
            <Pressable
              key={option.level}
              onPress={() => updateComplexity(option.level)}
              style={{
                flex: 1,
                padding: 16,
                borderRadius: 12,
                backgroundColor: isActive ? "#4FC3F7" : "#F5F5F5",
                borderWidth: isActive ? 0 : 1,
                borderColor: "#E0E0E0",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: isActive ? "#FFF" : "#333",
                  marginBottom: 4,
                }}
              >
                {option.label}
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: isActive ? "#E3F2FD" : "#999",
                }}
              >
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Speech Rate */}
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8, color: "#333" }}>
        Speech Rate: {ttsRate.toFixed(1)}x
      </Text>
      <Slider
        style={{ height: 40, marginBottom: 16 }}
        minimumValue={0.3}
        maximumValue={2.0}
        step={0.1}
        value={ttsRate}
        onSlidingComplete={handleRateChange}
        minimumTrackTintColor="#4FC3F7"
        maximumTrackTintColor="#E0E0E0"
        thumbTintColor="#4FC3F7"
      />

      {/* Speech Pitch */}
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 8, color: "#333" }}>
        Speech Pitch: {ttsPitch.toFixed(1)}x
      </Text>
      <Slider
        style={{ height: 40, marginBottom: 24 }}
        minimumValue={0.5}
        maximumValue={2.0}
        step={0.1}
        value={ttsPitch}
        onSlidingComplete={handlePitchChange}
        minimumTrackTintColor="#4FC3F7"
        maximumTrackTintColor="#E0E0E0"
        thumbTintColor="#4FC3F7"
      />

      {/* Test Voice */}
      <Pressable
        onPress={testVoice}
        style={{
          backgroundColor: "#4CAF50",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
          Test Voice
        </Text>
      </Pressable>
    </ScrollView>
  );
}
