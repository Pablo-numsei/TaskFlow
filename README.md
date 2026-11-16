# TaskFlow

Aplicação web responsiva para organização de tarefas, desenvolvida com React, Vite e JavaScript.

## Funcionalidades

- Criar, editar e excluir tarefas
- Marcar tarefas como concluídas
- Definir prioridade e prazo
- Filtrar tarefas por status
- Pesquisar tarefas
- Visualizar indicadores de produtividade
- Salvar dados no armazenamento local do navegador (localStorage)

## Tecnologias

- React
- JavaScript
- Vite
- CSS
- Lucide React

## Executar localmente

Requisitos: Node.js e npm.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Persistência

Os dados são salvos no localStorage do navegador. Esta versão não utiliza backend ou banco de dados; portanto, as tarefas ficam armazenadas apenas no navegador e dispositivo em que foram criadas.

## Deploy

O projeto pode ser importado diretamente na Vercel. O comando de build é `npm run build` e o diretório de saída é `dist`.