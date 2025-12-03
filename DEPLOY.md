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

### Error 502: Bad Gateway

**Causa**: El contenedor no está escuchando en el puerto correcto o no está levantado.

**Solución**:
1. Verifica los logs: `Coolify → Application → Logs`
2. Busca errores en el build o al levantar nginx
3. Verifica que el Dockerfile esté en la raíz del repositorio
4. Asegúrate de que el puerto expuesto sea `80`

### Error 503: Service Unavailable

**Causa**: El servicio no pasó el health check o está reiniciándose constantemente.

**Solución**:
1. Verifica los logs del contenedor
2. Comprueba que `/health` endpoint funcione:
   ```bash
   # Dentro del contenedor (desde Coolify terminal)
   wget -O- http://localhost/health
   ```
3. Revisa que nginx esté corriendo dentro del contenedor

### Build Falla

**Causa**: Problemas con dependencias o configuración de pnpm.

**Solución**:
1. Verifica que `pnpm-lock.yaml` esté en el repositorio
2. Revisa los logs de build para errores específicos
3. Si falla en `pnpm install`, puede ser problema de red o dependencias

### No se Genera el Certificado SSL

**Causa**: DNS no apunta correctamente o puerto 80/443 bloqueado.

**Solución**:
1. Verifica DNS: `nslookup luna.axcsol.com`
2. Verifica que los puertos 80 y 443 estén abiertos en el firewall
3. En Coolify: **Domains → Regenerate Certificate**

### Contenedor se Reinicia Constantemente

**Causa**: La aplicación crashea al iniciar o nginx falla.

**Solución**:
1. Revisa logs: busca el error específico
2. Verifica que los archivos de build (dist/) se hayan generado correctamente
3. Prueba el Dockerfile localmente:
   ```bash
   docker build -t luna-test .
   docker run -p 8080:80 luna-test
   # Accede a http://localhost:8080
   ```

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
