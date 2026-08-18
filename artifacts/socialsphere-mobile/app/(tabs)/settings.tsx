import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Constants from 'expo-constants';
import {
  useCreateCheckout,
  useGetSubscription,
  useListWebhookEvents,
  useListWebhookSettings,
} from '@workspace/api-client-react';
import { useColors } from '@/hooks/useColors';
import { useSocialSphere } from '@/context/SocialSphereContext';
import { ScreenShell } from '@/components/SocialSphereUI';

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { integrations } = useSocialSphere();

  const subscriptionQuery = useGetSubscription();
  const webhookSettingsQuery = useListWebhookSettings();
  const webhookEventsQuery = useListWebhookEvents();
  const checkoutMutation = useCreateCheckout();

  const [upgrading, setUpgrading] = useState(false);

  const subscription = subscriptionQuery.data;
  const webhookSettings = webhookSettingsQuery.data;
  const webhookEvents = webhookEventsQuery.data ?? [];

  const connectedCount = integrations.filter((integration) => integration.connected).length;

  const handleUpgrade = async (plan: 'starter' | 'pro') => {
    setUpgrading(true);
    try {
      checkoutMutation.mutate(
        { data: { plan } },
        {
          onSuccess: async (result) => {
            if (!result.url) {
              Alert.alert('Billing unavailable', 'Stripe is not configured for this workspace yet.');
              return;
            }
            await WebBrowser.openBrowserAsync(result.url);
          },
          onError: () => {
            Alert.alert('Billing unavailable', 'Stripe is not configured. Set STRIPE_SECRET_KEY to enable billing.');
          },
        },
      );
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 92 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenShell eyebrow="Settings" title="Workspace settings" subtitle="Plan, platform webhooks, and account information.">
        <Section title="Subscription">
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardRow}>
              <Feather name="credit-card" size={17} color={colors.primary} />
              <View style={styles.cardCopy}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {(subscription?.plan ?? 'free').toUpperCase()}
                </Text>
                <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
                  {subscription?.status ?? 'inactive'}
                  {subscription?.currentPeriodEnd
                    ? ` · renews ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                    : ''}
                </Text>
              </View>
            </View>
            {subscription?.stripeConfigured ? (
              <Pressable
                onPress={() => handleUpgrade('pro')}
                disabled={upgrading}
                style={({ pressed }) => [styles.button, { backgroundColor: colors.primary, opacity: pressed ? 0.8 : upgrading ? 0.6 : 1 }]}
              >
                <Feather name="zap" size={15} color={colors.primaryForeground} />
                <Text style={[styles.buttonText, { color: colors.primaryForeground }]}>
                  {upgrading ? 'Opening checkout…' : 'Upgrade to Pro'}
                </Text>
              </Pressable>
            ) : (
              <Text style={[styles.mutedNote, { color: colors.mutedForeground }]}>
                Billing is not configured for this workspace. Stripe checkout will appear once STRIPE_SECRET_KEY is set.
              </Text>
            )}
          </View>
        </Section>

        <Section title="Platform webhooks">
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
              Platforms like Instagram and Facebook verify that your callback URL is reachable before sending real-time events. Register the values below in each platform's developer dashboard.
            </Text>
            {(webhookSettings?.settings ?? []).map((setting) => (
              <View key={setting.platform} style={[styles.webhookRow, { borderColor: colors.border }]}>
                <View style={styles.webhookHeader}>
                  <Text style={[styles.webhookPlatform, { color: colors.foreground }]}>{setting.platform}</Text>
                  {setting.requiresWebhook ? (
                    <Text style={[styles.webhookBadge, { color: colors.accentForeground, backgroundColor: colors.accent }]}>
                      webhook required
                    </Text>
                  ) : null}
                </View>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>CALLBACK URL</Text>
                <Text selectable style={[styles.mono, { color: colors.foreground }]}>{setting.callbackUrl}</Text>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>VERIFY TOKEN</Text>
                <Text selectable style={[styles.mono, { color: colors.foreground }]}>{setting.verifyToken}</Text>
              </View>
            ))}
          </View>

          <Section title="Recent events">
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {webhookEvents.length === 0 ? (
                <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
                  No webhook events received yet. Once a platform is connected and its webhook is registered, real-time events will appear here.
                </Text>
              ) : (
                webhookEvents.map((event) => (
                  <View key={event.id} style={[styles.eventRow, { borderColor: colors.border }]}>
                    <Feather name="radio" size={14} color={colors.primary} />
                    <Text style={[styles.eventText, { color: colors.foreground }]}>
                      {event.platform} · {event.eventType}
                    </Text>
                    <Text style={[styles.eventTime, { color: colors.mutedForeground }]}>
                      {new Date(event.receivedAt).toLocaleTimeString()}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </Section>
        </Section>

        <Section title="Connections">
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardRow}>
              <Feather name="link" size={17} color={colors.primary} />
              <View style={styles.cardCopy}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                  {connectedCount} of {integrations.length} connected
                </Text>
                <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
                  Official OAuth connections only. Never simulated.
                </Text>
              </View>
            </View>
          </View>
        </Section>

        <Section title="Privacy">
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
              SocialSphere only stores engagement and conversation data that flows through
              official platform APIs and approved webhooks. Lead records are labeled
              REAL, DEMO, or NOT CONNECTED so you always know where data came from.
              No credentials are collected or stored by the app.
            </Text>
          </View>
        </Section>

        <Section title="App">
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardRow}>
              <Feather name="smartphone" size={17} color={colors.primary} />
              <View style={styles.cardCopy}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>SocialSphere AI Mobile</Text>
                <Text style={[styles.cardMeta, { color: colors.mutedForeground }]}>
                  v{Constants.default.expoConfig?.version ?? '1.0.0'} · {Constants.default.expoConfig?.name}
                </Text>
              </View>
            </View>
          </View>
        </Section>
      </ScreenShell>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  section: { marginTop: 22 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 11 },
  card: { borderWidth: 1, borderRadius: 18, padding: 15 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardCopy: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardMeta: { fontSize: 12, lineHeight: 18, marginTop: 4 },
  mutedNote: { fontSize: 12, lineHeight: 18, marginTop: 12 },
  button: { minHeight: 44, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 13 },
  buttonText: { fontSize: 13, fontWeight: '800' },
  webhookRow: { borderTopWidth: 1, paddingTop: 13, marginTop: 13 },
  webhookHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  webhookPlatform: { fontSize: 14, fontWeight: '700', textTransform: 'capitalize' },
  webhookBadge: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4, borderRadius: 99, paddingHorizontal: 8, paddingVertical: 4 },
  fieldLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8, marginTop: 8 },
  mono: { fontSize: 12, marginTop: 3, fontVariant: ['tabular-nums'] },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, paddingTop: 11, marginTop: 11 },
  eventText: { flex: 1, fontSize: 12, fontWeight: '600' },
  eventTime: { fontSize: 11 },
});