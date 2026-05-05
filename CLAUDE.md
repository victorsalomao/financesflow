# FinanceFlow — App de Finanças do Casal

## Contexto do Projeto
App mobile de controle financeiro para casal (2 usuários).
Foco: controle de gastos da casa, divisão de contas, metas conjuntas.

## Stack
- Frontend: React Native com Expo
- Backend: Node.js com Fastify + TypeScript
- Microsserviço IA: FastAPI (Python)
- Banco: Supabase (PostgreSQL)
- IA: OpenAI API (gpt-4o-mini)
- Open Banking: Pluggy SDK
- Notificações: WhatsApp API Meta

## Idioma do Código
- Entidades do banco de dados: PORTUGUÊS
- Variáveis e funções no código: inglês
- Comentários: português
- Mensagens de erro para o usuário: português

## Estrutura de Pastas
financeflow/
├── apps/
│   ├── mobile/          # React Native Expo
│   └── backend/         # Node.js Fastify
├── services/
│   └── ia/              # FastAPI Python
├── banco/
│   └── migrations/      # SQL migrations do Supabase
└── docs/

## Regras de Segurança (NUNCA ignorar)
- Row Level Security (RLS) OBRIGATÓRIO em todas as tabelas
- Usuário só acessa dados do próprio `domicilio`
- JWT do Supabase em todas as rotas autenticadas
- FastAPI nunca exposta publicamente

## Modelo de Dados — Entidades em Português
Tabelas principais:
- `usuarios` → integrado ao Supabase Auth
- `domicilios` → unidade do casal
- `membros_domicilio` → relação usuário <-> domicílio
- `contas_bancarias` → contas/cartões sincronizados
- `transacoes` → coração do sistema
- `categorias` → padrão + customizadas
- `metas` → objetivos financeiros
- `contas_recorrentes` → boletos e vencimentos

## MVP — O que entra na v1
✅ Autenticação do casal (invite por código)
✅ CRUD de transações manuais
✅ Categorização automática com IA
✅ Dashboard básico (saldo, gastos do mês, últimas transações)
✅ Divisão simples de despesas (50/50 ou percentual)

❌ Open Banking (v2)
❌ WhatsApp bot (v2)
❌ Exportação PDF/Excel (v2)
❌ Investimentos (v3)

## Padrão de Resposta da API
```json
{
  "sucesso": true,
  "dados": {},
  "mensagem": "Operação realizada com sucesso"
}
```

## Decisões Técnicas

### 1. Chaves Supabase `sb_secret_` não bypassam RLS no PostgREST
**Problema:** O projeto usa o novo formato de chaves do Supabase (`sb_publishable_` / `sb_secret_`), que são opaque tokens — não JWTs. O PostgREST desta versão do Supabase espera um JWT com `role: "service_role"` para conceder bypass de RLS. Com o novo formato, o cliente admin (`supabase.from(...).insert()`) sofre bloqueio de RLS como se fosse um usuário comum.

**Solução adotada:** Todas as operações que precisam de privilégio elevado (escrever fora do contexto do próprio usuário) foram implementadas como funções PostgreSQL `SECURITY DEFINER`. Essas funções rodam com as permissões do dono da função (superusuário do Supabase), bypassando RLS corretamente, e são chamadas via `supabase.rpc()` com o JWT do usuário.

**Funções criadas:**
- `fn_criar_usuario(p_auth_id, p_nome, p_email)` — insere na tabela `usuarios` após registro
- `fn_criar_domicilio(p_nome, p_codigo, p_usuario_id)` — cria domicílio e adiciona o criador como admin atomicamente
- `fn_entrar_domicilio(p_codigo, p_usuario_id)` — valida convite e insere membro atomicamente
- `fn_buscar_por_convite(p_codigo)` — busca domicílio por código sem expor todos os registros
- `fn_convite_existe(p_codigo)` — verifica unicidade do código de convite
- `fn_domicilio_do_usuario()` — retorna o `domicilio_id` do usuário autenticado (usada nas políticas RLS)
- `fn_id_do_usuario()` — retorna o `usuarios.id` do usuário autenticado

**Regra:** Nunca usar o cliente admin (`supabase`) para operações de dados (`.from()`). Usar sempre `supabaseAuth(token)` + funções SECURITY DEFINER quando necessário.

---

### 2. `getDomicilioId` via RPC, não via join
**Problema:** A implementação original fazia um join `membros_domicilio ← usuarios` com filtro em tabela relacionada (`.eq('usuarios.auth_id', authId)`). Essa sintaxe do PostgREST é frágil com RLS ativo em ambas as tabelas.

**Solução adotada:** Todos os services usam `db.rpc('fn_domicilio_do_usuario')` para obter o `domicilio_id`. A função é SECURITY DEFINER, retorna o valor direto do JWT e é a mesma usada pelas políticas RLS — garantindo consistência.

---

### 3. Registro com `admin.createUser` + rollback manual
**Problema:** `supabase.auth.admin.createUser()` cria o usuário no Supabase Auth mas não retorna sessão. Se o passo seguinte (inserir em `usuarios`) falhar, fica um usuário órfão no Auth sem registro no banco.

**Solução adotada:** Após `admin.createUser`, faz-se imediatamente `signInWithPassword` para obter o JWT, depois chama `fn_criar_usuario` via `supabaseAuth`. Se qualquer passo falhar, `supabase.auth.admin.deleteUser()` é chamado para garantir consistência. O registro já retorna o token de sessão, evitando um segundo request de login.

---

### 4. Aplicar migrations manualmente no Supabase SQL Editor
**Problema:** A Management API do Supabase (`api.supabase.com`) exige um Personal Access Token (PAT), não a service role key. Sem PAT ou `DATABASE_URL` no `.env`, não é possível rodar migrations programaticamente.

**Solução adotada:** Migrations aplicadas manualmente em `https://supabase.com/dashboard/project/hzeainzefjdpmrbhvqyk/sql/new`. Para automatizar no futuro, adicionar ao `.env`:
```
DATABASE_URL=postgresql://postgres.[project-id]:[senha]@aws-0-[region].pooler.supabase.com:6543/postgres
```
E rodar `npx tsx scripts/migrate.ts` (script em `apps/backend/scripts/migrate.ts` aplica todas as migrations de `banco/migrations/` em ordem alfanumérica; valida `DATABASE_URL` antes de conectar).

---

### 5. Confirmação de email desabilitada via `admin.createUser`
**Problema:** O free tier do Supabase tem rate limit baixo de envio de emails. Usar `auth.signUp()` padrão dispararia emails de confirmação e bloquearia testes rapidamente.

**Solução adotada:** `admin.createUser({ email_confirm: true })` cria o usuário já confirmado, sem enviar email. Adequado para o modelo do app (fechado por convite — confirmação de email não agrega valor ao fluxo).

---

### 6. `KeyboardAvoidingView` deve envolver o `SafeAreaView` (não o contrário)
**Problema:** Com `SafeAreaView` por fora, ele consome o espaço do bottom antes do KAV calcular o offset do teclado. No iOS (iPhone 15 Pro Max), o botão de submit desaparecia ao abrir o teclado.

**Solução adotada:** `KeyboardAvoidingView` por fora com `behavior="padding"` no iOS e `"height"` no Android. `SafeAreaView` por dentro com `edges={['top','left','right']}` (exclui bottom para não interferir). `paddingBottom: 60` no ScrollView como buffer adicional.

---

### 7. Resposta de auth normalizada
**Problema:** Backend retornava `{ token, usuario: supabaseUser }` — mobile esperava `{ access_token, usuario: { id, auth_id, nome, email, domicilio_id } }`. Três inconsistências: nome do campo, tipo do objeto usuario, ausência de `domicilio_id`.

**Solução adotada:** `auth.service.ts` atualizado — todos os endpoints retornam `access_token`. O `login()` faz duas queries extras com o JWT: busca o perfil na tabela `usuarios` + chama `fn_domicilio_do_usuario()` para obter `domicilio_id`. `criarDomicilio` e `entrarDomicilio` retornam `{ domicilio, usuario }` com `domicilio_id` já preenchido.

---

### 8. IP local para testes com dispositivo físico
**Problema:** `localhost` não funciona em dispositivo físico — o iPhone não alcança o `localhost` do computador.

**Solução adotada:** Usar o IP local do adaptador Ethernet via `ipconfig`. Desktop via cabo + iPhone via Wi-Fi no mesmo roteador = mesma rede local. Configurar `apps/mobile/.env` com `EXPO_PUBLIC_API_URL=http://192.168.x.x:3333`.

---

## Como rodar localmente

### Backend
```bash
cd apps/backend
npm run dev        # inicia em http://0.0.0.0:3333
```
Verificar se está online: `curl http://localhost:3333/health` → `{"status":"ok"}`

**Pré-requisito:** `apps/backend/.env` deve existir com as variáveis abaixo (não usar o `.env` da raiz — o tsx não o encontra):
```
PORT=3333
SUPABASE_URL=https://hzeainzefjdpmrbhvqyk.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
IA_SERVICE_URL=http://localhost:8000
```

### Mobile
```bash
cd apps/mobile
npx expo start     # escanear QR com Expo Go no iPhone
```
`apps/mobile/.env` deve apontar para o IP local da máquina (não localhost):
```
EXPO_PUBLIC_API_URL=http://192.168.0.44:3333
```
IP atual da máquina: **192.168.0.44** (verificar com `ipconfig` se mudar).

---

## Status do Projeto
- ✅ Backend MVP (Node.js + Fastify) — porta 3333, 22 endpoints validados
- ✅ Microsserviço IA (FastAPI Python) — `POST /categorizar` com gpt-4o-mini
- ✅ Design System — `docs/DESIGN_SYSTEM.md` (dark theme, NativeWind tokens, wireframes)
- ✅ Mobile MVP (React Native + Expo) — todas as telas implementadas

## Mobile — Estrutura Implementada

```
apps/mobile/
├── babel.config.js          ← NativeWind v4 (jsxImportSource)
├── metro.config.js           ← withNativeWind
├── global.css                ← @tailwind base/components/utilities
├── tailwind.config.js        ← design system tokens completos
├── nativewind-env.d.ts       ← tipos NativeWind para TS
├── App.tsx                   ← AuthProvider + RootNavigator + StatusBar
└── src/
    ├── context/AuthContext.tsx       ← estado de auth (in-memory, React Context)
    ├── services/api.ts               ← cliente HTTP, todos os endpoints
    ├── utils/format.ts               ← formatCurrency, formatDate, currentMonthParam
    ├── navigation/
    │   ├── RootNavigator.tsx         ← lógica Auth vs App
    │   ├── AuthNavigator.tsx         ← Login → Register → Domicilio → Convite
    │   └── AppNavigator.tsx          ← Bottom tabs + FAB central
    └── screens/
        ├── auth/
        │   ├── LoginScreen.tsx       ← e-mail + senha, redirect pós-login
        │   ├── RegisterScreen.tsx    ← nome + e-mail + senha
        │   ├── DomicilioScreen.tsx   ← criar casa OU entrar com código
        │   └── ConviteScreen.tsx     ← exibe código + Share nativo
        ├── dashboard/
        │   └── DashboardScreen.tsx   ← saldo, categorias, últimas transações
        ├── transactions/
        │   ├── TransactionListScreen.tsx ← lista filtrada, long-press para deletar
        │   └── AddTransactionScreen.tsx  ← modal de nova transação
        ├── goals/
        │   └── GoalsScreen.tsx       ← lista de metas + bottom sheet criar
        └── profile/
            └── ProfileScreen.tsx     ← dados do usuário + logout
```

## Próximas melhorias (v2 Mobile)
- Persistência de token com `@react-native-async-storage/async-storage`
- Fontes Sora/Inter com `@expo-google-fonts`
- Haptics com `expo-haptics`
- Bottom sheets com `@gorhom/bottom-sheet`
- Integração com IA para sugestão de categoria na tela de nova transação
- Tela de detalhes da transação (edição)
- Pull-to-refresh animado
- Push notifications