# Guia de Integração WhatsApp - Sistema de Fidelidade

## 📱 Visão Geral

Existem **2 formas principais** de integrar WhatsApp com o sistema de fidelidade:

1. **WhatsApp Web (Mais Simples)** - Usar o WhatsApp Web com QR Code
2. **WhatsApp Business API (Mais Profissional)** - Integração oficial com Meta

---

## Opção 1: WhatsApp Web com QR Code (Recomendado para Começar)

### ✅ Vantagens
- ✅ Implementação imediata (sem esperar aprovação)
- ✅ Sem custos adicionais
- ✅ Funciona com qualquer número de WhatsApp
- ✅ Perfeito para começar agora
- ✅ Suporta envio de mensagens e mídia

### ❌ Desvantagens
- ❌ Requer navegador aberto
- ❌ Pode ser bloqueado por WhatsApp (TOS)
- ❌ Não é oficial/suportado
- ❌ Pode perder conexão

### Como Funciona

```
1. Você acessa o dashboard
2. Clica em "Conectar WhatsApp"
3. Escaneia QR Code com seu celular
4. Sistema fica conectado e pronto para enviar mensagens
5. Mensagens são enviadas automaticamente
```

### Arquitetura

```
┌─────────────────────────────────────────┐
│     Dashboard (seu-app.manus.space)     │
└─────────────────────────────────────────┘
                    ↓
         [Conectar WhatsApp Web]
                    ↓
        [Escanear QR Code]
                    ↓
┌─────────────────────────────────────────┐
│   WhatsApp Web (Seu Navegador)          │
│   - Sessão mantida                      │
│   - Conectado 24/7                      │
└─────────────────────────────────────────┘
                    ↓
        [Enviar Mensagens]
                    ↓
┌─────────────────────────────────────────┐
│   Cliente recebe mensagem no WhatsApp   │
└─────────────────────────────────────────┘
```

### Implementação

**Passo 1: Instalar Biblioteca**

```bash
npm install whatsapp-web.js qrcode-terminal
```

**Passo 2: Criar Conectador**

```typescript
// server/whatsapp.ts
import { Client } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

let whatsappClient: Client | null = null;

export async function initWhatsApp() {
  whatsappClient = new Client();

  whatsappClient.on('qr', (qr) => {
    // Gerar QR Code para exibir no dashboard
    console.log('QR Code gerado');
    qrcode.generate(qr, { small: true });
  });

  whatsappClient.on('ready', () => {
    console.log('WhatsApp conectado!');
  });

  whatsappClient.on('message', (msg) => {
    console.log('Mensagem recebida:', msg.body);
  });

  await whatsappClient.initialize();
}

export async function sendWhatsAppMessage(
  phone: string,
  message: string
) {
  if (!whatsappClient) {
    throw new Error('WhatsApp não conectado');
  }

  const chatId = `${phone}@c.us`;
  await whatsappClient.sendMessage(chatId, message);
}
```

**Passo 3: Adicionar ao Dashboard**

```typescript
// client/src/pages/WhatsAppConnect.tsx
import { useState } from 'react';
import { trpc } from '@/lib/trpc';

export function WhatsAppConnect() {
  const [qrCode, setQrCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  const connectMutation = trpc.whatsapp.connect.useMutation({
    onSuccess: (data) => {
      setQrCode(data.qrCode);
    },
  });

  return (
    <div className="p-6">
      <h2>Conectar WhatsApp</h2>
      
      {!isConnected ? (
        <div>
          <button onClick={() => connectMutation.mutate()}>
            Gerar QR Code
          </button>
          
          {qrCode && (
            <div>
              <p>Escaneie com seu celular:</p>
              <img src={qrCode} alt="QR Code" />
            </div>
          )}
        </div>
      ) : (
        <div className="bg-green-100 p-4">
          ✅ WhatsApp Conectado
        </div>
      )}
    </div>
  );
}
```

**Passo 4: Enviar Mensagem**

```typescript
// Quando aplicar recomendação
const sendMessage = trpc.whatsapp.send.useMutation();

await sendMessage.mutateAsync({
  phone: customer.phone,
  message: `Olá ${customer.name}! 🎉\n\nVocê ganhou 10% de cashback em sua próxima compra!\n\nAproveite! 💝`
});
```

---

## Opção 2: WhatsApp Business API (Mais Profissional)

### ✅ Vantagens
- ✅ Oficial e suportado pela Meta
- ✅ Sem limite de mensagens
- ✅ Análise de métricas
- ✅ Suporte profissional
- ✅ Escalável para muitos clientes

### ❌ Desvantagens
- ❌ Requer aprovação da Meta (2-4 semanas)
- ❌ Custo por mensagem (R$ 0,10 - R$ 0,50)
- ❌ Número de telefone dedicado
- ❌ Implementação mais complexa

### Como Funciona

```
1. Solicitar acesso à WhatsApp Business API
2. Meta aprova sua conta
3. Receber credenciais (Phone ID, Access Token)
4. Integrar API no sistema
5. Enviar mensagens via API
```

### Arquitetura

```
┌─────────────────────────────────────────┐
│     Dashboard (seu-app.manus.space)     │
└─────────────────────────────────────────┘
                    ↓
    [Enviar Mensagem via API]
                    ↓
┌─────────────────────────────────────────┐
│   WhatsApp Business API (Meta)          │
│   - Número dedicado                     │
│   - Credenciais seguras                 │
└─────────────────────────────────────────┘
                    ↓
        [Entregar Mensagem]
                    ↓
┌─────────────────────────────────────────┐
│   Cliente recebe mensagem no WhatsApp   │
└─────────────────────────────────────────┘
```

### Implementação

**Passo 1: Solicitar Acesso**

1. Ir para: https://www.whatsapp.com/business/
2. Clicar em "Get Started"
3. Preencher formulário
4. Aguardar aprovação (2-4 semanas)

**Passo 2: Instalar Biblioteca**

```bash
npm install axios
```

**Passo 3: Criar Conectador**

```typescript
// server/whatsapp-api.ts
import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.instagram.com/v18.0';
const PHONE_ID = 'seu_phone_id';
const ACCESS_TOKEN = 'seu_access_token';

export async function sendWhatsAppMessageAPI(
  phone: string,
  message: string
) {
  try {
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_ID}/messages`,
      {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'text',
        text: {
          body: message,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    throw error;
  }
}
```

**Passo 4: Usar no Sistema**

```typescript
// Mesmo código do WhatsApp Web, mas chamando a API
await sendWhatsAppMessageAPI(customer.phone, message);
```

---

## Comparação: WhatsApp Web vs Business API

| Aspecto | WhatsApp Web | Business API |
|--------|-------------|-------------|
| **Implementação** | Imediata | 2-4 semanas |
| **Custo** | Grátis | R$ 0,10-0,50/msg |
| **Limite** | Sem limite oficial | Sem limite |
| **Confiabilidade** | Média | Alta |
| **Suporte** | Não oficial | Oficial Meta |
| **Número** | Seu WhatsApp | Número dedicado |
| **Análise** | Não | Sim (métricas) |
| **Melhor Para** | Começar agora | Produção |

---

## 🚀 Recomendação: Começar com WhatsApp Web

**Por quê?**
1. ✅ Você pode começar **HOJE** a usar o sistema
2. ✅ Sem custos adicionais
3. ✅ Sem esperar aprovação
4. ✅ Perfeito para testar e validar
5. ✅ Depois migra para Business API quando crescer

**Fluxo Recomendado:**

```
AGORA (Semana 1-2)
├── Publicar sistema no Manus
├── Conectar WhatsApp Web
├── Começar a usar com clientes
└── Testar e validar

DEPOIS (Semana 3-4)
├── Solicitar WhatsApp Business API
├── Aguardar aprovação Meta
└── Migrar para API quando aprovado

FUTURO (Mês 2+)
├── Usar WhatsApp Business API
├── Integrar com SISLOJA
└── Escalar para centenas de clientes
```

---

## 📋 Checklist para Publicar e Usar Agora

### ✅ Antes de Publicar

- [ ] Sistema testado localmente
- [ ] Banco de dados criado
- [ ] Variáveis de ambiente configuradas
- [ ] Testes unitários passando (19/19 ✅)

### ✅ Publicar no Manus

- [ ] Clique em "Publish" no Management UI
- [ ] Aguarde deploy (5-10 minutos)
- [ ] Acesse o link público

### ✅ Configurar WhatsApp Web

- [ ] Instalar biblioteca `whatsapp-web.js`
- [ ] Criar página de conexão no dashboard
- [ ] Gerar QR Code
- [ ] Escanear com seu celular
- [ ] Testar envio de mensagem

### ✅ Começar a Usar

- [ ] Cadastrar primeiro cliente
- [ ] Fazer uma venda de teste
- [ ] Executar análise de IA
- [ ] Enviar mensagem via WhatsApp
- [ ] Validar que tudo funciona

---

## 🔧 Implementação Rápida (WhatsApp Web)

Vou criar os arquivos necessários para você começar hoje:

1. **Conectador WhatsApp** - `server/whatsapp.ts`
2. **Página de Conexão** - `client/src/pages/WhatsAppConnect.tsx`
3. **Procedures tRPC** - Adicionar ao `server/routers.ts`
4. **Testes** - `server/whatsapp.test.ts`

**Tempo de implementação:** 30-45 minutos

---

## ❓ Perguntas Frequentes

### P: Preciso deixar o navegador aberto?
**R:** Sim, com WhatsApp Web. Com Business API, não.

### P: Posso usar meu número pessoal?
**R:** Sim, com WhatsApp Web. Com Business API, precisa de número dedicado.

### P: Quanto custa?
**R:** WhatsApp Web é grátis. Business API custa R$ 0,10-0,50 por mensagem.

### P: Quantas mensagens posso enviar?
**R:** WhatsApp Web tem limite não oficial. Business API é ilimitado.

### P: O WhatsApp pode bloquear minha conta?
**R:** Sim, se enviar muitas mensagens muito rápido. Use delays.

### P: Como evitar bloqueio?
**R:** Enviar mensagens com intervalo (1-2 segundos entre cada).

---

## 🎯 Próximos Passos

**Você quer que eu:**

1. **Implemente WhatsApp Web agora?** - Você publica e usa hoje
2. **Implemente Business API?** - Você solicita acesso e usa em 2-4 semanas
3. **Implemente ambas?** - Começa com Web, depois migra para API

**Qual você prefere?** 🚀
