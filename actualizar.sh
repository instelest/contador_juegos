#!/bin/bash
# Script de actualización para el servidor de contadores
# Uso: ./actualizar.sh

set -e

REPO_DIR="/home/instelestual/contador_juegos"
SERVICE_NAME="contador"

echo "=== Actualizando servidor de contadores ==="

# 1. Ir al directorio del repo
cd "$REPO_DIR"

# 2. Descargar cambios
echo ">> Descargando cambios de git..."
git pull

# 3. Instalar dependencias si cambiaron
echo ">> Verificando dependencias..."
cd backend
npm install --production

# 4. Reiniciar el servicio
echo ">> Reiniciando servicio..."
sudo systemctl restart "$SERVICE_NAME"

# 5. Esperar y verificar
sleep 2
if systemctl is-active --quiet "$SERVICE_NAME"; then
  echo "=== Servidor actualizado y corriendo ==="
else
  echo "=== ERROR: El servicio no arrancó ==="
  sudo journalctl -u "$SERVICE_NAME" -n 20 --no-pager
  exit 1
fi
