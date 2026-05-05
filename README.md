# FinanceFlow

App mobile de controle financeiro para casais. Foco em controle compartilhado de gastos, divisão de contas e metas conjuntas — com ajuda de IA para categorização automática e captura de transações por linguagem natural.

## Stack

| Camada | Tecnologia |
|---|---|
| Mobile | React Native + Expo SDK 54 (TypeScript) |
| Backend | Node.js + Fastify (TypeScript) |
| Microsserviço IA | FastAPI (Python) com OpenAI `gpt-4o-mini` |
| Banco de dados | Supabase (PostgreSQL com Row Level Security) |
| Autenticação | Supabase Auth (JWT) |

## Estrutura de pastas

```
financeflow/
├── apps/
│   ├── mobile/      # React Native Expo
│   └── backend/     # Node.js Fastify
├── services/
│   └── ia/          # FastAPI Python (microsserviço de IA)
├── banco/
│   └── migrations/  # SQL migrations do Supabase
└── docs/
```

## Como rodar localmente

Pré-requisitos:
- Node.js 20+ e npm
- Python 3.10+
- Conta no Supabase com projeto criado e migrations aplicadas (em `banco/migrations/`)
- Chave da OpenAI

### Backend Fastify

```bash
cd apps/backend
cp .env.example .env  # preencher SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_SECRET_KEY
npm install
npm run dev           # http://localhost:3333
```

### Mobile Expo

```bash
cd apps/mobile
npm install
# Crie apps/mobile/.env apontando para o IP local da máquina (não localhost):
#   EXPO_PUBLIC_API_URL=http://192.168.x.x:3333
npx expo start --clear
# Escanear QR code com Expo Go no dispositivo físico
```

### Microsserviço IA

```bash
cd services/ia
pip install -r requirements.txt
# Definir OPENAI_API_KEY em .env
./start.sh   # macOS/Linux
# ou
./start.ps1  # Windows
# Roda em http://localhost:8000 (não exposta publicamente)
```

## Status do MVP

- ✅ Autenticação do casal (invite por código)
- ✅ CRUD de transações manuais com categoria persistida
- ✅ Categorização automática com IA (sugestão conforme descrição)
- ✅ Captura assistida (parser de linguagem natural com preview de confirmação)
- ✅ Dashboard (saldo, gastos do mês, últimas transações, divisão de despesas)
- ✅ Persistência de sessão (AsyncStorage)
- ✅ Refresh automático entre telas

Próximos passos: ver `docs/PROGRESSO.md`.

## Idioma

- Entidades de banco: português
- Variáveis e funções no código: inglês
- Comentários: português
- Mensagens de erro para o usuário: português

## Licença

Privado.
