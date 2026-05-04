# Transactions Screen — Handoff Comparison

**Source:** VictorFinances Screen Handoff.html + VictorFinances Prototype.html  
**Date:** 2026-05-04  
**File audited:** `apps/mobile/src/screens/transactions/TransactionListScreen.tsx`

---

## Items that match the prototype ✅

| Element | Spec | Implementation |
|---|---|---|
| Screen background | `#09091A` | `T.bg` |
| Header title | fontSize 20, fontWeight 800, letterSpacing -0.5 | ✅ |
| Header subtitle | `{n} registros · saldo {fmt}` | ✅ |
| Filter pills container | `paddingHorizontal: 16, paddingVertical: 12, gap: 8` | ✅ |
| Filter pill height | 36 | ✅ |
| Filter pill borderRadius | 10 | ✅ |
| Filter pill active colors | violet/rose/emerald per type | ✅ |
| Section header padding | `paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4` | ✅ |
| Section header text | fontSize 10, fontWeight 700, uppercase, letterSpacing 1.5, color T.muted | ✅ |
| Section header sticky | `stickySectionHeadersEnabled={true}` | ✅ |
| Section header background | `T.bg` (opaque, prevents bleed-through) | ✅ |
| Date labels | Hoje / Ontem / weekday long + day + short month | ✅ |
| Group card | `bg: T.card (#13142A), marginHorizontal: 16, marginBottom: 8, borderRadius: 16, borderWidth: 1, borderColor: T.border` | ✅ |
| Item padding | `padding: 13, paddingHorizontal: 16` | ✅ |
| Item icon size | 44×44, borderRadius 13 | ✅ |
| Item icon border | `cor + '28'` | ✅ |
| Item icon bg | `cor + '18'` | ✅ |
| Item icon glyph | `trending-up` (receita) / `trending-down` (despesa) | ✅ |
| Item title | fontSize 14, fontWeight 600, color T.text, numberOfLines 1 | ✅ |
| Category chip | `bg: cor+'18', borderRadius 4, px 5, py 1, fontSize 10, fontWeight 600` | ✅ |
| User name text | fontSize 11, color T.muted, prefix `·` | ✅ |
| Amount | fontSize 14, fontWeight 700, color emerald/rose | ✅ |
| Amount prefix | `+` (receita) / `−` (en-dash, despesa) | ✅ |
| Item divider | `borderBottomWidth: 1, borderBottomColor: rgba(255,255,255,0.04)` except last | ✅ |
| Long-press delete | Alert with Cancelar / Excluir | ✅ |
| Loading state | `ActivityIndicator` centered, marginTop 60 | ✅ |
| Empty state | Icon + label + hint, centered, marginTop 80 | ✅ |
| Pull to refresh | `RefreshControl`, tintColor T.violet | ✅ |
| Bottom padding | `contentContainerStyle: { paddingBottom: 100 }` | ✅ |
| SectionList architecture | One-item-per-section pattern (`data: [TransacaoData[]]`) | ✅ |

---

## Differences found and corrected

| # | Element | Prototype spec | Before fix | Fix applied |
|---|---|---|---|---|
| 1 | Saldo display | `fmt(Math.abs(total))` — always positive, color signals sign | `formatCurrency(total)` — could render negative number | Changed to `formatCurrency(Math.abs(total))` |
| 2 | Secondary row gap | `gap: 6` between category chip and user name | `gap: 4` | Changed to `gap: 6` |

---

## Notes

- **categoria via IA**: The prototype assumes `categoria_nome` comes from the API response. The backend AI microservice auto-categorises on create; the list endpoint already returns `categoria_nome` on each transaction. No backend change needed.
- **usuario_nome**: Returned by the API when transactions include multi-user context. The field renders correctly when present and is hidden when absent.
- **No expo-linear-gradient**: Gradient fills in the prototype are approximated with solid colors (gradient start color). Package is not installed; this is a known v2 item.
- **expo-haptics**: Long-press / save haptic feedback (handoff step 8) not yet implemented — package not installed. Queued for v2.
