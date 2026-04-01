import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { storage, StorageKeys } from "@/db/storage";
import { useProfileStore } from "@/shared/hooks/useProfileStore";
import { getActiveProfile, setActiveProfile as dbSetActive, updateProfile } from "@/db/queries/profileQueries";
import { GRID_PRESETS } from "@/shared/constants/grid";
import type { AgeGroup, ComplexityLevel, UserProfile } from "@/shared/types";

const AGE_OPTIONS: { value: AgeGroup; label: string; icon: string }[] = [
  { value: "child", label: "Child", icon: "happy" },
  { value: "teen", label: "Teen", icon: "person" },
  { value: "adult", label: "Adult", icon: "people" },
];

const COMPLEXITY_OPTIONS: { value: ComplexityLevel; label: string; description: string }[] = [
  { value: "emergent", label: "Simple", description: "Large buttons, fewer options" },
  { value: "core", label: "Balanced", description: "Core vocabulary" },
  { value: "advanced", label: "Full", description: "Maximum vocabulary" },
];

export default function OnboardingScreen() {
  const setActiveProfile = useProfileStore((s) => s.setActiveProfile);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("child");
  const [complexity, setComplexity] = useState<ComplexityLevel>("emergent");

  const handleFinish = async () => {
    const grid = GRID_PRESETS[complexity];
    const profileData: UserProfile = {
      id: "default",
      name: name.trim() || "User",
      ageGroup,
      complexityLevel: complexity,
      gridRows: grid.rows,
      gridCols: grid.cols,
      isActive: true,
    };

    try {
      await dbSetActive("default");
      const existing = await getActiveProfile();
      if (existing) {
        await updateProfile(profileData);
      }
    } catch {}

    setActiveProfile(profileData);
    storage.set(StorageKeys.HAS_ONBOARDED, true);
    router.replace("/(tabs)");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", padding: 32 }}>
      {step === 0 && (
        <View style={{ alignItems: "center", width: "100%" }}>
          <Ionicons name="chatbubbles" size={64} color="#4FC3F7" />
          <Text style={{ fontSize: 28, fontWeight: "700", color: "#333", marginTop: 16 }}>
            Welcome to Tala
          </Text>
          <Text style={{ fontSize: 16, color: "#666", marginTop: 8, textAlign: "center" }}>
            {"Let's set up your communication board"}
          </Text>
          <TextInput
            placeholder="Enter name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
            style={{
              width: "80%",
              maxWidth: 300,
              height: 48,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E0E0E0",
              paddingHorizontal: 16,
              fontSize: 16,
              color: "#333",
              marginTop: 24,
              textAlign: "center",
            }}
          />
          <Pressable
            onPress={() => setStep(1)}
            style={{
              marginTop: 24,
              backgroundColor: "#4FC3F7",
              paddingHorizontal: 48,
              paddingVertical: 14,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Next</Text>
          </Pressable>
        </View>
      )}

      {step === 1 && (
        <View style={{ alignItems: "center", width: "100%" }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 24 }}>
            Age Group
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {AGE_OPTIONS.map((opt) => {
              const isActive = ageGroup === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setAgeGroup(opt.value)}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 16,
                    backgroundColor: isActive ? "#4FC3F7" : "#F5F5F5",
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: isActive ? 0 : 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <Ionicons name={opt.icon as any} size={32} color={isActive ? "#FFF" : "#666"} />
                  <Text style={{ marginTop: 8, fontWeight: "600", color: isActive ? "#FFF" : "#333" }}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 16, marginTop: 32 }}>
            <Pressable onPress={() => setStep(0)} style={{ paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0" }}>
              <Text style={{ color: "#666", fontWeight: "600" }}>Back</Text>
            </Pressable>
            <Pressable onPress={() => setStep(2)} style={{ paddingHorizontal: 48, paddingVertical: 14, borderRadius: 12, backgroundColor: "#4FC3F7" }}>
              <Text style={{ color: "#FFF", fontWeight: "600" }}>Next</Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === 2 && (
        <View style={{ alignItems: "center", width: "100%" }}>
          <Text style={{ fontSize: 22, fontWeight: "700", color: "#333", marginBottom: 24 }}>
            Grid Size
          </Text>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {COMPLEXITY_OPTIONS.map((opt) => {
              const isActive = complexity === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => setComplexity(opt.value)}
                  style={{
                    width: 120,
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: isActive ? "#4FC3F7" : "#F5F5F5",
                    alignItems: "center",
                    borderWidth: isActive ? 0 : 1,
                    borderColor: "#E0E0E0",
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700", color: isActive ? "#FFF" : "#333" }}>
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: isActive ? "#E3F2FD" : "#999", marginTop: 4, textAlign: "center" }}>
                    {opt.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <View style={{ flexDirection: "row", gap: 16, marginTop: 32 }}>
            <Pressable onPress={() => setStep(1)} style={{ paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: "#E0E0E0" }}>
              <Text style={{ color: "#666", fontWeight: "600" }}>Back</Text>
            </Pressable>
            <Pressable onPress={handleFinish} style={{ paddingHorizontal: 48, paddingVertical: 14, borderRadius: 12, backgroundColor: "#4CAF50" }}>
              <Text style={{ color: "#FFF", fontWeight: "600" }}>Get Started</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
