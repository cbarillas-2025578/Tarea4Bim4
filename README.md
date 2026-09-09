# Tarea4Bim4 - Control de Gastos e Ingresos

Aplicación full-stack para el control de finanzas personales con autenticación de usuarios, categorías, presupuesto y reportes.

## Características

- **Autenticación**: Registro, login, refresh de token automático y protección de rutas (JWT + Guards)
- **Dashboard**: Resumen de ingresos, gastos, balance, curvas de evolución mensual y presupuesto editable
- **Ingresos**: CRUD completo y filtros por mes y fuente
- **Gastos**: CRUD completo y filtros por mes y categoría
- **Categorías**: CRUD, búsqueda, filtro por tipo, orden, duplicar, pin de favoritas, conteo/total de usos y aviso antes de eliminar una categoría en uso
- **Reportes**: Resumen anual y mensual de ingresos vs gastos
- **Configuración**: Cambio de idioma (es/en) y tema claro/oscuro
- **UX**: Modales de confirmación para eliminar, toast de configuración y animaciones suaves
- **Persistencia**: PostgreSQL con `pg` (SQL directo)

## Estructura

```
Tarea2Bim4/
├── backend/                          # API Node.js + Express + TypeScript + PostgreSQL (pg)
│   └── src/
│       ├── modules/
│       │   ├── auth/                 # Autenticación (registro, login, refresh, JWT)
│       │   ├── database/             # Pool de conexión y creación de tablas (SQL)
│       │   ├── income/               # Módulo de ingresos
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   ├── models/
│       │   │   └── routes/
│       │   ├── expense/              # Módulo de gastos
│       │   ├── category/             # Módulo de categorías
│       │   └── report/               # Módulo de reportes
│       ├── App.ts                    # Configuración Express
│       └── server.ts                 # Punto de entrada
└── frontend/                         # Angular 18 (standalone components)
    └── src/app/
        ├── auth/                     # Login y registro
        ├── dashboard/                # Resumen con gráficas y presupuesto
        ├── expense/                  # Gastos (tabla, formulario, filtros)
        ├── income/                   # Ingresos (tabla, formulario, filtros)
        ├── category/                 # Categorías
        ├── report/                   # Reportes
        ├── config/                   # Configuración (idioma y tema)
        ├── guards/                   # AuthGuard para rutas protegidas
        ├── services/                 # auth, expense, dashboard, settings
        ├── app.routes.ts
        └── app.component.ts
```

## Backend

```bash
cd backend
npm install
cp .env.example .env   # Configura DB PostgreSQL y JWT_SECRET
npm run dev            # http://localhost:3000
```

### Endpoints (`/api`)

**Auth:**
- `POST /api/auth/login` — `{ email, password }` → retorna JWT
- `POST /api/auth/register` — `{ nombre, email, password }`
- `POST /api/auth/refresh` — renueva el token

**Gastos (requieren Bearer Token):**
- `GET /api/expenses?month=&year=&category=` — listar con filtros
- `GET /api/expenses/:id` — obtener uno
- `POST /api/expenses` — crear `{ amount, category, transactionDate }`
- `PUT /api/expenses/:id` — actualizar
- `DELETE /api/expenses/:id` — eliminar

**Ingresos (requieren Bearer Token):**
- `GET /api/incomes?month=&year=` — listar con filtros
- `GET /api/incomes/:id` — obtener uno
- `POST /api/incomes` — crear `{ amount, source, description, transactionDate }`
- `PUT /api/incomes/:id` — actualizar
- `DELETE /api/incomes/:id` — eliminar

**Categorías (requieren Bearer Token):**
- `GET /api/categories?type=expense|income` — listar
- `GET /api/categories/:id` — obtener una
- `POST /api/categories` — crear
- `PUT /api/categories/:id` — actualizar
- `DELETE /api/categories/:id` — eliminar

**Reportes (requieren Bearer Token):**
- `GET /api/reports/:year` — reporte anual
- `GET /api/reports/:year/:month` — reporte mensual

## Frontend

```bash
cd frontend
npm install
npm start   # http://localhost:4200
```

- Configura la API en `src/environments/environment.ts` (`http://localhost:3000/api` por defecto)
- Rutas protegidas con `AuthGuard`
- El token se adjunta automáticamente y se refresca antes de expirar

## Variables de Entorno (Backend)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=control_gastos
DB_USER=postgres
DB_PASSWORD=admin
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=24h
```

> El backend usa valores por defecto si falta alguna variable. `JWT_SECRET` y `JWT_EXPIRES_IN` solo se leen si están definidas.

## Base de Datos

Las tablas se crean automáticamente al iniciar el backend:
- `usuarios` — usuarios registrados (se crea por defecto `Benjamin@gmail.com` / `Benjamin34gt`)
- `ingresos` — transacciones de ingresos
- `expenses` — transacciones de gastos
- `categorias` — categorías de gastos e ingresos

## Notas

- Moneda: Quetzales (GTQ)
- Tipos de transacción: `income` | `expense`
- Categorías predefinidas: Salario, Freelance, Inversiones, Alimentación, Transporte, Entretenimiento, Servicios, Otros