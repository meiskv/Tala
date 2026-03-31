import { Pressable, Text, View } from "react-native";
import { Image } from "expo-image";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SymbolButtonProps {
  label: string;
  imagePath: string | null;
  bgColor?: string | null;
  size: number;
  onPress: () => void;
}

export function SymbolButton({
  label,
  imagePath,
  bgColor,
  size,
  onPress,
}: SymbolButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const imageSize = size * 0.6;

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        {
          width: size,
          height: size,
          backgroundColor: bgColor ?? "#F5F5F5",
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          padding: 4,
        },
      ]}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      {imagePath ? (
        <Image
          source={{ uri: imagePath }}
          style={{ width: imageSize, height: imageSize }}
          contentFit="contain"
          cachePolicy="disk"
        />
      ) : (
        <View
          style={{
            width: imageSize,
            height: imageSize,
            backgroundColor: "#E0E0E0",
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: imageSize * 0.4, color: "#999" }}>?</Text>
        </View>
      )}
      <Text
        numberOfLines={1}
        style={{
          fontSize: Math.max(10, size * 0.12),
          fontWeight: "600",
          color: "#333",
          marginTop: 2,
          textAlign: "center",
        }}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
