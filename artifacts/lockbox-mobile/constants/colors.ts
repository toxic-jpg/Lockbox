/**
 * Design tokens synced from the sibling web artifact (password-vault/src/index.css).
 * Light/dark values converted from HSL to hex.
 * Primary: Violet #6246EC (light) / #8069F5 (dark)
 * Background: Deep navy dark / Near-white light
 */
const colors = {
  light: {
    text: '#07091C',
    tint: '#6246EC',
    background: '#F3F4F8',
    foreground: '#07091C',
    card: '#FFFFFF',
    cardForeground: '#07091C',
    primary: '#6246EC',
    primaryForeground: '#FFFFFF',
    secondary: '#ECEDF2',
    secondaryForeground: '#07091C',
    muted: '#ECEDF2',
    mutedForeground: '#6A7282',
    accent: '#ECEDF2',
    accentForeground: '#07091C',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#D9DCE6',
    input: '#D9DCE6',
  },
  dark: {
    text: '#DDEAF5',
    tint: '#8069F5',
    background: '#07091C',
    foreground: '#DDEAF5',
    card: '#0C1630',
    cardForeground: '#DDEAF5',
    primary: '#8069F5',
    primaryForeground: '#07091C',
    secondary: '#111E3B',
    secondaryForeground: '#DDEAF5',
    muted: '#101C38',
    mutedForeground: '#9BA3B8',
    accent: '#131F3D',
    accentForeground: '#DDEAF5',
    destructive: '#C0392B',
    destructiveForeground: '#DDEAF5',
    border: '#182038',
    input: '#1B2540',
  },
  radius: 12,
};

export default colors;
