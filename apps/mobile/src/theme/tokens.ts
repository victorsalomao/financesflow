export const colors = {
  // Backgrounds (4 níveis de elevação)
  bg:             '#09091A',
  surface:        '#0E0F1E',
  card:           '#13142A',
  raised:         '#181932',

  // Borders
  border:         'rgba(255,255,255,0.06)',
  borderHover:    'rgba(255,255,255,0.12)',
  borderStrong:   'rgba(255,255,255,0.10)',
  borderSubtle:   'rgba(255,255,255,0.04)',
  borderModal:    'rgba(255,255,255,0.07)',
  borderInput:    'rgba(255,255,255,0.05)',

  // Brand / Accent
  violet:         '#7C6AF7',
  violetLight:    '#9B6AF7',
  pink:           '#F472B6',
  emerald:        '#22D3A5',
  rose:           '#F87171',
  amber:          '#FBBF24',
  blue:           '#60A5FA',

  // Text
  textPrimary:    '#EDEEFF',
  textSecondary:  '#7E7CA0',
  textMuted:      '#4A4869',
  textOnAccent:   '#09091A',

  // Category colors
  catFood:        '#FF6B6B',
  catTransport:   '#4ECDC4',
  catHousing:     '#45B7D1',
  catHealth:      '#96CEB4',
  catLeisure:     '#FBBF24',
  catEducation:   '#DDA0DD',
  catClothing:    '#F0A500',
  catIncome:      '#22D3A5',
  catOther:       '#9896B0',

  // Semantic overlays
  violetBg:       'rgba(124,106,247,0.09)',
  violetBorder:   'rgba(124,106,247,0.25)',
  pinkBg:         'rgba(244,114,182,0.12)',
  pinkBorder:     'rgba(244,114,182,0.3)',
  emeraldBg:      'rgba(34,211,165,0.09)',
  emeraldBorder:  'rgba(34,211,165,0.2)',
  roseBg:         'rgba(248,113,113,0.09)',
  roseBorder:     'rgba(248,113,113,0.25)',
};

export const spacing = {
  xxs: 2, xs: 4, sm: 8, md: 12,
  lg: 16,   // card horizontal margin
  xl: 20,   // card internal padding
  xxl: 24,  // header horizontal padding
  screen: 24,
  card: 16,
};

export const radius = {
  xs: 4, sm: 8, md: 10,
  lg: 13,   // icon containers (44×44)
  xl: 14,   // buttons, input groups
  card: 16,
  cardLg: 18,
  hero: 24,
  sheet: 28,
  pill: 999,
  avatar: 38,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  fab: {
    shadowColor: '#7C6AF7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 10,
  },
  tabBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 20,
  },
};

export const opacity = {
  pressed:  0.7,
  disabled: 0.4,
  loading:  0.85,
};

// Objeto de conveniência — compatibilidade com código existente
export const T = {
  bg:      colors.bg,
  surface: colors.surface,
  card:    colors.card,
  raised:  colors.raised,
  border:  colors.border,
  border2: colors.borderStrong,
  violet:  colors.violet,
  pink:    colors.pink,
  emerald: colors.emerald,
  rose:    colors.rose,
  amber:   colors.amber,
  blue:    colors.blue,
  teal:    '#4ECDC4',
  text:    colors.textPrimary,
  sub:     colors.textSecondary,
  muted:   colors.textMuted,
} as const;
