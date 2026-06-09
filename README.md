# TheDevLab Restaurante 

Sistema web de gestión para restaurante desarrollado con Next.js, React, TailwindCSS y Supabase.

##  Descripción

Aplicación web fullstack que permite gestionar de forma integral las operaciones de un restaurante: inventario de ingredientes, pedidos, pagos y administración de usuarios con roles diferenciados.

##  Integrantes

- Mariana Carvajal Rueda
- Roller Andrés Hernandez López


##  Demo

https://thedevlab-restaurante.vercel.app/

##  Credenciales de prueba

| Rol | Correo | Contraseña |
|-----|--------|------------|
| Administrador | admin@restaurante.com | admin123 |
| Mesero | user@restaurante.com | user123 |

## Tecnologías

- **Frontend:** Next.js 16, React, TailwindCSS, shadcn/ui
- **Backend:** Next.js API Routes
- **Base de datos:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Autenticación:** NextAuth.js (JWT)
- **Gráficas:** Recharts

##  Instalación y ejecución local

### Prerrequisitos
- Node.js 18+
- Cuenta en Supabase

### Pasos

1. Clona el repositorio:
```bash
git clone https://github.com/202601-Ingenieria-Web/TheDevLab-Restaurante
cd TheDevLab-Restaurante
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea el archivo `.env` en la raíz:
```env
DATABASE_URL=postgresql://postgres.yulyktngpgjiisdltnik:Thelabrestaurante@aws-1-sa-east-1.pooler.supabase.com:5432/postgres
AUTH_SECRET=70c25f1482291bb021ae74f8f7046ee9bc6ba9301631903f3836c3102d54120d
```

4. Ejecuta las migraciones:
```bash
npx prisma migrate dev
npx prisma generate
```

5. Carga los datos iniciales:
```bash
npx tsx --env-file=.env scripts/seed.ts
```

6. Inicia el servidor:
```bash
npm run dev
```

7. Abre [http://localhost:3000](http://localhost:3000)

## Funcionalidades

### Inventario (Maestros)
- Gestión de ingredientes con unidades de medida
- Control de stock con alertas visuales
- Validación para evitar salidas mayores al stock disponible

### Transacciones
- Registro de entradas y salidas por ingrediente
- Gráfica de movimientos del mes
- Trazabilidad por usuario responsable

### Pedidos
- Creación de pedidos con múltiples productos
- Estados: Pendiente → En preparación → Listo → Entregado
- Tipos: En sitio / Para llevar
- Registro de pagos: Efectivo, Tarjeta, Transferencia

### Usuarios
- Roles diferenciados: ADMIN y Mesero (USER)
- Creación y edición de usuarios por el administrador
- Protección de rutas por rol
