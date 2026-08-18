import React, { createContext, useContext, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListConversationsQueryKey,
  getListIntegrationsQueryKey,
  getListLeadsQueryKey,
  useAdvanceLead,
  useApproveConversation,
  useConnectIntegration,
  useListConversations,
  useListIntegrations,
  useListLeads,
  type Conversation,
  type DataMode,
  type Integration,
  type Lead,
  type LeadStatus,
} from '@workspace/api-client-react';
import {
  demoConversations,
  demoIntegrations,
  demoLeads,
} from '@/constants/demoData';

export type {
  Conversation,
  DataMode,
  Integration,
  Lead,
  LeadStatus,
} from '@workspace/api-client-react';

export const statusOrder: LeadStatus[] = [
  'DISCOVERED',
  'ENGAGED',
  'INTERESTED',
  'QUALIFIED',
  'WEBSITE VISIT',
  'CONVERSION',
  'CUSTOMER',
];

/**
 * Advances a demo lead one stage. Mirrors the server-side rule so the UI can
 * stay interactive offline: real stage changes always come from verified
 * platform or website events, never from this local helper.
 */
function advanceDemoStatus(status: LeadStatus, mode: DataMode): LeadStatus | null {
  if (mode !== 'DEMO') return null;
  const currentIndex = statusOrder.indexOf(status);
  const nextIndex = currentIndex + 1;
  if (currentIndex === -1 || nextIndex >= statusOrder.length) return null;
  return statusOrder[nextIndex];
}

type DeliveryResult = 'requires_connection' | 'queued';

type SocialSphereContextValue = {
  leads: Lead[];
  conversations: Conversation[];
  integrations: Integration[];
  isLoading: boolean;
  isRefreshing: boolean;
  hasError: boolean;
  getLead: (id: string) => Lead | undefined;
  getConversation: (id: string) => Conversation | undefined;
  advanceLead: (id: string) => void;
  /** Returns the official OAuth authorization URL, or null when unconfigured. */
  connectIntegration: (id: string) => Promise<string | null>;
  /** Approves an AI-suggested reply on the server. Never simulates a send. */
  approveConversation: (
    id: string,
    reply: string,
  ) => Promise<DeliveryResult | null>;
};

const SocialSphereContext = createContext<SocialSphereContextValue | null>(null);

export function SocialSphereProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const leadsQuery = useListLeads({
    query: { queryKey: getListLeadsQueryKey(), initialData: demoLeads },
  });
  const conversationsQuery = useListConversations({
    query: {
      queryKey: getListConversationsQueryKey(),
      initialData: demoConversations,
    },
  });
  const integrationsQuery = useListIntegrations({
    query: {
      queryKey: getListIntegrationsQueryKey(),
      initialData: demoIntegrations,
    },
  });

  const advanceMutation = useAdvanceLead();
  const connectMutation = useConnectIntegration();
  const approveMutation = useApproveConversation();

  const leads = leadsQuery.data ?? demoLeads;
  const conversations = conversationsQuery.data ?? demoConversations;
  const integrations = integrationsQuery.data ?? demoIntegrations;

  const value = useMemo<SocialSphereContextValue>(
    () => ({
      leads,
      conversations,
      integrations,
      isLoading:
        leadsQuery.isLoading ||
        conversationsQuery.isLoading ||
        integrationsQuery.isLoading,
      isRefreshing:
        leadsQuery.isFetching ||
        conversationsQuery.isFetching ||
        integrationsQuery.isFetching,
      hasError: Boolean(
        leadsQuery.error || conversationsQuery.error || integrationsQuery.error,
      ),
      getLead: (id) => leads.find((lead) => lead.id === id),
      getConversation: (id) =>
        conversations.find((conversation) => conversation.id === id),
      advanceLead: (id) => {
        advanceMutation.mutate(
          { id },
          {
            onError: () => {
              // Offline fallback: keep the demo interactive by advancing the
              // cached stage locally. This mirrors the server's DEMO-only rule.
              queryClient.setQueryData(
                getListLeadsQueryKey(),
                (current: Lead[] | undefined) =>
                  current?.map((lead) => {
                    if (lead.id !== id) return lead;
                    const nextStatus = advanceDemoStatus(lead.status, lead.mode);
                    return nextStatus ? { ...lead, status: nextStatus } : lead;
                  }) ?? current,
              );
            },
            onSuccess: (updated) => {
              queryClient.setQueryData(
                getListLeadsQueryKey(),
                (current: Lead[] | undefined) =>
                  current?.map((lead) =>
                    lead.id === updated.id ? updated : lead,
                  ) ?? current,
              );
            },
          },
        );
      },
      connectIntegration: (id) =>
        new Promise((resolve, reject) => {
          connectMutation.mutate(
            { id },
            {
              onSuccess: (result) => resolve(result.authUrl || null),
              onError: () => resolve(null),
            },
          );
        }),
      approveConversation: (id, reply) =>
        new Promise((resolve, reject) => {
          approveMutation.mutate(
            { id, data: { reply } },
            {
              onSuccess: (result) => {
                queryClient.setQueryData(
                  getListConversationsQueryKey(),
                  (current: Conversation[] | undefined) =>
                    current?.map((conversation) =>
                      conversation.id === id
                        ? { ...conversation, ...result.conversation }
                        : conversation,
                    ) ?? current,
                );
                resolve(result.delivery);
              },
              onError: () => resolve(null),
            },
          );
        }),
    }),
    [
      leads,
      conversations,
      integrations,
      leadsQuery.isLoading,
      conversationsQuery.isLoading,
      integrationsQuery.isLoading,
      leadsQuery.isFetching,
      conversationsQuery.isFetching,
      integrationsQuery.isFetching,
      leadsQuery.error,
      conversationsQuery.error,
      integrationsQuery.error,
      advanceMutation,
      connectMutation,
      approveMutation,
      queryClient,
    ],
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