// Script de migración para añadir posicionContador y configLogo a contadores existentes
// Ejecutar con: node migrar_contadores.js

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'backend', 'data.json');

console.log('🔧 Iniciando migración de contadores...\n');

// Leer data.json
if (!fs.existsSync(DATA_FILE)) {
  console.error('❌ Error: No se encontró data.json en backend/');
  console.log('   Ruta esperada:', DATA_FILE);
  process.exit(1);
}

let data;
try {
  data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log('✅ data.json leído correctamente');
} catch (e) {
  console.error('❌ Error leyendo data.json:', e.message);
  process.exit(1);
}

// Backup
const BACKUP_FILE = DATA_FILE + '.backup.' + Date.now();
fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2));
console.log('✅ Backup creado:', path.basename(BACKUP_FILE));
console.log('');

let contadoresActualizados = 0;

// Migrar cada contador
if (data.contadores) {
  Object.keys(data.contadores).forEach(id => {
    const contador = data.contadores[id];
    let cambios = [];
    
    // Añadir posicionContador si no existe
    if (!contador.posicionContador) {
      contador.posicionContador = {
        vertical: "center",
        horizontal: "center"
      };
      cambios.push('posicionContador');
    }
    
    // Añadir configLogo si no existe
    if (!contador.configLogo) {
      contador.configLogo = {
        posX: 10,
        posY: 10,
        tamano: 340
      };
      cambios.push('configLogo');
    }
    
    // Añadir configMesas si no existe o está incompleta
    if (!contador.configMesas) {
      contador.configMesas = {
        mostrar: true,
        colorFondo: "rgba(20, 20, 20, 0.9)",
        colorEncabezado: "#ff3b3b",
        colorTexto: "#ffffff",
        tamanoTexto: "2vh",
        transparenciaFilas: 0.9,
        nombreColumna1: "Mesa",
        nombreColumna2: "Emparejamiento",
        tipoColumnas: "auto",
        numeroFilas: 10,
        numeroColumnas: 2
      };
      cambios.push('configMesas');
    }
    
    if (cambios.length > 0) {
      console.log(`✅ Contador "${contador.nombre}" (${id}):`);
      console.log(`   Añadido: ${cambios.join(', ')}`);
      contadoresActualizados++;
    }
  });
}

if (contadoresActualizados === 0) {
  console.log('ℹ️  Todos los contadores ya estaban actualizados');
} else {
  console.log('');
  console.log(`✅ ${contadoresActualizados} contador(es) actualizado(s)`);
  
  // Guardar data.json actualizado
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    console.log('✅ data.json guardado correctamente');
  } catch (e) {
    console.error('❌ Error guardando data.json:', e.message);
    console.log('   Restaurando backup...');
    fs.copyFileSync(BACKUP_FILE, DATA_FILE);
    console.log('   Backup restaurado');
    process.exit(1);
  }
}

console.log('');
console.log('🎉 Migración completada con éxito!');
console.log('');
console.log('Siguiente paso:');
console.log('1. Reinicia el servidor: cd backend && npm start');
console.log('2. Recarga el navegador con Ctrl+Shift+R');
console.log('3. Prueba el posicionamiento y el logo');
