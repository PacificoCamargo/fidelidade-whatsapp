# Integração WhatsApp com Código de Pareamento

## Visão Geral

O sistema de fidelidade agora suporta integração com WhatsApp através de autenticação por **código de pareamento** (pairing code), eliminando a necessidade de QR code visual. Este método oferece melhor compatibilidade com ambientes de servidor e é mais confiável que métodos anteriores.

## Arquitetura

### Componentes Principais

| Componente | Localização | Responsabilidade |
|---|---|---|
| **Módulo de Pareamento** | `server/whatsapp-pairing.ts` | Gerencia ciclo de vida do cliente WhatsApp, solicita código de pareamento e mantém estado da conexão |
| **Router tRPC** | `server/routers/whatsapp-router.ts` | Expõe endpoints para iniciar pareamento, verificar status e desconectar |
| **Interface de Usuário** | `client/src/pages/WhatsAppPairing.tsx` | Permite usuário inserir número de telefone, exibe código de pareamento e monitora conexão |
| **Dependências** | `package.json` | whatsapp-web.js (v1.34.6), puppeteer, chromium |

### Fluxo de Autenticação

```
1. Usuário insere número de telefone (formato: 55XXXXXXXXXXX)
   ↓
2. Frontend chama trpc.whatsapp.initiatePairing(phoneNumber)
   ↓
3. Backend inicializa cliente whatsapp-web.js com LocalAuth
   ↓
4. Backend solicita código de pareamento via client.requestPairingCode()
   ↓
5. Código de 6 dígitos é retornado ao frontend
   ↓
6. Usuário vê código na tela e escaneia no celular (Configurações → Dispositivos Conectados)
   ↓
7. Frontend faz polling de status a cada 2 segundos
   ↓
8. Quando pareamento completa, backend dispara evento 'authenticated'
   ↓
9. Frontend detecta isConnected=true e exibe tela de sucesso
```

## Implementação Técnica

### Módulo de Pareamento (`server/whatsapp-pairing.ts`)

O módulo exporta as seguintes funções:

#### `initiatePairing(phoneNumber: string): Promise<string>`

Inicia o processo de pareamento para um número de telefone específico.

**Parâmetros:**
- `phoneNumber` (string): Número no formato internacional (ex: 5511999999999)

**Retorno:**
- Promise que resolve para o código de pareamento (6 dígitos)

**Comportamento:**
1. Destrói cliente anterior se existir
2. Cria novo cliente com `LocalAuth` strategy
3. Configura listeners para eventos de conexão
4. Inicializa cliente
5. Solicita código de pareamento
6. Armazena estado em `pairingState`

**Exemplo:**
```typescript
const pairingCode = await initiatePairing('5511999999999');
console.log('Código:', pairingCode); // "123456"
```

#### `getPairingStatus(): object`

Retorna status atual do pareamento.

**Retorno:**
```typescript
{
  pairingCode: string | null,
  isConnected: boolean,
  phoneNumber: string | null
}
```

#### `isConnected(): boolean`

Verifica se WhatsApp está conectado e pronto para enviar mensagens.

#### `disconnectWhatsApp(): Promise<void>`

Desconecta cliente WhatsApp e limpa estado.

#### `sendMessage(phoneNumber: string, message: string): Promise<void>`

Envia mensagem para um número de telefone.

**Parâmetros:**
- `phoneNumber` (string): Número destino (com ou sem formato @c.us)
- `message` (string): Conteúdo da mensagem

### Router tRPC (`server/routers/whatsapp-router.ts`)

Expõe os seguintes endpoints:

#### `whatsapp.initiatePairing` (Mutation)

**Input:**
```typescript
{ phoneNumber: string }
```

**Output:**
```typescript
{
  success: boolean,
  message: string,
  pairingCode?: string
}
```

#### `whatsapp.checkPairingStatus` (Query)

**Output:**
```typescript
{
  pairingCode: string | null,
  isConnected: boolean,
  phoneNumber: string | null
}
```

#### `whatsapp.isPairingConnected` (Query)

**Output:**
```typescript
{ isConnected: boolean }
```

#### `whatsapp.disconnectPairing` (Mutation)

**Output:**
```typescript
{
  success: boolean,
  message: string
}
```

### Interface de Usuário (`client/src/pages/WhatsAppPairing.tsx`)

A página segue um fluxo de três etapas:

**Etapa 1: Input**
- Usuário insere número de telefone
- Validação de formato (mínimo 10 dígitos)
- Botão "Gerar Código" dispara `initiatePairing`

**Etapa 2: Pairing**
- Exibe código de 6 dígitos em fonte monospace
- Botão para copiar código
- Instruções passo a passo para pareamento no celular
- Polling automático de status a cada 2 segundos
- Timeout de 5 minutos

**Etapa 3: Connected**
- Confirmação de sucesso
- Botão para desconectar

## Configuração de Ambiente

### Dependências Obrigatórias

```json
{
  "whatsapp-web.js": "^1.34.6",
  "puppeteer": "^latest",
  "chromium-browser": "^128.0+"
}
```

### Instalação

```bash
# Instalar dependências Node
pnpm install

# Instalar Chromium no sistema (Ubuntu/Debian)
sudo apt-get install -y chromium-browser

# Verificar instalação
chromium-browser --version
```

### Variáveis de Ambiente

Nenhuma variável de ambiente adicional é necessária. O módulo usa:
- Caminho do Chromium: `/usr/bin/chromium-browser`
- ID do cliente: `fidelidade-whatsapp` (fixo)
- Armazenamento de sessão: `.wwebjs_auth` (local)

## Tratamento de Erros

### Erros Comuns

| Erro | Causa | Solução |
|---|---|---|
| "Could not find Chrome" | Chromium não instalado | `sudo apt-get install chromium-browser` |
| "Timeout waiting for pairing code" | Número inválido ou sem WhatsApp | Verificar número e tentar novamente |
| "Connection Failure" | Rede instável | Aguardar e tentar novamente |
| "Client not initialized" | Pareamento incompleto | Aguardar 30 segundos e tentar novamente |

### Logging

O módulo emite logs detalhados com prefixo `[WhatsApp Pairing]`:

```
[WhatsApp Pairing] Iniciando pareamento para: 5511999999999
[WhatsApp Pairing] Inicializando cliente...
[WhatsApp Pairing] Solicitando código de pareamento...
[WhatsApp Pairing] Código de pareamento gerado: 123456
[WhatsApp Pairing] Cliente autenticado!
```

## Limitações e Considerações

### Limitações Técnicas

1. **Sessão por Servidor**: Cada instância do servidor mantém sua própria sessão WhatsApp. Em ambientes com múltiplas instâncias, seria necessário implementar armazenamento compartilhado de sessão.

2. **Um Cliente por Instância**: Atualmente, apenas um cliente WhatsApp pode estar conectado por instância do servidor. Para múltiplas contas, seria necessário refatorar para suportar múltiplos clientes.

3. **Chromium Obrigatório**: O whatsapp-web.js requer Chromium/Chrome para funcionar. Não funciona em ambientes sem interface gráfica sem configuração especial.

4. **Limite de Taxa**: WhatsApp implementa rate limiting. Recomenda-se aguardar 1-2 segundos entre mensagens em envios em massa.

### Considerações de Segurança

1. **Armazenamento de Sessão**: As credenciais de sessão são armazenadas localmente em `.wwebjs_auth`. Proteja este diretório.

2. **Número de Telefone**: O número de telefone é transmitido via HTTPS. Não é armazenado no banco de dados.

3. **Código de Pareamento**: O código é válido por apenas 5 minutos e é descartado após uso.

## Próximas Etapas

### Fase 1: Testes
- [ ] Testar pareamento com número real
- [ ] Validar envio de mensagens
- [ ] Testar desconexão e reconexão
- [ ] Verificar comportamento com múltiplas instâncias

### Fase 2: Campanhas
- [ ] Integrar com sistema de campanhas
- [ ] Implementar envio em massa com rate limiting
- [ ] Adicionar templates de mensagem
- [ ] Criar dashboard de histórico de mensagens

### Fase 3: Automação
- [ ] Envio automático de boas-vindas
- [ ] Notificações de promoção por tier
- [ ] Lembretes de pontos expirando
- [ ] Confirmação de compra

### Fase 4: Escalabilidade
- [ ] Implementar armazenamento compartilhado de sessão
- [ ] Suportar múltiplas contas WhatsApp
- [ ] Adicionar fila de mensagens com retry
- [ ] Monitoramento e alertas

## Referências

- **whatsapp-web.js**: Biblioteca JavaScript para automação do WhatsApp Web via Puppeteer
- **Puppeteer**: Biblioteca Node.js para controlar Chrome/Chromium via DevTools Protocol
- **Chromium**: Navegador open-source que serve como base para Chrome

## Suporte

Para problemas ou dúvidas sobre a integração WhatsApp:

1. Consulte os logs do servidor em `.manus-logs/devserver.log`
2. Verifique se Chromium está instalado: `chromium-browser --version`
3. Teste a conexão manualmente no celular
4. Verifique se o número tem WhatsApp ativo
