// backend/server.js
const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { getAudioDurationInSeconds } = require('get-audio-duration');

const app = express();

// Leer puerto desde config.json
let configPuerto = 3000;
try {
  const configFile = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));
  configPuerto = configFile.puerto || 3000;
} catch(e) {
  console.log('No se pudo leer config.json, usando puerto por defecto 3000');
}
const PORT = configPuerto;

// Configurar multer para subir audio
const audioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'audio');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'audio_' + Date.now() + path.extname(file.originalname));
  }
});

// Configurar multer para subir iconos
const iconStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'iconos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `icono_${timestamp}${path.extname(file.originalname)}`);
  }
});

const uploadAudio = multer({ storage: audioStorage });
const uploadIcon = multer({ storage: iconStorage });

// Configurar multer para subir logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'logos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `logo_${timestamp}${path.extname(file.originalname)}`);
  }
});

const uploadLogo = multer({ storage: logoStorage });

app.use(express.json({ charset: 'utf-8' }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/admin', express.static(path.join(__dirname, 'public-admin')));
app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/iconos', express.static(path.join(__dirname, 'iconos')));
app.use('/logos', express.static(path.join(__dirname, 'logos')));

const DATA_FILE = path.join(__dirname, 'data.json');
const CONFIGS_DIR = path.join(__dirname, 'configuraciones');

// Crear directorios necesarios si no existen
if (!fs.existsSync(CONFIGS_DIR)) {
  fs.mkdirSync(CONFIGS_DIR);
}
if (!fs.existsSync(path.join(__dirname, 'audio'))) {
  fs.mkdirSync(path.join(__dirname, 'audio'));
}
if (!fs.existsSync(path.join(__dirname, 'iconos'))) {
  fs.mkdirSync(path.join(__dirname, 'iconos'));
}
if (!fs.existsSync(path.join(__dirname, 'logos'))) {
  fs.mkdirSync(path.join(__dirname, 'logos'));
}

let estado = {};

// Leer estado inicial desde disco si existe
try {
  if (fs.existsSync(DATA_FILE)) {
    estado = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } else {
    const primerContadorId = `contador_${Date.now()}`;
    estado = {
      contadorActual: primerContadorId,
      contadoresVisibles: [primerContadorId],
      orientacionVista: 'horizontal',
      contadores: {
        [primerContadorId]: crearContadorVacio(primerContadorId, 'Contador Principal')
      }
    };
  }
} catch(e) {
  console.error("Error leyendo data.json:", e);
  estado = {};
}

// Asegurar estructura correcta
if (!estado.contadores) estado.contadores = {};
if (!estado.orientacionVista) estado.orientacionVista = 'horizontal';

// Si no hay contadores, crear uno inicial
if (Object.keys(estado.contadores).length === 0) {
  const inicialId = `contador_${Date.now()}`;
  estado.contadores[inicialId] = crearContadorVacio(inicialId, 'Contador Principal');
}

// Asegurar que contadorActual y contadoresVisibles apunten a contadores existentes
const idsExistentes = Object.keys(estado.contadores);
if (!estado.contadorActual || !estado.contadores[estado.contadorActual]) {
  estado.contadorActual = idsExistentes[0];
}
if (!estado.contadoresVisibles || estado.contadoresVisibles.length === 0) {
  estado.contadoresVisibles = [idsExistentes[0]];
} else {
  // Filtrar IDs que ya no existen
  estado.contadoresVisibles = estado.contadoresVisibles.filter(id => estado.contadores[id]);
  if (estado.contadoresVisibles.length === 0) {
    estado.contadoresVisibles = [idsExistentes[0]];
  }
}

// Migrar contadores existentes para agregar nuevas propiedades
let necesitaGuardar = false;
Object.keys(estado.contadores).forEach(id => {
  if (migrarContador(estado.contadores[id])) {
    console.log(`✅ Contador ${id} migrado con nuevas propiedades`);
    necesitaGuardar = true;
  }
});

// Guardar si hubo cambios
if (necesitaGuardar) {
  console.log('💾 Guardando estado con contadores migrados...');
  fs.writeFileSync(DATA_FILE, JSON.stringify(estado, null, 2));
  console.log('✅ Estado migrado guardado correctamente');
}

function crearContadorVacio(id, nombre) {
  return {
    id,
    nombre,
    contadorActivo: false,
    tiempoRestante: 0,
    tiempoInicial: 0,
    texto: "Preparado para iniciar",
    colorContador: "#ff3b3b",
    tamanoContador: "40vh",
    colorTexto: "#ffffff",
    tamanoTexto: "10vh",
    colorFondo: "#000000",
    tiempoFinalizacion: null,
    audio: { 
      archivo: null, 
      duracion: 0, 
      modo: 'final',  // 'final' o 'antes_final'
      segundosAntes: 30,  // cuántos segundos antes del final reproducir
      reproduciendo: false,
      timestampReproduccion: null  // evita reproducciones múltiples
    },
    logo: { 
      archivo: null,
      nombre: 'Logo',
      tamano: 340,  // en px
      posX: 10,     // porcentaje
      posY: 10      // porcentaje
    },
    mesas: [],
    iconos: [],
    posicionContador: {
      top: 50,  // porcentaje
      left: 50  // porcentaje
    },
    configLogo: {
      archivo: null,
      nombre: 'Logo',
      tamano: 15,  // porcentaje del ancho
      posX: 10,
      posY: 10,
      visible: true
    },
    configMesas: {
      columnas: 2,
      altura: 30,
      colorCabecera: '#ff3b3b',
      colorFondo: '#141414',
      colorNumero: '#ff8800',
      colorVS: '#ff3b3b',
      tamCabecera: 2.5,
      tamFilas: 2.2,
      tamNumero: 2.5,
      posicion: 'bottom-center',
      margen: 20,
      ancho: 90,
      tiempoVisible: null,  // null = indefinido, número = segundos
      tituloMesa: 'Mesa',   // Título personalizable columna 1
      tituloEmparejamiento: 'Emparejamiento',  // Título personalizable columna 2
      timestampContadorInicio: null  // Timestamp de cuándo INICIÓ el contador
    }
  };
}

// Función de migración para contadores antiguos sin nuevas propiedades
function migrarContador(contador) {
  let actualizado = false;
  
  // Agregar logo si no existe
  if (!contador.logo) {
    contador.logo = { 
      archivo: null,
      nombre: 'Logo',
      tamano: 340,
      posX: 10,
      posY: 10
    };
    actualizado = true;
  }
  
  // Agregar configLogo si no existe
  if (!contador.configLogo) {
    contador.configLogo = {
      archivo: null,
      nombre: 'Logo',
      tamano: 15,
      posX: 10,
      posY: 10,
      visible: true
    };
    actualizado = true;
  }
  
  // Agregar configMesas si no existe
  if (!contador.configMesas) {
    contador.configMesas = {
      columnas: 2,
      altura: 30,
      colorCabecera: '#ff3b3b',
      colorFondo: '#141414',
      colorNumero: '#ff8800',
      colorVS: '#ff3b3b',
      tamCabecera: 2.5,
      tamFilas: 2.2,
      tamNumero: 2.5,
      posicion: 'bottom-center',
      margen: 20,
      ancho: 90,
      tiempoVisible: 600  // 10 minutos por defecto
    };
    actualizado = true;
  } else {
    // Si existe pero tiempoVisible es null, poner 600
    if (contador.configMesas.tiempoVisible === null || contador.configMesas.tiempoVisible === undefined) {
      contador.configMesas.tiempoVisible = 600;
      actualizado = true;
    }
  }
  
  // Agregar posicionContador si no existe
  if (!contador.posicionContador) {
    contador.posicionContador = {
      top: 50,
      left: 50
    };
    actualizado = true;
  }
  
  // Agregar iconos array si no existe
  if (!contador.iconos) {
    contador.iconos = [];
    actualizado = true;
  }
  
  // Agregar mesas array si no existe
  if (!contador.mesas) {
    contador.mesas = [];
    actualizado = true;
  }
  
  return actualizado;
}

// FunciÃ³n para obtener el contador actual
function getContador() {
  return estado.contadores[estado.contadorActual] || Object.values(estado.contadores)[0];
}

// Guardado controlado en disco
let guardando = false;
let timeoutGuardar = null;
function guardarEstado() {
  if (guardando) return;
  guardando = true;
  fs.writeFile(DATA_FILE, JSON.stringify(estado, null, 2), (err) => {
    if(err) console.error('Error guardando estado:', err);
    guardando = false;
  });
}
function marcarCambio() {
  clearTimeout(timeoutGuardar);
  timeoutGuardar = setTimeout(guardarEstado, 5000);
}
setInterval(() => { guardarEstado(); }, 60000);

// ------------------------------------------------------
// Rutas API - GestiÃ³n de contadores
// ------------------------------------------------------

// Listar todos los contadores
app.get('/api/contadores', (req, res) => {
  const lista = Object.values(estado.contadores).map(c => ({
    id: c.id,
    nombre: c.nombre,
    activo: c.id === estado.contadorActual,
    visible: estado.contadoresVisibles.includes(c.id)
  }));
  res.json({ 
    contadores: lista, 
    actual: estado.contadorActual,
    visibles: estado.contadoresVisibles
  });
});

// Crear nuevo contador
app.post('/api/contadores', (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido' });
  
  const id = `contador_${Date.now()}`;
  estado.contadores[id] = crearContadorVacio(id, nombre);
  
  marcarCambio();
  res.json({ success: true, id, nombre });
});

// Cambiar contador activo (para ediciÃ³n en admin)
app.post('/api/contadores/cambiar', (req, res) => {
  const { id } = req.body;
  if (!estado.contadores[id]) {
    return res.status(404).json({ success: false, message: 'Contador no encontrado' });
  }
  
  estado.contadorActual = id;
  marcarCambio();
  res.json({ success: true, id });
});

// Renombrar contador
app.put('/api/contadores/:id/nombre', (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ success: false, message: 'Nombre requerido' });
  }
  
  if (!estado.contadores[id]) {
    return res.status(404).json({ success: false, message: 'Contador no encontrado' });
  }
  
  estado.contadores[id].nombre = nombre.trim();
  marcarCambio();
  res.json({ success: true, nombre: nombre.trim() });
});

// Cambiar contadores visibles en pantalla
app.post('/api/contadores/visibles', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids)) {
    return res.status(400).json({ success: false, message: 'Se requiere array de IDs' });
  }
  
  // Validar que todos los IDs existen
  const idsValidos = ids.filter(id => estado.contadores[id]);
  estado.contadoresVisibles = idsValidos.length > 0 ? idsValidos : ['default'];
  
  marcarCambio();
  res.json({ success: true, visibles: estado.contadoresVisibles });
});

// Cambiar orientaciÃ³n de la vista
app.post('/api/contadores/orientacion', (req, res) => {
  const { orientacion } = req.body;
  if (orientacion !== 'horizontal' && orientacion !== 'vertical') {
    return res.status(400).json({ success: false, message: 'OrientaciÃ³n debe ser horizontal o vertical' });
  }
  
  estado.orientacionVista = orientacion;
  marcarCambio();
  res.json({ success: true, orientacion });
});

// Obtener contadores visibles con toda su info
app.get('/api/contadores/visibles', (req, res) => {
  const contadoresVisibles = estado.contadoresVisibles
    .map(id => estado.contadores[id])
    .filter(c => c); // Filtrar nulls por si acaso
  
  res.json({ 
    contadores: contadoresVisibles,
    orientacion: estado.orientacionVista || 'horizontal'
  });
});

// Eliminar contador
app.delete('/api/contadores/:id', (req, res) => {
  const { id } = req.params;

  if (!estado.contadores[id]) {
    return res.status(404).json({ success: false, message: 'Contador no encontrado' });
  }

  // No permitir borrar el último contador
  if (Object.keys(estado.contadores).length <= 1) {
    return res.status(400).json({ success: false, message: 'Debe haber al menos un contador' });
  }

  delete estado.contadores[id];

  // Si era el actual, cambiar al primer contador restante
  if (estado.contadorActual === id) {
    estado.contadorActual = Object.keys(estado.contadores)[0];
  }

  // Remover de visibles y asegurar que quede al menos uno
  estado.contadoresVisibles = estado.contadoresVisibles.filter(cid => cid !== id);
  if (estado.contadoresVisibles.length === 0) {
    estado.contadoresVisibles = [Object.keys(estado.contadores)[0]];
  }

  marcarCambio();
  res.json({ success: true });
});

// ------------------------------------------------------
// Guardar y cargar configuraciones
// ------------------------------------------------------

// Guardar configuraciÃ³n actual
app.post('/api/configuraciones/guardar', (req, res) => {
  const { nombre, contadorId } = req.body;
  if (!nombre) return res.status(400).json({ success: false, message: 'Nombre requerido' });
  
  const id = contadorId || estado.contadorActual;
  const contador = estado.contadores[id];
  
  if (!contador) {
    return res.status(404).json({ success: false, message: 'Contador no encontrado' });
  }
  
  const configId = `config_${Date.now()}`;
  const config = {
    id: configId,
    nombre,
    fechaGuardado: new Date().toISOString(),
    contadorId: contador.id,
    contadorNombre: contador.nombre,
    configuracion: JSON.parse(JSON.stringify(contador)) // Deep copy
  };
  
  const configPath = path.join(CONFIGS_DIR, `${configId}.json`);
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    res.json({ success: true, config: { id: configId, nombre, fecha: config.fechaGuardado } });
  } catch (error) {
    console.error('Error guardando configuraciÃ³n:', error);
    res.status(500).json({ success: false, message: 'Error guardando configuraciÃ³n' });
  }
});

// Listar configuraciones guardadas
app.get('/api/configuraciones', (req, res) => {
  try {
    const archivos = fs.readdirSync(CONFIGS_DIR).filter(f => f.endsWith('.json'));
    const configs = archivos.map(archivo => {
      const configPath = path.join(CONFIGS_DIR, archivo);
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      return {
        id: config.id,
        nombre: config.nombre,
        fecha: config.fechaGuardado,
        contadorNombre: config.contadorNombre
      };
    });
    
    // Ordenar por fecha descendente
    configs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    res.json({ configuraciones: configs });
  } catch (error) {
    console.error('Error listando configuraciones:', error);
    res.json({ configuraciones: [] });
  }
});

// Cargar configuraciÃ³n
app.post('/api/configuraciones/cargar', (req, res) => {
  const { configId, contadorDestinoId } = req.body;
  
  if (!configId) {
    return res.status(400).json({ success: false, message: 'ID de configuraciÃ³n requerido' });
  }
  
  const configPath = path.join(CONFIGS_DIR, `${configId}.json`);
  
  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ success: false, message: 'ConfiguraciÃ³n no encontrada' });
  }
  
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const contadorId = contadorDestinoId || estado.contadorActual;
    
    if (!estado.contadores[contadorId]) {
      return res.status(404).json({ success: false, message: 'Contador destino no encontrado' });
    }
    
    // Cargar configuraciÃ³n manteniendo el ID y nombre actuales
    const idOriginal = estado.contadores[contadorId].id;
    const nombreOriginal = estado.contadores[contadorId].nombre;
    
    estado.contadores[contadorId] = JSON.parse(JSON.stringify(config.configuracion));
    estado.contadores[contadorId].id = idOriginal;
    estado.contadores[contadorId].nombre = nombreOriginal;
    
    // Resetear estados temporales
    estado.contadores[contadorId].contadorActivo = false;
    estado.contadores[contadorId].tiempoRestante = config.configuracion.tiempoInicial;
    estado.contadores[contadorId].tiempoFinalizacion = null;
    if (estado.contadores[contadorId].audio) {
      estado.contadores[contadorId].audio.reproduciendo = false;
    }
    
    marcarCambio();
    res.json({ success: true, message: 'ConfiguraciÃ³n cargada correctamente' });
  } catch (error) {
    console.error('Error cargando configuraciÃ³n:', error);
    res.status(500).json({ success: false, message: 'Error cargando configuraciÃ³n' });
  }
});

// Eliminar configuraciÃ³n guardada
app.delete('/api/configuraciones/:id', (req, res) => {
  const { id } = req.params;
  const configPath = path.join(CONFIGS_DIR, `${id}.json`);
  
  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ success: false, message: 'ConfiguraciÃ³n no encontrada' });
  }
  
  try {
    fs.unlinkSync(configPath);
    res.json({ success: true });
  } catch (error) {
    console.error('Error eliminando configuraciÃ³n:', error);
    res.status(500).json({ success: false, message: 'Error eliminando configuraciÃ³n' });
  }
});

// Crear contador desde plantilla/configuración guardada
app.post('/api/contadores/desde-plantilla', (req, res) => {
  const { configId, nombre } = req.body;
  if (!configId) return res.status(400).json({ success: false, message: 'configId requerido' });

  const configPath = path.join(CONFIGS_DIR, `${configId}.json`);
  if (!fs.existsSync(configPath)) {
    return res.status(404).json({ success: false, message: 'Configuración no encontrada' });
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const nuevoId = `contador_${Date.now()}`;
    const nuevoNombre = nombre || `${config.nombre || 'Plantilla'} (copia)`;

    // Crear contador con la configuración de la plantilla
    const nuevoContador = JSON.parse(JSON.stringify(config.configuracion));
    nuevoContador.id = nuevoId;
    nuevoContador.nombre = nuevoNombre;
    nuevoContador.contadorActivo = false;
    nuevoContador.tiempoRestante = nuevoContador.tiempoInicial || 0;
    nuevoContador.tiempoFinalizacion = null;
    if (nuevoContador.audio) nuevoContador.audio.reproduciendo = false;

    estado.contadores[nuevoId] = nuevoContador;
    marcarCambio();
    res.json({ success: true, id: nuevoId, nombre: nuevoNombre });
  } catch (error) {
    console.error('Error creando contador desde plantilla:', error);
    res.status(500).json({ success: false, message: 'Error creando contador desde plantilla' });
  }
});

// ------------------------------------------------------
// Rutas API existentes (actualizadas para usar getContador)
// ------------------------------------------------------

// GET estado del contador actual
app.get('/api/status', (req, res) => {
  const contador = getContador();
  
  // Asegurar que configMesas existe
  if (!contador.configMesas) {
    contador.configMesas = {
      columnas: 2,
      altura: 30,
      colorCabecera: '#ff3b3b',
      colorFondo: '#141414',
      colorNumero: '#ff8800',
      colorVS: '#ff3b3b',
      tamCabecera: 2.5,
      tamFilas: 2.2,
      tamNumero: 2.5,
      posicion: 'bottom-center',
      margen: 20,
      ancho: 90,
      tiempoVisible: null
    };
  }
  
  // Asegurar que posicionContador existe
  if (!contador.posicionContador) {
    contador.posicionContador = {
      top: 50,
      left: 50
    };
  }
  
  res.json(contador);
});

// POST cambiar texto
app.post('/api/texto', (req, res) => {
  const { texto } = req.body;
  if (typeof texto === 'string') {
    getContador().texto = texto;
    marcarCambio();
    res.json({ success: true });
  } else res.status(400).json({ success: false });
});

// POST cambiar estilos
app.post('/api/estilo', (req, res) => {
  const contador = getContador();
  const { colorContador, tamanoContador, colorTexto, tamanoTexto, colorFondo } = req.body;
  if (colorContador) contador.colorContador = colorContador;
  if (tamanoContador) contador.tamanoContador = tamanoContador;
  if (colorTexto) contador.colorTexto = colorTexto;
  if (tamanoTexto) contador.tamanoTexto = tamanoTexto;
  if (colorFondo) contador.colorFondo = colorFondo;
  marcarCambio();
  res.json({ success: true });
});

// Guardar posición del contador
app.post('/api/posicion-contador', (req, res) => {
  const { top, left } = req.body;
  const contador = getContador();
  
  if (!contador.posicionContador) {
    contador.posicionContador = {};
  }
  
  if (top !== undefined) contador.posicionContador.top = top;
  if (left !== undefined) contador.posicionContador.left = left;
  
  marcarCambio();
  res.json({ success: true, posicion: contador.posicionContador });
});

// POST set tiempo
app.post('/api/setTime', (req, res) => {
  const { tiempo, iniciar } = req.body;
  if (typeof tiempo === 'number' && tiempo >= 0) {
    const contador = getContador();
    contador.tiempoRestante = tiempo;
    contador.tiempoInicial = tiempo;
    contador.tiempoFinalizacion = null;
    if (iniciar) contador.contadorActivo = true;
    marcarCambio();
    res.json({ success: true });
  } else res.status(400).json({ success: false });
});

// POST start / stop / reset
app.post('/api/start', (req, res) => {
  const contador = getContador();
  contador.contadorActivo = true;
  contador.tiempoFinalizacion = null;
  
  // Establecer timestamp de inicio del contador para mesas temporales
  if (!contador.configMesas) contador.configMesas = {};
  contador.configMesas.timestampContadorInicio = Date.now();
  
  marcarCambio();
  res.json({ success: true });
});

app.post('/api/stop', (req, res) => {
  const contador = getContador();
  contador.contadorActivo = false;
  contador.tiempoFinalizacion = null;
  contador.audio.reproduciendo = false;
  contador.audio.timestampReproduccion = null;  // Limpiar timestamp
  
  // Limpiar timestamp de inicio
  if (contador.configMesas) {
    contador.configMesas.timestampContadorInicio = null;
  }
  
  marcarCambio();
  res.json({ success: true });
});

app.post('/api/reset', (req, res) => {
  const contador = getContador();
  contador.tiempoRestante = contador.tiempoInicial;
  contador.contadorActivo = false;
  contador.tiempoFinalizacion = null;
  contador.audio.reproduciendo = false;
  contador.audio.timestampReproduccion = null;  // Limpiar timestamp
  
  // Limpiar timestamp de inicio
  if (contador.configMesas) {
    contador.configMesas.timestampContadorInicio = null;
  }
  
  marcarCambio();
  res.json({ success: true });
});

// ------------------------------------------------------
// Control individual de contadores (para multi-vista)
// ------------------------------------------------------

app.post('/api/contador/:id/start', (req, res) => {
  const contador = estado.contadores[req.params.id];
  if (!contador) return res.status(404).json({ success: false });
  contador.contadorActivo = true;
  contador.tiempoFinalizacion = null;
  
  // Establecer timestamp de inicio del contador para mesas temporales
  if (!contador.configMesas) contador.configMesas = {};
  contador.configMesas.timestampContadorInicio = Date.now();
  
  marcarCambio();
  res.json({ success: true });
});

app.post('/api/contador/:id/stop', (req, res) => {
  const contador = estado.contadores[req.params.id];
  if (!contador) return res.status(404).json({ success: false });
  contador.contadorActivo = false;
  contador.tiempoFinalizacion = null;
  contador.audio.reproduciendo = false;
  contador.audio.timestampReproduccion = null;
  
  // Limpiar timestamp de inicio
  if (contador.configMesas) {
    contador.configMesas.timestampContadorInicio = null;
  }
  
  marcarCambio();
  res.json({ success: true });
});

app.post('/api/contador/:id/reset', (req, res) => {
  const contador = estado.contadores[req.params.id];
  if (!contador) return res.status(404).json({ success: false });
  contador.tiempoRestante = contador.tiempoInicial;
  contador.contadorActivo = false;
  contador.tiempoFinalizacion = null;
  contador.audio.reproduciendo = false;
  contador.audio.timestampReproduccion = null;
  
  // Limpiar timestamp de inicio
  if (contador.configMesas) {
    contador.configMesas.timestampContadorInicio = null;
  }
  
  marcarCambio();
  res.json({ success: true });
});

// ------------------------------------------------------
// GestiÃ³n de iconos
// ------------------------------------------------------

app.post('/api/iconos', uploadIcon.single('icono'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subiÃ³ archivo' });
    }

    const { nombre, tamano, posX, posY } = req.body;
    const contador = getContador();
    
    const nuevoIcono = {
      id: `icono_${Date.now()}`,
      nombre: nombre || 'Icono',
      archivo: req.file.filename,
      tamano: parseInt(tamano) || 100,
      posX: parseInt(posX) || 50,
      posY: parseInt(posY) || 50,
      visible: true
    };

    if (!contador.iconos) contador.iconos = [];
    contador.iconos.push(nuevoIcono);
    
    marcarCambio();
    res.json({ success: true, icono: nuevoIcono });
  } catch (error) {
    console.error('Error subiendo icono:', error);
    res.status(500).json({ success: false, message: 'Error subiendo icono' });
  }
});

app.put('/api/iconos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, tamano, posX, posY, visible } = req.body;
  const contador = getContador();
  
  const icono = contador.iconos?.find(i => i.id === id);
  if (!icono) {
    return res.status(404).json({ success: false, message: 'Icono no encontrado' });
  }

  if (nombre !== undefined) icono.nombre = nombre;
  if (tamano !== undefined) icono.tamano = parseInt(tamano);
  if (posX !== undefined) icono.posX = parseInt(posX);
  if (posY !== undefined) icono.posY = parseInt(posY);
  if (visible !== undefined) icono.visible = visible;

  marcarCambio();
  res.json({ success: true, icono });
});

app.delete('/api/iconos/:id', (req, res) => {
  const { id } = req.params;
  const contador = getContador();
  
  const index = contador.iconos?.findIndex(i => i.id === id);
  if (index === -1 || index === undefined) {
    return res.status(404).json({ success: false, message: 'Icono no encontrado' });
  }

  const icono = contador.iconos[index];
  const filePath = path.join(__dirname, 'iconos', icono.archivo);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  contador.iconos.splice(index, 1);
  marcarCambio();
  res.json({ success: true });
});

// Añadir icono desde biblioteca
app.post('/api/iconos/desde-biblioteca', (req, res) => {
  try {
    const { archivo, nombre, tamano, posX, posY } = req.body;
    const contador = getContador();
    
    // Verificar que el archivo existe
    const filePath = path.join(__dirname, 'iconos', archivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    
    const nuevoIcono = {
      id: `icono_${Date.now()}`,
      nombre: nombre || 'Icono',
      archivo: archivo,
      tamano: parseInt(tamano) || 100,
      posX: parseInt(posX) || 50,
      posY: parseInt(posY) || 50,
      visible: true
    };

    if (!contador.iconos) contador.iconos = [];
    contador.iconos.push(nuevoIcono);
    
    marcarCambio();
    res.json({ success: true, icono: nuevoIcono });
  } catch (error) {
    console.error('Error añadiendo icono desde biblioteca:', error);
    res.status(500).json({ success: false, message: 'Error añadiendo icono' });
  }
});

// ------------------------------------------------------
// Gestión de Logo
// ------------------------------------------------------

app.post('/api/logo', uploadLogo.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió archivo' });
    }

    // Copiar el archivo subido como logo.png
    const logoPath = path.join(__dirname, '../frontend/logo.png');
    fs.copyFileSync(req.file.path, logoPath);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error subiendo logo:', error);
    res.status(500).json({ success: false, message: 'Error subiendo logo' });
  }
});

app.post('/api/logo/desde-biblioteca', (req, res) => {
  try {
    const { archivo } = req.body;
    
    // Verificar que el archivo existe en logos
    const sourcePath = path.join(__dirname, 'logos', archivo);
    if (!fs.existsSync(sourcePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    
    // Copiar como logo.png
    const logoPath = path.join(__dirname, '../frontend/logo.png');
    fs.copyFileSync(sourcePath, logoPath);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error actualizando logo:', error);
    res.status(500).json({ success: false, message: 'Error actualizando logo' });
  }
});

// ------------------------------------------------------
// Biblioteca de archivos
// ------------------------------------------------------

app.get('/api/biblioteca', (req, res) => {
  try {
    const iconosDir = path.join(__dirname, 'iconos');
    const logosDir = path.join(__dirname, 'logos');
    const audiosDir = path.join(__dirname, 'audio');
    
    const iconos = fs.existsSync(iconosDir) ? fs.readdirSync(iconosDir) : [];
    const logos = fs.existsSync(logosDir) ? fs.readdirSync(logosDir) : [];
    const audios = fs.existsSync(audiosDir) ? fs.readdirSync(audiosDir) : [];
    
    res.json({ iconos, logos, audios });
  } catch (error) {
    console.error('Error leyendo biblioteca:', error);
    res.status(500).json({ success: false, message: 'Error leyendo biblioteca' });
  }
});

app.delete('/api/biblioteca/:tipo/:archivo', (req, res) => {
  try {
    const { tipo, archivo } = req.params;
    let directorioBase;
    
    if (tipo === 'iconos') directorioBase = path.join(__dirname, 'iconos');
    else if (tipo === 'logos') directorioBase = path.join(__dirname, 'logos');
    else if (tipo === 'audios') directorioBase = path.join(__dirname, 'audio');
    else return res.status(400).json({ success: false, message: 'Tipo inválido' });
    
    const filePath = path.join(directorioBase, archivo);
    
    // Validar que el archivo existe y está dentro del directorio correcto
    if (!filePath.startsWith(directorioBase)) {
      return res.status(403).json({ success: false, message: 'Acceso denegado' });
    }
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    res.status(500).json({ success: false, message: 'Error eliminando archivo' });
  }
});

// ------------------------------------------------------
// Audio
// ------------------------------------------------------
app.post('/api/upload-audio', uploadAudio.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió archivo' });
    }

    const modo = req.body.modo || 'final';
    const segundosAntes = parseInt(req.body.segundosAntes) || 30;
    const filePath = req.file.path;
    const duracion = await getAudioDurationInSeconds(filePath);
    
    const contador = getContador();
    contador.audio = {
      archivo: req.file.filename,
      duracion: Math.ceil(duracion),
      modo: modo,
      segundosAntes: segundosAntes,
      reproduciendo: false,
      timestampReproduccion: null
    };
    
    marcarCambio();
    res.json({ success: true, duracion: Math.ceil(duracion), modo: modo, segundosAntes });
  } catch (error) {
    console.error('Error procesando audio:', error);
    res.status(500).json({ success: false, message: 'Error procesando audio' });
  }
});

app.delete('/api/audio', (req, res) => {
  const contador = getContador();
  if (contador.audio.archivo) {
    const filePath = path.join(__dirname, 'audio', contador.audio.archivo);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  contador.audio = { archivo: null, duracion: 0, modo: 'final', segundosAntes: 30, reproduciendo: false, timestampReproduccion: null };
  marcarCambio();
  res.json({ success: true });
});

app.post('/api/audio/desde-biblioteca', async (req, res) => {
  try {
    const { archivo, modo, segundosAntes } = req.body;
    
    // Verificar que el archivo existe
    const filePath = path.join(__dirname, 'audio', archivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    
    const duracion = await getAudioDurationInSeconds(filePath);
    
    const contador = getContador();
    contador.audio = {
      archivo: archivo,
      duracion: Math.ceil(duracion),
      modo: modo || 'final',
      segundosAntes: parseInt(segundosAntes) || 30,
      reproduciendo: false,
      timestampReproduccion: null
    };
    
    marcarCambio();
    res.json({ success: true, duracion: Math.ceil(duracion), modo: modo || 'final', segundosAntes: parseInt(segundosAntes) || 30 });
  } catch (error) {
    console.error('Error configurando audio:', error);
    res.status(500).json({ success: false, message: 'Error configurando audio' });
  }
});

// Listar audios disponibles en biblioteca
app.get('/api/audio/biblioteca', (req, res) => {
  try {
    const audioDir = path.join(__dirname, 'audio');
    
    if (!fs.existsSync(audioDir)) {
      return res.json({ audios: [] });
    }
    
    const archivos = fs.readdirSync(audioDir)
      .filter(f => f.match(/\.(mp3|wav|ogg|m4a)$/i))
      .map(f => ({
        nombre: f,
        ruta: `/audio/${f}`
      }));
    
    res.json({ audios: archivos });
  } catch (error) {
    console.error('Error listando audios:', error);
    res.status(500).json({ audios: [] });
  }
});

// Usar audio de biblioteca
app.post('/api/audio/usar', async (req, res) => {
  try {
    const { archivo, modo } = req.body;
    if (!archivo) {
      return res.status(400).json({ success: false, message: 'Archivo requerido' });
    }
    
    const filePath = path.join(__dirname, 'audio', archivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    
    const duracion = await getAudioDurationInSeconds(filePath);
    const contador = getContador();
    
    contador.audio = {
      archivo: archivo,
      duracion: Math.ceil(duracion),
      modo: modo || 'final',
      reproduciendo: false
    };
    
    marcarCambio();
    res.json({ success: true, duracion: Math.ceil(duracion), modo: contador.audio.modo });
  } catch (error) {
    console.error('Error configurando audio:', error);
    res.status(500).json({ success: false, message: 'Error configurando audio' });
  }
});

// Usar icono de biblioteca
app.post('/api/iconos/usar', (req, res) => {
  try {
    const { archivo, nombre, tamano, posX, posY } = req.body;
    
    if (!archivo) {
      return res.status(400).json({ success: false, message: 'Archivo requerido' });
    }
    
    const filePath = path.join(__dirname, 'iconos', archivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    
    const contador = getContador();
    
    const nuevoIcono = {
      id: `icono_${Date.now()}`,
      nombre: nombre || 'Icono',
      archivo: archivo,
      tamano: parseInt(tamano) || 100,
      posX: parseInt(posX) || 50,
      posY: parseInt(posY) || 50,
      visible: true
    };

    if (!contador.iconos) contador.iconos = [];
    contador.iconos.push(nuevoIcono);
    
    marcarCambio();
    res.json({ success: true, icono: nuevoIcono });
  } catch (error) {
    console.error('Error añadiendo icono:', error);
    res.status(500).json({ success: false, message: 'Error añadiendo icono' });
  }
});

// ------------------------------------------------------
// Gestión de Logo
// ------------------------------------------------------

app.post('/api/logo', uploadLogo.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No se subió archivo' });
    }

    const { nombre } = req.body;
    const contador = getContador();
    
    if (!contador.configLogo) {
      contador.configLogo = {
        archivo: req.file.filename,
        nombre: nombre || 'Logo',
        tamano: 15,
        posX: 10,
        posY: 10,
        visible: true
      };
    } else {
      contador.configLogo.archivo = req.file.filename;
      if (nombre) contador.configLogo.nombre = nombre;
    }
    
    contador.logo = { archivo: req.file.filename };
    
    marcarCambio();
    res.json({ success: true, logo: contador.logo, config: contador.configLogo });
  } catch (error) {
    console.error('Error subiendo logo:', error);
    res.status(500).json({ success: false, message: 'Error subiendo logo' });
  }
});

app.post('/api/logo/usar', (req, res) => {
  try {
    const { archivo, nombre } = req.body;
    
    if (!archivo) {
      return res.status(400).json({ success: false, message: 'Archivo requerido' });
    }
    
    const filePath = path.join(__dirname, 'logos', archivo);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
    }
    
    const contador = getContador();
    contador.logo = { archivo: archivo };
    
    if (!contador.configLogo) {
      contador.configLogo = {
        archivo: archivo,
        nombre: nombre || 'Logo',
        tamano: 15,
        posX: 10,
        posY: 10,
        visible: true
      };
    } else {
      contador.configLogo.archivo = archivo;
      if (nombre) contador.configLogo.nombre = nombre;
    }
    
    marcarCambio();
    res.json({ success: true, logo: contador.logo, config: contador.configLogo });
  } catch (error) {
    console.error('Error configurando logo:', error);
    res.status(500).json({ success: false, message: 'Error configurando logo' });
  }
});

app.delete('/api/logo', (req, res) => {
  const contador = getContador();
  contador.logo = { archivo: null };
  marcarCambio();
  res.json({ success: true });
});

// Configurar logo
app.post('/api/logo/config', (req, res) => {
  const { nombre, tamano, posX, posY, visible } = req.body;
  const contador = getContador();
  
  // Asegurar que existe logo
  if (!contador.logo) {
    contador.logo = {
      archivo: null,
      nombre: 'Logo',
      tamano: 340,
      posX: 10,
      posY: 10
    };
  }
  
  // Actualizar propiedades del logo
  if (nombre !== undefined) contador.logo.nombre = nombre;
  if (tamano !== undefined) contador.logo.tamano = parseInt(tamano);
  if (posX !== undefined) contador.logo.posX = parseInt(posX);
  if (posY !== undefined) contador.logo.posY = parseInt(posY);
  
  // También actualizar configLogo para compatibilidad
  if (!contador.configLogo) {
    contador.configLogo = { ...contador.logo, visible: true };
  } else {
    if (nombre !== undefined) contador.configLogo.nombre = nombre;
    if (tamano !== undefined) contador.configLogo.tamano = parseInt(tamano);
    if (posX !== undefined) contador.configLogo.posX = parseInt(posX);
    if (posY !== undefined) contador.configLogo.posY = parseInt(posY);
    if (visible !== undefined) contador.configLogo.visible = visible;
  }
  
  marcarCambio();
  res.json({ success: true, config: contador.logo });
});

// Renombrar icono en biblioteca
app.post('/api/biblioteca/iconos/renombrar', (req, res) => {
  const { archivoActual, nuevoNombre } = req.body;
  
  if (!archivoActual || !nuevoNombre) {
    return res.status(400).json({ success: false, message: 'Archivo actual y nuevo nombre requeridos' });
  }
  
  const rutaActual = path.join(__dirname, 'iconos', archivoActual);
  const rutaNueva = path.join(__dirname, 'iconos', nuevoNombre);
  
  if (!fs.existsSync(rutaActual)) {
    return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
  }
  
  if (fs.existsSync(rutaNueva)) {
    return res.status(400).json({ success: false, message: 'Ya existe un archivo con ese nombre' });
  }
  
  try {
    fs.renameSync(rutaActual, rutaNueva);
    
    // Actualizar referencias en todos los contadores
    Object.values(estado.contadores).forEach(contador => {
      if (contador.iconos) {
        contador.iconos.forEach(icono => {
          if (icono.archivo === archivoActual) {
            icono.archivo = nuevoNombre;
          }
        });
      }
    });
    
    marcarCambio();
    res.json({ success: true, nuevoNombre });
  } catch (error) {
    console.error('Error renombrando icono:', error);
    res.status(500).json({ success: false, message: 'Error al renombrar archivo' });
  }
});

// Renombrar logo en biblioteca
app.post('/api/biblioteca/logos/renombrar', (req, res) => {
  const { archivoActual, nuevoNombre } = req.body;
  
  if (!archivoActual || !nuevoNombre) {
    return res.status(400).json({ success: false, message: 'Archivo actual y nuevo nombre requeridos' });
  }
  
  const rutaActual = path.join(__dirname, 'logos', archivoActual);
  const rutaNueva = path.join(__dirname, 'logos', nuevoNombre);
  
  if (!fs.existsSync(rutaActual)) {
    return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
  }
  
  if (fs.existsSync(rutaNueva)) {
    return res.status(400).json({ success: false, message: 'Ya existe un archivo con ese nombre' });
  }
  
  try {
    fs.renameSync(rutaActual, rutaNueva);
    
    // Actualizar referencias en todos los contadores
    Object.values(estado.contadores).forEach(contador => {
      if (contador.logo && contador.logo.archivo === archivoActual) {
        contador.logo.archivo = nuevoNombre;
      }
    });
    
    marcarCambio();
    res.json({ success: true, nuevoNombre });
  } catch (error) {
    console.error('Error renombrando logo:', error);
    res.status(500).json({ success: false, message: 'Error al renombrar archivo' });
  }
});

// Renombrar audio en biblioteca
app.post('/api/biblioteca/audios/renombrar', (req, res) => {
  const { archivoActual, nuevoNombre } = req.body;
  
  if (!archivoActual || !nuevoNombre) {
    return res.status(400).json({ success: false, message: 'Archivo actual y nuevo nombre requeridos' });
  }
  
  const rutaActual = path.join(__dirname, 'audio', archivoActual);
  const rutaNueva = path.join(__dirname, 'audio', nuevoNombre);
  
  if (!fs.existsSync(rutaActual)) {
    return res.status(404).json({ success: false, message: 'Archivo no encontrado' });
  }
  
  if (fs.existsSync(rutaNueva)) {
    return res.status(400).json({ success: false, message: 'Ya existe un archivo con ese nombre' });
  }
  
  try {
    fs.renameSync(rutaActual, rutaNueva);
    
    // Actualizar referencias en todos los contadores
    Object.values(estado.contadores).forEach(contador => {
      if (contador.audio && contador.audio.archivo === archivoActual) {
        contador.audio.archivo = nuevoNombre;
      }
    });
    
    marcarCambio();
    res.json({ success: true, nuevoNombre });
  } catch (error) {
    console.error('Error renombrando audio:', error);
    res.status(500).json({ success: false, message: 'Error al renombrar archivo' });
  }
});

// ------------------------------------------------------
// Mesas - GestiÃ³n independiente por contador
// ------------------------------------------------------

// Crear/actualizar mesas para un contador especÃ­fico
app.post('/api/contador/:id/mesas', (req, res) => {
  const { id } = req.params;
  const { emparejamientos } = req.body;
  
  if (!estado.contadores[id]) {
    return res.status(404).json({ success: false, message: 'Contador no encontrado' });
  }
  
  if (!emparejamientos || !Array.isArray(emparejamientos)) {
    return res.status(400).json({ success: false, message: 'Formato invÃ¡lido' });
  }

  estado.contadores[id].mesas = emparejamientos.map(e => ({
    mesa: e.mesa,
    jugador1: e.jugador1,
    jugador2: e.jugador2,
    activa: e.activa !== false
  }));

  marcarCambio();
  res.json({ ok: true, mesas: estado.contadores[id].mesas });
});

// Obtener mesas de un contador especÃ­fico
app.get('/api/contador/:id/mesas', (req, res) => {
  const { id } = req.params;
  const contador = estado.contadores[id];
  
  if (!contador) {
    return res.status(404).json({ success: false, message: 'Contador no encontrado' });
  }
  
  const mesasActivas = contador.mesas?.filter(m => m.activa) || [];
  res.json({ mesas: mesasActivas });
});

// Limpiar mesas de un contador especÃ­fico
app.delete('/api/contador/:id/mesas', (req, res) => {
  const { id } = req.params;
  
  if (!estado.contadores[id]) {
    return res.status(404).json({ success: false, message: 'Contador no encontrado' });
  }
  
  estado.contadores[id].mesas = [];
  marcarCambio();
  res.json({ success: true });
});

// Mantener endpoints legacy para compatibilidad (usan contador actual)
app.post('/api/create-table', (req, res) => {
  const { emparejamientos, ronda } = req.body;
  if (!emparejamientos || !Array.isArray(emparejamientos)) {
    return res.status(400).json({ success: false, message: 'Formato inválido' });
  }

  const contador = getContador();
  
  // Guardar ronda en configMesas
  if (!contador.configMesas) contador.configMesas = {};
  contador.configMesas.ronda = ronda || null;
  
  contador.mesas = emparejamientos.map(e => ({
    mesa: e.mesa,
    jugador1: e.jugador1,
    jugador2: e.jugador2,
    activa: e.activa !== false,
    ronda: ronda || null
  }));

  marcarCambio();
  res.json({ ok: true, mesas: contador.mesas });
});

app.get('/api/mesas', (req, res) => {
  const contador = getContador();
  const mesasActivas = contador.mesas?.filter(m => m.activa) || [];
  res.json({ mesas: mesasActivas });
});

app.delete('/api/mesas', (req, res) => {
  getContador().mesas = [];
  marcarCambio();
  res.json({ success: true });
});

// Configuración visual de mesas
app.post('/api/mesas/config', (req, res) => {
  const { columnas, altura, colorCabecera, colorFondo, colorNumero, colorVS, 
          tamCabecera, tamFilas, tamNumero, posicion, margen, ancho, tiempoVisible,
          tituloMesa, tituloEmparejamiento } = req.body;
  
  const contador = getContador();
  
  if (!contador.configMesas) {
    contador.configMesas = {};
  }
  
  if (columnas !== undefined) contador.configMesas.columnas = columnas;
  if (altura !== undefined) contador.configMesas.altura = altura;
  if (colorCabecera !== undefined) contador.configMesas.colorCabecera = colorCabecera;
  if (colorFondo !== undefined) contador.configMesas.colorFondo = colorFondo;
  if (colorNumero !== undefined) contador.configMesas.colorNumero = colorNumero;
  if (colorVS !== undefined) contador.configMesas.colorVS = colorVS;
  if (tamCabecera !== undefined) contador.configMesas.tamCabecera = tamCabecera;
  if (tamFilas !== undefined) contador.configMesas.tamFilas = tamFilas;
  if (tamNumero !== undefined) contador.configMesas.tamNumero = tamNumero;
  if (posicion !== undefined) contador.configMesas.posicion = posicion;
  if (margen !== undefined) contador.configMesas.margen = margen;
  if (ancho !== undefined) contador.configMesas.ancho = ancho;
  if (tiempoVisible !== undefined) contador.configMesas.tiempoVisible = tiempoVisible;
  if (tituloMesa !== undefined) contador.configMesas.tituloMesa = tituloMesa;
  if (tituloEmparejamiento !== undefined) contador.configMesas.tituloEmparejamiento = tituloEmparejamiento;
  
  marcarCambio();
  res.json({ success: true });
});

// ------------------------------------------------------
// Contador automático con audio
// ------------------------------------------------------
setInterval(() => {
  Object.values(estado.contadores).forEach(contador => {
    if (contador.contadorActivo && contador.tiempoRestante > 0) {
      contador.tiempoRestante--;
      
      // Sistema de audio mejorado
      if (contador.audio.archivo && !contador.audio.timestampReproduccion) {
        let debeReproducir = false;
        
        if (contador.audio.modo === 'final') {
          // Modo final: reproducir cuando llega a 0
          if (contador.tiempoRestante === 0) {
            debeReproducir = true;
          }
        } else if (contador.audio.modo === 'antes_final') {
          // Modo antes del final: reproducir X segundos antes
          const segundosAntes = contador.audio.segundosAntes || 30;
          if (contador.tiempoRestante === segundosAntes) {
            debeReproducir = true;
          }
        }
        
        if (debeReproducir) {
          contador.audio.reproduciendo = true;
          contador.audio.timestampReproduccion = Date.now();
          console.log(`🔊 Activando audio en contador ${contador.nombre} (modo: ${contador.audio.modo}, tiempo: ${contador.tiempoRestante}s)`);
        }
      }
      
      if (contador.tiempoRestante === 0) {
        contador.tiempoFinalizacion = Date.now();
      }
    } else if (contador.contadorActivo && contador.tiempoRestante <= 0) {
      contador.contadorActivo = false;
    }
  });
}, 1000);

// ------------------------------------------------------
// Iniciar servidor
// ------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Panel Admin: http://localhost:${PORT}/admin`);
  console.log(`Vista Unica: http://localhost:${PORT}`);
  console.log(`Vista multiple: http://localhost:${PORT}/multi.html`);
});