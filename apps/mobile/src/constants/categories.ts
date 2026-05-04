export const CATEGORY_COLORS: Record<string, string> = {
  'Alimentação': '#FF6B6B',
  'Transporte':  '#4ECDC4',
  'Moradia':     '#45B7D1',
  'Saúde':       '#96CEB4',
  'Lazer':       '#FBBF24',
  'Educação':    '#DDA0DD',
  'Vestuário':   '#F0A500',
  'Receita':     '#22D3A5',
  'Outros':      '#9896B0',
};

export function getCategoryColor(nome?: string): string {
  if (!nome) return '#7C6AF7';
  return CATEGORY_COLORS[nome] ?? '#7C6AF7';
}

export function getCategoryEmoji(nome?: string): string {
  if (!nome) return '📦';
  return CATEGORIAS.find(c => c.nome === nome)?.emoji ?? '📦';
}

export const CATEGORIAS = [
  { nome: 'Alimentação', emoji: '🍔', cor: '#FF6B6B' },
  { nome: 'Transporte',  emoji: '🚗', cor: '#4ECDC4' },
  { nome: 'Moradia',     emoji: '🏠', cor: '#45B7D1' },
  { nome: 'Saúde',       emoji: '❤️', cor: '#96CEB4' },
  { nome: 'Lazer',       emoji: '🎮', cor: '#FBBF24' },
  { nome: 'Educação',    emoji: '📚', cor: '#DDA0DD' },
  { nome: 'Vestuário',   emoji: '👕', cor: '#F0A500' },
  { nome: 'Outros',      emoji: '📦', cor: '#9896B0' },
] as const;
