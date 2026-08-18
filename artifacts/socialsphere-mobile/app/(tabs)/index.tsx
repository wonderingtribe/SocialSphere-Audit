import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSocialSphere } from '@/context/SocialSphereContext';
import {
  ConversationRow,
  DataModePill,
  MetricCard,
  PipelineBar,
  ScreenShell,
  SectionHeading,
} from '@/components/SocialSphereUI';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { leads, conversations } = useSocialSphere();
  const qualified = leads.filter((lead) => lead.status === 'QUALIFIED').length;
  const needsApproval = conversations.filter((conversation) => conversation.status === 'Needs approval').length;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 92 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenShell
        eyebrow="SocialSphere AI"
        title="Turn real signals into momentum."
        subtitle="Your command center for social conversations, qualified leads, and thoughtful follow-up."
      >
        <View style={[styles.banner, { backgroundColor: colors.foreground }]}>
          <View style={styles.bannerCopy}>
            <DataModePill mode="DEMO" />
            <Text style={[styles.bannerTitle, { color: colors.inverseForeground }]}>Preview the Lead Engine</Text>
            <Text style={[styles.bannerText, { color: colors.inverseForeground }]}>
              This workspace uses clearly labeled demo signals until you connect an official platform.
            </Text>
          </View>
          <Feather name="activity" color={colors.primaryForeground} size={28} />
        </View>

        <View style={styles.metrics}>
          <MetricCard value={String(leads.length)} label="Demo leads" icon="users" />
          <MetricCard value={String(qualified)} label="Qualified" icon="check-circle" tone="green" />
          <MetricCard value={String(needsApproval)} label="Needs approval" icon="message-square" tone="coral" />
        </View>

        <PipelineBar leads={leads} />

        <SectionHeading title="Inbox attention" action="Open inbox" onPress={() => router.push('/(tabs)/inbox')} />
        {conversations.slice(0, 1).map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            onPress={() => router.push(`/conversation/${conversation.id}`)}
          />
        ))}

        <View style={[styles.ruleCard, { backgroundColor: colors.secondary }]}>
          <Feather name="shield" size={18} color={colors.secondaryForeground} />
          <View style={styles.ruleCopy}>
            <Text style={[styles.ruleTitle, { color: colors.secondaryForeground }]}>Approval-first by design</Text>
            <Text style={[styles.ruleText, { color: colors.secondaryForeground }]}>
              SocialSphere suggests. Your team decides. Nothing sends until an authorized connection and approval exist.
            </Text>
          </View>
        </View>
      </ScreenShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
  banner: { borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 },
  bannerCopy: { flex: 1 },
  bannerTitle: { fontSize: 20, lineHeight: 25, fontWeight: '700', marginTop: 15 },
  bannerText: { fontSize: 12, lineHeight: 18, marginTop: 7 },
  metrics: { flexDirection: 'row', gap: 8, marginTop: 10 },
  ruleCard: { flexDirection: 'row', gap: 11, borderRadius: 18, padding: 15, marginTop: 18 },
  ruleCopy: { flex: 1 },
  ruleTitle: { fontSize: 13, fontWeight: '800' },
  ruleText: { fontSize: 12, lineHeight: 18, marginTop: 4 },
});