# Conhecimento armazenado — Arquitetura do projeto

Fonte: `docs/ARCHITECTURE.md` (lido em 2026-11-24).

## Visão geral

Projeto **full-stack** construído principalmente em **TypeScript**, com **Next.js** como framework único para interfaces e APIs. Os dados ficam no **Supabase (PostgreSQL)**, a aplicação é hospedada na **Vercel** e fluxos automatizados são orquestrados por **N8N**.

## Stack por camada

| Camada | Ferramentas | Papel principal |
| --- | --- | --- |
| Front-End | TypeScript, Next.js, React.js, Biome, TailwindCSS, Data-FNS, Shadcn, React Query | Interfaces tipadas, componentização, estilos, datas, design system e gestão de dados remotos |
| Back-End | TypeScript, Next.js, Bcrypt, Mastra.ai, tRPC | APIs, endpoints tipados, segurança de senhas e agentes internos |
| Banco de dados | Supabase (PostgreSQL) | Persistência relacional dos dados |
| Infraestrutura | Vercel | Hospedagem do servidor (API) e do cliente (SPA) |
| Automação | N8N | Criação de fluxos automatizados |

## Conceitos aprendidos

### Front-End
- **TypeScript** é a linguagem principal, com tipagem estática.
- **Next.js** cuida da criação e gestão das interfaces e também das APIs.
- **React.js** é usado para componentizar a interface.
- **Biome** substitui ferramentas de lint/format: valida, formata e corrige código.
- **TailwindCSS** é a solução de estilização.
- **date-fns** cuida da manipulação de datas e horas.
- **Shadcn** fornece a base de componentização (design system).
- **React Query** gere queries de leitura da API e mutations de alteração de dados.

### Back-End
- **TypeScript + Next.js** também compõem o servidor.
- **Bcrypt** gera salt e hash de senhas (segurança de credenciais).
- **Mastra.ai** cria e personaliza agentes internos (IA).
- **tRPC** gere os endpoints, mantendo contratos tipados entre cliente e servidor.

### Dados, infra e automação
- **Supabase** fornece o banco **PostgreSQL**.
- **Vercel** hospeda tanto a API quanto o cliente SPA.
- **N8N** automatiza fluxos de trabalho externos/ internos.

## Decisões arquiteturais implícitas

1. **Unificação front/back**: Next.js concentra UI e API em um único projeto, reduzindo a complexidade de deploy.
2. **Segurança de autenticação**: senhas nunca são armazenadas em texto puro — bcrypt aplica salt + hash.
3. **Tipagem ponta a ponta**: TypeScript + tRPC + React Query formam um fluxo tipado do banco até a interface.
4. **Design system próprio**: Shadcn + Tailwind padronizam a aparência sem CSS customizado extenso.
5. **Inteligência e automação separadas**: Mastra.ai para agentes internos; N8N para integrações e fluxos automatizados.
