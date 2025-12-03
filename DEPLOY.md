# Guía de Deploy en Coolify (VPS Hostinger)

Esta guía te llevará paso a paso para deployar la aplicación Luna en tu VPS con Coolify y configurar el dominio `luna.axcsol.com`.

## Pre-requisitos

- VPS con Coolify instalado
- Acceso al panel de Coolify
- Dominio `luna.axcsol.com` apuntando a la IP del VPS (registro A en DNS)
- Repositorio GitHub: https://github.com/xuli70/luna

## Paso 1: Verificar DNS

Antes de comenzar, verifica que tu dominio apunte correctamente al VPS:

```bash
# Desde tu terminal local
nslookup luna.axcsol.com
# Debe devolver la IP de tu VPS Hostinger
```

Si no apunta correctamente, configura en tu proveedor DNS:
```
Tipo: A
Nombre: luna.axcsol.com
Valor: [IP_DE_TU_VPS]
TTL: 3600
```

## Paso 2: Limpiar Configuración Anterior (si existe)

Si ya tienes una aplicación "luna" en Coolify que está dando errores:

1. Ve a Coolify Dashboard
2. Busca el proyecto/aplicación "luna"
3. Click en **Settings** → **Danger Zone**
4. Click en **Delete Resource**
5. Confirma la eliminación

## Paso 3: Crear Nueva Aplicación en Coolify

### 3.1. Crear Proyecto

1. En Coolify Dashboard, click en **+ New**
2. Selecciona **Project**
3. Nombre: `luna-project` (o el que prefieras)
4. Click en **Save**

### 3.2. Crear Entorno

1. Dentro del proyecto creado, click en **+ New Environment**
2. Nombre: `production`
3. Click en **Save**

### 3.3. Agregar Aplicación

1. Dentro del environment, click en **+ New Resource**
2. Selecciona **Public Repository**
3. Configura:
   - **Type**: Public Repository
   - **Repository URL**: `https://github.com/xuli70/luna`
   - **Branch**: `main`
   - Click en **Continue**

## Paso 4: Configurar la Aplicación

### 4.1. Configuración General

En la página de configuración de la aplicación:

1. **General Settings**:
   - **Name**: `luna-app`
   - **Server**: Selecciona tu servidor (usualmente `localhost`)
   - **Destination**: Docker Engine (default)

2. **Build Settings**:
   - **Build Pack**: Dockerfile
   - **Dockerfile Location**: `/Dockerfile` (debe detectarlo automáticamente)
   - **Docker Compose File**: (dejar vacío)
   - **Base Directory**: `/` (raíz del proyecto)
   - **Nota**: El Dockerfile usa **npm** (no pnpm) aprovechando el `package-lock.json` existente

3. **Port Settings**:
   - **Port Exposes**: `80` (el puerto que expone el contenedor)
   - **Port Mappings**: Coolify lo manejará automáticamente

### 4.2. Configurar Dominio

1. Ve a la sección **Domains**
2. Click en **+ Add Domain**
3. Ingresa: `luna.axcsol.com`
4. Click en **Save**
5. **Importante**: Activa **Generate SSL Certificate** (Let's Encrypt)
   - Coolify generará automáticamente el certificado SSL

### 4.3. Variables de Entorno (Opcional)

Si necesitas variables de entorno específicas:

1. Ve a la sección **Environment Variables**
2. Agrega las variables necesarias:
   ```
   NODE_ENV=production
   BUILD_MODE=prod
   ```
   (Nota: Estas ya están definidas en el Dockerfile, pero puedes sobrescribirlas aquí si es necesario)

### 4.4. Health Check

Coolify configurará automáticamente el health check, pero puedes verificar:

1. Ve a **Health Checks**
2. Configura:
   - **Enabled**: ✅ Activado
   - **Path**: `/health`
   - **Interval**: 30s
   - **Timeout**: 3s
   - **Retries**: 3

## Paso 5: Deploy Inicial

1. Click en el botón **Deploy** (arriba a la derecha)
2. Coolify comenzará a:
   - Clonar el repositorio
   - Construir la imagen Docker (multi-stage build)
   - Crear y levantar el contenedor
   - Configurar el proxy reverso
   - Generar certificado SSL

3. **Monitorea los logs** en tiempo real:
   - Ve a la sección **Deployments** o **Logs**
   - Deberías ver:
     ```
     ✓ Building image...
     ✓ Installing dependencies...
     ✓ Building application...
     ✓ Creating nginx container...
     ✓ Container started successfully
     ✓ Health check passed
     ```

## Paso 6: Verificar el Deploy

### 6.1. Verificar Estado del Contenedor

En Coolify:
1. Ve a la aplicación
2. Verifica que el estado sea **Running** (verde)
3. Si hay errores, revisa los logs

### 6.2. Verificar Acceso HTTP/HTTPS

Desde tu navegador:

```
http://luna.axcsol.com
https://luna.axcsol.com
```

Ambos deben funcionar (HTTP redirige a HTTPS automáticamente).

### 6.3. Verificar Health Check

```bash
# Desde terminal
curl http://luna.axcsol.com/health
# Debe devolver: "healthy"
```

## Solución de Problemas Comunes

### ⚠️ Error: ERR_PNPM_NO_LOCKFILE (RESUELTO)

**Error completo**:
```
ERR_PNPM_NO_LOCKFILE Cannot install with "frozen-lockfile" because pnpm-lock.yaml is absent
```

**Causa**: El Dockerfile intentaba usar pnpm pero el repositorio solo tiene `package-lock.json` (npm).

**Solución Implementada**:
- ✅ Cambiado Dockerfile para usar **npm** en lugar de pnpm
- ✅ Usa `npm ci` (instala desde package-lock.json exacto)
- ✅ Remueve referencias a pnpm-lock.yaml

**Archivos afectados**: `Dockerfile` líneas 8-11

---

### ⚠️ Error: sh: tsc: not found (RESUELTO)

**Error completo**:
```
sh: tsc: not found
The command '/bin/sh -c npm run build' returned a non-zero code: 127
```

**Causa**:
- TypeScript (`tsc`) y Vite están instalados en `node_modules/.bin/`
- El script `npm run build` ejecuta `tsc` directamente sin `npx`
- `tsc` no está en el PATH global del contenedor

**Solución Implementada**:
En el Dockerfile, reemplazar:
```dockerfile
RUN npm run build
```

Por:
```dockerfile
RUN rm -rf node_modules/.vite-temp && \
    npx tsc -b && \
    npx vite build
```

**Por qué funciona**: `npx` busca automáticamente binarios en `node_modules/.bin/` sin necesidad de modificar PATH.

**Archivos afectados**: `Dockerfile` líneas 19-22

---

### Error 502: Bad Gateway

**Causa**: El contenedor no está escuchando en el puerto correcto o no está levantado.

**Diagnóstico**:
1. Verifica los logs: `Coolify → Application → Logs`
2. Busca errores en el build (TypeScript, Vite, npm)
3. Verifica que el Dockerfile esté en la raíz del repositorio
4. Asegúrate de que el puerto expuesto sea `80` en el Dockerfile

**Solución**:
```bash
# Verifica que el contenedor esté corriendo
docker ps | grep luna

# Verifica logs del contenedor
docker logs [container_id]

# Verifica que nginx responda dentro del contenedor
docker exec [container_id] wget -O- http://localhost/
```

---

### Error 503: Service Unavailable

**Causa**: El servicio no pasó el health check o está reiniciándose constantemente.

**Diagnóstico**:
1. Ve a Coolify → Application → Logs
2. Busca: `Health check failed` o `Container restarting`
3. Verifica que el `/health` endpoint funcione

**Solución**:
```bash
# Dentro del contenedor (desde Coolify terminal)
wget -O- http://localhost/health
# Debe devolver: "healthy"

# Verifica que nginx esté corriendo
ps aux | grep nginx

# Verifica que los archivos estén en el lugar correcto
ls -la /usr/share/nginx/html/
```

---

### Build Falla por Dependencias

**Síntomas**:
- `npm ci` falla
- Errores de "Cannot find module"
- Versiones incompatibles

**Solución**:
1. Verifica que `package-lock.json` esté en el repositorio:
   ```bash
   git ls-files | grep package-lock.json
   ```

2. Si el lockfile está corrupto, regenera localmente:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   git add package-lock.json
   git commit -m "Regenerate package-lock.json"
   ```

3. Verifica que no haya conflictos de versiones en `package.json`

---

### No se Genera el Certificado SSL

**Causa**: DNS no apunta correctamente o puerto 80/443 bloqueado.

**Diagnóstico**:
```bash
# Verifica DNS
nslookup luna.axcsol.com
# Debe devolver la IP del VPS

# Verifica que el dominio sea accesible
curl -I http://luna.axcsol.com
```

**Solución**:
1. Verifica que el registro A del dominio apunte a la IP del VPS
2. Espera a que el DNS se propague (puede tardar hasta 24h, usualmente minutos)
3. Verifica que los puertos 80 y 443 estén abiertos en el firewall
4. En Coolify: **Domains → Regenerate Certificate**

---

### Contenedor se Reinicia Constantemente

**Causa**: La aplicación crashea al iniciar o nginx falla.

**Diagnóstico**:
```bash
# Ver logs en tiempo real
docker logs -f [container_id]

# Ver cuántas veces se ha reiniciado
docker ps -a | grep luna
```

**Solución**:
1. Revisa logs: busca el error específico (segmentation fault, permission denied, etc.)
2. Verifica que los archivos de build (`dist/`) se hayan generado correctamente
3. Prueba el Dockerfile localmente:
   ```bash
   docker build -t luna-test .
   docker run -p 8080:80 luna-test
   # Accede a http://localhost:8080
   ```

4. Verifica la configuración de nginx:
   ```bash
   docker exec [container_id] nginx -t
   ```

---

### Build Exitoso pero Página en Blanco

**Causa**: Archivos no se copiaron correctamente o ruta incorrecta.

**Diagnóstico**:
```bash
# Verifica que index.html exista
docker exec [container_id] ls -la /usr/share/nginx/html/

# Verifica contenido de index.html
docker exec [container_id] cat /usr/share/nginx/html/index.html
```

**Solución**:
1. Verifica que el `COPY --from=builder /app/dist` apunte al directorio correcto
2. Asegúrate de que Vite build genera archivos en `/app/dist`
3. Revisa la configuración de `vite.config.ts` (build.outDir)

## Paso 7: Configurar Auto-Deploy (Opcional)

Para que Coolify redeploy automáticamente cuando hagas push a GitHub:

1. Ve a **Source** en la configuración de la aplicación
2. Activa **Automatic Deployment**
3. Coolify creará un webhook en GitHub
4. Cada push a `main` disparará un nuevo deployment automáticamente

## Verificación Final

Lista de verificación:

- [ ] Aplicación accesible en https://luna.axcsol.com
- [ ] Certificado SSL válido (candado verde en navegador)
- [ ] Health check responde correctamente en /health
- [ ] No hay errores en los logs de Coolify
- [ ] Todas las funcionalidades de la app funcionan (mapa, cálculos, 3D)
- [ ] Responsive funciona en móvil

## Comandos Útiles

### Ver Logs en Tiempo Real
```bash
# Desde el panel de Coolify
Application → Logs → Enable "Follow logs"
```

### Rebuild y Redeploy
```bash
# Desde Coolify
Click en "Deploy" → Selecciona "Force Rebuild"
```

### Acceder al Contenedor
```bash
# Desde Coolify Terminal
docker exec -it [container_id] sh
# Verificar archivos:
ls -la /usr/share/nginx/html/
# Verificar nginx:
nginx -t
```

## Mantenimiento

### Actualizar la Aplicación

1. Haz push de cambios a GitHub
2. Si auto-deploy está activado, Coolify redeploy automáticamente
3. Si no: Ve a Coolify → Click en **Deploy**

### Revisar Métricas

Coolify proporciona:
- CPU usage
- Memory usage
- Network traffic
- Logs históricos

Accede desde: `Application → Metrics`

---

## ✅ Deployment Exitoso - Métricas Reales

### Resultado Final del Deployment

**Fecha**: 2025-Dec-03
**Commit**: `4e8b69a28ed485ef26694cf6b67911ee0ae392b0`
**Estado**: ✅ FINISHED - Deployment Completado
**URL**: https://luna.axcsol.com/

### Tiempos de Build

| Etapa | Tiempo | Estado |
|-------|--------|--------|
| Git clone | ~2s | ✅ |
| npm ci (438 paquetes) | 16.3s | ✅ |
| Copiar archivos | <1s | ✅ |
| TypeScript compile (npx tsc -b) | ~9s | ✅ |
| Vite build (1585 módulos) | 8.76s | ✅ |
| Exportar imagen Docker | <1s | ✅ |
| Contenedor iniciado | ~1s | ✅ |
| Health check | <6s | ✅ PASSING |
| Rolling update | <1s | ✅ |
| **TOTAL** | **~59s** | **✅** |

### Estadísticas del Build

**Archivos generados**:
- `index.html`: 1.09 kB
- CSS: 17.97 kB (gzipped: 4.26 kB)
- JavaScript: 3 chunks
  - Chunk 1: 153.66 kB
  - Chunk 2: 437.88 kB
  - Chunk 3: 529.50 kB

**Calidad**:
- ✅ 0 vulnerabilidades
- ✅ Health check passing
- ✅ SSL/HTTPS activo (Let's Encrypt)

### Iteraciones hasta Éxito

| Intento | Error | Solución | Commit |
|---------|-------|----------|--------|
| 1 | `ERR_PNPM_NO_LOCKFILE` | Cambiar a npm | `4aec4303` |
| 2 | `sh: tsc: not found` | Usar npx | `4e8b69a2` |
| 3 | ✅ **EXITOSO** | - | `4e8b69a2` |

**Tiempo total del proceso**: ~20 minutos (incluyendo debugging)

### Lecciones Aprendidas

1. **Package Manager Consistency**:
   - Usar el lockfile que ya existe en el repo
   - `npm ci` es más rápido y determinista que `npm install`

2. **Binarios en Docker**:
   - Usar `npx` para ejecutar binarios de node_modules
   - Evita problemas de PATH en contenedores

3. **Build Optimization**:
   - Evitar `npm install` redundantes en el build script
   - Ejecutar comandos de build manualmente en el Dockerfile

4. **Auto-Update UX** (Issue #4):
   - El auto-update cada 60s sobrescribia la hora configurada manualmente por el usuario
   - Solucion: Estado `isManualDatetime` que pausa auto-update cuando el usuario cambia la hora
   - Boton "Reanudar tiempo real" para volver al modo automatico

---

## Soporte

Si sigues teniendo problemas:

1. Revisa los logs completos del deployment
2. Verifica la configuración del servidor en Coolify
3. Comprueba que Docker Engine funciona correctamente en el VPS
4. Consulta la documentación oficial: https://coolify.io/docs

---

**Nota**: Esta configuración usa un Dockerfile multi-stage optimizado que:
- Construye la app con Node.js 22 usando **npm** (aprovecha `package-lock.json` existente)
- Usa `npm ci` para instalación rápida y determinista de dependencias
- Sirve los archivos estáticos con nginx
- Incluye health checks en `/health` endpoint
- Está optimizado para producción con cache y compresión gzip
