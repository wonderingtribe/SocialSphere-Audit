import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSocialSphere } from '@/context/SocialSphereContext';
import { DataModePill } from '@/components/SocialSphereUI';

export default function LeadDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getLead, advanceLead } = useSocialSphere();
  const lead = getLead(id);

  if (!lead) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.foreground }]}>Lead not found</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 30, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
        <Feather name="arrow-left" size={20} color={colors.foreground} />
        <Text style={[styles.backText, { color: colors.foreground }]}>Lead details</Text>
      </Pressable>
      <View style={[styles.hero, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarText, { color: colors.secondaryForeground }]}>
            {lead.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{lead.name}</Text>
        <Text style={[styles.username, { color: colors.mutedForeground }]}>{lead.username} · {lead.platform}</Text>
        <View style={styles.heroPills}>
          <DataModePill mode={lead.mode} />
          <View style={[styles.statusPill, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.statusPillText, { color: colors.secondaryForeground }]}>{lead.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.scoreRow}>
        <Score value={lead.leadScore} label="Lead score" />
        <Score value={lead.intentScore} label="Intent score" />
      </View>
      <InfoBlock title="Observed signal" value={lead.interaction} icon="activity" />
      <InfoBlock title="Engagement history" value={lead.history} icon="clock" />
      <InfoBlock title="Notes" value={lead.notes} icon="file-text" />
      <View style={[styles.metaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Meta label="Source" value={lead.source} />
        <Meta label="Campaign" value={lead.campaign} />
        <Meta label="Last interaction" value={lead.lastInteraction} />
        <Meta label="Next follow-up" value={lead.nextFollowUp} />
      </View>
      <Pressable
        onPress={() => advanceLead(lead.id)}
        style={({ pressed }) => [styles.advanceButton, { backgroundColor: colors.primary, opacity: pressed ? 0.82 : 1 }]}
      >
        <Feather name="arrow-up-right" size={17} color={colors.primaryForeground} />
        <Text style={[styles.advanceText, { color: colors.primaryForeground }]}>Advance demo stage</Text>
      </Pressable>
      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
        This action changes the local demo record only. Real stage changes will come from verified platform or website events.
      </Text>
    </ScrollView>
  );
}

function Score({ value, label }: { value: number; label: string }) {
  const colors = useColors();
  return (
    <View style={[styles.scoreCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.scoreValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

function InfoBlock({ title, value, icon }: { title: string; value: string; icon: keyof typeof Feather.glyphMap }) {
  const colors = useColors();
  return (
    <View style={[styles.infoBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={17} color={colors.primary} />
      <View style={styles.infoCopy}>
        <Text style={[styles.infoTitle, { color: colors.mutedForeground }]}>{title}</Text>
        <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
      </View>
    </View>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={styles.meta}>
      <Text style={[styles.metaLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 18, fontWeight: '700' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 18 },
  backText: { fontSize: 15, fontWeight: '700' },
  hero: { borderWidth: 1, borderRadius: 22, alignItems: 'center', padding: 20 },
  avatar: { width: 58, height: 58, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 18, fontWeight: '800' },
  name: { fontSize: 23, fontWeight: '700', marginTop: 13 },
  username: { fontSize: 13, marginTop: 4 },
  heroPills: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 },
  statusPill: { borderRadius: 99, paddingHorizontal: 9, paddingVertical: 5 },
  statusPillText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  scoreRow: { flexDirection: 'row', gap: 9, marginTop: 10 },
  scoreCard: { flex: 1, borderWidth: 1, borderRadius: 17, padding: 14 },
  scoreValue: { fontSize: 25, fontWeight: '800' },
  scoreLabel: { fontSize: 11, marginTop: 3 },
  infoBlock: { borderWidth: 1, borderRadius: 17, padding: 14, flexDirection: 'row', gap: 11, marginTop: 10 },
  infoCopy: { flex: 1 },
  infoTitle: { fontSize: 11, fontWeight: '700' },
  infoValue: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  metaCard: { borderWidth: 1, borderRadius: 17, padding: 14, marginTop: 10 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 7 },
  metaLabel: { fontSize: 12 },
  metaValue: { fontSize: 12, fontWeight: '700', textAlign: 'right', flexShrink: 1 },
  advanceButton: { borderRadius: 14, minHeight: 48, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 16 },
  advanceText: { fontSize: 14, fontWeight: '800' },
  disclaimer: { fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 10, paddingHorizontal: 10 },
});