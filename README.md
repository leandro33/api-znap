# ZNAP

Este repositório contém dois projetos:

- **app-znap** → frontend (Vue 3 + Vite)
- **api-znap** → backend (Node.js + Restify + MySQL)

Ambos são orquestrados via **Docker Compose**.

---

## 📂 Estrutura de pastas

```
znap/
 ├── app-znap/        # código do frontend
 ├── api-znap/        # código do backend
 ├── docker-compose.yml
 └── README.md
```

> O arquivo `docker-compose.yml` deve estar na raiz da pasta `znap`.

---

## 🚀 Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado  
- [Docker Compose](https://docs.docker.com/compose/) (já incluso em versões recentes do Docker Desktop)

---

## ⚙️ Configuração inicial

1. Clone o repositório:
   ```bash
   git clone https://seu-repo/znap.git
   cd znap
   ```

2. Configure variáveis de ambiente se necessário:  
   - `api-znap/.env` → credenciais do MySQL, porta da API etc.  
   - `app-znap/.env` → URL base da API (ex.: `VITE_API_URL=http://localhost:3000`)

---

## ▶️ Subindo os containers

Na pasta raiz `znap`, execute:

```bash
docker compose up --build
```

Isso vai:

- Criar a imagem do **backend** (`api-znap`)
- Criar a imagem do **frontend** (`app-znap`)
- Subir ambos os containers juntos

---

## 🌐 Acessando

- **Frontend (app-znap)** → http://localhost:5173  
- **Backend (api-znap)** → http://localhost:3000  

> As portas podem variar conforme configuração no `docker-compose.yml`.

---

## 🔄 Desenvolvimento

Se fizer alterações no código, basta reconstruir:

```bash
docker compose up --build
```

---

## 🛑 Parando os containers

```bash
docker compose down
```

---

## 📌 Observações

- Certifique-se que o **MySQL** também está rodando (pode estar no mesmo `docker-compose.yml` ou externo).  
- Caso use MySQL em container, configure no `docker-compose.yml` a rede para que a API consiga se conectar.  
- Logs da API:
  ```bash
  docker compose logs -f api-znap
  ```
- Logs do App:
  ```bash
  docker compose logs -f app-znap
  ```

---
