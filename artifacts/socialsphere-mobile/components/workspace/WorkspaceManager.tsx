import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColors } from '@/hooks/useColors';
import {
  WorkspaceWidget,
  type WidgetPosition,
} from './WorkspaceWidget';

export type WidgetLayout = WidgetPosition & { pinned: boolean; minimized: boolean };

export type WidgetDefinition = {
  id: string;
  title: string;
  icon: keyof typeof Feather.glyphMap;
  render: () => React.ReactNode;
};

type WorkspaceManagerProps = {
  widgets: WidgetDefinition[];
  storageKey?: string;
};

const WORLD_SCALE = 2.25;
const WIDGET_WIDTH = 316;
const STORAGE_DEBOUNCE_MS = 250;

const defaultLayout = (widgets: WidgetDefinition[], worldWidth: number): Record<string, WidgetLayout> => {
  const layout: Record<string, WidgetLayout> = {};
  let column = 0;
  let row = 0;
  widgets.forEach((widget, index) => {
    if (index > 0 && index % 2 === 0) {
      column = 0;
      row += 1;
    }
    layout[widget.id] = {
      x: 16 + column * (WIDGET_WIDTH + 18),
      y: 16 + row * 240,
      pinned: false,
      minimized: false,
    };
    column += 1;
  });
  return layout;
};

/**
 * Infinite-canvas workspace. Widgets live on a large world and can be dragged
 * anywhere (long-press then move), pinned in place, minimized to a bar, or
 * expanded to a half-screen overlay via the maximize control. The layout is
 * persisted per device.
 */
export function WorkspaceManager({ widgets, storageKey }: WorkspaceManagerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();

  const worldWidth = Math.round(Math.max(windowWidth * WORLD_SCALE, 700));
  const worldHeight = Math.round(Math.max(windowHeight * WORLD_SCALE, 900));

  const [layout, setLayout] = useState<Record<string, WidgetLayout>>(() =>
    defaultLayout(widgets, worldWidth),
  );
  const [maximizedId, setMaximizedId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const key = storageKey ?? 'socialsphere.workspace.v1';

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (!raw) return;
        const stored = JSON.parse(raw) as Record<string, WidgetLayout>;
        setLayout((current) => {
          const merged = { ...current };
          for (const [id, value] of Object.entries(stored)) {
            if (merged[id]) merged[id] = value;
          }
          return merged;
        });
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [key]);

  useEffect(() => {
    if (!loaded) return;
    if (persistTimer.current) clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      AsyncStorage.setItem(key, JSON.stringify(layout)).catch(() => {});
    }, STORAGE_DEBOUNCE_MS);
    return () => {
      if (persistTimer.current) clearTimeout(persistTimer.current);
    };
  }, [layout, loaded, key]);

  const updateWidget = useCallback(
    (id: string, patch: Partial<WidgetLayout>) => {
      setLayout((current) => {
        const existing = current[id];
        if (!existing) return current;
        return { ...current, [id]: { ...existing, ...patch } };
      });
    },
    [],
  );

  const resetLayout = useCallback(() => {
    setLayout(defaultLayout(widgets, worldWidth));
  }, [widgets, worldWidth]);

  const maximizedWidget = useMemo(
    () => widgets.find((widget) => widget.id === maximizedId),
    [widgets, maximizedId],
  );

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      onLayout={(event) => {
        // no-op: canvas height comes from window dimensions
        void event;
      }}
    >
      <View
        style={[
          styles.topBar,
          { paddingTop: insets.top + 8, paddingHorizontal: 16 },
        ]}
      >
        <View>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>SocialSphere AI</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Command center</Text>
        </View>
        <Pressable onPress={resetLayout} style={[styles.reset, { borderColor: colors.border }]} hitSlop={8}>
          <Feather name="layout" size={14} color={colors.foreground} />
          <Text style={[styles.resetText, { color: colors.foreground }]}>Reset</Text>
        </Pressable>
      </View>
      <View style={[styles.hintRow, { paddingHorizontal: 16 }]}>
        <Feather name="move" size={12} color={colors.mutedForeground} />
        <Text style={[styles.hint, { color: colors.mutedForeground }]}>
          Long-press any panel to move it · pin keeps it in place
        </Text>
      </View>

      <View style={styles.canvasFrame}>
        <ScrollView
          style={StyleSheet.absoluteFill}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            nestedScrollEnabled
          >
            <View
              style={[styles.world, { width: worldWidth, height: worldHeight }]}
              pointerEvents="auto"
            >
              {widgets.map((widget) => {
                const state = layout[widget.id] ?? defaultLayout([widget], worldWidth)[widget.id];
                return (
                  <WorkspaceWidget
                    key={widget.id}
                    id={widget.id}
                    title={widget.title}
                    icon={widget.icon}
                    position={{ x: state.x, y: state.y }}
                    width={WIDGET_WIDTH}
                    pinned={state.pinned}
                    minimized={state.minimized}
                    canvasWidth={worldWidth}
                    canvasHeight={worldHeight}
                    onMoveEnd={(id, position) => updateWidget(id, position)}
                    onTogglePin={(id) => updateWidget(id, { pinned: !layout[id]?.pinned })}
                    onToggleMinimize={(id) =>
                      updateWidget(id, { minimized: !layout[id]?.minimized })
                    }
                    onMaximize={(id) => setMaximizedId(id)}
                  >
                    {widget.render()}
                  </WorkspaceWidget>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {maximizedWidget ? (
        <View style={styles.overlay}>
          <View
            style={[
              styles.maxPanel,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                maxHeight: Math.round(windowHeight * 0.5),
              },
            ]}
          >
            <View style={styles.maxHeader}>
              <View style={styles.maxTitleRow}>
                <Feather name={maximizedWidget.icon} size={16} color={colors.primary} />
                <Text style={[styles.maxTitle, { color: colors.foreground }]}>{maximizedWidget.title}</Text>
              </View>
              <Pressable onPress={() => setMaximizedId(null)} hitSlop={8} style={styles.maxClose}>
                <Feather name="minimize-2" size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
            <View style={styles.maxBody}>{maximizedWidget.render()}</View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: 6 },
  eyebrow: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, marginTop: 3 },
  reset: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 },
  resetText: { fontSize: 11, fontWeight: '700' },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingBottom: 8 },
  hint: { fontSize: 10.5 },
  canvasFrame: { flex: 1, overflow: 'hidden' },
  world: {},
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', padding: 20 },
  maxPanel: { width: '100%', borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  maxHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11 },
  maxTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  maxTitle: { fontSize: 15, fontWeight: '800' },
  maxClose: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  maxBody: { paddingHorizontal: 14, paddingBottom: 16 },
});