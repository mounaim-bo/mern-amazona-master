#  Guide Complet de Déploiement – MERN Amazona

## 1.  Pré-requis

Avant de commencer, assurez-vous d’avoir :  
- Un serveur Linux (Ubuntu 20.04+ recommandé).  
- Docker installé :  
  ```bash
  sudo apt update
  sudo apt install -y docker.io

#  Docker Compose installé :
    sudo apt install -y docker-compose

# Git installé :
sudo apt install -y git

# Cloner le projet
git clone https://github.com/basir/mern-amazona.git
cd mern-amazona
# 2.Création des Images Docker : 
## Frontend (React + Nginx)
### frontend/Dockerfile :
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

### frontend/nginx.conf :

server {
    listen 80;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api {
        proxy_pass http://backend:5000;
    }
}

## Backend (Node.js / Express)

### backend/Dockerfile :

FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
## Base de données (MongoDB) : 
### mongo-init/init.js :

db = db.getSiblingDB('amazona');

db.createUser({
  user: 'amazonaUser',
  pwd: 'amazonaPass',
  roles: [{ role: 'readWrite', db: 'amazona' }],
});

db.createCollection('products');

### docker-compose.yml :

version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - mern-net

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://amazonaUser:amazonaPass@mongo:27017/amazona
      - JWT_SECRET=mysecretjwt
      - PORT=5000
    depends_on:
      - mongo
    networks:
      - mern-net

  mongo:
    build: ./mongo
    restart: always
    volumes:
      - mongo-data:/data/db
    networks:
      - mern-net

  create-admin:
    build: ./backend
    command: ["npm", "run", "create-admin"]
    depends_on:
      - backend
    environment:
      - MONGODB_URI=mongodb://amazonaUser:amazonaPass@mongo:27017/amazona
    networks:
      - mern-net

networks:
  mern-net:

volumes:
  mongo-data:

## 3.Automatisation du Déploiement
### Variables d’environnement

#### deploy/.env :

SERVER_USER=ubuntu
SERVER_IP=10.5.100.187
PROJECT_DIR=/home/ubuntu/mern-app

### Script de déploiement

#### deploy/deploy.sh :

#!/bin/bash
set -e

echo "=== Début du déploiement ==="

cd "$(dirname "$0")"
cd ..

echo "Copie du fichier .env vers backend..."
cp ./deploy/.env ./backend/.env

echo "Construction et lancement des conteneurs Docker..."
docker-compose down
docker-compose build
docker-compose up -d

echo "=== Déploiement terminé avec succès ==="


### Lancer le déploiement en local (via Git Bash)

chmod +x deploy.sh
./deploy.sh

## Ensuite ouvrez votre navigateur et allez sur :

http://localhost:3000

# Validation du Déploiement
## Vérifier que les conteneurs tournent
docker ps      
# Vérifier le backend
curl http://localhost:5000/api/products   
# Vérifier le frontend dans le navigateur
http://<IP_SERVEUR>:3000   
# Créer l’admin
docker-compose run --rm create-admin   






