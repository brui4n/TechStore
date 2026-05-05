# TechStore - Sistema de Gestión con Seguridad Avanzada

Este proyecto es una plataforma de gestión de inventario y usuarios diseñada bajo una arquitectura de microservicios contenerizada con **Docker**. Implementa niveles avanzados de seguridad, incluyendo Autenticación de Doble Factor (MFA), Control de Acceso basado en Roles (RBAC) y Atributos (ABAC), y un módulo completo de Auditoría.

## 🚀 Requisitos Previos

Asegúrese de tener instalados los siguientes componentes:
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## 🛠️ Instrucciones de Despliegue

Siga estos pasos para levantar el entorno completo (Base de Datos, Redis, Backend y Frontend):

1. **Clonar el repositorio** (si aún no lo ha hecho).
2. **Levantar los contenedores**:
   Ejecute el siguiente comando en la raíz del proyecto:
   ```bash
   docker-compose up --build
   ```
   *Este comando construirá las imágenes, inicializará la base de datos MySQL, el servidor de caché Redis y expondrá los puertos necesarios.*

3. **Acceder a la aplicación**:
   - **Frontend**: [http://localhost:5173](http://localhost:5173)
   - **API Backend**: [http://localhost:3000](http://localhost:3000)

## 🔑 Credenciales de Prueba (Seeding)

El sistema se inicializa automáticamente con los siguientes datos para facilitar la revisión:

| Usuario | Email | Contraseña | Rol |
| :--- | :--- | :--- | :--- |
| **Super Administrador** | `superadmin@techstore.com` | `Admin@1234` | Admin |

> **Nota sobre MFA**: Al iniciar sesión por primera vez con cualquier usuario, el sistema solicitará la configuración de MFA mediante un código QR. Utilice aplicaciones como **Google Authenticator** o **Authy**.

## 🛡️ Características Principales

- **Seguridad Dinámica**: Implementación de permisos granulares. Los administradores pueden crear roles y asignarles permisos específicos (ej. `manage_tiendas`, `view_audit_logs`) desde la interfaz.
- **Motor ABAC**: Control de acceso basado en atributos (tienda asignada, tipo de producto) para restringir acciones de Gerentes y Empleados a sus propias sucursales.
- **Auditoría**: Registro en tiempo real de todas las acciones críticas (Creación, Edición, Eliminación) con detalles del autor y fecha.
- **MFA (2FA)**: Protección de cuentas mediante algoritmos TOTP.
- **Gestión Multi-Tienda**: Capacidad de administrar múltiples sucursales y asignar inventario de forma independiente.

## 🧪 Comandos Útiles

- **Detener el sistema**: `docker-compose down`
- **Ver logs en tiempo real**: `docker-compose logs -f`
- **Limpiar base de datos y reiniciar**: `docker-compose down -v && docker-compose up --build`
