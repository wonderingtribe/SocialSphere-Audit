import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSocialSphere } from '@/context/SocialSphereContext';
import { DataModePill, ScreenShell } from '@/components/SocialSphereUI';

export default function IntegrationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { integrations } = useSocialSphere();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 92 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenShell
        eyebrow="Connections"
        title="Bring your own signals."
        subtitle="Connect through official OAuth scopes. SocialSphere never bypasses authentication, rate limits, or platform policies."
      >
        <View style={[styles.notice, { backgroundColor: colors.accent }]}>
          <Feather name="lock" size={17} color={colors.accentForeground} />
          <Text style={[styles.noticeText, { color: colors.accentForeground }]}>
            Connections are not active in this preview. No platform data is being collected.
          </Text>
        </View>
        {integrations.map((integration) => (
          <View key={integration.id} style={[styles.integrationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.integrationIcon, { backgroundColor: colors.secondary }]}>
              <Feather name={integration.icon as keyof typeof Feather.glyphMap} size={20} color={colors.secondaryForeground} />
            </View>
            <View style={styles.integrationCopy}>
              <View style={styles.integrationTitleRow}>
                <Text style={[styles.integrationTitle, { color: colors.foreground }]}>{integration.name}</Text>
                <DataModePill mode="NOT_CONNECTED" />
              </View>
              <Text style={[styles.integrationDescription, { color: colors.mutedForeground }]}>{integration.description}</Text>
              <Pressable
                onPress={() =>
                  Alert.alert(
                    'Official connection workflow',
                    `The ${integration.name} OAuth flow will be added before this platform can be connected. This preview will not simulate a connection.`,
                  )
                }
                style={({ pressed }) => [styles.connectButton, { borderColor: colors.border, opacity: pressed ? 0.7 : 1 }]}
              >
                <Feather name="external-link" size={14} color={colors.foreground} />
                <Text style={[styles.connectText, { color: colors.foreground }]}>Connection workflow coming next</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScreenShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  notice: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderRadius: 16, padding: 14, marginBottom: 13 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '600' },
  integrationCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, borderWidth: 1, borderRadius: 18, padding: 14, marginBottom: 10 },
  integrationIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  integrationCopy: { flex: 1 },
  integrationTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  integrationTitle: { fontSize: 15, fontWeight: '700' },
  integrationDescription: { fontSize: 12, lineHeight: 18, marginTop: 5 },
  connectButton: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10, alignSelf: 'flex-start', marginTop: 11 },
  connectText: { fontSize: 10, fontWeight: '700' },
});