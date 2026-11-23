FROM node:20-alpine
WORKDIR /usr/src/app
# Copia dependências e instala
COPY package*.json ./
RUN npm install --production
# Copia o código fonte
COPY . .
# A porta e o comando de arranque serão injetados pelo docker-compose