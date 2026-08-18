/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in the web artifacts
 * (index.css) so that all SocialSphere surfaces share one visual identity.
 * Dark mode tokens are provided below and picked up automatically by the
 * useColors() hook.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#172033',
    tint: '#7357ff',

    // Core surfaces
    background: '#f7f8fc',
    foreground: '#172033',

    // Cards / elevated surfaces
    card: '#ffffff',
    cardForeground: '#172033',

    // Primary action color (buttons, links, active states)
    primary: '#7357ff',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#eeedff',
    secondaryForeground: '#5141bb',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#eef0f6',
    mutedForeground: '#687089',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#fff0e7',
    accentForeground: '#a54e22',

    // Destructive actions (delete, error states)
    destructive: '#ef4444',
    destructiveForeground: '#ffffff',
    destructiveSurface: '#fff1f1',

    // Positive states and inverse surfaces
    success: '#23865a',
    successSurface: '#e4f7ed',
    inverseForeground: '#ffffff',

    // Borders and input outlines
    border: '#e2e5ef',
    input: '#d9ddec',
  },
  dark: {
    // Legacy aliases
    text: '#f4f6fc',
    tint: '#9b83ff',

    // Core surfaces
    background: '#0f1426',
    foreground: '#f4f6fc',

    // Cards / elevated surfaces
    card: '#171d33',
    cardForeground: '#f4f6fc',

    // Primary action color
    primary: '#9b83ff',
    primaryForeground: '#0f1426',

    // Secondary surfaces
    secondary: '#232a45',
    secondaryForeground: '#c9c2ff',

    // Muted elements
    muted: '#222943',
    mutedForeground: '#98a0bd',

    // Accent highlights
    accent: '#3a2416',
    accentForeground: '#ffb98a',

    // Destructive actions
    destructive: '#ff6b6b',
    destructiveForeground: '#1a0f0f',
    destructiveSurface: '#3a1c1c',

    // Positive states
    success: '#43c787',
    successSurface: '#12301f',
    inverseForeground: '#0f1426',

    // Borders and input outlines
    border: '#262d47',
    input: '#2b3350',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;