#!/bin/bash

echo "=== Début du déploiement ==="

# Aller à la racine du projet
cd "$(dirname "$0")" 
cd ..

# Copier le fichier .env dans backend
cp ./deploy/.env ./backend/.env

# Construire et lancer les conteneurs
docker-compose down
docker-compose build
docker-compose up -d

