# Sistema de Fidelidade WhatsApp - Moda Feminina

Backend Node.js + Frontend React para gerenciamento de programa de fidelidade com integração WhatsApp.

## 🚀 Estrutura do Projeto

```
fidelidade-whatsapp/
├── client/              # Frontend React 19 + Tailwind 4
├── server/              # Backend Express + tRPC
├── drizzle/             # Banco de dados (schema + migrations)
├── shared/              # Código compartilhado
├── src/                 # Servidor Node.js para Railway
├── Dockerfile           # Configuração Docker
├── railway.json         # Configuração Railway
├── package.json         # Dependências
└── README.md            # Este arquivo
```

## 📋 Requisitos

- Node.js 22+
- pnpm 10+
- MySQL/TiDB (banco de dados)

## 🔧 Instalação

```bash
pnpm install
```

## 🏃 Desenvolvimento

```bash
pnpm run dev
```

## 🚀 Deploy no Railway

```bash
git push origin main
```

O Railway fará deploy automaticamente.

## 📚 Documentação

- [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) - Guia de deploy
- [GUIA_DEPLOY_RAILWAY.md](./GUIA_DEPLOY_RAILWAY.md) - Passo a passo
- [WHATSAPP_PAIRING.md](./WHATSAPP_PAIRING.md) - Integração WhatsApp
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment geral

## 🤝 Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue.
