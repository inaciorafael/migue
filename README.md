# 🧉 MIGUÉ

**M.I.G.U.E — Mock Inteligente Gerador de URLs e Experiências**

A ideia é exatamente essa.

O MIGUÉ existe para você:

- Trabalhar como se a API estivesse pronta
- Integrar o frontend normalmente
- Simular cenários complexos
- Rodar tudo como se fosse um backend real

Sem precisar criar servidor fake, sem configurar mil coisas, sem boilerplate.

Você só aponta para um JSON… e continua trabalhando.

Porque todo dev já passou por isso:

> "A API não tá pronta ainda… mas eu preciso continuar."

O MIGUÉ não é gambiarra.

É a **gambiarra profissionalizada, tipada, com hot-reload, faker e runtime de template.**

- Interceptar requisições HTTP
- Retornar mocks definidos em JSON
- Fazer hot-reload automático dos mocks
- Gerar respostas dinâmicas com templates, `faker`, funções utilitárias e contexto da própria request
- Opcionalmente fazer proxy para um backend real quando não houver mock

Feito para **fluxos reais de frontend**, onde o backend ainda não existe, está instável, ou você precisa simular cenários complexos rapidamente.

---

## 🚧 STATUS DO PROJETO

> Em desenvolvimento ativo. A estrutura está sólida, mas novas capacidades estão sendo adicionadas constantemente.

---

## ❗️NÃO É PARA BUILDAR

O MIGUÉ **não deve ser buildado**.

Ele foi projetado para rodar **direto pelo TypeScript** usando `tsx`.

Isso evita toda a complexidade de ESM, dist, extensões `.js`, etc.

Você deve rodar SEMPRE assim:

```bash
tsx apps/cli/src/index.ts
```

---

## 📦 Instalação

No monorepo:

```bash
pnpm install
```

Nada de build.

---

## 🚀 Executando

Sem backend real:

```bash
tsx apps/cli/src/index.ts \
  --mocks mocks/mocks.json \
  --port 4321
```

Com backend real (proxy fallback):

```bash
tsx apps/cli/src/index.ts \
  --mocks mocks/mocks.json \
  --backend https://api.real.com \
  --port 4321
```

---

## 🧱 Estrutura de um mock

Schema base:

```ts
MockRuleSchema = {
  id: string,
  enabled: boolean,

  match: {
    method: string,
    path: string,
    query?: Record<string, string>,
    body?: any
  },

  response: {
    status: number,
    delay?: number,
    body: any
  }
}
```

---

---

## 🧪 Exemplo prático

### mocks/mocks.json

```json
[
  {
    "id": "get-user",
    "enabled": true,
    "match": {
      "method": "GET",
      "path": "/users/:id"
    },
    "response": {
      "status": 200,
      "body": {
        "id": "{{ params.id }}",
        "requestUserAgent": "{{ query.ua || 'unknown' }}",
        "generatedId": "{{ uuid() }}",
        "sameGeneratedId": "{{ generatedId }}",
        "name": "{{ faker.person.fullName() }}",
        "email": "{{ faker.internet.email() }}",
        "items": "{{ Array.from({ length: randomInt(2,4) }, () => ({ id: uuid(), name: faker.commerce.productName() })) }}"
      }
    }
  }
]
```

### Rodando o MIGUÉ

```bash
tsx apps/cli/src/index.ts --mocks mocks/users.json --port 4321
```

### Fazendo a requisição

```bash
curl "http://localhost:4321/users/42?ua=chrome"
```

### Resposta

```json
{
  "id": "42",
  "requestUserAgent": "chrome",
  "generatedId": "9f3c1...",
  "sameGeneratedId": "9f3c1...",
  "name": "Maria Silva",
  "email": "maria@email.com",
  "items": [
    { "id": "a1b2", "name": "Incredible Cotton Hat" },
    { "id": "c3d4", "name": "Ergonomic Wooden Chair" }
  ]
}
```

---

## 🧠 Templates dinâmicos (`{{ }}`)

Tudo dentro de `{{ }}` é executado em runtime.

Você tem acesso a:

| Variável | Descrição |
|---|---|
| `params` | Params da rota (`/users/:id`) |
| `query` | Querystring da request |
| `body` | Body da request |
| `faker` | Faker completo |
| helpers | `uuid()`, `randomInt()`, etc |
| **dados já resolvidos do próprio JSON** |

---

## 🔥 Reutilizando dados do próprio JSON

```json
{
  "body": {
    "id": "{{ uuid() }}",
    "copy": "{{ id }}"
  }
}
```

```json
{
  "user": {
    "id": "{{ uuid() }}"
  },
  "ownerId": "{{ user.id }}"
}
```

---

## 🎲 Faker + Arrays dinâmicos

```json
{
  "items": "{{ Array.from({length: randomInt(2,5)}, () => ({ id: uuid(), name: faker.commerce.productName() })) }}"
}
```

---

## ⏱ Delay

```json
"delay": 1000
```

---

## 🔄 Hot Reload

Edite o `mocks.json`.

Salve.

O MIGUÉ recarrega automaticamente. Sem reiniciar.

---

## 📜 Logs detalhados

O MIGUÉ mostra:

- Regra encontrada
- Request recebida
- Dados usados no matching
- Quando caiu no proxy

Perfeito para debugar integrações.

---

## 🧩 Quando usar o MIGUÉ?

- Backend ainda não existe
- Precisa simular cenários complexos
- Testar estados de erro facilmente
- Trabalhar offline
- Criar mocks vivos e realistas para frontend

---

## 🛣 Roadmap

- Interface web para editar mocks
- Persistência de estado entre requests
- Sistema de cenários
- Erros condicionais baseados na request
- Coleções de mocks reutilizáveis

---

## 🧉 Por que o nome?

Porque todo dev já fez um **migué** para conseguir trabalhar enquanto a API não estava pronta.
