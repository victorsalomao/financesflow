# FinanceFlow — Progresso do Projeto

## Status Geral

| Módulo | Status | Observação |
|---|---|---|
| Banco (Supabase) | ✅ Concluído | 5 migrations aplicadas, schema + RLS completo |
| Backend (Fastify) | ✅ Concluído | 22 endpoints, porta 3333 |
| Microsserviço IA (FastAPI) | ✅ Concluído | `POST /categorizar` com gpt-4o-mini |
| Mobile (Expo) | 🔄 Em testes | MVP completo, bugs críticos corrigidos na sessão 2 |

---

## Sessão 2 — Mobile MVP (03/05/2026)

### O que foi desenvolvido

Setup completo do NativeWind v4 + 22 arquivos criados do zero:

**Configuração:**
- `babel.config.js` — NativeWind v4 (`jsxImportSource: 'nativewind'`) + reanimated plugin
- `metro.config.js` — `withNativeWind` apontando para `global.css`
- `global.css` — imports tailwind base/components/utilities
- `tailwind.config.js` — atualizado com tokens completos do design system (brand, bg, text, income, expense, border)
- `nativewind-env.d.ts` — tipos TypeScript para prop `className`

**Foundation:**
- `src/context/AuthContext.tsx` — estado de auth in-memory (token + usuario), funções `signIn/signOut/updateUsuario`
- `src/services/api.ts` — cliente HTTP para todos os endpoints com tipos TypeScript
- `src/utils/format.ts` — `formatCurrency`, `formatDate`, `formatMonthLabel`, `currentMonthParam`

**Navegação:**
- `RootNavigator.tsx` — direciona Auth vs App com base em `token + domicilio_id`
- `AuthNavigator.tsx` — Login → Register → Domicilio → Convite
- `AppNavigator.tsx` — 4 tabs (Dashboard, Transações, Metas, Perfil) + FAB central que abre `AddTransaction` como modal

**Telas (9 telas):**
| Tela | Funcionalidades |
|---|---|
| LoginScreen | Email + senha, redirect inteligente pós-login |
| RegisterScreen | Nome + email + senha → vai direto para Domicílio |
| DomicilioScreen | Criar casa OU entrar com código de convite (8 chars) |
| ConviteScreen | Exibe código gerado, Share nativo do SO |
| DashboardScreen | Saldo do mês, receitas/despesas, barras por categoria, últimas transações, pull-to-refresh |
| TransactionListScreen | Lista filtrada (todas/despesas/receitas), long-press para deletar |
| AddTransactionScreen | Toggle tipo, input de valor formatado, categorias, data, salvar |
| GoalsScreen | Lista com progress bar, modal bottom-sheet para criar, long-press para deletar |
| ProfileScreen | Avatar com iniciais, dados do usuário, menu de opções, logout com confirmação |

**Decisão técnica — zero dependências extras:**
Usou apenas pacotes já instalados + `@expo/vector-icons` (bundled no Expo SDK 54). Evitou zustand, AsyncStorage, @gorhom/bottom-sheet para manter MVP simples. Auth state é in-memory (usuário precisa logar novamente após fechar o app — aceito para MVP).

---

### Bugs encontrados e corrigidos

#### Bug 1 — `babel-preset-expo` não instalado
**Sintoma:** `Cannot find module 'babel-preset-expo'` ao escanear QR.
**Causa:** Pacote não estava no `package.json` do mobile.
**Fix:** `npm install babel-preset-expo`

#### Bug 2 — Botão de cadastrar não aparecia no iOS (iPhone 15 Pro Max)
**Sintoma:** Usuário preenchia os campos mas o botão "Cadastrar" ficava invisível.
**Causa raiz:** Ordem errada das views. `SafeAreaView` envolvia o `KeyboardAvoidingView`, consumindo o espaço do bottom antes do KAV calcular o offset do teclado. Com o teclado aberto, o botão caía abaixo da área visível.
**Fix:** Inverter a hierarquia — `KeyboardAvoidingView` por fora, `SafeAreaView` com `edges={['top','left','right']}` por dentro. Também adicionado `paddingBottom: 60` no ScrollView e `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` para cobrir ambas as plataformas.
**Telas afetadas:** LoginScreen, RegisterScreen, DomicilioScreen, AddTransactionScreen.
**Extra:** Renomeado "Continuar →" → "Cadastrar" e adicionado `onSubmitEditing={handleRegister}` no campo senha (botão "Concluído" do teclado iOS já submete o form).

#### Bug 3 — Network request failed
**Sintoma:** Erro de rede ao tentar cadastrar.
**Causa:** `localhost` não funciona em dispositivo físico — o iPhone não alcança o `localhost` do computador.
**Fix:** Usar o IP local do computador na rede (via `ipconfig`). Criar `apps/mobile/.env` com `EXPO_PUBLIC_API_URL=http://192.168.x.x:3333`. Desktop via cabo Ethernet no mesmo roteador que o iPhone Wi-Fi = mesma rede local.

#### Bug 4 — Auth routes com prefixo errado
**Sintoma:** Todas as chamadas de auth retornavam 404.
**Causa:** Backend registra rotas com prefixo `/auth/`, mas `api.ts` chamava `/login`, `/registro` etc. sem prefixo.
**Fix:** Atualizado `api.ts` — todas as rotas auth agora usam `/auth/login`, `/auth/registro`, `/auth/domicilio`, `/auth/domicilio/entrar`.

#### Bug 5 — Resposta de login com campo errado (`token` vs `access_token`)
**Sintoma:** `signIn()` recebia `undefined` como token — usuário nunca autenticava.
**Causa:** Backend retornava `{ token, usuario }` mas `AuthData` no mobile esperava `{ access_token, usuario }`.
**Fix:** Atualizado `auth.service.ts` para retornar `access_token` em todos os endpoints de auth.

#### Bug 6 — Login retornava Supabase User sem `domicilio_id`
**Sintoma:** Após login, usuário com domicílio existente sempre caía na tela de Domicílio novamente.
**Causa:** `login()` retornava `data.user` (objeto do Supabase Auth) que não contém `nome`, `domicilio_id` nem os campos customizados da tabela `usuarios`.
**Fix:** `login()` agora faz duas queries adicionais após o `signInWithPassword`: busca o perfil na tabela `usuarios` + chama `fn_domicilio_do_usuario()` via RPC para obter o `domicilio_id`.

#### Bug 7 — `criarDomicilio`/`entrarDomicilio` retornavam formato errado
**Sintoma:** Após criar domicílio, `updateUsuario(data.usuario)` crashava — `data.usuario` era `undefined`.
**Causa:** Backend retornava somente os dados do domicílio (`data[0]` do RPC `fn_criar_domicilio`). Mobile esperava `{ domicilio: {...}, usuario: {...} }`.
**Fix:** Ambas as funções no `auth.service.ts` foram atualizadas para retornar `{ domicilio: { id, nome, codigo_convite }, usuario: { id, auth_id, nome, email, domicilio_id } }`.

---

## Estrutura de Arquivos (completa)

```
financesflow/
├── Claude.md
├── .env                               # Chaves Supabase (não versionar)
│
├── banco/
│   └── migrations/
│       ├── 001_schema_inicial.sql
│       ├── 002_fix_rls_policies.sql
│       ├── 003_funcoes_bootstrap.sql
│       ├── 004_funcao_criar_usuario.sql
│       └── 005_fix_fn_criar_usuario.sql
│
├── apps/
│   ├── backend/
│   │   ├── .env                       # PORT=3333 + Supabase keys
│   │   └── src/
│   │       ├── server.ts              # host: '0.0.0.0', porta 3333
│   │       ├── config/env.ts
│   │       ├── lib/supabase.ts
│   │       ├── lib/ia.ts
│   │       ├── plugins/authenticate.ts
│   │       ├── utils/resposta.ts
│   │       └── modules/
│   │           ├── auth/              # registro, login, domicilio
│   │           ├── transacoes/
│   │           ├── categorias/
│   │           ├── dashboard/
│   │           └── metas/
│   │
│   └── mobile/
│       ├── .env                       # EXPO_PUBLIC_API_URL=http://<IP>:3333
│       ├── babel.config.js            # NativeWind v4 + reanimated
│       ├── metro.config.js            # withNativeWind
│       ├── global.css                 # @tailwind directives
│       ├── tailwind.config.js         # design system tokens
│       ├── nativewind-env.d.ts        # tipos className
│       ├── App.tsx                    # AuthProvider + RootNavigator
│       └── src/
│           ├── context/AuthContext.tsx
│           ├── services/api.ts
│           ├── utils/format.ts
│           └── navigation/
│               ├── RootNavigator.tsx
│               ├── AuthNavigator.tsx
│               └── AppNavigator.tsx
│           └── screens/
│               ├── auth/              # Login, Register, Domicilio, Convite
│               ├── dashboard/         # DashboardScreen
│               ├── transactions/      # TransactionList, AddTransaction
│               ├── goals/             # GoalsScreen
│               └── profile/           # ProfileScreen
│
├── services/
│   └── ia/                            # FastAPI Python
│       ├── main.py
│       └── start.ps1
│
└── docs/
    ├── DESIGN_SYSTEM.md
    └── PROGRESSO.md
```

---

## Rotas do Backend

### Auth — `/auth`
| Método | Rota | Auth | Retorno |
|---|---|---|---|
| `POST` | `/auth/registro` | ❌ | `{ access_token, usuario: { id, auth_id, nome, email, domicilio_id: null } }` |
| `POST` | `/auth/login` | ❌ | `{ access_token, usuario: { id, auth_id, nome, email, domicilio_id } }` |
| `POST` | `/auth/domicilio` | ✅ | `{ domicilio: { id, nome, codigo_convite }, usuario: { ...+ domicilio_id } }` |
| `POST` | `/auth/domicilio/entrar` | ✅ | `{ domicilio: { id, nome, codigo_convite }, usuario: { ...+ domicilio_id } }` |

### Transações — `/transacoes`
| Método | Rota | Query params |
|---|---|---|
| `GET` | `/transacoes` | `data_inicio`, `data_fim`, `tipo`, `categoria_id`, `pagina`, `limite` |
| `POST` | `/transacoes` | — |
| `PUT` | `/transacoes/:id` | — |
| `DELETE` | `/transacoes/:id` | — |

### Dashboard — `/dashboard`
| Rota | Query params |
|---|---|
| `GET /dashboard` | — |
| `GET /dashboard/categorias` | `mes` (YYYY-MM) |
| `GET /dashboard/divisao` | `percentual`, `mes` |

### Metas — `/metas`
`GET /metas` · `POST /metas` · `PUT /metas/:id` · `DELETE /metas/:id`

### Health
`GET /health` → `{ status: "ok" }`

---

## Como rodar localmente

### Backend
```bash
cd apps/backend
npm run dev
# Servidor em http://0.0.0.0:3333
```

### Mobile
```bash
# 1. Descobrir IP local do computador
ipconfig   # Windows — pegar IPv4 do Ethernet ou Wi-Fi

# 2. Criar apps/mobile/.env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3333

# 3. Rodar
cd apps/mobile
npx expo start --clear
# Escanear QR com Expo Go no iPhone
```

### Microsserviço IA (opcional para MVP)
```bash
cd services/ia
.\start.ps1   # Windows
```

---

## Decisões Técnicas

### Banco
1. **Chaves `sb_secret_` não bypassam RLS** — operações privilegiadas usam funções `SECURITY DEFINER` via `rpc()`. Nunca usar `supabase.from()` (admin) para dados.
2. **`fn_domicilio_do_usuario()`** — usada em todos os services para obter `domicilio_id`, evita join frágil com RLS ativo.
3. **Registro retorna token** — `admin.createUser` + `signInWithPassword` imediato. Rollback com `admin.deleteUser` se qualquer passo falhar.
4. **Migrations manuais** — aplicadas no SQL Editor do Supabase (sem `DATABASE_URL` disponível).

### Mobile
5. **KAV fora do SafeAreaView** — `KeyboardAvoidingView` deve envolver o `SafeAreaView`, não o contrário. Caso contrário, o KAV não calcula o offset do teclado corretamente no iOS e botões desaparecem.
6. **Auth state in-memory** — React Context sem `AsyncStorage` para MVP. Usuário precisa re-logar após fechar o app. Planejado para v2.
7. **`@expo/vector-icons` (Ionicons)** — bundled com Expo SDK 54, zero dependências extras. Evitou instalar lucide-react-native.
8. **IP local em vez de localhost** — dispositivo físico não acessa `localhost` do computador. Desktop via Ethernet + iPhone via Wi-Fi no mesmo roteador = mesma rede local. Configurar `EXPO_PUBLIC_API_URL` com IP do Ethernet.

---

## Próximos Passos (v2 Mobile)

- [ ] Persistência de token com `@react-native-async-storage/async-storage` (usuário fica logado)
- [ ] Fontes Sora/Inter com `@expo-google-fonts`
- [ ] Integração com IA para sugestão de categoria na tela de nova transação
- [ ] Tela de detalhes/edição de transação
- [ ] Filtros avançados na lista de transações (período, categoria)
- [ ] Tela de divisão de despesas (`GET /dashboard/divisao`)
- [ ] Tela de detalhes do domicílio com código de convite
- [ ] Push notifications
