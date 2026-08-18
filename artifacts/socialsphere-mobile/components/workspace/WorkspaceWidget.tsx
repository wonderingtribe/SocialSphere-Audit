import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/useColors';

export type WidgetPosition = { x: number; y: number };

export type WorkspaceWidgetProps = {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  position: WidgetPosition;
  width: number;
  pinned: boolean;
  minimized: boolean;
  canvasWidth: number;
  canvasHeight: number;
  onMoveEnd: (id: string, position: WidgetPosition) => void;
  onTogglePin: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  children: React.ReactNode;
};

export function WorkspaceWidget({
  id,
  title,
  icon,
  position,
  width,
  pinned,
  minimized,
  canvasWidth,
  canvasHeight,
  onMoveEnd,
  onTogglePin,
  onToggleMinimize,
  onMaximize,
  children,
}: WorkspaceWidgetProps) {
  const colors = useColors();
  const translateX = useSharedValue(position.x);
  const translateY = useSharedValue(position.y);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  useEffect(() => {
    translateX.value = position.x;
    translateY.value = position.y;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position.x, position.y]);

  const clampX = (value: number) =>
    Math.min(Math.max(value, -8), Math.max(canvasWidth - width + 8, -8));
  const clampY = (value: number) =>
    Math.min(Math.max(value, -8), Math.max(canvasHeight - 64 + 8, -8));

  const pan = Gesture.Pan()
    .enabled(!pinned)
    .activateAfterLongPress(220)
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = clampX(startX.value + event.translationX);
      translateY.value = clampY(startY.value + event.translationY);
    })
    .onEnd(() => {
      runOnJS(onMoveEnd)(id, {
        x: Math.round(translateX.value),
        y: Math.round(translateY.value),
      });
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.layer,
        { width },
        animatedStyle,
        { zIndex: minimized ? 1 : 3 },
      ]}
    >
      <GestureDetector gesture={pan}>
        <View
          style={[
            styles.widget,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              ...(pinned ? { backgroundColor: colors.secondary, borderColor: colors.border } : {}),
            },
          ]}
        >
          <View style={styles.header}>
            <View style={[styles.dragZone, { opacity: pinned ? 0.4 : 1 }]}>
              <View style={[styles.titleRow, { flexDirection: 'row' }]}>
                <Feather name={icon} size={15} color={pinned ? colors.success : colors.primary} />
                <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
                {pinned ? (
                  <Feather name="anchor" size={11} color={colors.success} />
                ) : null}
              </View>
            </View>
            <View style={styles.controls}>
              {minimized ? (
                <Pressable onPress={() => onToggleMinimize(id)} hitSlop={8} style={styles.control}>
                  <Feather name="chevron-down" size={17} color={colors.mutedForeground} />
                </Pressable>
              ) : (
                <>
                  <Pressable onPress={() => onToggleMinimize(id)} hitSlop={8} style={styles.control}>
                    <Feather name="minus" size={16} color={colors.mutedForeground} />
                  </Pressable>
                  <Pressable onPress={() => onTogglePin(id)} hitSlop={8} style={styles.control}>
                    <Feather name={pinned ? 'anchor' : 'anchor'} size={15} color={pinned ? colors.success : colors.mutedForeground} />
                  </Pressable>
                  <Pressable onPress={() => onMaximize(id)} hitSlop={8} style={styles.control}>
                    <Feather name="maximize-2" size={15} color={colors.mutedForeground} />
                  </Pressable>
                </>
              )}
            </View>
          </View>
          {!minimized ? (
            <View style={styles.body}>{children}</View>
          ) : null}
        </View>
      </GestureDetector>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', top: 0, left: 0 },
  widget: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  dragZone: { flex: 1 },
  titleRow: { alignItems: 'center', gap: 7 },
  title: { fontSize: 12, fontWeight: '700', flexShrink: 1 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  control: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingHorizontal: 12, paddingBottom: 12 },
});