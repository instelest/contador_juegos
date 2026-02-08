#!/bin/bash
# Diagnóstico completo del sistema

echo "🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA"
echo "===================================="
echo ""

cd ~/contador-web || exit 1

echo "1️⃣ ESTADO DEL SERVIDOR"
echo "----------------------"
if sudo systemctl is-active --quiet contador; then
  echo "✅ Servidor: CORRIENDO"
  echo "   PID: $(sudo systemctl show -p MainPID --value contador)"
else
  echo "❌ Servidor: DETENIDO"
  echo ""
  echo "Últimos errores:"
  sudo journalctl -u contador -n 10 --no-pager
fi

echo ""
echo "2️⃣ BACKEND - Endpoint /api/posicion"
echo "------------------------------------"
echo "Línea 948 de server.js:"
sed -n '948p' backend/server.js
if grep -q "const { posicion } = req.body;" backend/server.js; then
  echo "✅ Correcto: Busca 'posicion' en req.body"
else
  echo "❌ Incorrecto: Busca 'vertical, horizontal' directamente"
fi

echo ""
echo "3️⃣ FRONTEND - index.html"
echo "-------------------------"
if grep -q '<div id="contadorContainer">' frontend/index.html; then
  echo "✅ Tiene contadorContainer"
else
  echo "❌ NO tiene contadorContainer"
fi

if grep -q 'function actualizarPosicion' frontend/index.html; then
  echo "✅ Tiene función actualizarPosicion"
else
  echo "❌ NO tiene función actualizarPosicion"
fi

if grep -q 'function determinarVista' frontend/index.html; then
  echo "✅ Tiene función determinarVista (vista automática)"
else
  echo "❌ NO tiene función determinarVista"
fi

echo ""
echo "4️⃣ DATA.JSON - Configuración guardada"
echo "--------------------------------------"
if [ -f "backend/data.json" ]; then
  echo "Contador actual:"
  jq -r '.contadorActual' backend/data.json 2>/dev/null || echo "Error leyendo data.json"
  
  echo ""
  echo "Posición guardada del contador default:"
  jq -r '.contadores.default.posicionContador' backend/data.json 2>/dev/null || echo "Error leyendo posición"
else
  echo "❌ data.json no existe"
fi

echo ""
echo "5️⃣ ARCHIVOS DE REPARACIÓN DISPONIBLES"
echo "---------------------------------------"
[ -f "index_COMPLETO_FINAL.html" ] && echo "✅ index_COMPLETO_FINAL.html" || echo "❌ index_COMPLETO_FINAL.html NO DISPONIBLE"
[ -f "ARREGLO_BACKEND.sh" ] && echo "✅ ARREGLO_BACKEND.sh" || echo "❌ ARREGLO_BACKEND.sh"
[ -f "REPARAR_TODO.sh" ] && echo "✅ REPARAR_TODO.sh" || echo "❌ REPARAR_TODO.sh"

echo ""
echo "6️⃣ PUERTOS EN USO"
echo "------------------"
if sudo netstat -tlnp 2>/dev/null | grep -q ":3000"; then
  echo "✅ Puerto 3000 en uso (servidor corriendo)"
  sudo netstat -tlnp 2>/dev/null | grep ":3000"
else
  echo "❌ Puerto 3000 NO en uso (servidor no responde)"
fi

echo ""
echo "===================================="
echo ""
echo "RESUMEN:"
echo "--------"

ISSUES=0

if ! sudo systemctl is-active --quiet contador; then
  echo "❌ Servidor detenido"
  ISSUES=$((ISSUES+1))
fi

if ! grep -q "const { posicion } = req.body;" backend/server.js; then
  echo "❌ Backend necesita corrección"
  ISSUES=$((ISSUES+1))
fi

if ! grep -q "contadorContainer" frontend/index.html; then
  echo "❌ Frontend necesita corrección"
  ISSUES=$((ISSUES+1))
fi

if [ $ISSUES -eq 0 ]; then
  echo "✅ Sistema en buen estado"
  echo ""
  echo "Si aún no funciona, el problema es CACHÉ del navegador:"
  echo "1. Cerrar navegador COMPLETAMENTE"
  echo "2. Abrir navegador nuevo"
  echo "3. F12 → Application → Storage → Clear site data"
  echo "4. Probar en modo incógnito"
else
  echo ""
  echo "⚠️  Se encontraron $ISSUES problema(s)"
  echo ""
  echo "SOLUCIÓN:"
  echo "bash REPARAR_TODO.sh"
fi

echo "===================================="
