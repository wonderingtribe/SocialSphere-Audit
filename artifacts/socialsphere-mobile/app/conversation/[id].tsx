import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useSocialSphere } from '@/context/SocialSphereContext';
import { DataModePill } from '@/components/SocialSphereUI';

export default function ConversationDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getConversation, getLead, approveConversation } = useSocialSphere();
  const conversation = getConversation(id);
  const lead = conversation ? getLead(conversation.leadId) : undefined;
  const [reply, setReply] = useState(conversation?.suggestion ?? '');
  const [submitting, setSubmitting] = useState(false);

  if (!conversation || !lead) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.notFound, { color: colors.foreground }]}>Conversation not found</Text>
      </View>
    );
  }

  const isAlreadyApproved = conversation.replyStatus === 'approved' || conversation.replyStatus === 'sent';

  const handleApprove = async () => {
    if (!reply.trim()) {
      Alert.alert('Empty reply', 'Write a reply before approving it.');
      return;
    }
    setSubmitting(true);
    try {
      const delivery = await approveConversation(conversation.id, reply.trim());
      if (!delivery) {
        Alert.alert('Could not approve', 'The server could not save this reply.');
        return;
      }
      Alert.alert(
        delivery === 'queued' ? 'Reply queued' : 'Reply approved',
        delivery === 'queued'
          ? 'The response has been sent through the connected platform account.'
          : 'The reply is saved and approved. It will be sent once the official platform account is connected — SocialSphere never simulates a send.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top + 18, paddingBottom: insets.bottom + 30, paddingHorizontal: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
        <Feather name="arrow-left" size={20} color={colors.foreground} />
        <Text style={[styles.backText, { color: colors.foreground }]}>Conversation review</Text>
      </Pressable>
      <View style={styles.headerRow}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarText, { color: colors.secondaryForeground }]}>
            {conversation.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.headerCopy}>
          <Text style={[styles.name, { color: colors.foreground }]}>{conversation.name}</Text>
          <Text style={[styles.username, { color: colors.mutedForeground }]}>{conversation.username} · {conversation.platform}</Text>
        </View>
        <DataModePill mode={conversation.mode} />
      </View>
      <View style={[styles.message, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.messageLabel, { color: colors.mutedForeground }]}>INBOUND MESSAGE</Text>
        <Text style={[styles.messageText, { color: colors.foreground }]}>{conversation.preview}</Text>
      </View>
      <View style={styles.signalRow}>
        <Signal icon="target" label="Intent" value={conversation.intent} />
        <Signal icon="heart" label="Sentiment" value={conversation.sentiment} />
      </View>
      <View style={[styles.suggestion, { backgroundColor: colors.secondary }]}>
        <View style={styles.suggestionHeader}>
          <Feather name="cpu" size={17} color={colors.secondaryForeground} />
          <Text style={[styles.suggestionTitle, { color: colors.secondaryForeground }]}>AI suggested response</Text>
        </View>
        <Text style={[styles.suggestionText, { color: colors.secondaryForeground }]}>
          Generated from this thread and the observed lead context. Review before sending.
        </Text>
        <TextInput
          value={reply}
          onChangeText={setReply}
          multiline
          editable={!isAlreadyApproved}
          style={[styles.replyInput, {
            backgroundColor: colors.card,
            color: colors.foreground,
            borderColor: colors.border,
            ...(isAlreadyApproved ? { opacity: 0.7 } : {}),
          }]}
          placeholder="Write the response to send…"
          placeholderTextColor={colors.mutedForeground}
        />
        {isAlreadyApproved ? (
          <Text style={[styles.approvedFootnote, { color: colors.secondaryForeground }]}>
            This reply is {conversation.replyStatus === 'sent' ? 'sent' : 'approved'} — edit it on the platform before delivery if needed.
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={handleApprove}
        disabled={submitting || isAlreadyApproved}
        style={({ pressed }) => [
          styles.approveButton,
          {
            backgroundColor: isAlreadyApproved ? colors.muted : colors.primary,
            opacity: pressed ? 0.82 : submitting ? 0.7 : 1,
          },
        ]}
      >
        <Feather
          name={submitting ? 'loader' : isAlreadyApproved ? 'check-circle' : 'check-circle'}
          size={17}
          color={isAlreadyApproved ? colors.mutedForeground : colors.primaryForeground}
        />
        <Text style={[styles.approveText, { color: isAlreadyApproved ? colors.mutedForeground : colors.primaryForeground }]}>
          {submitting
            ? 'Approving…'
            : isAlreadyApproved
              ? conversation.replyStatus === 'sent'
                ? 'Reply sent'
                : 'Approved — awaiting platform'
              : 'Approve and send'}
        </Text>
      </Pressable>
      <Text style={[styles.disclaimer, { color: colors.mutedForeground }]}>
        Approval-first workflow · Requires a connected {conversation.platform} account
      </Text>
      <Pressable onPress={() => router.push(`/lead/${lead.id}`)} style={styles.leadLink}>
        <Text style={[styles.leadLinkText, { color: colors.primary }]}>View full lead context</Text>
        <Feather name="arrow-up-right" size={15} color={colors.primary} />
      </Pressable>
    </ScrollView>
  );
}

function Signal({ icon, label, value }: { icon: keyof typeof Feather.glyphMap; label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={[styles.signal, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={15} color={colors.primary} />
      <Text style={[styles.signalLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.signalValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 18, fontWeight: '700' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 21 },
  backText: { fontSize: 15, fontWeight: '700' },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 11 },
  avatar: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800' },
  headerCopy: { flex: 1 },
  name: { fontSize: 18, fontWeight: '700' },
  username: { fontSize: 12, marginTop: 3 },
  message: { borderWidth: 1, borderRadius: 18, padding: 16, marginTop: 22 },
  messageLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  messageText: { fontSize: 16, lineHeight: 23, marginTop: 9 },
  signalRow: { flexDirection: 'row', gap: 9, marginTop: 10 },
  signal: { flex: 1, borderWidth: 1, borderRadius: 16, padding: 13 },
  signalLabel: { fontSize: 10, marginTop: 8 },
  signalValue: { fontSize: 12, fontWeight: '700', marginTop: 3 },
  suggestion: { borderRadius: 18, padding: 16, marginTop: 10 },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  suggestionTitle: { fontSize: 14, fontWeight: '800' },
  suggestionText: { fontSize: 11, lineHeight: 17, marginTop: 12, opacity: 0.8 },
  replyInput: { borderWidth: 1, borderRadius: 12, marginTop: 12, minHeight: 84, padding: 12, fontSize: 14, lineHeight: 20, textAlignVertical: 'top' },
  approvedFootnote: { fontSize: 11, lineHeight: 17, marginTop: 12, opacity: 0.9 },
  approveButton: { minHeight: 49, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 17 },
  approveText: { fontSize: 14, fontWeight: '800' },
  disclaimer: { fontSize: 11, textAlign: 'center', marginTop: 10 },
  leadLink: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 5, marginTop: 22 },
  leadLinkText: { fontSize: 13, fontWeight: '800' },
});