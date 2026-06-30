# VisionGram

![Vue 3](https://img.shields.io/badge/Vue-3-42b883?logo=vuedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646cff?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-06b6d4?logo=tailwindcss&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-2.x-ffd859?logo=pinia&logoColor=black)
![Vue Router](https://img.shields.io/badge/Vue_Router-4.x-35495e?logo=vuerouter&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2d3748?logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-4169e1?logo=postgresql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=jsonwebtokens&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP-5a29e4?logo=axios&logoColor=white)

VisionGram é uma plataforma social inspirada no Instagram, construída com Vue 3 no frontend e Node.js, Express, TypeScript, Prisma e PostgreSQL no backend. O projeto foi desenvolvido como uma aplicação full stack em estilo hackathon e inclui os principais fluxos esperados em uma experiência de feed social: autenticação, gerenciamento de perfil, criação de posts, curtidas, comentários, relações de follow, notificações, posts salvos, pesquisa, stories e navegação estilo reels.

## Visão geral

O repositório contém duas partes principais:

- Frontend: uma aplicação Vue 3 + TypeScript com gerenciamento de estado Pinia, Vue Router, Tailwind CSS e uma interface baseada em componentes inspirada no Instagram.
- Backend: uma API Express + TypeScript usando Prisma ORM com banco de dados PostgreSQL e autenticação baseada em JWT.

Este README reflete a implementação atual do repositório, em vez de um roteiro idealizado.

## Preview

### Demonstração da Aplicação

Confira abaixo como a plataforma facilita a criação, o compartilhamento e a interação com publicações de forma simples, rápida e intuitiva, proporcionando uma experiência completa de rede social.  

Acompanhe o funcionamento pelo video a seguir:

[![Demonstração do projeto](https://github-production-user-asset-6210df.s3.amazonaws.com/4692453/614941808-4c75c668-b728-44d2-91b3-64fe7436d463.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAVCODYLSA53PQK4ZA%2F20260630%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20260630T045822Z&X-Amz-Expires=300&X-Amz-Signature=daed9f2f720d4b5d8658cb4c0d62b90ac694d41c3f192b051d40bd3fae8e206d&X-Amz-SignedHeaders=host&response-content-type=image%2Fpng)](https://youtu.be/pPQPnDUgivQ)

## Funcionalidades

### Autenticação e gerenciamento de conta
- Fluxos de cadastro, login, recuperação de senha e redefinição de senha
- Autenticação JWT com rotas da API protegidas
- Página de configurações com atualização de perfil, troca de senha e exclusão de conta
- Tratamento de preferência de gênero nas configurações

### Experiência de feed social
- Feed inicial com posts, curtidas, comentários e interações de salvamento
- Visualização de detalhes de post
- Rotas de Explore, Pesquisa, Notificações, Stories, Reels e mensagens diretas
- Páginas de perfil com posts, posts salvos e listas de seguidores/seguindo

### Interações com conteúdo
- Criação e compartilhamento de posts com imagens/mídia
- Curtir e descurtir posts
- Adicionar comentários e respostas a comentários
- Seguir e deixar de seguir usuários
- Salvar posts em uma lista pessoal de posts salvos
- Criação de notificações para follows e ações relacionadas

## Stack técnica

### Frontend
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS
- Axios
- Vue Toastification
- Swiper
- Font Awesome
- Emoji picker

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT
- bcrypt
- nodemailer
- CORS

## Estrutura do projeto

A estrutura abaixo mostra os principais diretórios e arquivos do repositório, sem entrar em detalhes excessivos de cada pasta:

```text
.
├── src/                          # Frontend Vue 3 + TypeScript
│   ├── App.vue                   # Componente principal da aplicação
│   ├── main.ts                   # Ponto de entrada do Vite
│   ├── components/               # Componentes reutilizáveis da interface
│   ├── views/                    # Páginas e telas principais
│   ├── stores/                   # Estado global com Pinia
│   ├── router/                   # Definição das rotas
│   ├── services/                 # Clientes de API e integrações
│   └── assets/                   # Imagens, estilos e arquivos estáticos
├── backend/                      # Backend Node.js + Express
│   ├── src/                      # Código principal da API
│   │   ├── server.ts             # Inicialização do servidor
│   │   ├── modules/              # Módulos de auth, posts, likes, follows e outros
│   │   └── shared/               # Utilidades e helpers compartilhados
│   └── schema.prisma             # Schema Prisma e modelos do banco
├── package.json                  # Scripts e dependências do frontend
├── backend/package.json         # Scripts e dependências do backend
└── .env / backend/.env          # Configurações locais de ambiente
```

## Modelo de banco de dados

O schema do Prisma define as seguintes entidades principais:

- User
- Post
- Like
- Comment
- Follow
- Notification
- PasswordResetToken
- SavedPost

## Variáveis de ambiente

### Frontend
Crie um arquivo .env na raiz do projeto para o Vite:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Backend
Crie um arquivo .env na pasta backend:

```env
DATABASE_URL=postgresql://USUARIO:SENHA@HOST:5432/NOME_DO_BANCO
JWT_SECRET=sua-chave-secreta
FRONTEND_URL=http://localhost:5173
PORT=3000

MAIL_HOST=smtp.exemplo.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=seu-email@exemplo.com
MAIL_PASS=sua-senha
MAIL_FROM=seu-email@exemplo.com
```

## Começando

### 1) Instalar dependências

Instale as dependências do frontend:

```bash
npm install
```

Instale as dependências do backend:

```bash
cd backend
npm install
```

### 2) Preparar o banco de dados

Execute as migrações do Prisma e gere o client:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 3) Iniciar os serviços

Inicie a API do backend:

```bash
cd backend
npm run dev
```

Em um segundo terminal, inicie o frontend:

```bash
npm run dev
```

O frontend ficará disponível em http://localhost:5173 e o backend em http://localhost:3000 por padrão.

## Scripts disponíveis

### Frontend
- npm run dev — inicia o servidor de desenvolvimento Vite
- npm run build — executa verificação de tipos e build de produção
- npm run preview — visualiza o build de produção
- npm run test:unit — executa testes com Vitest
- npm run lint — executa ESLint

### Backend
- npm run dev — inicia a API Express com ts-node-dev
- npm run build — compila TypeScript
- npm run start — compila e executa o servidor
- npm run prisma:migrate — executa migrações do Prisma
- npm run prisma:generate — gera o client do Prisma
- npm run prisma:studio — abre o Prisma Studio

## Tabela de rotas da API

A API do backend está organizada em módulos e segue o padrão base http://localhost:3000. As rotas marcadas como Protegida exigem um token JWT no cabeçalho Authorization.

| Módulo | Endpoint | Método | Descrição |
| --- | --- | --- | --- |
| Autenticação | /auth/register | POST | Cadastra um novo usuário. |
| Autenticação | /auth/login | POST | Realiza login e retorna um token JWT. |
| Autenticação | /auth/forgot-password | POST | Solicita recuperação de senha. |
| Autenticação | /auth/reset-password | POST | Redefine a senha com token válido. |
| Autenticação | /auth/me | GET | Retorna os dados do usuário autenticado. Protegida. |
| Usuários | /users | GET | Lista usuários. |
| Usuários | /users/:id | GET | Busca um usuário pelo ID. |
| Usuários | /users/:id | PUT | Atualiza dados do perfil. Protegida. |
| Usuários | /users/:id/password | PUT | Altera a senha do usuário. Protegida. |
| Usuários | /users/me | DELETE | Exclui a conta do usuário autenticado. Protegida. |
| Posts | /posts | GET | Lista posts do feed. |
| Posts | /posts | POST | Cria um novo post. Protegida. |
| Posts | /posts/:id | GET | Retorna um post específico. |
| Posts | /posts/:id | PUT | Atualiza um post. Protegida. |
| Posts | /posts/:id | DELETE | Remove um post. Protegida. |
| Posts | /posts/share/:id | GET | Retorna dados de compartilhamento de um post. |
| Curtidas | /posts/:id/like | POST | Curte um post. Protegida. |
| Curtidas | /posts/:id/like | DELETE | Remove a curtida de um post. Protegida. |
| Comentários | /posts/:id/comments | POST | Cria um comentário em um post. Protegida. |
| Comentários | /posts/:id/comments | GET | Lista comentários de um post. |
| Comentários | /posts/:id/comments/:commentId/replies | GET | Lista respostas de um comentário. |
| Comentários | /posts/:id/comments/:commentId | DELETE | Remove um comentário. Protegida. |
| Seguir | /users/:id/follow | POST | Segue um usuário. Protegida. |
| Seguir | /users/:id/follow | DELETE | Deixa de seguir um usuário. Protegida. |
| Seguir | /users/:id/followers | GET | Lista seguidores de um usuário. |
| Seguir | /users/:id/following | GET | Lista usuários seguidos por um usuário. |
| Notificações | /notifications | GET | Lista notificações do usuário autenticado. Protegida. |
| Notificações | /notifications | POST | Cria uma notificação. Protegida. |
| Notificações | /notifications/:id/read | POST | Marca uma notificação como lida. Protegida. |
| Posts salvos | /posts/:id/save | POST | Salva um post na lista do usuário. Protegida. |
| Posts salvos | /posts/:id/save | DELETE | Remove um post da lista de salvos. Protegida. |
| Posts salvos | /me/saved-posts | GET | Lista posts salvos do usuário autenticado. Protegida. |

## Deploy

O projeto pode ser publicado utilizando:

- **Vercel (Frontend):** https://visiongram-two.vercel.app
- **Vercel Serverless Functions (Backend):** https://backend-nine-phi-b4rqy1286p.vercel.app

> Não é necessário instalação após publicação - basta acessar o link.

## Observações

- A interface foi pensada para lembrar o Instagram, mas a implementação é um aplicativo social full stack funcional, e não uma cópia pixel-perfect.
- O projeto atualmente depende de uma API real com banco PostgreSQL, e não de dados mockados.
- O frontend e o backend estão separados intencionalmente para que o app possa ser desenvolvido e implantado de forma independente.

## Conclusão

O VisionGram foi desenvolvido como um projeto full stack para demonstrar a criação de uma rede social funcional, integrando frontend e backend em uma solução completa e organizada. Ao longo do desenvolvimento, foram aplicados conceitos importantes de arquitetura de software, consumo de API, autenticação, gerenciamento de estado, persistência de dados e experiência de usuário.

O projeto representa uma base sólida para futuras evoluções, como implantação, melhorias de performance, testes automatizados e expansão de recursos sociais. Ele também reforça a aplicação prática de tecnologias modernas no desenvolvimento web atual.

## Contribuição

Se quiser contribuir com feedback ou sugestões, fique à vontade para abrir uma **[Issue](https://github.com/isaias-oliveira-fullstack/visiongram/issues)** ou **[enviar ideias](https://github.com/isaias-oliveira-fullstack/visiongram/pulls)**.

## Licença

Este projeto está licenciado sob a Licença MIT.

Veja o arquivo [LICENSE](./LICENSE) para mais detalhes.

## Autor

Projeto desenvolvido por Isaias Oliveira.
Conecte-se comigo no [LinkedIn](https://www.linkedin.com/in/isaias-oliveira-dev/).
