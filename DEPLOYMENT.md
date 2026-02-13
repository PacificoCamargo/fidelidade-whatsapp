# Guia de Deployment Independente - Sistema de Fidelidade WhatsApp

Este guia mostra como executar o sistema de forma independente fora da plataforma Manus.

## Pré-requisitos

- **Node.js** 18+ (https://nodejs.org)
- **pnpm** (gerenciador de pacotes) - instale com: `npm install -g pnpm`
- **MySQL** 8.0+ ou **MariaDB** (banco de dados)
- **Git** (para clonar o repositório)

## Passo 1: Preparar o Banco de Dados

### Opção A: MySQL Local

```bash
# Instalar MySQL (macOS com Homebrew)
brew install mysql

# Iniciar MySQL
brew services start mysql

# Acessar MySQL
mysql -u root

# Criar banco de dados
CREATE DATABASE fidelidade_whatsapp;
CREATE USER 'fidelidade'@'localhost' IDENTIFIED BY 'sua_senha_segura';
GRANT ALL PRIVILEGES ON fidelidade_whatsapp.* TO 'fidelidade'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Opção B: MySQL com Docker

```bash
# Instalar Docker (https://docker.com)

# Executar MySQL em container
docker run --name mysql-fidelidade \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=fidelidade_whatsapp \
  -e MYSQL_USER=fidelidade \
  -e MYSQL_PASSWORD=sua_senha_segura \
  -p 3306:3306 \
  -d mysql:8.0
```

### Opção C: Banco de Dados Online

Use serviços como:
- **PlanetScale** (MySQL compatível) - https://planetscale.com
- **Railway** - https://railway.app
- **Render** - https://render.com

## Passo 2: Clonar e Configurar o Projeto

```bash
# Clonar o repositório (você receberá os arquivos)
cd seu-diretorio
unzip fidelidade-whatsapp.zip
cd fidelidade-whatsapp

# Instalar dependências
pnpm install
```

## Passo 3: Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Banco de Dados
DATABASE_URL="mysql://fidelidade:sua_senha_segura@localhost:3306/fidelidade_whatsapp"

# Autenticação (gere valores aleatórios seguros)
JWT_SECRET="sua_chave_jwt_aleatoria_muito_segura_aqui"

# OAuth (desabilitar para uso local)
VITE_APP_ID="local-dev"
OAUTH_SERVER_URL="http://localhost:3000"
VITE_OAUTH_PORTAL_URL="http://localhost:3000"

# Owner (seu usuário admin)
OWNER_OPEN_ID="admin-local"
OWNER_NAME="Seu Nome"

# APIs Manus (opcional - deixe em branco se não usar)
BUILT_IN_FORGE_API_URL=""
BUILT_IN_FORGE_API_KEY=""
VITE_FRONTEND_FORGE_API_URL=""
VITE_FRONTEND_FORGE_API_KEY=""

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=""
VITE_ANALYTICS_WEBSITE_ID=""

# App Info
VITE_APP_TITLE="Fidelidade WhatsApp"
VITE_APP_LOGO="/logo.png"
```

## Passo 4: Criar Banco de Dados

```bash
# Gerar migrations
pnpm drizzle-kit generate

# Aplicar migrations ao banco
pnpm drizzle-kit migrate
```

## Passo 5: Executar em Desenvolvimento

```bash
# Terminal 1: Iniciar servidor backend
pnpm dev

# O servidor estará em http://localhost:3000
```

## Passo 6: Build para Produção

```bash
# Build da aplicação
pnpm build

# Iniciar em produção
pnpm start

# O servidor estará em http://localhost:3000
```

## Passo 7: Configurar Autenticação Local (Sem Manus OAuth)

Para usar sem Manus OAuth, você precisa criar um sistema de autenticação local:

### Opção A: Autenticação Simples (Desenvolvimento)

Edite `server/_core/context.ts`:

```typescript
// Para desenvolvimento, você pode usar um usuário fixo
export const ctx = {
  user: {
    id: 1,
    openId: "admin-local",
    name: "Administrador",
    email: "admin@local.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  }
};
```

### Opção B: Autenticação com Senha (Recomendado)

Crie um arquivo `server/auth-local.ts`:

```typescript
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function authenticateLocal(email: string, password: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Em produção, use bcrypt para hash de senhas
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user.length) {
    throw new Error("Usuário não encontrado");
  }

  // Validar senha (implementar hash com bcrypt)
  return user[0];
}
```

## Passo 8: Configurar WhatsApp Web (Baileys)

O sistema usa a biblioteca Baileys para WhatsApp Web. Funciona assim:

1. Acesse `/whatsapp` no dashboard
2. Clique em "Conectar WhatsApp"
3. Escanear o QR Code com seu celular
4. Confirmar no WhatsApp
5. Sistema fica conectado e pronto para enviar mensagens

**Importante:** Mantenha a sessão ativa. Se desconectar, será necessário escanear o QR Code novamente.

## Passo 9: Deploy em Servidor

### Opção A: Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up

# Configurar variáveis de ambiente no painel Railway
```

### Opção B: Render

```bash
# 1. Fazer push para GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin seu-repo-github
git push -u origin main

# 2. Conectar Render ao repositório
# https://dashboard.render.com

# 3. Configurar:
# - Build Command: pnpm build
# - Start Command: pnpm start
# - Variáveis de ambiente no painel
```

### Opção C: Vercel + Supabase

```bash
# Deploy frontend no Vercel
vercel deploy

# Usar Supabase para banco de dados
# https://supabase.com
```

### Opção D: VPS (DigitalOcean, Linode, AWS)

```bash
# 1. SSH para seu servidor
ssh root@seu-servidor

# 2. Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 3. Instalar pnpm
npm install -g pnpm

# 4. Clonar projeto
git clone seu-repositorio
cd fidelidade-whatsapp

# 5. Instalar dependências
pnpm install

# 6. Configurar .env
nano .env.local

# 7. Build
pnpm build

# 8. Usar PM2 para manter rodando
npm install -g pm2
pm2 start "pnpm start" --name fidelidade
pm2 startup
pm2 save

# 9. Configurar Nginx como reverse proxy
sudo apt-get install nginx
# Editar /etc/nginx/sites-available/default
# Apontar para localhost:3000
```

## Variáveis de Ambiente Explicadas

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão MySQL | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Chave para assinar tokens | Gerar com: `openssl rand -base64 32` |
| `VITE_APP_TITLE` | Nome da aplicação | "Fidelidade WhatsApp" |
| `VITE_APP_LOGO` | URL do logo | "/logo.png" |
| `OWNER_OPEN_ID` | ID único do admin | "admin-local" |
| `OWNER_NAME` | Nome do admin | "Seu Nome" |

## Troubleshooting

### Erro: "Cannot find module"
```bash
# Reinstalar dependências
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Erro: "Database connection failed"
```bash
# Verificar conexão MySQL
mysql -u fidelidade -p -h localhost fidelidade_whatsapp

# Verificar DATABASE_URL no .env.local
```

### Erro: "Port 3000 already in use"
```bash
# Usar porta diferente
PORT=3001 pnpm start

# Ou matar processo na porta 3000
lsof -i :3000
kill -9 <PID>
```

### WhatsApp desconectando
- Manter a sessão ativa
- Não usar o WhatsApp Web no navegador simultaneamente
- Reconectar escaneando QR Code novamente

## Estrutura de Pastas

```
fidelidade-whatsapp/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas do dashboard
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # Utilitários
│   └── public/            # Assets estáticos
├── server/                # Backend Node.js
│   ├── routers/           # Procedimentos tRPC
│   ├── db.ts              # Funções de banco de dados
│   ├── business.ts        # Lógica de negócio
│   ├── automation.ts      # Sistema de automações
│   └── whatsapp.ts        # Integração WhatsApp
├── drizzle/               # Schema e migrations
├── .env.local             # Variáveis de ambiente
├── package.json           # Dependências
└── README.md              # Este arquivo
```

## Suporte e Documentação

- **tRPC**: https://trpc.io
- **Drizzle ORM**: https://orm.drizzle.team
- **Baileys (WhatsApp)**: https://github.com/WhiskeySockets/Baileys
- **React**: https://react.dev
- **Tailwind CSS**: https://tailwindcss.com

## Licença

Este projeto é fornecido como está. Você é livre para usar, modificar e distribuir conforme necessário.

---

**Dúvidas?** Entre em contato ou consulte a documentação dos projetos acima.
