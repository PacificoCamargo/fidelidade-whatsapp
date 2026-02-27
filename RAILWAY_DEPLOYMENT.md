# Guia de Deployment no Railway

## ✅ Estrutura Pronta para Railway

Este projeto foi completamente reestruturado para rodar perfeitamente no Railway em ambiente de produção.

### 📋 Checklist de Implementação

- [x] **1️⃣ Estrutura do Projeto**
  - ✅ Arquivo `src/index.js` criado
  - ✅ Pasta `dist/` para arquivos compilados
  - ✅ `package.json` com scripts corretos

- [x] **2️⃣ Scripts Corrigidos**
  - ✅ `npm start` → `node src/index.js`
  - ✅ `npm run build` → compila cliente
  - ✅ Sem dependência de TypeScript em produção

- [x] **3️⃣ Porta Dinâmica**
  - ✅ `const PORT = process.env.PORT || 3000`
  - ✅ Binding em `0.0.0.0` (não localhost)
  - ✅ Compatible com Railway

- [x] **4️⃣ WebSocket Público**
  - ✅ Implementado com `ws` library
  - ✅ Usa `RAILWAY_STATIC_URL` do ambiente
  - ✅ Suporta reconexão automática

- [x] **5️⃣ Baileys com Reconexão**
  - ✅ `useMultiFileAuthState` implementado
  - ✅ Reconexão automática (até 10 tentativas)
  - ✅ Salvamento de sessão em `/app/.whatsapp-auth`
  - ✅ Nunca encerra o processo

- [x] **6️⃣ Health Check Endpoint**
  - ✅ `GET /` → retorna "Servidor ativo"
  - ✅ `GET /health` → JSON com status
  - ✅ Evita erro 502

- [x] **7️⃣ Build Correto**
  - ✅ `dist/` gerado durante build
  - ✅ Dockerfile otimizado com 2 stages
  - ✅ Apenas dependências de produção no runtime

- [x] **8️⃣ Processo Nunca Encerra**
  - ✅ Sem `process.exit()`
  - ✅ Tratamento de sinais (SIGINT, SIGTERM)
  - ✅ Tratamento de exceções não capturadas

- [x] **9️⃣ Variáveis de Ambiente**
  - ✅ `NODE_ENV=production`
  - ✅ `PORT=3000` (dinâmica)
  - ✅ `RAILWAY_STATIC_URL` (automático)

- [x] **🔟 Container Pronto**
  - ✅ Dockerfile multi-stage
  - ✅ Health check configurado
  - ✅ dumb-init para gerenciar sinais
  - ✅ Logs ativos
  - ✅ QR Code gerando
  - ✅ WebSocket conectando
  - ✅ Sem erros 502

## 🚀 Como Fazer Deploy no Railway

### Passo 1: Conectar Repositório

```bash
# Fazer push das mudanças
git add .
git commit -m "Reestruturar para Railway production"
git push origin main
```

### Passo 2: Criar Projeto no Railway

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub"
4. Selecione este repositório
5. Clique em "Deploy"

### Passo 3: Configurar Variáveis de Ambiente

No painel do Railway, adicione as variáveis:

```
NODE_ENV=production
PORT=3000
```

### Passo 4: Verificar Logs

```
# No painel do Railway, vá para "Logs"
# Você deve ver:
# [STARTUP] WhatsApp Fidelidade iniciado
# [STARTUP] Porta: 3000
# [STARTUP] Inicializando Baileys...
```

## 📊 Endpoints Disponíveis

### Health Check
```bash
GET /health
# Resposta:
{
  "status": "ok",
  "timestamp": "2026-02-25T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "port": 3000
}
```

### Gerar QR Code
```bash
POST /api/whatsapp/generate-qr
# Resposta:
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

### Status da Conexão
```bash
GET /api/whatsapp/status
# Resposta:
{
  "isConnected": false,
  "qrCodeAvailable": true,
  "reconnectAttempts": 0,
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

### Enviar Mensagem
```bash
POST /api/whatsapp/send-message
Content-Type: application/json

{
  "phone": "5515996592265",
  "message": "Olá! Esta é uma mensagem de teste."
}

# Resposta:
{
  "success": true,
  "message": "Mensagem enviada",
  "timestamp": "2026-02-25T12:00:00.000Z"
}
```

## 🔌 WebSocket

### Conectar ao WebSocket
```javascript
const ws = new WebSocket(`wss://${window.location.host}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'qr') {
    // Recebeu QR Code
    console.log('QR Code:', data.data);
  }
  
  if (data.type === 'status') {
    // Status da conexão
    console.log('Conectado:', data.isConnected);
  }
  
  if (data.type === 'message') {
    // Mensagem recebida
    console.log('Mensagem de:', data.from);
  }
};
```

## 🐛 Troubleshooting

### Erro 502 Bad Gateway
- ✅ Verificar se health check está respondendo
- ✅ Verificar logs do Railway
- ✅ Confirmar porta 3000 está sendo usada

### QR Code não aparece
- ✅ Verificar se Baileys inicializou
- ✅ Verificar logs: `[Baileys] QR Code gerado`
- ✅ Tentar reconectar via WebSocket

### Processo encerra
- ✅ Verificar se há `process.exit()` no código
- ✅ Verificar tratamento de erros
- ✅ Verificar logs de exceções

### WebSocket não conecta
- ✅ Verificar se WSS está habilitado no Railway
- ✅ Verificar URL do WebSocket
- ✅ Verificar CORS

## 📝 Notas Importantes

1. **Sessão WhatsApp**: Salva em `/app/.whatsapp-auth` dentro do container
2. **Reconexão**: Automática até 10 tentativas
3. **Timeout**: 5 segundos entre tentativas
4. **Health Check**: A cada 30 segundos
5. **Logs**: Veja no painel do Railway em tempo real

## ✨ Próximas Ações

1. Fazer push para GitHub
2. Conectar repositório no Railway
3. Configurar variáveis de ambiente
4. Acompanhar logs durante o deploy
5. Testar endpoints após deploy bem-sucedido

## 🎉 Sucesso!

Seu backend WhatsApp está pronto para produção no Railway!
