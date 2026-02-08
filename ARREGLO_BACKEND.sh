#!/bin/bash
# Arreglar endpoint de posición en el backend

echo "🔧 ARREGLANDO BACKEND - Endpoint de Posición"
echo "============================================="
echo ""

cd ~/contador-web || exit 1

echo "⏸️  Deteniendo servidor..."
sudo systemctl stop contador
sleep 1

echo "💾 Creando backup..."
cp backend/server.js "backend/server.js.backup_$(date +%s)"
echo "✅ Backup creado"

echo "📋 Aplicando corrección..."

# Hacer el cambio con sed
sed -i 's/const { vertical, horizontal } = req\.body;/const { posicion } = req.body;/' backend/server.js
sed -i 's/if (vertical) contador\.posicionContador\.vertical = vertical;/if (posicion \&\& posicion.vertical) contador.posicionContador.vertical = posicion.vertical;/' backend/server.js
sed -i 's/if (horizontal) contador\.posicionContador\.horizontal = horizontal;/if (posicion \&\& posicion.horizontal) contador.posicionContador.horizontal = posicion.horizontal;/' backend/server.js

echo "✅ Corrección aplicada"

echo "🔄 Reiniciando servidor..."
sudo systemctl start contador
sleep 2

if sudo systemctl is-active --quiet contador; then
  echo "✅ Servidor reiniciado correctamente"
else
  echo "❌ Error al reiniciar - Restaurando backup..."
  cp backend/server.js.backup_* backend/server.js
  sudo systemctl start contador
  exit 1
fi

echo ""
echo "============================================="
echo "✅ BACKEND CORREGIDO"
echo ""
echo "AHORA PRUEBA:"
echo "1. http://192.168.50.100:3000/admin"
echo "2. Click en CUALQUIER posición"
echo "3. http://192.168.50.100:3000"
echo "4. Ctrl + Shift + R"
echo "5. ¿Contador se mueve? → ✅ ARREGLADO"
echo ""
echo "En console verás:"
echo "Posición recibida: {vertical: 'bottom', horizontal: 'left'}"
echo "(Cambiará según el botón que pulses)"
echo "============================================="
