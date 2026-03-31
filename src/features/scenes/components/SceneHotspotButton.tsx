import { Pressable, Text } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { getSymbolImageUrl } from "@/features/symbols/arasaacApi";
import type { SceneHotspot } from "@/shared/types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HOTSPOT_SIZE = 80;
const IMAGE_SIZE = 50;

interface SceneHotspotButtonProps {
  hotspot: SceneHotspot;
  onPress: (hotspot: SceneHotspot) => void;
}

export function SceneHotspotButton({
  hotspot,
  onPress,
}: SceneHotspotButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.88, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const imageUrl = getSymbolImageUrl(hotspot.arasaacId);

  return (
    <AnimatedPressable
      onPress={() => onPress(hotspot)}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          position: "absolute",
          left: `${hotspot.x}%`,
          top: `${hotspot.y}%`,
          width: HOTSPOT_SIZE,
          height: HOTSPOT_SIZE,
          marginLeft: -HOTSPOT_SIZE / 2,
          marginTop: -HOTSPOT_SIZE / 2,
          backgroundColor: "rgba(255,255,255,0.92)",
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
          elevation: 4,
        },
      ]}
      accessibilityLabel={hotspot.label}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: imageUrl }}
        style={{ width: IMAGE_SIZE, height: IMAGE_SIZE }}
        contentFit="contain"
        cachePolicy="disk"
      />
      <Text
        numberOfLines={1}
        style={{
          fontSize: 10,
          fontWeight: "700",
          color: "#333",
          marginTop: 1,
          textAlign: "center",
        }}
      >
        {hotspot.label}
      </Text>
    </AnimatedPressable>
  );
}
