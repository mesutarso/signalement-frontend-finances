# Frontend — Coolify

Source : `https://github.com/mesutarso/signalement-frontend-finances.git`, branche `main`.

L’application est reliée à la GitHub App existante dans Coolify, avec **Deploy on push (webhooks)** activé. Chaque push sur `main` déclenche la construction et le déploiement automatique du frontend. Vérifier le SHA du commit et l’état sain dans les journaux de déploiement.

Créer une application Dockerfile à la racine, fichier `/Dockerfile`, port interne `3000`. Activer la connexion au réseau prédéfini `coolify`, sur le même serveur que le backend.

Variable runtime : `BACKEND_URL=http://signalements-backend:8080`. Cette variable reste côté serveur et ne doit pas commencer par `NEXT_PUBLIC_`.

Attribuer uniquement ici le domaine HTTPS public. Configurer le contrôle de santé sur `/connexion`. Le backend, PostgreSQL et Redis ne reçoivent aucun domaine public ni port publié.

Publier le Dockerfile, `.dockerignore` et la configuration Next.js standalone dans le dépôt avant de déployer. Le modèle backend figure dans son dépôt, fichier `docker-compose.production.yml`.

Déploiement vérifié le 7 novembre 2026 : application `yl0jdaj9bukjf7frcc00htkg`, domaine `https://signalements.72.62.16.125.sslip.io`. Certificat HTTPS valide, contrôle de santé `/connexion`, connexion administrateur et pages protégées vérifiés. L’image runtime inclut curl pour le contrôle de santé Coolify.
