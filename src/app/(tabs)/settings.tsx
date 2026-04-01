import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  FlatList,
} from "react-native";
import Slider from "@react-native-community/slider";
import * as Speech from "expo-speech";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons } from "@expo/vector-icons";
import { useProfileStore } from "@/shared/hooks/useProfileStore";
import { useThemeStore } from "@/shared/hooks/useThemeStore";
import { useColors } from "@/shared/hooks/useColors";
import { storage, StorageKeys } from "@/db/storage";
import { getAllProfiles, insertProfile, setActiveProfile as dbSetActiveProfile, deleteProfile, getActiveProfile } from "@/db/queries/profileQueries";
import { getSentenceHistory, clearSentenceHistory } from "@/db/queries/sentenceHistoryQueries";
import { useSentenceStore } from "@/shared/hooks/useSentenceStore";
import type { ComplexityLevel, UserProfile, SentenceSymbol, SentenceHistoryEntry } from "@/shared/types";
import { GRID_PRESETS } from "@/shared/constants/grid";

const COMPLEXITY_OPTIONS: { level: ComplexityLevel; label: string; description: string }[] = [
  { level: "emergent", label: "Emergent", description: "2x3 grid - Large buttons, simple" },
  { level: "core", label: "Core", description: "3x5 grid - Balanced vocabulary" },
  { level: "advanced", label: "Advanced", description: "4x7 grid - Full vocabulary" },
];

const THEME_OPTIONS = [
  { value: "system" as const, label: "System", icon: "phone-portrait" },
  { value: "light" as const, label: "Light", icon: "sunny" },
  { value: "dark" as const, label: "Dark", icon: "moon" },
];

const ORIENTATION_OPTIONS = [
  { value: "landscape" as const, label: "Landscape", icon: "tablet-landscape" },
  { value: "portrait" as const, label: "Portrait", icon: "tablet-portrait" },
  { value: "auto" as const, label: "Auto", icon: "sync" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const profile = useProfileStore((s) => s.activeProfile);
  const updateComplexity = useProfileStore((s) => s.updateComplexity);
  const setActiveProfileStore = useProfileStore((s) => s.setActiveProfile);

  const themeMode = useThemeStore((s) => s.mode);
  const setThemeMode = useThemeStore((s) => s.setMode);

  const loadFromHistory = useSentenceStore((s) => s.loadFromHistory);

  const [ttsRate, setTtsRate] = useState(
    storage.getNumber(StorageKeys.TTS_RATE) ?? 1.0
  );
  const [ttsPitch, setTtsPitch] = useState(
    storage.getNumber(StorageKeys.TTS_PITCH) ?? 1.0
  );
  const [voices, setVoices] = useState<Speech.Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState(
    storage.getString(StorageKeys.TTS_VOICE) ?? ""
  );
  const [showVoices, setShowVoices] = useState(false);

  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [showNewProfile, setShowNewProfile] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");

  const [history, setHistory] = useState<SentenceHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const [orientationLock, setOrientationLock] = useState(
    storage.getString(StorageKeys.ORIENTATION_LOCK) ?? "landscape"
  );

  const loadProfiles = useCallback(async () => {
    try {
      const all = await getAllProfiles();
      setProfiles(all);
    } catch {}
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const h = await getSentenceHistory(30);
      setHistory(h);
    } catch {}
  }, []);

  useEffect(() => {
    Speech.getAvailableVoicesAsync().then((v) => {
      const english = v.filter((voice) => voice.language.startsWith("en"));
      setVoices(english.length > 0 ? english : v);
    });
    loadProfiles();
  }, [loadProfiles]);

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

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoice(voiceId);
    storage.set(StorageKeys.TTS_VOICE, voiceId);
    setShowVoices(false);
  };

  const testVoice = () => {
    Speech.speak("Hello, I am your communication assistant.", {
      rate: ttsRate,
      pitch: ttsPitch,
      voice: selectedVoice || undefined,
    });
  };

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) return;
    const id = `profile-${Date.now()}`;
    const newProfile: UserProfile = {
      id,
      name: newProfileName.trim(),
      ageGroup: "child",
      complexityLevel: "emergent",
      gridRows: GRID_PRESETS.emergent.rows,
      gridCols: GRID_PRESETS.emergent.cols,
      isActive: false,
    };
    try {
      await insertProfile(newProfile);
      setNewProfileName("");
      setShowNewProfile(false);
      await loadProfiles();
    } catch {}
  };

  const handleSwitchProfile = async (p: UserProfile) => {
    try {
      await dbSetActiveProfile(p.id);
      const updated = await getActiveProfile();
      if (updated) setActiveProfileStore(updated);
      await loadProfiles();
    } catch {}
  };

  const handleDeleteProfile = (p: UserProfile) => {
    if (p.isActive) return;
    Alert.alert("Delete Profile", `Delete "${p.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteProfile(p.id);
          await loadProfiles();
        },
      },
    ]);
  };

  const handleOrientationChange = async (value: string) => {
    setOrientationLock(value);
    storage.set(StorageKeys.ORIENTATION_LOCK, value);
    if (value === "landscape") {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else if (value === "portrait") {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    } else {
      await ScreenOrientation.unlockAsync();
    }
  };

  const handleLoadSentence = (entry: SentenceHistoryEntry) => {
    try {
      const symbols: SentenceSymbol[] = JSON.parse(entry.symbolsJson);
      loadFromHistory(symbols);
      setShowHistory(false);
    } catch {}
  };

  const handleClearHistory = () => {
    Alert.alert("Clear History", "Delete all sentence history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          await clearSentenceHistory();
          setHistory([]);
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: 24 }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 24, color: colors.text }}>
        Settings
      </Text>

      <SectionHeader title="User Profiles" colors={colors} />
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        {profiles.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => handleSwitchProfile(p)}
            onLongPress={() => handleDeleteProfile(p)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              backgroundColor: p.isActive ? colors.accent : colors.card,
              borderWidth: p.isActive ? 0 : 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "600", color: p.isActive ? "#FFF" : colors.text }}>
              {p.name}
            </Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setShowNewProfile(!showNewProfile)}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 10,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            borderStyle: "dashed",
          }}
        >
          <Text style={{ fontSize: 14, color: colors.textSecondary }}>+ Add</Text>
        </Pressable>
      </View>
      {showNewProfile && (
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
          <TextInput
            placeholder="Profile name"
            placeholderTextColor={colors.textTertiary}
            value={newProfileName}
            onChangeText={setNewProfileName}
            style={{
              flex: 1,
              height: 40,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
              paddingHorizontal: 12,
              fontSize: 14,
              color: colors.text,
              backgroundColor: colors.card,
            }}
          />
          <Pressable
            onPress={handleAddProfile}
            style={{
              height: 40,
              paddingHorizontal: 16,
              borderRadius: 8,
              backgroundColor: colors.accent,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFF", fontWeight: "600" }}>Save</Text>
          </Pressable>
        </View>
      )}

      <SectionHeader title="Grid Complexity" colors={colors} />
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
                backgroundColor: isActive ? colors.accent : colors.card,
                borderWidth: isActive ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: isActive ? "#FFF" : colors.text,
                  marginBottom: 4,
                }}
              >
                {option.label}
              </Text>
              <Text style={{ fontSize: 12, color: isActive ? "#E3F2FD" : colors.textTertiary }}>
                {option.description}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Theme" colors={colors} />
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        {THEME_OPTIONS.map((opt) => {
          const isActive = themeMode === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => setThemeMode(opt.value)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 12,
                borderRadius: 12,
                backgroundColor: isActive ? colors.accent : colors.card,
                borderWidth: isActive ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name={opt.icon as any} size={18} color={isActive ? "#FFF" : colors.text} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: isActive ? "#FFF" : colors.text }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Orientation" colors={colors} />
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
        {ORIENTATION_OPTIONS.map((opt) => {
          const isActive = orientationLock === opt.value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => handleOrientationChange(opt.value)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: 12,
                borderRadius: 12,
                backgroundColor: isActive ? colors.accent : colors.card,
                borderWidth: isActive ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <Ionicons name={opt.icon as any} size={18} color={isActive ? "#FFF" : colors.text} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: isActive ? "#FFF" : colors.text }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title={`Speech Rate: ${ttsRate.toFixed(1)}x`} colors={colors} />
      <Slider
        style={{ height: 40, marginBottom: 16 }}
        minimumValue={0.3}
        maximumValue={2.0}
        step={0.1}
        value={ttsRate}
        onSlidingComplete={handleRateChange}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
      />

      <SectionHeader title={`Speech Pitch: ${ttsPitch.toFixed(1)}x`} colors={colors} />
      <Slider
        style={{ height: 40, marginBottom: 16 }}
        minimumValue={0.5}
        maximumValue={2.0}
        step={0.1}
        value={ttsPitch}
        onSlidingComplete={handlePitchChange}
        minimumTrackTintColor={colors.accent}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.accent}
      />

      <SectionHeader title="Voice" colors={colors} />
      <Pressable
        onPress={() => setShowVoices(!showVoices)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          padding: 14,
          borderRadius: 12,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          marginBottom: 8,
        }}
      >
        <Text style={{ fontSize: 14, color: colors.text }}>
          {selectedVoice
            ? voices.find((v) => v.identifier === selectedVoice)?.name ?? selectedVoice
            : "System Default"}
        </Text>
        <Ionicons name={showVoices ? "chevron-up" : "chevron-down"} size={18} color={colors.textSecondary} />
      </Pressable>
      {showVoices && (
        <View style={{ maxHeight: 200, marginBottom: 16, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: colors.border }}>
          <FlatList
            data={voices}
            keyExtractor={(item) => item.identifier}
            renderItem={({ item }) => {
              const isActive = selectedVoice === item.identifier;
              return (
                <Pressable
                  onPress={() => handleVoiceSelect(item.identifier)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    padding: 12,
                    backgroundColor: isActive ? `${colors.accent}22` : colors.background,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 13, color: colors.text }}>{item.name}</Text>
                  <Text style={{ fontSize: 11, color: colors.textTertiary }}>{item.language}</Text>
                  {isActive && <Ionicons name="checkmark" size={18} color={colors.accent} style={{ marginLeft: 8 }} />}
                </Pressable>
              );
            }}
          />
        </View>
      )}

      <Pressable
        onPress={testVoice}
        style={{
          backgroundColor: colors.success,
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
          Test Voice
        </Text>
      </Pressable>

      <SectionHeader title="Sentence History" colors={colors} />
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <Pressable
          onPress={() => { setShowHistory(!showHistory); if (!showHistory) loadHistory(); }}
          style={{
            flex: 1,
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: "center",
          }}
        >
          <Text style={{ color: colors.text, fontWeight: "600" }}>
            {showHistory ? "Hide History" : "Show History"}
          </Text>
        </Pressable>
        <Pressable
          onPress={handleClearHistory}
          style={{
            padding: 14,
            borderRadius: 12,
            backgroundColor: colors.danger,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFF", fontWeight: "600" }}>Clear</Text>
        </Pressable>
      </View>
      {showHistory && (
        <View style={{ marginBottom: 24 }}>
          {history.length === 0 ? (
            <Text style={{ color: colors.textTertiary, textAlign: "center", padding: 16 }}>
              No sentence history yet
            </Text>
          ) : (
            history.map((entry) => {
              let symbols: SentenceSymbol[] = [];
              try { symbols = JSON.parse(entry.symbolsJson); } catch {}
              const text = symbols.map((s) => s.vocalization).join(" ");
              return (
                <Pressable
                  key={entry.id}
                  onPress={() => handleLoadSentence(entry)}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    backgroundColor: colors.card,
                    marginBottom: 6,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 14, color: colors.text }}>{text}</Text>
                  <Text style={{ fontSize: 11, color: colors.textTertiary, marginTop: 4 }}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SectionHeader({ title, colors }: { title: string; colors: Record<string, string> }) {
  return (
    <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12, color: colors.text }}>
      {title}
    </Text>
  );
}
