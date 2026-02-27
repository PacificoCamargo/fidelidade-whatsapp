#!/usr/bin/env node

/**
 * Backend WhatsApp Fidelidade - Production Ready para Railway
 * 
 * Características:
 * - Porta dinâmica com binding 0.0.0.0
 * - WebSocket público para Railway
 * - Baileys com reconexão automática
 * - Health check endpoint
 * - Nunca encerra o processo
 * - Compatível com serverless
 */

const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

// Configuração de porta dinâmica
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';
const RAILWAY_STATIC_URL = process.env.RAILWAY_STATIC_URL || `localhost:${PORT}`;

console.log(`[STARTUP] NODE_ENV: ${NODE_ENV}`);
console.log(`[STARTUP] PORT: ${PORT}`);
console.log(`[STARTUP] RAILWAY_STATIC_URL: ${RAILWAY_STATIC_URL}`);

// Criar aplicação Express
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================
// 1️⃣ HEALTH CHECK ENDPOINT (obrigatório)
// ============================================
app.get('/', (req, res) => {
  res.status(200).send('Servidor ativo - WhatsApp Fidelidade');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    port: PORT,
  });
});

// ============================================
// 2️⃣ SERVIR ARQUIVOS ESTÁTICOS
// ============================================
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log(`[STARTUP] Servindo arquivos estáticos de: ${distPath}`);
}

// ============================================
// 3️⃣ WEBSOCKET PÚBLICO PARA RAILWAY
// ============================================
const wss = new WebSocket.Server({ server });

const clients = new Map();
let whatsappClient = null;
let qrCodeData = null;
let isConnected = false;

wss.on('connection', (ws, req) => {
  const clientId = Math.random().toString(36).substring(7);
  clients.set(clientId, ws);
  
  console.log(`[WebSocket] Cliente conectado: ${clientId}`);
  
  // Enviar QR Code se disponível
  if (qrCodeData) {
    ws.send(JSON.stringify({
      type: 'qr',
      data: qrCodeData,
      timestamp: new Date().toISOString(),
    }));
  }
  
  // Enviar status de conexão
  ws.send(JSON.stringify({
    type: 'status',
    isConnected,
    timestamp: new Date().toISOString(),
  }));
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log(`[WebSocket] Mensagem recebida de ${clientId}:`, data.type);
      
      if (data.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
      }
    } catch (err) {
      console.error(`[WebSocket] Erro ao processar mensagem:`, err);
    }
  });
  
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`[WebSocket] Cliente desconectado: ${clientId}`);
  });
  
  ws.on('error', (err) => {
    console.error(`[WebSocket] Erro no cliente ${clientId}:`, err);
  });
});

// Função para broadcast para todos os clientes
function broadcastToClients(message) {
  const payload = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  });
}

// ============================================
// 4️⃣ BAILEYS COM RECONEXÃO AUTOMÁTICA
// ============================================
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

const authFolder = path.join(__dirname, '../.whatsapp-auth');
if (!fs.existsSync(authFolder)) {
  fs.mkdirSync(authFolder, { recursive: true });
}

let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const RECONNECT_DELAY = 5000; // 5 segundos

async function initializeBaileys() {
  try {
    console.log('[Baileys] Inicializando...');
    
    const { state, saveCreds } = await useMultiFileAuthState(authFolder);
    
    whatsappClient = makeWASocket({
      auth: state,
      printQRInTerminal: false, // Não imprimir no terminal
      logger: pino({ level: 'error' }), // Apenas erros
      browser: ['Chrome (Linux)', '', ''],
      syncFullHistory: false,
      shouldIgnoreJid: (jid) => /status@broadcast/.test(jid),
    });
    
    // Evento: QR Code gerado
    whatsappClient.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;
      
      if (qr) {
        console.log('[Baileys] QR Code gerado');
        qrCodeData = qr;
        broadcastToClients({
          type: 'qr',
          data: qr,
          timestamp: new Date().toISOString(),
        });
      }
      
      if (connection === 'open') {
        console.log('[Baileys] Conectado com sucesso');
        isConnected = true;
        reconnectAttempts = 0;
        qrCodeData = null;
        
        broadcastToClients({
          type: 'status',
          isConnected: true,
          message: 'WhatsApp conectado',
          timestamp: new Date().toISOString(),
        });
      }
      
      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        
        console.log('[Baileys] Desconectado. Motivo:', lastDisconnect?.error?.output?.statusCode);
        
        if (shouldReconnect && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`[Baileys] Tentando reconectar... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
          
          broadcastToClients({
            type: 'status',
            isConnected: false,
            message: `Reconectando... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`,
            timestamp: new Date().toISOString(),
          });
          
          setTimeout(() => initializeBaileys(), RECONNECT_DELAY);
        } else if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
          console.error('[Baileys] Máximo de tentativas de reconexão atingido');
          isConnected = false;
          
          broadcastToClients({
            type: 'status',
            isConnected: false,
            message: 'Desconectado - máximo de tentativas atingido',
            timestamp: new Date().toISOString(),
          });
        } else {
          console.log('[Baileys] Logout detectado - aguardando novo pareamento');
          isConnected = false;
          qrCodeData = null;
        }
      }
    });
    
    // Salvar credenciais
    whatsappClient.ev.on('creds.update', saveCreds);
    
    // Evento: Mensagem recebida
    whatsappClient.ev.on('messages.upsert', async (m) => {
      const message = m.messages[0];
      if (!message.key.fromMe) {
        console.log('[Baileys] Mensagem recebida de:', message.key.remoteJid);
        
        broadcastToClients({
          type: 'message',
          from: message.key.remoteJid,
          text: message.message?.conversation || 'Mensagem não-texto',
          timestamp: new Date().toISOString(),
        });
      }
    });
    
  } catch (err) {
    console.error('[Baileys] Erro ao inicializar:', err);
    
    // Tentar reconectar após erro
    if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++;
      console.log(`[Baileys] Reconectando após erro... (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
      setTimeout(() => initializeBaileys(), RECONNECT_DELAY);
    }
  }
}

// ============================================
// 5️⃣ ROTAS DA API
// ============================================

// Gerar QR Code
app.post('/api/whatsapp/generate-qr', (req, res) => {
  try {
    if (qrCodeData) {
      res.json({
        success: true,
        qrCode: qrCodeData,
        timestamp: new Date().toISOString(),
      });
    } else if (isConnected) {
      res.json({
        success: true,
        message: 'Já conectado',
        isConnected: true,
        timestamp: new Date().toISOString(),
      });
    } else {
      res.json({
        success: false,
        message: 'QR Code não disponível',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Status da conexão
app.get('/api/whatsapp/status', (req, res) => {
  res.json({
    isConnected,
    qrCodeAvailable: !!qrCodeData,
    reconnectAttempts,
    timestamp: new Date().toISOString(),
  });
});

// Enviar mensagem
app.post('/api/whatsapp/send-message', async (req, res) => {
  try {
    const { phone, message } = req.body;
    
    if (!whatsappClient || !isConnected) {
      return res.status(400).json({
        success: false,
        message: 'WhatsApp não conectado',
      });
    }
    
    if (!phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Telefone e mensagem são obrigatórios',
      });
    }
    
    const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;
    await whatsappClient.sendMessage(jid, { text: message });
    
    res.json({
      success: true,
      message: 'Mensagem enviada',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// ============================================
// 6️⃣ INICIAR SERVIDOR
// ============================================

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`[SERVIDOR] WhatsApp Fidelidade iniciado`);
  console.log(`[SERVIDOR] Porta: ${PORT}`);
  console.log(`[SERVIDOR] Ambiente: ${NODE_ENV}`);
  console.log(`[SERVIDOR] URL: http://0.0.0.0:${PORT}`);
  console.log(`[SERVIDOR] WebSocket: wss://${RAILWAY_STATIC_URL}`);
  console.log(`[SERVIDOR] Health Check: http://0.0.0.0:${PORT}/health`);
  console.log(`${'='.repeat(60)}\n`);
});

// ============================================
// 7️⃣ GARANTIR QUE PROCESSO NUNCA ENCERRE
// ============================================

// Tratar sinais de encerramento
process.on('SIGINT', () => {
  console.log('[PROCESS] Recebido SIGINT - mantendo servidor ativo');
  // Não fazer process.exit()
});

process.on('SIGTERM', () => {
  console.log('[PROCESS] Recebido SIGTERM - mantendo servidor ativo');
  // Não fazer process.exit()
});

process.on('uncaughtException', (err) => {
  console.error('[PROCESS] Exceção não capturada:', err);
  // Não fazer process.exit()
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[PROCESS] Promise rejection não tratada:', reason);
  // Não fazer process.exit()
});

// ============================================
// 8️⃣ INICIALIZAR BAILEYS
// ============================================

setTimeout(() => {
  console.log('[STARTUP] Inicializando Baileys...');
  initializeBaileys();
}, 1000);

// Manter o processo vivo
setInterval(() => {
  // Health check interno
  if (clients.size > 0) {
    console.log(`[HEALTH] ${clients.size} cliente(s) WebSocket conectado(s)`);
  }
}, 30000);
