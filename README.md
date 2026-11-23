# Training Manager LMS

Sistema de Gestão de Treinamentos Corporativos desenvolvido para a disciplina **Software Product: Analysis, Specification, Project & Implementation**.

## Sobre o projeto

O **Training Manager LMS** é uma aplicação web desenvolvida para facilitar o gerenciamento de treinamentos corporativos, colaboradores, turmas e matrículas de uma organização.

O sistema permite administrar o ciclo de treinamento, desde o cadastro dos colaboradores até o acompanhamento dos resultados por meio de indicadores, relatórios e históricos individuais.

O projeto utiliza uma arquitetura de três camadas:

- **Front-end:** interface utilizada pelos usuários.
- **Back-end:** processamento das regras de negócio e disponibilização da API REST.
- **Banco de dados:** armazenamento e gerenciamento das informações.

## Tecnologias utilizadas

| Camada | Tecnologias |
|---|---|
| Front-end | HTML5, CSS3 e JavaScript |
| Back-end | Node.js e Express |
| Banco de dados | MySQL |
| Integração | API REST e Fetch API |
| Versionamento | Git e GitHub |
| Desenvolvimento | Visual Studio Code e MySQL Workbench |

---

## AC1 — Primeira Sprint: Cadastros

### Objetivo

Desenvolver a estrutura inicial do sistema e estabelecer a comunicação entre o front-end, o back-end e o banco de dados.

### Funcionalidades implementadas

- Cadastro de colaboradores.
- Consulta e listagem de colaboradores.
- Cadastro de treinamentos.
- Consulta e listagem de treinamentos.
- Integração entre interface, API REST e MySQL.
- Implementação das operações básicas de gerenciamento dos registros.

### Resultados alcançados

A AC1 estabeleceu a base do Training Manager, permitindo armazenar e consultar informações de colaboradores e treinamentos.

---

## AC2 — Segunda Sprint: Turmas, Matrículas e Importação CSV

### Objetivo

Ampliar o sistema para permitir a organização de turmas, o gerenciamento de participantes e a importação de dados em lote.

### Funcionalidades implementadas

- Cadastro e gerenciamento de turmas.
- Associação de treinamentos às turmas.
- Matrícula individual de colaboradores.
- Visualização de participantes por turma.
- Importação em lote de colaboradores por CSV.
- Importação em lote de treinamentos por CSV.
- Importação em lote de turmas por CSV.
- Importação em lote de matrículas por CSV.
- Validação de registros duplicados e inconsistências.
- Relatórios de resultados das importações.

### Resultados alcançados

A AC2 permitiu organizar treinamentos em turmas e vincular colaboradores às ações de capacitação, reduzindo a necessidade de cadastros individuais por meio da importação em lote.

---

## AC3 — Terceira Sprint: Controle de Conclusão e Dashboard

### Objetivo

Ampliar o acompanhamento dos treinamentos corporativos, permitindo controlar a situação das matrículas, registrar conclusões e visualizar indicadores gerenciais.

### 1. Gestão de status das matrículas

- Atualização individual do status dos participantes.
- Três situações disponíveis: `Matriculado`, `Concluído` e `Ausente`.
- Persistência das alterações no MySQL.
- Atualização diretamente na relação de participantes de cada turma.

### 2. Registro de conclusão

- Inclusão do campo `data_conclusao` na tabela `matriculas`.
- Registro automático da data ao marcar uma matrícula como `Concluído`.
- Exibição da data de conclusão na interface.
- Limpeza da data quando a matrícula passa para outro status.

### 3. API de indicadores

| Método | Endpoint | Descrição |
|---|---|---|
| PUT | `/matriculas/:id/status` | Atualiza o status de uma matrícula |
| GET | `/dashboard/resumo` | Retorna os indicadores gerais |
| GET | `/dashboard/treinamentos` | Retorna os indicadores por treinamento |

### 4. Dashboard gerencial

O dashboard apresenta:

- Total de matrículas.
- Quantidade de participantes concluídos.
- Quantidade de ausentes.
- Taxa geral de conclusão.
- Gráfico de distribuição por status.
- Tabela de indicadores por treinamento.
- Atualização dos indicadores por meio da API.

### Regra de cálculo

**Taxa de Conclusão (%) = (Matrículas Concluídas / Total de Matrículas) × 100**

Os indicadores consideram os registros de matrículas, não a quantidade de colaboradores distintos.

### Arquivos implementados ou atualizados

| Arquivo | Finalidade |
|---|---|
| `backend/routes/dashboard.js` | Consultas dos indicadores |
| `backend/routes/matriculas.js` | Atualização de status e datas |
| `backend/server.js` | Registro das rotas |
| `frontend/dashboard.html` | Interface do dashboard |
| `frontend/dashboard.js` | Integração com a API |
| `frontend/turmas.html` | Acompanhamento dos participantes |
| `frontend/turmas.js` | Atualização de status |

### Resultados alcançados

A AC3 transformou o Training Manager em uma aplicação capaz de acompanhar a execução dos treinamentos e apresentar informações gerenciais sobre matrículas, conclusões e ausências.

**Branch:** `desenvolvimento-ac3`

---

## AC4 — Quarta Sprint: Relatórios e Histórico do Colaborador

### Objetivo

Desenvolver funcionalidades para consulta, análise e exportação de informações sobre treinamentos corporativos, permitindo o acompanhamento individual dos colaboradores e a extração de relatórios.

### 1. Relatórios de matrículas

Foi implementada uma interface para consultar os registros de matrículas e aplicar filtros sobre as informações armazenadas no banco de dados.

**Funcionalidades:**

- Consulta geral de matrículas.
- Filtro por treinamento.
- Filtro por turma.
- Filtro por status.
- Filtro por período de início das turmas.
- Combinação de filtros.
- Exibição dos resultados em tabela.
- Contagem de registros encontrados.
- Limpeza dos filtros.

Os filtros de treinamentos e turmas são carregados diretamente dos respectivos cadastros.

### 2. Exportação de relatórios CSV

Foi implementada a exportação dos resultados consultados para arquivos CSV.

**Características:**

- Exportação dos registros retornados pela consulta.
- Arquivo compatível com Microsoft Excel.
- Separação das colunas por ponto e vírgula.
- Codificação UTF-8 com BOM para preservar caracteres acentuados.
- Formatação das datas no padrão brasileiro.
- Identificação das colunas exportadas.
- Nome de arquivo com a data da exportação.
- Tratamento de valores para reduzir riscos de interpretação como fórmulas no Excel.

**Informações disponíveis na exportação:**

- Matrícula.
- Nome do colaborador.
- Cargo.
- Loja.
- Treinamento.
- Turma.
- Carga horária.
- Data de início.
- Data de término.
- Status da matrícula.
- Data de conclusão.

### 3. Histórico individual do colaborador

Foi desenvolvida uma funcionalidade para consultar o histórico de treinamentos de um colaborador utilizando sua matrícula.

**Funcionalidades:**

- Pesquisa por matrícula.
- Identificação do colaborador.
- Exibição do cargo e da loja.
- Consulta de todos os treinamentos vinculados ao colaborador.
- Visualização das turmas.
- Exibição da carga horária.
- Consulta das datas de início e término.
- Exibição do status de cada matrícula.
- Consulta da data de conclusão.

### 4. Indicadores individuais

A página de histórico apresenta cinco indicadores:

| Indicador | Descrição |
|---|---|
| Total de matrículas | Quantidade de matrículas do colaborador |
| Concluídos | Quantidade de matrículas concluídas |
| Ausentes | Quantidade de matrículas com status Ausente |
| Horas concluídas | Soma da carga horária dos treinamentos concluídos |
| Taxa de conclusão | Percentual de matrículas concluídas |

**Taxa de Conclusão Individual (%) = (Matrículas Concluídas / Total de Matrículas) × 100**

### 5. API REST da AC4

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/relatorios/matriculas` | Consulta matrículas com filtros opcionais |
| GET | `/historico/:matricula` | Retorna dados, indicadores e histórico do colaborador |

**Parâmetros disponíveis para relatórios:**

- `treinamento_id`
- `turma_id`
- `status`
- `data_inicio`
- `data_fim`

### 6. Arquivos implementados ou atualizados

| Arquivo | Finalidade |
|---|---|
| `backend/routes/relatorios.js` | API de consulta de relatórios |
| `backend/routes/historico.js` | API de histórico individual |
| `backend/server.js` | Registro das novas rotas |
| `frontend/relatorios.html` | Interface dos relatórios |
| `frontend/relatorios.js` | Filtros, consultas e exportação CSV |
| `frontend/historico.html` | Interface do histórico individual |
| `frontend/historico.js` | Pesquisa e exibição dos indicadores |
| Páginas de navegação | Inclusão dos acessos a Relatórios e Histórico |

### 7. Resultados alcançados

A AC4 ampliou as possibilidades de acompanhamento do Training Manager LMS, permitindo consultar dados consolidados e históricos individuais.

A exportação CSV facilita o uso das informações em ferramentas externas, enquanto o histórico individual oferece uma visão detalhada da participação de cada colaborador nos treinamentos corporativos.

**Branch:** `desenvolvimento-ac4`

---

## Modelagem e Diagramas UML

Para documentar a arquitetura e o comportamento do sistema, foram elaborados dois diagramas UML.

### Diagrama de Classes

Representa as principais entidades e seus relacionamentos:

- **Colaborador:** dados cadastrais e identificação.
- **Treinamento:** informações sobre os cursos e suas cargas horárias.
- **Turma:** realização de um treinamento em determinado período.
- **Matrícula:** associação entre colaboradores e turmas, com controle de status e conclusão.

**Relacionamentos principais:**

- Um treinamento pode possuir várias turmas.
- Uma turma pertence a um treinamento.
- Um colaborador pode possuir várias matrículas.
- Uma turma pode possuir várias matrículas.
- Cada matrícula vincula um colaborador a uma turma.

### Diagrama de Casos de Uso

Representa as funcionalidades disponibilizadas ao usuário do sistema:

- Gerenciar colaboradores.
- Gerenciar treinamentos.
- Gerenciar turmas.
- Matricular colaboradores.
- Importar dados por CSV.
- Atualizar status das matrículas.
- Consultar dashboard.
- Consultar relatórios.
- Exportar relatórios.
- Consultar histórico individual.

Os diagramas foram preparados como parte da documentação acadêmica do projeto.

---

## Estrutura do projeto

```text
training-manager/
│
├── backend/
│   ├── database/
│   │   └── connection.js
│   │
│   ├── routes/
│   │   ├── colaboradores.js
│   │   ├── treinamentos.js
│   │   ├── turmas.js
│   │   ├── matriculas.js
│   │   ├── dashboard.js
│   │   ├── relatorios.js
│   │   └── historico.js
│   │
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── treinamentos.html
│   ├── turmas.html
│   ├── dashboard.html
│   ├── relatorios.html
│   ├── historico.html
│   ├── colaboradores.js
│   ├── treinamentos.js
│   ├── turmas.js
│   ├── dashboard.js
│   ├── relatorios.js
│   ├── historico.js
│   └── style.css
│
├── uploads/
├── .env
├── .gitignore
├── package.json
└── README.md
```

*Estrutura resumida dos principais arquivos. O arquivo `.env` deve permanecer fora do versionamento.*

---

## Como executar o projeto

### Pré-requisitos

- Node.js instalado.
- MySQL instalado e configurado.
- Banco de dados `training_manager` criado.
- Dependências do projeto instaladas.

### 1. Clonar o repositório

```bash
git clone https://github.com/EduardoRuiz517/training-manager.git
cd training-manager
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar as variáveis de ambiente

Criar um arquivo `.env` na raiz do projeto:

```dotenv
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=SUA_SENHA
DB_NAME=training_manager
```

O banco e suas tabelas devem estar previamente configurados no MySQL.

**Não publicar o arquivo `.env` no GitHub.**

### 4. Iniciar o servidor

```bash
node backend/server.js
```

A API estará disponível em:

`http://localhost:3000`

### 5. Acessar o sistema

Abrir `frontend/index.html` no navegador, preferencialmente utilizando o Live Server do VS Code.

---

## Evolução do projeto

| Sprint | Entrega principal | Situação |
|---|---|---|
| AC1 | Cadastros de colaboradores e treinamentos | Concluída |
| AC2 | Turmas, matrículas e importação CSV | Concluída |
| AC3 | Controle de conclusão e dashboard | Concluída |
| AC4 | Relatórios, exportação CSV e histórico individual | Concluída |

---

## Possíveis melhorias futuras

- Autenticação de usuários e controle de permissões.
- Pesquisa de colaboradores por nome.
- Exportação de relatórios em Excel e PDF.
- Emissão de certificados.
- Trilhas de aprendizagem por cargo.
- Notificações sobre treinamentos.
- Indicadores avançados de desempenho.

---

## Integrantes

- Eduardo Ruiz

## Disciplina

**Software Product: Analysis, Specification, Project & Implementation**

**Turma:** 202602 — EAD — ADS 5A

## Repositório

[Training Manager — GitHub](https://github.com/EduardoRuiz517/training-manager)