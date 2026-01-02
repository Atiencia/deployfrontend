# Solución para Limpieza Automática de Sesiones

## Problema Resuelto
Cuando un usuario tenía una sesión abierta con un token inválido o expirado, la aplicación mostraba errores pero no limpiaba automáticamente las cookies y tokens. El usuario debía limpiar manualmente el navegador.

## Solución Implementada

### 1. **authUtils.ts** - Utilidades Centralizadas
Ubicación: `FrontEnd/src/utils/authUtils.ts`

Funciones creadas:
- `clearAuthData()`: Limpia localStorage, sessionStorage y cookies del cliente
- `isAuthenticated()`: Verifica si hay una sesión válida
- `redirectToLogin()`: Limpia todo y redirige al login

### 2. **axiosConfig.ts** - Interceptores Globales
Ubicación: `FrontEnd/src/config/axiosConfig.ts`

Características:
- **Interceptor de Axios**: Detecta respuestas 401/403 y limpia la sesión automáticamente
- **Interceptor de Fetch**: Sobrescribe `window.fetch` para detectar tokens inválidos en todas las peticiones
- Redirección automática al login cuando se detecta un token inválido

### 3. **ProtectedRoute.tsx** - Verificación Mejorada
Cambios realizados:
- Verifica consistencia entre localStorage y Jotai al cargar
- Limpia automáticamente datos inconsistentes
- Redirige al login si faltan datos de sesión

### 4. **home.tsx** - Validación al Inicio
Cambios realizados:
- Verifica consistencia de datos al cargar la página home
- Sincroniza automáticamente entre localStorage y estado
- Limpia sesión si detecta inconsistencias

### 5. **login.tsx** - Limpieza al Entrar
Cambios realizados:
- Limpia automáticamente toda la sesión al cargar la página de login
- Asegura que el usuario siempre empiece con un estado limpio

### 6. **listaQueries.ts** - Logout Mejorado
Cambios realizados:
- Usa `clearAuthData()` centralizada
- Maneja errores sin bloquear la limpieza local
- Siempre limpia la sesión aunque falle el logout en servidor


La aplicación ahora verifica y limpia sesiones en:

1. ✅ **Al cargar App.tsx**: Se inicializa el interceptor global
2. ✅ **En cada petición HTTP**: Interceptores de axios y fetch
3. ✅ **En ProtectedRoute**: Verifica consistencia al proteger rutas
4. ✅ **En Home**: Sincroniza datos al cargar
5. ✅ **En Login**: Limpia sesión al entrar
6. ✅ **En Logout**: Limpia sesión al salir (incluso si hay error)

