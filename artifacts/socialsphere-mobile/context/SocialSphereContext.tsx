import React, { createContext, useContext, useMemo, useState } from 'react';

export type LeadStatus =
  | 'DISCOVERED'
  | 'ENGAGED'
  | 'INTERESTED'
  | 'QUALIFIED'
  | 'WEBSITE VISIT'
  | 'CONVERSION'
  | 'CUSTOMER';

export type DataMode = 'DEMO' | 'REAL' | 'NOT_CONNECTED';

export type Lead = {
  id: string;
  name: string;
  username: string;
  platform: string;
  source: string;
  campaign: string;
  interaction: string;
  history: string;
  leadScore: number;
  intentScore: number;
  status: LeadStatus;
  tags: string[];
  notes: string;
  lastInteraction: string;
  nextFollowUp: string;
  conversionStatus: string;
  mode: DataMode;
};

export type Conversation = {
  id: string;
  leadId: string;
  name: string;
  username: string;
  platform: string;
  preview: string;
  intent: string;
  sentiment: string;
  status: string;
  suggestion: string;
  mode: DataMode;
};

export type Integration = {
  id: string;
  name: string;
  description: string;
  icon: string;
  connected: boolean;
};

const demoLeads: Lead[] = [
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

const demoConversations: Conversation[] = [
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

const integrations: Integration[] = [
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

type SocialSphereContextValue = {
  leads: Lead[];
  conversations: Conversation[];
  integrations: Integration[];
  getLead: (id: string) => Lead | undefined;
  getConversation: (id: string) => Conversation | undefined;
  advanceLead: (id: string) => void;
};

const SocialSphereContext = createContext<SocialSphereContextValue | null>(null);

const statusOrder: LeadStatus[] = [
  'DISCOVERED',
  'ENGAGED',
  'INTERESTED',
  'QUALIFIED',
  'WEBSITE VISIT',
  'CONVERSION',
  'CUSTOMER',
];

export function SocialSphereProvider({ children }: { children: React.ReactNode }) {
  const [leads, setLeads] = useState<Lead[]>(demoLeads);

  const value = useMemo<SocialSphereContextValue>(
    () => ({
      leads,
      conversations: demoConversations,
      integrations,
      getLead: (id) => leads.find((lead) => lead.id === id),
      getConversation: (id) =>
        demoConversations.find((conversation) => conversation.id === id),
      advanceLead: (id) => {
        setLeads((current) =>
          current.map((lead) => {
            if (lead.id !== id || lead.mode !== 'DEMO') return lead;
            const currentIndex = statusOrder.indexOf(lead.status);
            const nextStatus =
              statusOrder[Math.min(currentIndex + 1, statusOrder.length - 1)];
            return { ...lead, status: nextStatus };
          }),
        );
      },
    }),
    [leads],
  );

  return (
    <SocialSphereContext.Provider value={value}>
      {children}
    </SocialSphereContext.Provider>
  );
}

export function useSocialSphere() {
  const context = useContext(SocialSphereContext);
  if (!context) {
    throw new Error('useSocialSphere must be used inside SocialSphereProvider');
  }
  return context;
}