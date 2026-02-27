# 🚀 Guia Completo: Deploy no Railway (Passo a Passo para Iniciantes)

## 📋 Resumo do Que Vamos Fazer

1. **Fazer push do código para GitHub** (salvar na nuvem)
2. **Criar conta no Railway** (plataforma de hospedagem)
3. **Conectar GitHub ao Railway** (autorizar acesso)
4. **Configurar variáveis de ambiente** (senhas e configurações)
5. **Fazer deploy** (colocar online)
6. **Testar se está funcionando** (validar)

---

## 🔧 PASSO 1: Fazer Push para GitHub

### O que é GitHub?
GitHub é um serviço na nuvem onde você armazena seu código. É como um "Google Drive" para programadores.

### Como fazer:

**1.1) Abra o terminal/prompt de comando**

Se você está no Windows:
- Pressione `Win + R`
- Digite `cmd`
- Pressione Enter

Se você está no Mac/Linux:
- Abra o terminal normalmente

**1.2) Navegue até a pasta do projeto**

```bash
cd C:\Users\SeuUsuario\fidelidade-whatsapp
```

Ou se estiver no Mac/Linux:
```bash
cd ~/fidelidade-whatsapp
```

**1.3) Configure seu Git (primeira vez apenas)**

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@gmail.com"
```

**1.4) Verifique se há mudanças**

```bash
git status
```

Você verá uma lista de arquivos modificados (em vermelho).

**1.5) Adicione todas as mudanças**

```bash
git add .
```

**1.6) Crie um "commit" (salve as mudanças com uma mensagem)**

```bash
git commit -m "Reestruturar para Railway production"
```

**1.7) Faça push (envie para GitHub)**

```bash
git push origin main
```

Se pedir senha, use seu **token de acesso pessoal do GitHub** (não a senha da conta).

### ✅ Pronto! Seu código está no GitHub

---

## 🚂 PASSO 2: Criar Conta no Railway

### Como fazer:

**2.1) Abra o navegador e acesse:**
```
https://railway.app
```

**2.2) Clique em "Sign Up" (canto superior direito)**

**2.3) Escolha uma forma de se registrar:**
- GitHub (recomendado - mais fácil)
- Google
- Email

**2.4) Se escolher GitHub:**
- Clique em "Continue with GitHub"
- Faça login com sua conta GitHub
- Autorize o Railway a acessar sua conta
- Clique em "Authorize railway-app"

**2.5) Complete o cadastro:**
- Escolha um nome de usuário
- Clique em "Create Account"

### ✅ Sua conta Railway está criada!

---

## 🔗 PASSO 3: Conectar GitHub ao Railway

### Como fazer:

**3.1) No painel do Railway, clique em "New Project"**

**3.2) Selecione "Deploy from GitHub"**

**3.3) Você verá a opção "Configure GitHub App"**
- Clique em "Configure GitHub App"
- Selecione seu repositório `fidelidade-whatsapp`
- Clique em "Install"

**3.4) De volta ao Railway, selecione o repositório**
- Clique em "fidelidade-whatsapp"
- Clique em "Deploy"

### ⏳ Aguarde o Deploy Automático

O Railway vai:
1. Baixar seu código do GitHub
2. Ler o `Dockerfile`
3. Compilar a aplicação
4. Colocar online

Isso pode levar **5-10 minutos**. Você verá logs na tela.

### ✅ Deploy iniciado!

---

## ⚙️ PASSO 4: Configurar Variáveis de Ambiente

### O que são variáveis de ambiente?
São configurações secretas (como senhas) que o servidor precisa, mas não queremos deixar visíveis no código.

### Como fazer:

**4.1) No painel do Railway, clique em "Variables"**

**4.2) Clique em "Add Variable"**

**4.3) Adicione as seguintes variáveis:**

| Nome | Valor |
|------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

**4.4) Para cada variável:**
- Digite o **Nome** (ex: `NODE_ENV`)
- Digite o **Valor** (ex: `production`)
- Clique em "Add"

**4.5) Se tiver outras variáveis (como chaves de API):**
- Adicione da mesma forma
- Clique em "Deploy" para aplicar as mudanças

### ✅ Variáveis configuradas!

---

## 🌐 PASSO 5: Obter a URL Pública

### Como fazer:

**5.1) No painel do Railway, vá para "Settings"**

**5.2) Procure por "Domain"**

**5.3) Você verá uma URL como:**
```
seu-projeto-abc123.railway.app
```

**5.4) Copie essa URL**
- Você usará para acessar seu servidor

### ✅ URL obtida!

---

## 🧪 PASSO 6: Testar se Está Funcionando

### Como fazer:

**6.1) Abra seu navegador**

**6.2) Digite a URL no navegador:**
```
https://seu-projeto-abc123.railway.app/health
```

**6.3) Você deve ver uma resposta como:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-25T12:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "port": 3000
}
```

Se vir isso, **PARABÉNS! 🎉 Seu servidor está online!**

### Se não funcionar:

**6.4) Verifique os logs:**
- No painel do Railway, clique em "Logs"
- Procure por erros
- Se houver erro, copie a mensagem e me envie

---

## 📊 PASSO 7: Verificar Logs em Tempo Real

### Como fazer:

**7.1) No painel do Railway, clique em "Logs"**

**7.2) Você verá mensagens como:**
```
[STARTUP] WhatsApp Fidelidade iniciado
[STARTUP] Porta: 3000
[STARTUP] Inicializando Baileys...
```

**7.3) Se ver essas mensagens, tudo está funcionando!**

### Mensagens importantes:

| Mensagem | Significado |
|----------|------------|
| `[STARTUP] WhatsApp Fidelidade iniciado` | Servidor iniciou com sucesso |
| `[Baileys] QR Code gerado` | QR Code foi gerado para pareamento |
| `[Baileys] Conectado com sucesso` | WhatsApp conectado |
| `[PROCESS] Exceção não capturada` | Erro (procure a mensagem de erro) |

---

## 🔄 PASSO 8: Atualizar Código (Próximas Vezes)

Quando você fizer mudanças no código:

**8.1) No terminal:**
```bash
git add .
git commit -m "Descrição da mudança"
git push origin main
```

**8.2) O Railway vai:**
- Detectar a mudança automaticamente
- Fazer novo deploy
- Atualizar o servidor

Você não precisa fazer nada mais!

---

## 🆘 Troubleshooting (Se Algo Não Funcionar)

### Erro 502 Bad Gateway
```
Significa: Servidor não está respondendo
Solução: 
1. Verifique os logs
2. Procure por erros
3. Reinicie o deploy
```

### Erro "Cannot find module"
```
Significa: Falta uma dependência
Solução:
1. Adicione a dependência: npm install nome-do-modulo
2. Faça push: git push origin main
3. Railway fará novo deploy
```

### Logs não aparecem
```
Significa: Servidor ainda está iniciando
Solução:
1. Aguarde 1-2 minutos
2. Atualize a página (F5)
3. Verifique novamente
```

### QR Code não aparece
```
Significa: Baileys não inicializou
Solução:
1. Verifique logs para erros
2. Tente reconectar
3. Se persistir, reinicie o deploy
```

---

## 📞 Resumo das URLs Importantes

| O Quê | URL |
|-------|-----|
| Health Check | `https://seu-projeto.railway.app/health` |
| Gerar QR Code | `https://seu-projeto.railway.app/api/whatsapp/generate-qr` (POST) |
| Status WhatsApp | `https://seu-projeto.railway.app/api/whatsapp/status` |
| Enviar Mensagem | `https://seu-projeto.railway.app/api/whatsapp/send-message` (POST) |

---

## ✨ Parabéns!

Você completou o deploy! 🎉

Seu servidor WhatsApp está **ONLINE** e pronto para usar!

### Próximos passos:
1. Testar o QR Code
2. Parear o WhatsApp
3. Enviar mensagens de teste
4. Integrar com seu frontend

---

## 📝 Dúvidas Frequentes

**P: Quanto custa o Railway?**
R: Tem um plano gratuito com limite de uso. Depois, você paga conforme usa.

**P: Meu código fica seguro?**
R: Sim! Suas credenciais ficam em variáveis de ambiente, não no código.

**P: Posso fazer rollback se algo der errado?**
R: Sim! Railway mantém histórico de deploys. Você pode reverter.

**P: Quanto tempo leva para fazer deploy?**
R: Geralmente 5-10 minutos.

**P: Preciso fazer algo para manter o servidor online?**
R: Não! Railway mantém 24/7. Você só paga pelo uso.

---

## 🎯 Checklist Final

- [ ] Código enviado para GitHub (`git push`)
- [ ] Conta Railway criada
- [ ] Repositório conectado ao Railway
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy completado
- [ ] URL pública obtida
- [ ] Health check respondendo
- [ ] Logs mostrando sucesso

Se tudo estiver marcado, **PARABÉNS! 🚀**

Seu backend está pronto para produção!
