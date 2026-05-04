# FinançasFlow — Design System

---

## 1. Identidade Visual

### Personalidade
O FinançasFlow é o parceiro financeiro do casal. A interface deve transmitir **controle sem ansiedade** — os dados financeiros aparecem de forma clara e organizada, nunca assustadores. A estética é escura e sofisticada como um aplicativo de investimentos premium, mas com toques quentes que lembram que há duas pessoas reais dividindo uma vida juntas.

### Pilares
| Pilar | Como se manifesta |
|---|---|
| **Sofisticado** | Paleta escura, tipografia precisa, espaçamentos generosos |
| **Acolhedor** | Cor do casal (rosa suave), linguagem amigável, avatares personalizados |
| **Confiante** | Dados sempre visíveis, hierarquia clara, sem informação escondida |
| **Moderno** | Glassmorphism sutil, gradientes discretos, animações com spring |

### Referências
- **Nubank** — sofisticação do dark theme, tipografia limpa, hierarquia de saldo
- **Notion** — clareza de layout, espaço em branco respeitado, sem ruído visual
- **Copilot Money** — visualização de dados financeiros, categorias coloridas, gráficos elegantes

---

## 2. Paleta de Cores

### Cores da Marca

```
brand-primary      #7C6AF7   Índigo suave — ações principais, foco, links
brand-primary-dim  #5B4ED4   Índigo escuro — pressed state, sombras
brand-secondary    #34D399   Esmeralda — receitas, saldo positivo, sucesso
brand-couple       #F472B6   Rosa — identidade do casal, CTAs especiais
brand-couple-dim   #DB2777   Rosa escuro — pressed state
```

### Backgrounds

```
bg-base            #0C0C14   Fundo raiz de todas as telas
bg-surface         #161622   Cards, listas, áreas de conteúdo
bg-elevated        #1E1E30   Bottom sheets, modais, popovers
bg-input           #1A1A28   Campos de formulário
bg-overlay         #0C0C14CC Overlay de modais (83% opacidade)
```

### Textos

```
text-primary       #F1F0FF   Títulos, valores, conteúdo principal
text-secondary     #9896B0   Labels, subtítulos, metadados
text-muted         #5C5A74   Placeholders, textos desabilitados
text-inverse       #0C0C14   Texto sobre fundos claros (botões)
```

### Semânticas

```
income             #34D399   Receitas, saldo positivo
income-bg          #34D39914 Background de badge de receita
expense            #F87171   Despesas, saldo negativo, erros
expense-bg         #F8717114 Background de badge de despesa
warning            #FBBF24   Alertas, vencimentos próximos
warning-bg         #FBBF2414 Background de badge de aviso
neutral            #9896B0   Transferências, valores neutros
```

### Bordas e Divisores

```
border-default     #2A2A3E   Bordas de cards e inputs em repouso
border-focus       #7C6AF7   Borda de input com foco
border-error       #F87171   Borda de input com erro
border-glass       #FFFFFF1A Borda de elementos glassmorphism
```

### Gradientes

```
gradient-primary   linear: #7C6AF7 → #5B4ED4   (135°) — botão primário
gradient-couple    linear: #F472B6 → #7C6AF7   (135°) — CTAs do casal
gradient-income    linear: #34D399 → #059669   (135°) — card de receita
gradient-card      linear: #1E1E30 → #161622   (160°) — card premium
gradient-overlay   linear: transparent → #0C0C14 (180°) — fade inferior em listas
```

### Uso por contexto

```
Saldo positivo       text-primary + income (valor)
Saldo negativo       text-primary + expense (valor)
Receita na lista     ícone income-bg, valor com income
Despesa na lista     ícone expense-bg, valor com expense
Botão principal      gradient-primary, text-inverse
Botão do casal       gradient-couple, text-inverse
Fundo de tela        bg-base
Card padrão          bg-surface, border-default
Bottom sheet         bg-elevated
```

---

## 3. Tipografia

### Fontes
- **Display / Headings:** `Sora` — personalidade, modernidade, presença
- **Body / Dados:** `Inter` — clareza, leitura de números, conteúdo denso

Ambas via `@expo-google-fonts`. Fallback: `System` (SF Pro no iOS, Roboto no Android).

### Escala Tipográfica

| Token | Fonte | Tamanho | Peso | Line Height | Uso |
|---|---|---|---|---|---|
| `display` | Sora | 32px | 700 Bold | 38px | Saldo principal, splash |
| `h1` | Sora | 26px | 700 Bold | 32px | Títulos de tela |
| `h2` | Sora | 22px | 600 SemiBold | 28px | Seções, cards de destaque |
| `h3` | Inter | 18px | 600 SemiBold | 24px | Subtítulos, nomes de categorias |
| `h4` | Inter | 16px | 500 Medium | 22px | Labels de seção |
| `body-lg` | Inter | 16px | 400 Regular | 24px | Texto corrido principal |
| `body` | Inter | 14px | 400 Regular | 21px | Descrições, listas |
| `body-sm` | Inter | 13px | 400 Regular | 19px | Metadados, datas |
| `label` | Inter | 12px | 500 Medium | 16px | Tags, badges, labels de input |
| `caption` | Inter | 11px | 400 Regular | 15px | Rodapés, notas legais |
| `mono` | Inter | 14px | 500 Medium | 21px | Código de convite, IDs |

### Pesos utilizados
- `400` Regular — corpo de texto
- `500` Medium — labels, destaque sutil
- `600` SemiBold — subtítulos, valores secundários
- `700` Bold — títulos, valores monetários principais

### Formatação de valores monetários
```
R$ 5.000,00   → display Bold + income (receita)
-R$ 380,00    → display Bold + expense (despesa)
R$ 4.620,00   → display Bold + text-primary (saldo)
```
Separador de milhar: ponto. Decimal: vírgula. Sempre exibir centavos.

---

## 4. Espaçamento e Grid

### Escala de Espaçamento (base 4px)
```
space-1    4px
space-2    8px
space-3    12px
space-4    16px   ← padding interno de cards
space-5    20px
space-6    24px   ← padding horizontal de tela
space-8    32px   ← separação entre seções
space-10   40px
space-12   48px
space-16   64px
```

### Border Radius
```
radius-sm    8px    tags, badges, inputs
radius-md    12px   botões
radius-lg    16px   cards menores
radius-xl    20px   cards principais
radius-2xl   24px   bottom sheets, modais
radius-full  9999px avatares, chips circulares
```

### Sombras (elevação)
```
shadow-sm   0 2px 8px #0000004D      cards em repouso
shadow-md   0 4px 16px #00000066     cards hover / pressionados
shadow-lg   0 8px 32px #00000080     bottom sheets
shadow-glow 0 0 20px #7C6AF740       botão primário com foco
```

---

## 5. Componentes Base

### 5.1 Cards

#### Card Padrão
```
Background:   bg-surface (#161622)
Border:       1px border-default (#2A2A3E)
Border radius: radius-xl (20px)
Padding:      space-4 (16px)
Sombra:       shadow-sm

Variantes:
  - Pressionável: scale(0.98) no press, shadow-md
  - Selecionado:  border-focus (#7C6AF7), leve glow
```

#### Card Glassmorphism
```
Background:   #FFFFFF08 (4% branco)
Backdrop:     blur(12px)
Border:       1px border-glass (#FFFFFF1A)
Border radius: radius-xl (20px)
Padding:      space-4 (16px)

Uso: card de saldo total, card de casal no dashboard
```

#### Card de Destaque (Gradiente)
```
Background:   gradient-card (#1E1E30 → #161622)
Border:       1px #7C6AF726 (primária em 15%)
Border radius: radius-xl (20px)
Padding:      space-5 (20px)
Sombra:       shadow-md + shadow-glow

Uso: card de meta financeira, card do mês
```

---

### 5.2 Botões

#### Primário
```
Background:   gradient-primary (#7C6AF7 → #5B4ED4)
Texto:        text-inverse (#0C0C14), body-lg Bold
Height:       52px
Border radius: radius-md (12px)
Padding H:    space-6 (24px)
Sombra:       shadow-glow

Press:        scale(0.97), opacity 0.9
Disabled:     opacity 0.4, sem gradiente
```

#### Secundário
```
Background:   transparent
Border:       1.5px brand-primary (#7C6AF7)
Texto:        brand-primary, body-lg Medium
Height:       52px
Border radius: radius-md (12px)

Press:        bg-primary/10 (10% opacidade da primária)
```

#### Ghost
```
Background:   transparent
Texto:        brand-primary, body-lg Medium
Sem borda

Press:        bg-primary/5
Uso:          ações secundárias em telas, links
```

#### Casal (CTA especial)
```
Background:   gradient-couple (#F472B6 → #7C6AF7)
Texto:        text-inverse (#0C0C14), body-lg Bold
Height:       52px
Border radius: radius-md (12px)
Ícone:        coração ou anel (opcional, à esquerda)

Uso:          convite do parceiro, metas conjuntas
```

#### Ícone (FAB)
```
Background:   gradient-primary
Tamanho:      56px × 56px
Border radius: radius-full
Ícone:        24px, text-inverse
Sombra:       shadow-lg + shadow-glow

Posição:      fixo, bottom-right, 24px das bordas
Uso:          adicionar transação
```

---

### 5.3 Inputs

#### Input Padrão
```
Background:   bg-input (#1A1A28)
Border:       1px border-default, radius-sm (8px)
Altura:       52px
Padding H:    space-4 (16px)
Texto:        body-lg, text-primary
Placeholder:  text-muted

Focus:
  Border:     1.5px border-focus (#7C6AF7)
  Shadow:     0 0 0 3px #7C6AF720

Error:
  Border:     1.5px border-error (#F87171)
  Shadow:     0 0 0 3px #F8717120
```

#### Input com Ícone
```
= Input Padrão
+ Ícone à esquerda: 20px, text-secondary, padding-left: 44px
+ Ícone à direita (opcional): senha toggle, 44px tap area
```

#### Input de Valor Monetário
```
Fonte:        display (32px) Bold, Sora
Alinhamento:  centro
Background:   transparente
Border:       apenas bottom, 2px
Prefix "R$":  h3, text-secondary, à esquerda do valor
Placeholder:  "0,00" em text-muted

Uso:          tela de adicionar transação
```

#### Mensagem de Erro
```
Texto:        caption, expense (#F87171)
Ícone:        círculo-exclamação 12px, à esquerda
Margem top:   space-1 (4px) abaixo do input
```

---

### 5.4 Bottom Sheet

```
Background:   bg-elevated (#1E1E2F)
Border radius: radius-2xl (24px) no topo apenas
Sombra:       shadow-lg

Handle (arraste):
  Largura:    40px
  Altura:     4px
  Cor:        text-muted (#5C5A74)
  Border radius: radius-full
  Margin top: space-2 (8px), centrado

Snap points padrão:
  - 40% da tela (peek)
  - 75% da tela (expanded)
  - 95% da tela (full)

Backdrop: bg-overlay, toque fora fecha
Animação: spring (damping 20, stiffness 200)
```

---

### 5.5 Tags de Categoria

```
Layout:       Row, ícone 16px + label
Padding:      4px horizontal, 8px vertical
Border radius: radius-full
Texto:        label (12px) Medium

Cores por categoria:
  Alimentação   #FF6B6B bg / #FF6B6B20 background
  Transporte    #4ECDC4 bg / #4ECDC420 background
  Moradia       #45B7D1 bg / #45B7D120 background
  Saúde         #96CEB4 bg / #96CEB420 background
  Lazer         #FFEAA7 bg / #FFEAA720 background  (texto escuro)
  Educação      #DDA0DD bg / #DDA0DD20 background
  Vestuário     #F0A500 bg / #F0A50020 background
  Receita       #34D399 bg / #34D39920 background
  Outros        #9896B0 bg / #9896B020 background
  Custom        brand-primary bg / #7C6AF720 background
```

---

### 5.6 Indicadores do Casal

#### Avatares Sobrepostos
```
Tamanho:      36px × 36px cada
Border radius: radius-full
Border:       2px bg-surface (para separação visual)
Sobreposição: -10px (segundo avatar à esquerda do primeiro)

Avatar com foto: foto circular
Avatar sem foto: iniciais (h4 SemiBold), bg gradient-couple
```

#### Barra de Divisão
```
Container:    Row, gap-2, height 8px
Barra Victor: flex(percentual), bg brand-primary, radius-full (lado esquerdo)
Barra Maria:  flex(100-percentual), bg brand-couple, radius-full (lado direito)
Labels:       caption abaixo de cada barra ("Victor 60%" / "Maria 40%")
Animação:     width com spring ao entrar na tela
```

#### Chip "Gasto por"
```
Row: avatar 20px + nome body-sm + valor label
Background: bg-surface
Border radius: radius-sm
Padding: 6px 10px
Uso: linha de transação na lista
```

---

### 5.7 Lista de Transações (Item)

```
Layout: Row, height 64px, padding H space-4
  
  [Ícone categoria 40px]  [Coluna esquerda flex-1]  [Coluna direita]

Ícone:
  40×40px, border-radius radius-md
  Background: cor da categoria em 20% opacidade
  Ícone: 20px, cor da categoria

Coluna esquerda:
  Linha 1: descricao (body Medium, text-primary) — truncate 1 linha
  Linha 2: data (body-sm, text-secondary) + chip "por Victor/Maria"

Coluna direita:
  Linha 1: valor (body-lg Bold)
    Receita: income (#34D399), prefixo "+"
    Despesa: expense (#F87171), prefixo "-"
  Linha 2: categoria tag (label, text-muted)

Separador: 1px border-default, margin-left 56px (alinha após ícone)
Press: bg-surface scale(0.99), ripple no Android
```

---

## 6. Padrões de Animação

### Transições de Tela
```
Stack navigation (drill-down):
  Entrada:  slide from right (translateX: screenWidth → 0)
  Saída:    slide to left (translateX: 0 → -screenWidth * 0.3) + fade
  Duração:  320ms, easing: cubic-bezier(0.25, 0.46, 0.45, 0.94)

Modal / Bottom Sheet:
  Entrada:  slide from bottom + fade in
  Saída:    slide to bottom + fade out
  Duração:  280ms, spring (damping 20)

Tab switch:
  Fade cruzado suave, 200ms
```

### Feedback de Ações

```
Botão press:
  scale: 1.0 → 0.97 (80ms) → 1.0 (release, spring)
  Haptic: impactAsync(light) no press

Swipe para deletar (lista):
  Threshold: 40% da largura
  Ação confirmada: hapticAsync(medium) + slide-out + collapse height

Pull to refresh:
  Spinner brand-primary com rotação contínua
  Snap de retorno: spring suave

Sucesso (ex: transação criada):
  Ícone check: scale 0 → 1.2 → 1.0, spring
  Background flash: income/20% → transparente, 400ms
  Haptic: notificationAsync(success)

Erro:
  Input shake: translateX -8px ↔ +8px, 3x, 40ms cada
  Haptic: notificationAsync(error)
```

### Loading States

```
Skeleton Screen (preferido a spinner):
  Cor base:     bg-surface (#161622)
  Cor shimmer:  #FFFFFF0A (4% branco)
  Animação:     shimmer linear, 1.4s loop
  Shape:        mesma geometria do conteúdo real

Skeleton padrão por tela:
  Dashboard:    card 120px + 3 linhas de lista
  Transações:   6 itens de lista com ícone, 2 linhas
  Metas:        2 cards de meta

Inline loader (botão):
  Spinner 20px, cor text-inverse, substitui texto do botão
  Botão desabilitado durante loading

Dados do gráfico:
  Barras animam de 0 → valor final, 600ms, stagger 80ms cada
  Easing: cubic-bezier(0.34, 1.56, 0.64, 1) (spring suave)
```

### Micro-animações

```
Valor monetário (count-up):
  Ao entrar na tela: conta de 0 até o valor real
  Duração: 800ms, easing ease-out
  Uso: saldo principal, total do mês

Badge de notificação:
  Aparece com scale 0 → 1.3 → 1.0, spring

Progress bar de meta:
  Anima de 0% → valor real ao montar, 1000ms, ease-out
  Pulso suave ao atingir 100% (scale + glow)

FAB:
  Entrada na tela: scale 0 → 1.1 → 1.0, spring, delay 400ms
  Rotação ao abrir menu: 45° com spring
```

---

## 7. Iconografia

**Biblioteca:** `lucide-react-native` — stroke icons, consistentes, modernos.

```
Tamanhos padrão:
  nav tab:        24px
  inline/lista:   20px
  badge/tag:      16px
  micro:          12px

Stroke width: 1.5px (padrão Lucide)
Cor padrão:   text-secondary (#9896B0)
Cor ativa:    brand-primary (#7C6AF7)

Ícones principais por funcionalidade:
  Dashboard:      LayoutDashboard
  Transações:     ArrowLeftRight
  Metas:          Target
  Perfil/Casal:   Users
  Adicionar:      Plus
  Receita:        TrendingUp
  Despesa:        TrendingDown
  Categorias:     Tag
  Calendário:     Calendar
  Filtro:         SlidersHorizontal
  Busca:          Search
  Editar:         Pencil
  Deletar:        Trash2
  Convite:        UserPlus
  Configurações:  Settings2
  Voltar:         ChevronLeft
  Fechar:         X
  Cheque:         Check
  Alerta:         AlertCircle
```

---

## 8. Navegação

### Bottom Tab Bar

```
Background:   bg-elevated (#1E1E30) + blur
Border top:   1px border-default
Height:       72px (+ safe area bottom)
Safe area:    respeitada com useSafeAreaInsets

Tabs:
  Dashboard    LayoutDashboard
  Transações   ArrowLeftRight
  [FAB +]      (centro, sem tab label)
  Metas        Target
  Perfil       Users

Tab ativa:    ícone brand-primary, label brand-primary, dot indicator
Tab inativa:  ícone text-muted, sem label
FAB central:  56px, gradient-primary, elevado 8px acima da barra
```

### Header padrão

```
Background:   bg-base (transparente / sem linha)
Título:       h3 SemiBold, text-primary, centralizado
Botão voltar: ChevronLeft 24px, text-secondary, touch area 44×44px
Ação direita: ícone 24px, text-secondary (ex: filtros, configurações)
```

---

## 9. Wireframes das Telas do MVP

### 9.1 Splash + Login

```
┌─────────────────────────────┐
│                             │
│                             │
│    [Logo animado]           │
│    FinançasFlow             │ ← display Bold, text-primary
│    Suas finanças, juntos.   │ ← body-lg, text-secondary
│                             │
│                             │
│ ┌─────────────────────────┐ │
│ │ 📧  email@exemplo.com   │ │ ← Input com ícone Mail
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🔒  ••••••••            │ │ ← Input com ícone Lock + toggle
│ └─────────────────────────┘ │
│                             │
│ [       Entrar            ] │ ← Botão primário (gradient)
│                             │
│    Esqueci minha senha      │ ← Ghost, text-secondary
│                             │
│ ────────── ou ──────────    │
│                             │
│ [    Criar conta nova    ]  │ ← Botão secundário (outlined)
│                             │
└─────────────────────────────┘

Animação de entrada:
  - Logo: fade + scale 0.8 → 1.0, 600ms
  - Campos: slide up com stagger 80ms cada
  - Botões: fade in após campos
```

---

### 9.2 Registro + Convite do Casal

**Tela A — Criar Conta**
```
┌─────────────────────────────┐
│ ← Criar conta               │ ← Header com botão voltar
├─────────────────────────────┤
│                             │
│ Como você quer ser          │
│ chamado(a)?                 │ ← h2, text-primary
│                             │
│ ┌─────────────────────────┐ │
│ │ 👤  Seu nome            │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 📧  E-mail              │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 🔒  Senha               │ │
│ └─────────────────────────┘ │
│                             │
│ [    Continuar →          ] │ ← Botão primário
│                             │
└─────────────────────────────┘
```

**Tela B — Configurar Domicílio**
```
┌─────────────────────────────┐
│ ← Seu espaço               │
├─────────────────────────────┤
│                             │
│ 🏠                          │ ← ícone 48px, brand-couple
│ Como vamos chamar           │
│ a casa de vocês?            │ ← h2
│                             │
│ ┌─────────────────────────┐ │
│ │ 🏠  Ex: Casa do Victor  │ │
│ └─────────────────────────┘ │
│                             │
│ [   Criar nossa casa 💕   ] │ ← Botão casal (gradient-couple)
│                             │
│ ─────── já tem convite? ──  │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🔑  CÓDIGO DE CONVITE   │ │ ← mono, letras maiúsculas, 8 chars
│ └─────────────────────────┘ │
│                             │
│ [      Entrar com código  ] │ ← Botão secundário
│                             │
└─────────────────────────────┘
```

**Tela C — Compartilhar Convite**
```
┌─────────────────────────────┐
│         Tudo pronto! 🎉     │ ← h1, centralizado
├─────────────────────────────┤
│                             │
│  ┌───────────────────────┐  │
│  │  ♥  Casa do Victor    │  │ ← Card glassmorphism
│  │                       │  │
│  │    Código de convite  │  │
│  │  ┌─────────────────┐  │  │
│  │  │  S O N U M Y 6O │  │  │ ← mono display, brand-primary
│  │  └─────────────────┘  │  │
│  │  Válido por 30 dias   │  │
│  └───────────────────────┘  │
│                             │
│  Convide seu parceiro(a)    │ ← h3, text-secondary
│  para acessar juntos        │
│                             │
│ [💕  Compartilhar convite ] │ ← Botão casal
│                             │
│ [      Ir para o app →   ] │ ← Ghost
│                             │
└─────────────────────────────┘
```

---

### 9.3 Dashboard Principal

```
┌─────────────────────────────┐
│  FinançasFlow    [🔔] [👤]  │ ← Header: logo esq, ícones dir
├─────────────────────────────┤
│ Olá, Victor 👋              │ ← h3, text-secondary
│                             │
│ ┌─────────────────────────┐ │
│ │    [glassmorphism card] │ │ ← Card de saldo, gradient sutil
│ │                         │ │
│ │  Saldo do mês           │ │ ← label, text-secondary
│ │  R$ 4.620,00            │ │ ← display Bold, count-up anim
│ │                         │ │
│ │  ┌──────────┐ ┌───────┐ │ │
│ │  │↑ R$5.000 │ │↓ R$380│ │ │ ← income / expense tags
│ │  │ Receitas │ │Despesa│ │ │
│ │  └──────────┘ └───────┘ │ │
│ │                         │ │
│ │  [Victor •──────── Maria│ │ ← barra de divisão do casal
│ └─────────────────────────┘ │
│                             │
│  Gastos por categoria       │ ← h4 + "Ver todos →" (ghost sm)
│                             │
│  ┌───────┐ ┌───────┐ ┌────┐ │
│  │🍔     │ │🚗     │ │🏠  │ │ ← Gráfico de barras horizontais
│  │Aliment│ │Transp.│ │Casa│ │   Victory Native, animadas
│  │R$ 380 │ │R$ 0   │ │R$ 0│ │
│  └───────┘ └───────┘ └────┘ │
│                             │
│  Últimas transações         │ ← h4 + "Ver todas →"
│                             │
│ ┌─────────────────────────┐ │
│ │ [🛒] Supermercado Extra │ │ ← Item de lista
│ │      Hoje • Victor      │ │    (componente 5.7)
│ │                  -R$380 │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ [💰] Salario maio       │ │
│ │      01/05 • Victor     │ │
│ │              +R$5.000   │ │
│ └─────────────────────────┘ │
│                             │
│     [Bottom Tab Bar]        │
└─────────────────────────────┘
```

---

### 9.4 Lista de Transações

```
┌─────────────────────────────┐
│ Transações    [🔍] [⚙️ ]    │ ← busca + filtro
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Todas │ Despesas│Receitas│ ← Segmented control, brand-primary
│ └─────────────────────────┘ │
│                             │
│ Maio 2026          R$ 4.620 │ ← label + saldo do período, inline
│                             │
│ ── Hoje ───────────────     │ ← label, text-muted (separador de dia)
│ ┌─────────────────────────┐ │
│ │ [🛒] Supermercado Extra │ │
│ │      Pet Shop • Victor  │ │ ← categoria tag + avatar chip
│ │                  -R$380 │ │
│ └─────────────────────────┘ │
│                             │
│ ── 01 de maio ─────────     │
│ ┌─────────────────────────┐ │
│ │ [💰] Salário maio       │ │
│ │      Receita • Victor   │ │
│ │              +R$5.000   │ │
│ └─────────────────────────┘ │
│                             │
│  ← swipe item para deletar  │ ← hint sutil na 1ª vez
│                             │
│           [  +  ]           │ ← FAB fixo, bottom-right
│     [Bottom Tab Bar]        │
└─────────────────────────────┘

Bottom Sheet de Filtros (ao tocar ⚙️):
┌─────────────────────────────┐
│        ──────               │ ← handle
│  Filtros                  x │
│                             │
│  Período                    │
│  [  01/05  ]  até  [31/05] ]│ ← Date pickers
│                             │
│  Tipo                       │
│  [Despesa ✓] [Receita] [Tudo│ ← Chips selecionáveis
│                             │
│  Categoria                  │
│  [🍔 Alim.] [🚗 Transp.]   │ ← Grid de tags, múltipla seleção
│  [🏠 Casa ] [+ outras...]  │
│                             │
│ [       Aplicar filtros   ] │
└─────────────────────────────┘
```

---

### 9.5 Adicionar Transação

```
┌─────────────────────────────┐
│ ←  Nova transação           │
├─────────────────────────────┤
│                             │
│ ┌─────────────────────────┐ │
│ │  Despesa  │  Receita    │ │ ← Toggle: expense/income cor
│ └─────────────────────────┘ │
│                             │
│          R$                 │ ← text-secondary, h3
│        0,00                 │ ← display Bold, centralizado
│   ________________________  │ ← bottom border animated
│                             │
│  ┌────────────────────────┐ │
│  │ 📝  Descrição          │ │ ← Input padrão
│  └────────────────────────┘ │
│                             │
│  ┌────────────────────────┐ │
│  │ 📅  Hoje, 03/05/2026   │ │ ← Date picker (toque abre modal)
│  └────────────────────────┘ │
│                             │
│  Categoria                  │ ← label
│  ┌────────────────────────┐ │
│  │ 🏷️  Sugestão: Pet Shop  │ │ ← IA sugeriu (badge "IA" pequeno)
│  │ [🍔][🚗][🏠][❤️][🎮]  │ │ ← grid de categorias, scroll H
│  └────────────────────────┘ │
│                             │
│  Pago por                   │ ← label
│  ┌──────────┐┌─────────────┐│
│  │ [V] Victor││ [M] Maria  ││ ← Chips com avatar
│  └──────────┘└─────────────┘│
│                             │
│ [     Salvar transação    ] │ ← Botão primário
│                             │
└─────────────────────────────┘

Comportamento:
  - Teclado numérico abre automaticamente no campo de valor
  - Categoria sugerida pela IA aparece pré-selecionada com badge "IA 🤖"
  - Ao salvar: animação de sucesso (check + haptic) → volta para lista
  - Campo valor: formata automaticamente enquanto digita
```

---

### 9.6 Metas Financeiras

```
┌─────────────────────────────┐
│  Metas           [+ Nova]   │ ← ghost button direito
├─────────────────────────────┤
│                             │
│  Vocês já guardaram         │ ← body-lg, text-secondary
│  R$ 500,00 juntos! 💪       │ ← h3, text-primary
│                             │
│ ┌─────────────────────────┐ │
│ │ ✈️  Viagem para Europa   │ │ ← Card de meta (destaque)
│ │                         │ │
│ │  R$ 500           3%    │ │ ← valor atual + %
│ │  ████░░░░░░░░░░░░░░░░░  │ │ ← progress bar animada
│ │  de R$ 15.000           │ │ ← valor alvo, text-secondary
│ │                         │ │
│ │  📅 Faltam 13 meses     │ │ ← label, text-muted
│ │  💡 Guardem R$1.208/mês │ │ ← sugestão calculada
│ └─────────────────────────┘ │
│                             │
│  [  + Adicionar progresso ] │ ← Botão secundário
│                             │
│  Metas concluídas     (0)   │ ← seção colapsável, label
│                             │
│           [  +  ]           │ ← FAB
│     [Bottom Tab Bar]        │
└─────────────────────────────┘

Bottom Sheet — Nova Meta:
┌─────────────────────────────┐
│        ──────               │
│  Nova meta              x   │
│                             │
│  ┌────────────────────────┐ │
│  │ 🎯  Nome da meta       │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │ R$  Valor alvo         │ │
│  └────────────────────────┘ │
│  ┌────────────────────────┐ │
│  │ 📅  Data limite (opc.) │ │
│  └────────────────────────┘ │
│                             │
│  Ícone    Cor               │
│  [✈️][🏠][🎓][🚗][💍][⭐]  │ ← grid de ícones
│  [● ● ● ● ● ●]             │ ← seletor de cor circular
│                             │
│ [      Criar meta 💕      ] │ ← Botão casal
└─────────────────────────────┘
```

---

## 10. Tokens NativeWind (tailwind.config.js)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary:    '#7C6AF7',
          'primary-dim': '#5B4ED4',
          secondary:  '#34D399',
          couple:     '#F472B6',
          'couple-dim': '#DB2777',
        },
        bg: {
          base:     '#0C0C14',
          surface:  '#161622',
          elevated: '#1E1E30',
          input:    '#1A1A28',
        },
        text: {
          primary:   '#F1F0FF',
          secondary: '#9896B0',
          muted:     '#5C5A74',
          inverse:   '#0C0C14',
        },
        income:  '#34D399',
        expense: '#F87171',
        warning: '#FBBF24',
        border: {
          DEFAULT: '#2A2A3E',
          focus:   '#7C6AF7',
          error:   '#F87171',
          glass:   '#FFFFFF1A',
        },
      },
      fontFamily: {
        sora:       ['Sora_700Bold', 'Sora_600SemiBold'],
        inter:      ['Inter_400Regular', 'Inter_500Medium', 'Inter_600SemiBold'],
        mono:       ['Inter_500Medium'],
      },
      borderRadius: {
        sm:   '8px',
        md:   '12px',
        lg:   '16px',
        xl:   '20px',
        '2xl': '24px',
      },
    },
  },
}
```

---

## 11. Checklist de Implementação Mobile

### Setup inicial
- [ ] `npx create-expo-app apps/mobile --template blank-typescript`
- [ ] Instalar NativeWind + Tailwind
- [ ] Instalar `@expo-google-fonts/inter` + `@expo-google-fonts/sora`
- [ ] Instalar React Navigation (native + bottom-tabs + stack)
- [ ] Instalar Victory Native + react-native-svg
- [ ] Instalar `lucide-react-native`
- [ ] Instalar `react-native-reanimated` + `react-native-gesture-handler`
- [ ] Instalar `@gorhom/bottom-sheet`
- [ ] Configurar `expo-haptics`
- [ ] Configurar safe area (`react-native-safe-area-context`)

### Estrutura de pastas sugerida
```
apps/mobile/src/
├── components/
│   ├── ui/          # Button, Input, Card, Tag, Avatar...
│   ├── transaction/ # TransactionItem, TransactionForm
│   ├── dashboard/   # BalanceCard, CategoryChart, CoupleBar
│   └── meta/        # GoalCard, GoalProgress
├── screens/
│   ├── auth/        # Login, Register, InviteSetup
│   ├── dashboard/   # DashboardScreen
│   ├── transactions/# TransactionList, AddTransaction
│   ├── goals/       # GoalsScreen
│   └── profile/     # ProfileScreen
├── navigation/
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── AppNavigator.tsx (bottom tabs)
├── hooks/           # useAuth, useTransactions, useDashboard
├── services/        # api.ts (axios/fetch wrapper)
├── stores/          # Zustand stores
└── utils/           # formatCurrency, formatDate
```
