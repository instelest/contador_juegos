#!/bin/bash
# Script verificador - Revisa que todos los archivos estén correctos

echo "🔍 VERIFICADOR DE ARCHIVOS - Contador de Torneos"
echo "=================================================="
echo ""

ERRORES=0

# Verificar estructura de directorios
echo "📁 Verificando estructura de directorios..."
if [ ! -d "backend" ]; then
  echo "❌ ERROR: No existe carpeta 'backend'"
  ERRORES=$((ERRORES + 1))
else
  echo "✅ Carpeta 'backend' existe"
fi

if [ ! -d "frontend" ]; then
  echo "❌ ERROR: No existe carpeta 'frontend'"
  ERRORES=$((ERRORES + 1))
else
  echo "✅ Carpeta 'frontend' existe"
fi

echo ""

# Verificar archivos críticos
echo "📄 Verificando archivos críticos..."

# Backend
if [ ! -f "backend/server.js" ]; then
  echo "❌ ERROR: No existe backend/server.js"
  ERRORES=$((ERRORES + 1))
else
  echo "✅ backend/server.js existe"
  
  # Verificar endpoints de logo
  if grep -q "api/logo/config" backend/server.js; then
    echo "   ✅ Endpoints de logo presentes"
  else
    echo "   ❌ Faltan endpoints de logo"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar endpoint de posición
  if grep -q "api/posicion" backend/server.js; then
    echo "   ✅ Endpoint de posición presente"
  else
    echo "   ❌ Falta endpoint de posición"
    ERRORES=$((ERRORES + 1))
  fi
fi

if [ ! -f "backend/data.json" ]; then
  echo "❌ ERROR: No existe backend/data.json"
  ERRORES=$((ERRORES + 1))
else
  echo "✅ backend/data.json existe"
  
  # Verificar que los contadores tienen posicionContador
  if grep -q "posicionContador" backend/data.json; then
    echo "   ✅ Contadores tienen posicionContador"
  else
    echo "   ❌ Contadores NO tienen posicionContador"
    echo "   ⚠️  EJECUTAR: node migrar_contadores.js"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar que los contadores tienen configLogo
  if grep -q "configLogo" backend/data.json; then
    echo "   ✅ Contadores tienen configLogo"
  else
    echo "   ❌ Contadores NO tienen configLogo"
    echo "   ⚠️  EJECUTAR: node migrar_contadores.js"
    ERRORES=$((ERRORES + 1))
  fi
fi

# Frontend
if [ ! -f "frontend/index.html" ]; then
  echo "❌ ERROR: No existe frontend/index.html"
  ERRORES=$((ERRORES + 1))
else
  echo "✅ frontend/index.html existe"
  
  # Verificar que tiene el div contadorContainer
  if grep -q "id=\"contadorContainer\"" frontend/index.html; then
    echo "   ✅ Tiene div contadorContainer"
  else
    echo "   ❌ Falta div contadorContainer"
    echo "   ⚠️  COPIAR: index_corregido.html → frontend/index.html"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar que tiene las clases de posicionamiento
  if grep -q "pos-center:not" frontend/index.html; then
    echo "   ✅ Tiene CSS de posicionamiento corregido"
  else
    echo "   ❌ Falta CSS de posicionamiento"
    echo "   ⚠️  COPIAR: index_corregido.html → frontend/index.html"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar que tiene vistaIndividual y vistaMultiple
  if grep -q "vistaIndividual" frontend/index.html; then
    echo "   ✅ Tiene vista individual/múltiple"
  else
    echo "   ❌ Falta sistema de vistas"
    echo "   ⚠️  COPIAR: index_corregido.html → frontend/index.html"
    ERRORES=$((ERRORES + 1))
  fi
fi

if [ ! -f "frontend/script.js" ]; then
  echo "❌ ERROR: No existe frontend/script.js"
  ERRORES=$((ERRORES + 1))
else
  echo "✅ frontend/script.js existe"
  
  # Verificar función actualizarPosicion
  if grep -q "function actualizarPosicion" frontend/script.js; then
    echo "   ✅ Tiene función actualizarPosicion"
  else
    echo "   ❌ Falta función actualizarPosicion"
    echo "   ⚠️  COPIAR: script_contador_con_logo.js → frontend/script.js"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar función actualizarLogo
  if grep -q "function actualizarLogo" frontend/script.js; then
    echo "   ✅ Tiene función actualizarLogo"
  else
    echo "   ❌ Falta función actualizarLogo"
    echo "   ⚠️  COPIAR: script_contador_con_logo.js → frontend/script.js"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar que llama a actualizarPosicion
  if grep -q "actualizarPosicion(data.posicionContador)" frontend/script.js; then
    echo "   ✅ Llama a actualizarPosicion"
  else
    echo "   ❌ NO llama a actualizarPosicion"
    echo "   ⚠️  COPIAR: script_contador_con_logo.js → frontend/script.js"
    ERRORES=$((ERRORES + 1))
  fi
fi

# Admin
if [ ! -f "backend/public-admin/index.html" ]; then
  echo "❌ ERROR: No existe backend/public-admin/index.html"
  ERRORES=$((ERRORES + 1))
else
  echo "✅ backend/public-admin/index.html existe"
  
  # Verificar que tiene tab de posición
  if grep -q "data-tab=\"posicion\"" backend/public-admin/index.html; then
    echo "   ✅ Tiene tab de posición"
  else
    echo "   ❌ Falta tab de posición"
    echo "   ⚠️  COPIAR: admin_index_COMPLETO_DEFINITIVO.html"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar que tiene tab de logo
  if grep -q "data-tab=\"logo\"" backend/public-admin/index.html; then
    echo "   ✅ Tiene tab de logo"
  else
    echo "   ❌ Falta tab de logo"
    echo "   ⚠️  COPIAR: admin_index_COMPLETO_DEFINITIVO.html"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar que tiene tab de config mesas
  if grep -q "data-tab=\"configmesas\"" backend/public-admin/index.html; then
    echo "   ✅ Tiene tab de config mesas"
  else
    echo "   ❌ Falta tab de config mesas"
    echo "   ⚠️  COPIAR: admin_index_COMPLETO_DEFINITIVO.html"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar que tiene botón guardarLogoBtn
  if grep -q "id=\"guardarLogoBtn\"" backend/public-admin/index.html; then
    echo "   ✅ Tiene botón guardarLogoBtn"
  else
    echo "   ❌ Falta botón guardarLogoBtn"
    echo "   ⚠️  COPIAR: admin_index_COMPLETO_DEFINITIVO.html"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar que tiene botón guardarConfigMesas
  if grep -q "id=\"guardarConfigMesas\"" backend/public-admin/index.html; then
    echo "   ✅ Tiene botón guardarConfigMesas"
  else
    echo "   ❌ Falta botón guardarConfigMesas (ERROR LÍNEA 1097)"
    echo "   ⚠️  COPIAR: admin_index_COMPLETO_DEFINITIVO.html"
    ERRORES=$((ERRORES + 1))
  fi
fi

if [ ! -f "backend/public-admin/script.js" ]; then
  echo "❌ ERROR: No existe backend/public-admin/script.js"
  ERRORES=$((ERRORES + 1))
else
  echo "✅ backend/public-admin/script.js existe"
  
  # Verificar función cargarPosicion
  if grep -q "function cargarPosicion" backend/public-admin/script.js; then
    echo "   ✅ Tiene función cargarPosicion"
  else
    echo "   ❌ Falta función cargarPosicion"
    ERRORES=$((ERRORES + 1))
  fi
  
  # Verificar función cargarConfigLogo
  if grep -q "function cargarConfigLogo" backend/public-admin/script.js; then
    echo "   ✅ Tiene función cargarConfigLogo"
  else
    echo "   ❌ Falta función cargarConfigLogo"
    ERRORES=$((ERRORES + 1))
  fi
fi

echo ""
echo "=================================================="
if [ $ERRORES -eq 0 ]; then
  echo "✅ TODO CORRECTO - No se encontraron errores"
  echo ""
  echo "Si el posicionamiento no funciona:"
  echo "1. Limpiar caché: Ctrl+Shift+R"
  echo "2. Ver consola: F12"
  echo "3. Verificar que contador tiene posicionContador en data.json"
else
  echo "❌ SE ENCONTRARON $ERRORES ERROR(ES)"
  echo ""
  echo "ACCIONES NECESARIAS:"
  echo "1. Revisar los ⚠️  arriba"
  echo "2. Copiar los archivos indicados"
  echo "3. Reiniciar servidor"
  echo "4. Limpiar caché navegador"
fi
echo "=================================================="
