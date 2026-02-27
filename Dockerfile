FROM node:18

# Instalar git (necessário para dependências baseadas em repositório Git)
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar arquivos de dependência
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm

# Instalar dependências usando pnpm
RUN pnpm install --no-frozen-lockfile

# Copiar restante do código
COPY . .

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["pnpm", "start"]
