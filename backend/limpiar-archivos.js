k// Script para limpiar iconos y logos inexistentes del data.json
// Ejecutar con: node limpiar-archivos.js

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data.json');
const ICONOS_DIR = path.join(__dirname, 'iconos');
const LOGOS_DIR = path.join(__dirname, 'logos');

console.log('🧹 Iniciando limpieza de archivos inexistentes...\n');

// Leer data.json
let estado;
try {
  estado = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  console.log('✅ data.json leído correctamente');
} catch (error) {
  console.error('❌ Error leyendo data.json:', error.message);
  process.exit(1);
}

let cambios = 0;

// Función para verificar si un archivo existe
function archivoExiste(dir, archivo) {
  if (!archivo) return false;
  const filepath = path.join(dir, archivo);
  return fs.existsSync(filepath);
}

// Limpiar iconos en cada contador
Object.keys(estado.contadores || {}).forEach(contadorId => {
  const contador = estado.contadores[contadorId];
  
  if (contador.iconos && Array.isArray(contador.iconos)) {
    const iconosOriginales = contador.iconos.length;
    contador.iconos = contador.iconos.filter(icono => {
      const existe = archivoExiste(ICONOS_DIR, icono.archivo);
      if (!existe) {
        console.log(`🗑️  Eliminando icono inexistente: ${icono.archivo} (${contador.nombre})`);
        cambios++;
      }
      return existe;
    });
    
    if (iconosOriginales !== contador.iconos.length) {
      console.log(`   Contador "${contador.nombre}": ${iconosOriginales} → ${contador.iconos.length} iconos`);
    }
  }
  
  // Limpiar logos
  if (contador.logo && contador.logo.archivo) {
    const logoExiste = archivoExiste(LOGOS_DIR, contador.logo.archivo);
    if (!logoExiste) {
      console.log(`🗑️  Eliminando logo inexistente: ${contador.logo.archivo} (${contador.nombre})`);
      contador.logo = { archivo: null };
      cambios++;
    }
  }
});

// Guardar cambios si hubo modificaciones
if (cambios > 0) {
  try {
    // Hacer backup
    const backupFile = DATA_FILE + '.backup_' + Date.now();
    fs.copyFileSync(DATA_FILE, backupFile);
    console.log(`\n📦 Backup creado: ${path.basename(backupFile)}`);
    
    // Guardar data.json limpio
    fs.writeFileSync(DATA_FILE, JSON.stringify(estado, null, 2));
    console.log(`✅ data.json actualizado con ${cambios} cambio(s)\n`);
    
    console.log('🎉 Limpieza completada exitosamente!');
    console.log('   Reinicia el servidor para aplicar los cambios.');
  } catch (error) {
    console.error('❌ Error guardando data.json:', error.message);
    process.exit(1);
  }
} else {
  console.log('\n✨ No se encontraron archivos inexistentes. Todo está limpio!');
}
