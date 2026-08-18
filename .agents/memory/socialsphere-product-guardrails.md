---
name: SocialSphere product guardrails
description: Durable trust and product principles for the SocialSphere AI social CRM and lead engine.
---

SocialSphere must use official platform OAuth/API integrations, clearly separate real, demo, and not-connected data, avoid fabricating lead activity, and keep AI conversations approval-first until configurable automation is explicitly designed and policy-safe.

**Why:** The product mission explicitly prioritizes user trust, platform compliance, evidence-backed lead scoring, and human approval before outbound messages.

**How to apply:** Every integration, lead score, conversation suggestion, and publishing workflow should preserve provenance and visibly communicate what is connected, what is simulated for preview, and what cannot run yet.

Social platforms should plug into one server-side capability-based adapter contract rather than separate product systems. Capabilities must be discovered per provider; credentials remain server-side; analytics and the Growth Arena are representations of verified events, not alternate data stores.

**Why:** The multi-platform architecture notes require extensibility without assuming every provider supports OAuth, publishing, messaging, analytics, webhooks, or lead events.

**How to apply:** Model connection states and provider capabilities explicitly, isolate every business account's data and roles, and only attribute visits, signups, revenue, or conversions when supporting events exist.