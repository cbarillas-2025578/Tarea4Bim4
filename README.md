# Tarea4Bim4 - Control de Ingresos y Gastos

Aplicación full-stack para control de finanzas personales con autenticación de usuarios.

## Características

- **Autenticación**: Registro, login y protección de rutas (JWT + Guards)
- **Dashboard**: Resumen de ingresos, gastos y balance
- **Ingresos**: CRUD completo (crear, leer, actualizar, eliminar)
- **Filtros**: Por mes, año y categoría
- **Persistencia**: PostgreSQL con TypeORM

## Estructura

```
Tarea2Bim4/
├── backend/                    # API Node.js + Express + TypeScript + TypeORM + PostgreSQL
│   └── src/
│       ├── modules/
│       │   ├── auth/           # Autenticación (registro, login, JWT)
│       │   ├── database/       # Configuración TypeORM
│       │   └── income/         # Módulo de ingresos
│       │       ├── controllers/
│       │       ├── services/
│       │       ├── models/
│       │       └── routes/
│       ├── App.ts              # Configuración Express
│       └── server.ts           # Punto de entrada
└── frontend/                   # Angular 17+ (standalone components)
    └── src/app/
        ├── auth/
        │   └── login/          # Componente de login
        ├── dashboard/          # Vista principal con resumen
        ├── income/
        │   ├── components/
        │   │   └── income-form/    # Formulario ingresos/gastos
        │   ├── income.component.ts
        │   └── income.component.html
        ├── guards/             # AuthGuard para rutas protegidas
        ├── services/
        │   ├── auth.service.ts
        │   └── income.service.ts
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
- `POST /api/auth/register` — `{ email, password, name }`
- `POST /api/auth/login` — `{ email, password }` → retorna JWT

**Ingresos (requieren Bearer Token):**
- `GET /api/income?month=&year=&category=` — listar con filtros
- `GET /api/income/:id` — obtener uno
- `POST /api/income` — crear `{ amount, category, description, date, type }`
- `PUT /api/income/:id` — actualizar
- `DELETE /api/income/:id` — eliminar

## Frontend

```bash
cd frontend
npm install
npm start   # http://localhost:4200
```

- Configura la API en `src/environments/environment.ts` (`http://localhost:3000/api` por defecto)
- Rutas protegidas con `AuthGuard`
- Interceptor HTTP adjunta JWT automáticamente

## Variables de Entorno (Backend)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_NAME=finanzas_db
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRES_IN=24h
PORT=3000
```

## Base de Datos

Tablas creadas automáticamente al iniciar (`synchronize: true` en desarrollo):
- `users` — usuarios registrados
- `income` — transacciones (income/expense)

## Notas

- Moneda: Quetzales (GTQ)
- Tipos de transacción: `income` | `expense`
- Categorías predefinidas: Salario, Freelance, Inversiones, Alimentación, Transporte, Entretenimiento, Servicios, Otros

