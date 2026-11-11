# Sign-Up (criação de conta)

## Escopo
Front-End, Back-End, Banco de dados

## Contexto
Precisamos implementar o fluxo para criação de contas na plataforma, as pessoas precisarão forncer:
- Primeiro nome
- Sobrenome 
- Email
- Senha
- Confirmação de senha 

## Requisitos funcionais
1. Precisamos adicionar validação no formulário na camada de cliente 
    1. Caso o formulários esteja válido podemos enviar a requisição para API
2. Os campos de nome e sobrenome devem ser separados 
3. Precisamos criar uma nova conta no Banco de dados na tabela de `accounts`
    1. `id`: nanoid (gerado com `nanoid` na camada de API)
    2. `first_name`: text
    3. `last_name`: text
    4. `created_at`: timestamp
    5. `updated_at`: timestamp
    6. `active`: boolean
    7. `email`: text
    8. `password`: text (hashed)
    9. `salt`: text (hased)

4. A requisição deve ser um `POST` para `/api/v1/sign-up`e receber os dados como JSON no `body`
5. Caso dê tudo certo retornar `201`ou erros de acordo com a validação
    1. `400`: Má formatação de dados


## Requisitos não funcionais
- Segurança: Precisamos salvar as senhas de forma segura no banco de dados 
    - Precisamos receber os dados do cliente de forma segura usando HTTPS (para previnir network sniff)
- UI/UX: boa experiência de uso através de uma interface bonita, elegante, moderna 
- Perfomance: O processo de criação de conta precisa ser rápido 

## Você deve 
- Criar a base do projeto com um endpoit inicial para criação de conta 
- Criar a base do projeto com uma página inicial para a interface de criação de conta
- Configurar as bibliotecas base 

## Você não deve 
- Implementar qualquer outra funcionalidade que esteja relacionda com sign-up (criação de contas)

## Tecnologias (Stack)
React.js, Next.js, React-Hook-Form, Shadcn, Tailwind, Supabase, TRPC, Bunjs.

## Critérios de aceitação 
- Temos uma página para criar a nova conta em `/auth/sign-up`
- A página contém um formulário com validação 
- A plataforma consegue se comunicar com a API para enviar os dados e receber uma resposta 
- Estamos informando possíveis erros

## Resultado 
TODO