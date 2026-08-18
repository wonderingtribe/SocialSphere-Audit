import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSocialSphere } from '@/context/SocialSphereContext';
import { DataModePill, LeadRow, ScreenShell } from '@/components/SocialSphereUI';

export default function LeadsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { leads } = useSocialSphere();
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 92 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenShell
        eyebrow="AI Lead Engine"
        title="Signals, with context."
        subtitle="Every lead carries the evidence behind its score. No invented activity, no mystery automation."
      >
        <DataModePill mode="DEMO" />
        {leads.map((lead) => (
          <LeadRow key={lead.id} lead={lead} onPress={() => router.push(`/lead/${lead.id}`)} />
        ))}
      </ScreenShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
});