# Training Manager

Sistema de Gestão de Treinamentos Corporativos desenvolvido para a disciplina de Software Product: Analysis, Specification, Project & Implementation.

## Sobre o projeto

O Training Manager tem como objetivo facilitar o gerenciamento de treinamentos e colaboradores de uma organização.

O projeto utiliza uma arquitetura de três camadas:

- Front-end
- Back-end
- Banco de Dados

## Tecnologias utilizadas

### Front-end
- HTML
- CSS
- JavaScript

### Back-end
- Node.js
- Express

### Banco de Dados
- MySQL

## AC1 - Primeira Sprint

Na primeira entrega foram desenvolvidas as seguintes funcionalidades:

- Cadastro de colaboradores
- Consulta de colaboradores
- Cadastro de treinamentos
- Consulta de treinamentos
- Integração entre Front-end, Back-end e Banco de Dados

## Estrutura do projeto

training-manager/

- backend/
  - database/
  - routes/
  - server.js
- frontend/
  - index.html
  - treinamentos.html
  - colaboradores.js
  - treinamentos.js
  - style.css

## Próximas etapas

Nas próximas sprints serão adicionadas novas funcionalidades ao sistema, incluindo gerenciamento de turmas, matrículas, controle de presença e indicadores.

## Integrantes

- Eduardo Ruiz

## Disciplina

Software Product: Analysis, Specification, Project & Implementation

Turma: 202602 - EAD - ADS 5A
## Entrega AC2 – Training Manager LMS

O Training Manager LMS é um sistema de gestão de treinamentos corporativos desenvolvido com HTML, CSS, JavaScript, Node.js, Express e MySQL.

### Funcionalidades implementadas
- Cadastro e listagem de colaboradores.
- Cadastro e listagem de treinamentos.
- Cadastro e gerenciamento de turmas.
- Matrícula individual de colaboradores.
- Visualização de participantes por turma.
- Importação em lote de colaboradores por CSV.
- Importação em lote de treinamentos por CSV.
- Importação em lote de turmas por CSV.
- Importação em lote de matrículas por CSV.
- Validação de registros duplicados e inconsistências.
- Relatórios de resultados das importações.



## AC3 — Controle de Conclusão e Dashboard de Indicadores

### Objetivo

A terceira etapa do projeto Training Manager LMS tem como objetivo ampliar o acompanhamento dos treinamentos corporativos, permitindo controlar a situação das matrículas, registrar a conclusão dos participantes e visualizar indicadores gerenciais por meio de um dashboard integrado ao banco de dados.

### Funcionalidades desenvolvidas

**1. Gestão de status das matrículas**

- Atualização individual do status dos participantes.
- Três situações disponíveis: `Matriculado`, `Concluído` e `Ausente`.
- Persistência das alterações no banco de dados MySQL.
- Atualização diretamente na relação de participantes de cada turma.

**2. Registro de conclusão**

- Inclusão do campo `data_conclusao` na tabela `matriculas`.
- Registro automático da data ao marcar uma matrícula como `Concluído`.
- Exibição da data de conclusão na interface de turmas.
- Limpeza da data de conclusão quando a matrícula passa para um status diferente de `Concluído`.

**3. API de indicadores**

Desenvolvimento de rotas REST utilizando Node.js e Express:

| Método | Endpoint | Descrição |
|---|---|---|
| PUT | `/matriculas/:id/status` | Atualiza o status de uma matrícula |
| GET | `/dashboard/resumo` | Retorna os indicadores gerais |
| GET | `/dashboard/treinamentos` | Retorna os indicadores por treinamento |

**4. Dashboard gerencial**

Desenvolvimento de uma página de acompanhamento com:

- Total de matrículas.
- Quantidade de participantes concluídos.
- Quantidade de ausentes.
- Taxa geral de conclusão.
- Gráfico de distribuição das matrículas por status.
- Tabela de indicadores por treinamento.
- Botão para atualizar os dados consultados na API.

### Regra de cálculo dos indicadores

A taxa de conclusão é calculada pela seguinte fórmula:

**Taxa de Conclusão (%) = (Matrículas Concluídas / Total de Matrículas) × 100**

Os indicadores consideram os registros de matrículas, não a quantidade de colaboradores distintos.

### Tecnologias utilizadas

- **Frontend:** HTML5, CSS3 e JavaScript.
- **Backend:** Node.js e Express.
- **Banco de dados:** MySQL.
- **Integração:** API REST e Fetch API.
- **Versionamento:** Git e GitHub.

### Arquivos implementados ou atualizados

| Arquivo | Finalidade |
|---|---|
| `backend/routes/dashboard.js` | Consultas dos indicadores |
| `backend/routes/matriculas.js` | Atualização dos status e datas |
| `backend/server.js` | Registro das rotas do dashboard |
| `frontend/dashboard.html` | Interface visual dos indicadores |
| `frontend/dashboard.js` | Integração com a API e apresentação dos dados |
| `frontend/turmas.html` | Interface de acompanhamento dos participantes |
| `frontend/turmas.js` | Atualização de status e exibição das datas |

### Resultados alcançados

A AC3 ampliou o Training Manager LMS de um sistema de cadastro e organização de treinamentos para uma aplicação que também acompanha a execução e os resultados das ações de capacitação.

Com a integração entre frontend, backend e MySQL, tornou-se possível consultar informações atualizadas sobre matrículas, conclusões e ausências, oferecendo uma visão gerencial do processo de treinamento.

### Versionamento

**Branch:** `desenvolvimento-ac3`

**Repositório:** https://github.com/EduardoRuiz517/training-manager