# Quick Start - Setup Independente em 5 Minutos

## Resumo Rápido

Este projeto é um **sistema completo de fidelidade e cashback** que pode ser executado de forma independente.

## O que você precisa:

1. **Node.js 18+** - https://nodejs.org
2. **MySQL 8.0+** - https://mysql.com ou use Docker
3. **Git** - https://git-scm.com

## Setup Rápido (5 minutos)

### 1. Preparar Banco de Dados

**Com Docker (mais fácil):**
```bash
docker run --name mysql-fidelidade \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=fidelidade_whatsapp \
  -e MYSQL_USER=fidelidade \
  -e MYSQL_PASSWORD=senha123 \
  -p 3306:3306 \
  -d mysql:8.0
```

**Ou instale MySQL localmente** (veja DEPLOYMENT.md)

### 2. Clonar e Configurar

```bash
# Extrair arquivos do projeto
cd fidelidade-whatsapp

# Instalar dependências
pnpm install

# Criar arquivo .env.local
cat > .env.local << 'EOF'
DATABASE_URL="mysql://fidelidade:senha123@localhost:3306/fidelidade_whatsapp"
JWT_SECRET="sua_chave_secreta_aleatoria_aqui_32_caracteres"
VITE_APP_TITLE="Fidelidade WhatsApp"
VITE_APP_ID="local-dev"
OWNER_OPEN_ID="admin"
OWNER_NAME="Administrador"
EOF
```

### 3. Criar Banco de Dados

```bash
pnpm drizzle-kit generate
pnpm drizzle-kit migrate
```

### 4. Executar

```bash
pnpm dev
```

Acesse: **http://localhost:3000**

## Próximos Passos

1. **Fazer Login** - Use qualquer conta (será criada automaticamente)
2. **Cadastrar Clientes** - Menu "Clientes" → "Novo Cliente"
3. **Registrar Compras** - Clique no cliente → "Registrar Compra"
4. **Conectar WhatsApp** - Menu "WhatsApp" → Escanear QR Code
5. **Configurar Automações** - Menu "Automações" → "Novo Trigger"

## Estrutura do Projeto

```
Backend (Node.js + Express + tRPC)
├── server/routers/        - API endpoints
├── server/business.ts     - Lógica de pontos/cashback
├── server/automation.ts   - Automações de envio
└── server/whatsapp.ts     - Integração WhatsApp

Frontend (React + Tailwind)
├── client/src/pages/      - Páginas do dashboard
├── client/src/components/ - Componentes reutilizáveis
└── client/src/lib/        - Utilitários

Banco de Dados (MySQL)
├── customers              - Clientes
├── wallets                - Saldo de pontos/cashback
├── transactions           - Histórico de operações
├── campaigns              - Campanhas promocionais
├── automation_triggers    - Triggers de automação
└── whatsapp_sessions      - Sessões WhatsApp conectadas
```

## Funcionalidades Principais

✅ **Gestão de Clientes** - Cadastro, busca, histórico
✅ **Sistema de Pontos** - Acumular por compra (configurável)
✅ **Cashback** - Converter pontos em créditos (por tier)
✅ **Tiers** - Bronze (5%), Prata (7%), Ouro (10%)
✅ **Campanhas** - Pontos em dobro, bônus aniversário
✅ **Recompensas** - Criar e gerenciar prêmios
✅ **WhatsApp** - Enviar notificações automáticas
✅ **Automações** - Triggers para eventos
✅ **Relatórios** - Análises e gráficos
✅ **Dashboard** - Métricas em tempo real

## Variáveis de Ambiente Essenciais

| Variável | O que é | Exemplo |
|----------|---------|---------|
| `DATABASE_URL` | Conexão MySQL | `mysql://user:pass@localhost:3306/db` |
| `JWT_SECRET` | Chave de segurança | Gere com: `openssl rand -base64 32` |
| `VITE_APP_TITLE` | Nome do app | "Fidelidade WhatsApp" |
| `OWNER_OPEN_ID` | ID do admin | "admin" |
| `OWNER_NAME` | Nome do admin | "Seu Nome" |

## Troubleshooting Rápido

**Erro: Port 3000 em uso**
```bash
PORT=3001 pnpm dev
```

**Erro: Banco de dados não conecta**
```bash
# Verificar se MySQL está rodando
mysql -u fidelidade -p -h localhost

# Verificar DATABASE_URL no .env.local
cat .env.local | grep DATABASE_URL
```

**Erro: Módulos não encontrados**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## Deploy em Produção

Veja **DEPLOYMENT.md** para opções de:
- Railway
- Render
- Vercel + Supabase
- VPS (DigitalOcean, AWS, etc)

## Documentação Completa

Veja **DEPLOYMENT.md** para guia detalhado de setup, autenticação, WhatsApp Web e deployment.

## Suporte

Consulte a documentação dos projetos usados:
- **tRPC** - https://trpc.io
- **Drizzle ORM** - https://orm.drizzle.team
- **Baileys (WhatsApp)** - https://github.com/WhiskeySockets/Baileys
- **React** - https://react.dev

---

**Pronto para começar?** Execute `pnpm dev` e acesse http://localhost:3000 🚀
