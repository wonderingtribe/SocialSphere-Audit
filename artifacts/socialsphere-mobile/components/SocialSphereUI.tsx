import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Conversation, DataMode, Lead, LeadStatus } from '@/context/SocialSphereContext';

export function ScreenShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const colors = useColors();
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: colors.primary }]}>{eyebrow}</Text>
        ) : null}
        <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function DataModePill({ mode }: { mode: DataMode }) {
  const colors = useColors();
  const palette =
    mode === 'REAL'
      ? { background: colors.successSurface, foreground: colors.success, label: 'REAL DATA' }
      : mode === 'DEMO'
        ? { background: colors.accent, foreground: colors.accentForeground, label: 'DEMO DATA' }
        : { background: colors.destructiveSurface, foreground: colors.destructive, label: 'NOT CONNECTED' };
  return (
    <View style={[styles.modePill, { backgroundColor: palette.background }]}>
      <View style={[styles.modeDot, { backgroundColor: palette.foreground }]} />
      <Text style={[styles.modeText, { color: palette.foreground }]}>{palette.label}</Text>
    </View>
  );
}

export function SectionHeading({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && onPress ? (
        <Pressable onPress={onPress} hitSlop={10}>
          <Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function MetricCard({
  value,
  label,
  icon,
  tone = 'primary',
}: {
  value: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
  tone?: 'primary' | 'coral' | 'green';
}) {
  const colors = useColors();
  const toneColor =
    tone === 'coral' ? colors.accentForeground : tone === 'green' ? '#23865a' : colors.primary;
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.metricIcon, { backgroundColor: `${toneColor}18` }]}>
        <Feather name={icon} size={17} color={toneColor} />
      </View>
      <Text style={[styles.metricValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

export function PipelineBar({ leads }: { leads: Lead[] }) {
  const colors = useColors();
  const stages: LeadStatus[] = ['DISCOVERED', 'ENGAGED', 'INTERESTED', 'QUALIFIED'];
  return (
    <View style={[styles.pipelineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.pipelineTop}>
        <Text style={[styles.pipelineTitle, { color: colors.foreground }]}>Lead pipeline</Text>
        <DataModePill mode="DEMO" />
      </View>
      <View style={styles.pipelineTrack}>
        {stages.map((stage) => {
          const count = leads.filter((lead) => lead.status === stage).length;
          return (
            <View key={stage} style={styles.pipelineStage}>
              <View style={[styles.pipelineSegment, { backgroundColor: count ? colors.primary : colors.muted }]} />
              <Text style={[styles.pipelineCount, { color: colors.foreground }]}>{count}</Text>
              <Text style={[styles.pipelineLabel, { color: colors.mutedForeground }]}>
                {stage === 'WEBSITE VISIT' ? 'VISIT' : stage}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function LeadRow({
  lead,
  onPress,
}: {
  lead: Lead;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
        <Text style={[styles.avatarText, { color: colors.secondaryForeground }]}>
          {lead.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
        </Text>
      </View>
      <View style={styles.rowMain}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowTitle, { color: colors.foreground }]}>{lead.name}</Text>
        <Text style={[styles.score, { color: lead.leadScore >= 70 ? colors.success : colors.primary }]}>
            {lead.leadScore}
          </Text>
        </View>
        <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
          {lead.username} · {lead.platform}
        </Text>
        <View style={styles.rowBottom}>
          <Text style={[styles.statusText, { color: colors.primary }]}>{lead.status}</Text>
          <DataModePill mode={lead.mode} />
        </View>
      </View>
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </Pressable>
  );
}

export function ConversationRow({
  conversation,
  onPress,
}: {
  conversation: Conversation;
  onPress: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.conversationCard,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.82 : 1 },
      ]}
    >
      <View style={styles.conversationHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.secondary }]}>
          <Text style={[styles.avatarText, { color: colors.secondaryForeground }]}>
            {conversation.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </Text>
        </View>
        <View style={styles.rowMain}>
          <View style={styles.rowTop}>
            <Text style={[styles.rowTitle, { color: colors.foreground }]}>{conversation.name}</Text>
            <DataModePill mode={conversation.mode} />
          </View>
          <Text style={[styles.rowMeta, { color: colors.mutedForeground }]}>
            {conversation.platform} · {conversation.status}
          </Text>
        </View>
      </View>
      <Text style={[styles.preview, { color: colors.foreground }]}>{conversation.preview}</Text>
      <View style={styles.suggestionLabel}>
        <Feather name="cpu" size={13} color={colors.primary} />
        <Text style={[styles.suggestionText, { color: colors.primary }]}>AI suggestion ready</Text>
      </View>
    </Pressable>
  );
}

export function EmptyState({
  icon,
  title,
  message,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  message: string;
}) {
  const colors = useColors();
  return (
    <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Feather name={icon} size={24} color={colors.mutedForeground} />
      <Text style={[styles.emptyTitle, { color: colors.foreground }]}>{title}</Text>
      <Text style={[styles.emptyMessage, { color: colors.mutedForeground }]}>{message}</Text>
    </View>
  );
}

export function LoadingState() {
  const colors = useColors();
  return <ActivityIndicator color={colors.primary} style={styles.loading} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, paddingHorizontal: 20 },
  header: { paddingTop: 12, paddingBottom: 20 },
  eyebrow: { fontSize: 12, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 8 },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -0.7 },
  subtitle: { fontSize: 15, lineHeight: 22, marginTop: 8, maxWidth: 340 },
  modePill: { flexDirection: 'row', alignItems: 'center', borderRadius: 99, paddingHorizontal: 8, paddingVertical: 5, gap: 5, alignSelf: 'flex-start' },
  modeDot: { width: 6, height: 6, borderRadius: 99 },
  modeText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 11, marginTop: 22 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  sectionAction: { fontSize: 13, fontWeight: '700' },
  metricCard: { flex: 1, borderWidth: 1, borderRadius: 18, padding: 14, minHeight: 116 },
  metricIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  metricValue: { fontSize: 25, fontWeight: '700', letterSpacing: -0.5 },
  metricLabel: { fontSize: 11, marginTop: 3 },
  pipelineCard: { borderWidth: 1, borderRadius: 20, padding: 16 },
  pipelineTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  pipelineTitle: { fontSize: 16, fontWeight: '700' },
  pipelineTrack: { flexDirection: 'row', gap: 7 },
  pipelineStage: { flex: 1 },
  pipelineSegment: { height: 6, borderRadius: 6, marginBottom: 8 },
  pipelineCount: { fontSize: 17, fontWeight: '700' },
  pipelineLabel: { fontSize: 8, marginTop: 3, letterSpacing: 0.3 },
  rowCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, padding: 13, gap: 11, marginBottom: 9 },
  avatar: { width: 42, height: 42, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800' },
  rowMain: { flex: 1, minWidth: 0 },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rowTitle: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  rowMeta: { fontSize: 12, marginTop: 4 },
  rowBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, gap: 8 },
  statusText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
  score: { fontSize: 15, fontWeight: '800' },
  conversationCard: { borderWidth: 1, borderRadius: 19, padding: 15, marginBottom: 10 },
  conversationHeader: { flexDirection: 'row', gap: 11, alignItems: 'center' },
  preview: { fontSize: 14, lineHeight: 20, marginTop: 14 },
  suggestionLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  suggestionText: { fontSize: 11, fontWeight: '700' },
  emptyState: { borderWidth: 1, borderRadius: 19, padding: 24, alignItems: 'center', marginTop: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptyMessage: { fontSize: 13, lineHeight: 19, textAlign: 'center', marginTop: 6, maxWidth: 280 },
  loading: { marginTop: 30 },
});