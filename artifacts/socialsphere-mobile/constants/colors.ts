/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
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

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
