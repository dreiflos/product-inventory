# Autoflex ERP — Controle de Estoque e Produção

Sistema desenvolvido como teste técnico. Controla produtos acabados, matérias-primas e composições, e sugere o que produzir com base no estoque disponível priorizando os produtos de maior valor.

---

## Stack

**Backend:** Java 17, Spring Boot 3.4, JPA/Hibernate, Oracle DB, Lombok, dotenv-java, SpringDoc (Swagger)

**Frontend:** React 19, Redux Toolkit, React Router, Axios, Tailwind CSS 4, Vite

**Testes:** JUnit 5 + Mockito (backend), Vitest + Testing Library (frontend), Cypress (integração)

---

## Banco de dados

Optei por Oracle, que é o banco recomendado. O projeto já inclui no `pom.xml` os drivers de Oracle, PostgreSQL e MySQL — para trocar basta alterar o `application.yaml` e o `.env`.

Para subir o Oracle localmente:

```bash
docker-compose up -d
```

Aguardar uns 2-3 minutos para o container inicializar. As credenciais estão no `.env`:

```env
DB_URL=oracle:thin:@localhost:1521/FREEPDB1
DB_USER=autoflex
DB_PASS=autoflex
```

Se preferir usar outro banco:

| Banco      | driver-class-name             | database-platform                         |
|------------|-------------------------------|-------------------------------------------|
| Oracle     | `oracle.jdbc.OracleDriver`    | `org.hibernate.dialect.OracleDialect`     |
| PostgreSQL | `org.postgresql.Driver`       | `org.hibernate.dialect.PostgreSQLDialect` |
| MySQL      | `com.mysql.cj.jdbc.Driver`    | `org.hibernate.dialect.MySQLDialect`      |

---

## Rodando o projeto

**Backend**
```bash
cd backend
./mvn spring-boot:run
```
API disponível em `http://localhost:8080`  
Swagger em `http://localhost:8080/swagger-ui.html`

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
Aplicação em `http://localhost:5173`

---

## Endpoints

### Produtos
```
GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}

POST   /api/products/{id}/compositions
DELETE /api/products/{id}/compositions/{compId}
```

### Matérias-primas
```
GET    /api/raw-materials
GET    /api/raw-materials/{id}
POST   /api/raw-materials
PUT    /api/raw-materials/{id}
DELETE /api/raw-materials/{id}
```

### Produção
```
GET    /api/production/suggested
```

---

## Como funciona a sugestão de produção

O endpoint `/api/production/suggested` busca todos os produtos ordenados por preço decrescente e simula a produção usando uma cópia temporária do estoque. Para cada produto calcula quantas unidades dá pra fabricar com base no insumo mais limitante, desconta o estoque consumido e passa pro próximo. Isso garante que os produtos mais caros consumam os insumos primeiro, maximizando a receita estimada.

---

## Páginas do frontend

**Dashboard (`/`)** — mostra as sugestões de produção geradas pelo backend com receita estimada, total de unidades e produto destaque.

**Produtos (`/products`)** — CRUD de produtos com modal de criar/editar/excluir e painel de composição expansível por produto para associar matérias-primas.

**Matérias-primas (`/materials`)** — CRUD de insumos com indicador de estoque baixo (≤ 10 unidades), barra de nível e KPIs de estoque.

---

## Testes

**Backend**
```bash
cd backend
./mvn test
```
Testa os três services com JUnit 5 e Mockito: `ProductService`, `RawMaterialService` e `ProductionService`.

**Frontend**
```bash
cd frontend
npm test
```
Testa o Redux slice e os três componentes de página com Vitest e Testing Library.

**Cypress**
```bash
# terminal 1
npm run dev

# terminal 2
npx cypress open
```
Todos os testes mocam a API com `cy.intercept`, então rodam sem o backend. Arquivos em `cypress/e2e/`: `products.cy.js`, `rawMaterials.cy.js`, `productionDashboard.cy.js` e `navigation.cy.js`.

---
## Arquitetura do sistema

O projeto foi estruturado seguindo o padrão de Arquitetura em Camadas, garantindo uma separação clara de responsabilidades, facilitando a manutenção do codigo e permitindo a implementação de novas funcionalidades de forma isolada, sem gerar efeitos colaterais devido a modularidade da arquitetura.


`Controller`: Porta de entrada da aplicação. Gerencia as requisições HTTP, valida os dados de entrada e direciona as chamadas para a camada de serviço.

`Service`: É onde reside toda a lógica, regras de validação de inventário e processos que não dependem de protocolos de rede ou DB.

`Domain`: Contém o núcleo da aplicação, sendo eles: /n
	`Model`: Representação das entidades de negócio. /n
	`Repository`: Interface de comunicação com o banco.
	
`DTO (Data Transfer Objects)`: Camada de transporte de dados. Utilizada para filtrar o que é enviado/recebido da API, protegendo as entidades do domain e evitando a exposição de dados.

`Config`: Centraliza as configurações do projeto.

---
## Estrutura

```
backend/src/main/java/com/example/project_inventory/
├── controller/
├── domain/
│   ├── model/
│   ├── repository/
│   └── service/
├── dto/
├── exception/
└── config/

frontend/src/
├── api/
├── pages/
├── store/
└── test/
cypress/
├── e2e/
├── fixtures/
└── support/
```
