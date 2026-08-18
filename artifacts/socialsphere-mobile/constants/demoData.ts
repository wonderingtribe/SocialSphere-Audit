import type { Conversation, Integration, Lead } from '@workspace/api-client-react';

/**
 * Offline fallback dataset.
 *
 * Mirrors the demo records served by the API. It is only used as react-query
 * initial data so the app stays usable when the API is unreachable (or while
 * it is still being deployed). The API is the source of truth: this copy is
 * never displayed as REAL data — every record is explicitly DEMO.
 */

export const demoLeads: Lead[] = [
  {
    id: 'lead-1',
    name: 'Maya Chen',
    username: '@mayachen.design',
    platform: 'Instagram',
    source: 'Organic comment',
    campaign: 'Spring launch',
    interaction: 'Asked about team pricing',
    history: 'Commented twice and opened the profile link',
    leadScore: 88,
    intentScore: 92,
    status: 'QUALIFIED',
    tags: ['high intent', 'team'],
    notes: 'Wants a walkthrough for a five-person studio.',
    lastInteraction: '18 min ago',
    nextFollowUp: 'Today, 4:30 PM',
    conversionStatus: 'Not converted',
    mode: 'DEMO',
  },
  {
    id: 'lead-2',
    name: 'Jordan Lee',
    username: '@jordanbuilds',
    platform: 'LinkedIn',
    source: 'Campaign reply',
    campaign: 'Founder stories',
    interaction: 'Replied to a campaign message',
    history: 'Saved a post and replied with a product question',
    leadScore: 74,
    intentScore: 68,
    status: 'INTERESTED',
    tags: ['founder', 'needs reply'],
    notes: 'Comparing tools for a new growth team.',
    lastInteraction: '2 hours ago',
    nextFollowUp: 'Tomorrow',
    conversionStatus: 'Not converted',
    mode: 'DEMO',
  },
  {
    id: 'lead-3',
    name: 'Riley Morgan',
    username: '@rileymorgan',
    platform: 'Instagram',
    source: 'Profile visit',
    campaign: 'Always on',
    interaction: 'Returned to the profile twice',
    history: 'Repeated engagement without a direct conversation',
    leadScore: 51,
    intentScore: 44,
    status: 'ENGAGED',
    tags: ['returning'],
    notes: 'Needs a meaningful inbound signal before outreach.',
    lastInteraction: 'Yesterday',
    nextFollowUp: 'No follow-up set',
    conversionStatus: 'Not converted',
    mode: 'DEMO',
  },
  {
    id: 'lead-4',
    name: 'Sam Rivera',
    username: '@samrivera.co',
    platform: 'LinkedIn',
    source: 'Post engagement',
    campaign: 'Always on',
    interaction: 'Liked a product education post',
    history: 'One verified engagement event in the demo dataset',
    leadScore: 29,
    intentScore: 22,
    status: 'DISCOVERED',
    tags: ['new'],
    notes: 'No direct buying signal yet.',
    lastInteraction: '3 days ago',
    nextFollowUp: 'No follow-up set',
    conversionStatus: 'Not converted',
    mode: 'DEMO',
  },
];

export const demoConversations: Conversation[] = [
  {
    id: 'conversation-1',
    leadId: 'lead-1',
    name: 'Maya Chen',
    username: '@mayachen.design',
    platform: 'Instagram',
    preview: 'Can you show me how this works for a small team?',
    intent: 'Pricing / product fit',
    sentiment: 'Curious',
    status: 'Needs approval',
    suggestion:
      'Thanks for asking, Maya. SocialSphere helps small teams turn real conversations into organized follow-up. I can share a quick walkthrough for your studio.',
    mode: 'DEMO',
  },
  {
    id: 'conversation-2',
    leadId: 'lead-2',
    name: 'Jordan Lee',
    username: '@jordanbuilds',
    platform: 'LinkedIn',
    preview: 'How does the lead scoring decide who to follow up with?',
    intent: 'Product question',
    sentiment: 'Interested',
    status: 'Needs approval',
    suggestion:
      'Great question. The lead engine weighs observed signals like replies, product questions, repeat engagement, and verified website activity. It never invents activity.',
    mode: 'DEMO',
  },
];

export const demoIntegrations: Integration[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Comments, messages, publishing, and approved webhooks',
    icon: 'instagram',
    connected: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Page activity, conversations, and campaign signals',
    icon: 'briefcase',
    connected: false,
  },
  {
    id: 'x',
    name: 'X',
    description: 'Replies, mentions, and approved publishing scopes',
    icon: 'message-circle',
    connected: false,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Page conversations and lead event webhooks',
    icon: 'facebook',
    connected: false,
  },
];