import { ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSocialSphere } from '@/context/SocialSphereContext';
import { ConversationRow, DataModePill, ScreenShell } from '@/components/SocialSphereUI';

export default function InboxScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { conversations } = useSocialSphere();
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 92 }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenShell
        eyebrow="Conversation Assistant"
        title="Review before you reply."
        subtitle="AI can understand the thread and prepare a thoughtful next step. Your team stays in control."
      >
        <DataModePill mode="DEMO" />
        {conversations.map((conversation) => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            onPress={() => router.push(`/conversation/${conversation.id}`)}
          />
        ))}
      </ScreenShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1 },
});