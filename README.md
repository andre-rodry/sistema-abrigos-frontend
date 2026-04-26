# Mãos que Acolhem 🤝

> Conectando ajuda a quem mais precisa

## 1. Apresentação da Ideia

Esse é o meu projeto. A ideia surgiu a partir do desafio sobre enchentes no Brasil. Pensando nesse cenário, decidi focar no problema de **falta de informação sobre abrigos disponíveis**, onde pessoas afetadas por enchentes não sabem onde encontrar locais seguros para se refugiar nem como pedir socorro rapidamente.

## 2. Problema Escolhido

**Caso 1 - Falta de Informação sobre Abrigos**

Durante enchentes, muitas pessoas precisam sair de suas casas rapidamente e não sabem onde encontrar abrigos disponíveis ou se ainda há vagas. Algumas informações até existem, mas estão espalhadas ou desatualizadas, dificultando a tomada de decisão em um momento crítico.

## 3. Solução Proposta

O **Mãos que Acolhem** é um sistema web que centraliza informações sobre abrigos em tempo real e conecta pessoas em situação de emergência com voluntários dispostos a ajudar. O sistema possui três perfis de uso:

- **Pessoas afetadas** — visualizam abrigos disponíveis com vagas e podem solicitar resgate informando localização, número de pessoas e observações
- **Voluntários** — se cadastram, fazem login e acessam um painel com solicitações de resgate pendentes para aceitar e atender
- **Administradores** — gerenciam abrigos, acompanham ocupação em tempo real e monitoram todos os resgates via dashboard

## 4. Telas do Sistema

- **Página Inicial** — exibe total de abrigos, pessoas abrigadas e vagas disponíveis, além da lista de abrigos com ocupação em tempo real
- **Formulário de Resgate** — permite solicitar resgate de três formas: localização GPS automática, endereço digitado ou **gravação de áudio**. A opção de áudio é essencial pois em situações de emergência a pessoa pode não ter tempo ou condições de digitar — basta gravar uma mensagem explicando sua situação e enviar
- **Cadastro de Voluntário** — formulário com nome, email, telefone, cidade, disponibilidade e habilidades
- **Painel do Voluntário** — lista resgates pendentes com filtros por status (Aguardando, A caminho, Concluído, Cancelado) e opção de aceitar resgate
- **Dashboard Administrativo** — exibe gráficos de ocupação por abrigo, visão geral de vagas e lista completa de abrigos com ações de editar e excluir

## 5. Estrutura do Sistema

### Front-end
Desenvolvido com **Next.js**. Permite visualização de abrigos, solicitação de resgates, cadastro e login de voluntários e painel administrativo completo.

### Back-end
Desenvolvido com **Node.js** e **Express**. Possui autenticação via **JWT** separada para administradores e voluntários.

Principais rotas:
- `GET /api/abrigos` — lista todos os abrigos
- `GET /api/abrigos/:id` — busca abrigo por ID
- `POST /api/abrigos` — cadastra novo abrigo (admin)
- `PUT /api/abrigos/:id` — atualiza abrigo (admin)
- `DELETE /api/abrigos/:id` — remove abrigo (admin)
- `POST /api/resgates` — solicita resgate (público)
- `GET /api/resgates` — lista resgates (autenticado)
- `POST /api/voluntario/register` — cadastra voluntário
- `POST /api/voluntario/login` — login voluntário
- `POST /api/admin/login` — login admin

### Banco de Dados
**PostgreSQL** com as seguintes tabelas:
- `abrigos` — informações dos abrigos (nome, endereço, capacidade, ocupação)
- `resgates` — solicitações de resgate com localização e status
- `voluntarios` — dados dos voluntários cadastrados
- `admin` — administradores do sistema

## 6. Documentação da API

A documentação completa da API está disponível no arquivo `API abrigos.postman_collection.json` na raiz do projeto.

Para utilizar, importe o arquivo no Postman. As rotas protegidas requerem token JWT obtido via login.

## 7. Como Executar

### Back-end
```bash
cd sistema-abrigos-backend
npm install
npm start
```

### Front-end
```bash
cd sistema-abrigos-frontend
npm install
npm run dev
```

Acesse `http://localhost:3000` no navegador.

## Tecnologias Utilizadas

- **Front-end:** Next.js
- **Back-end:** Node.js, Express
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT