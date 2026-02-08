const API = `http://${window.location.hostname}:3000/api`;

// ==============================================
// SISTEMA DE DETECCIÓN AUTOMÁTICA DE VISTA
// ==============================================
let vistaActual = 'single'; // 'single' o 'multi'
let contadoresActuales = [];
let orientacionActual = 'horizontal';
let audioPlayers = {};
let parpadeoIntervals = {};
const DURACION_PARPADEO = 30000;

// Elementos Vista Single
const singleView = document.getElementById('singleView');
const contadorEl = document.getElementById('contador');
const textoEl = document.getElementById('textoContador');
const finEl = document.getElementById('finMensaje');
const audioPlayer = document.getElementById('audioPlayer');
const iconosContainer = document.getElementById('iconosContainer');
const logoContainer = document.getElementById('logoContainer');
const tablaMesasEl = document.getElementById('tablaMesas');
const contadorContainer = document.getElementById('contadorContainer');

// Elementos Vista Multi
const multiView = document.getElementById('multiView');
const gridContainer = document.getElementById('gridContainer');

let audioReproducido = false;
let ultimoHashMesas = '';  // Para evitar regenerar HTML innecesariamente
let inicializado = false;  // Para forzar primera renderización

// ==============================================
// FUNCIÓN PRINCIPAL DE ACTUALIZACIÓN
// ==============================================
async function actualizar() {
  try {
    console.log('🔄 Actualizando frontend...', { inicializado, vistaActual });
    
    const res = await fetch(`${API}/contadores/visibles`);
    const data = await res.json();
    
    console.log('📦 Datos recibidos:', data);
    
    const contadores = data.contadores || [];
    const orientacion = data.orientacion || 'horizontal';
    
    // Si no hay contadores visibles, mostrar mensaje
    if (contadores.length === 0) {
      console.log('⚠️ No hay contadores visibles');
      singleView.classList.add('active');
      multiView.classList.remove('active');
      contadorEl.textContent = '--:--';
      textoEl.textContent = 'No hay contadores visibles';
      tablaMesasEl.innerHTML = '';
      return;
    }
    
    // Detectar cambio de vista
    const nuevaVista = contadores.length === 1 ? 'single' : 'multi';
    
    console.log('🎯 Vista detectada:', { nuevaVista, cantidad: contadores.length });
    
    // Forzar cambio si:
    // 1. La vista cambia
    // 2. La orientación cambia
    // 3. Es la primera ejecución (no inicializado)
    const forzarCambio = !inicializado ||
                        nuevaVista !== vistaActual || 
                        orientacion !== orientacionActual;
    
    console.log('🔀 ¿Forzar cambio?', { forzarCambio, inicializado, cambioVista: nuevaVista !== vistaActual });
    
    if (forzarCambio) {
      console.log('✅ Cambiando a vista:', nuevaVista);
      inicializado = true;
      cambiarVista(nuevaVista, contadores, orientacion);
    } else {
      // Actualizar vista actual
      if (vistaActual === 'single' && contadores.length === 1) {
        actualizarVistaSingle(contadores[0]);
      } else if (vistaActual === 'multi' && contadores.length > 1) {
        actualizarVistaMulti(contadores, orientacion);
      }
    }
    
  } catch(e) {
    console.error('Error actualizando:', e);
  }
}

// ==============================================
// CAMBIO DE VISTA
// ==============================================
function cambiarVista(nuevaVista, contadores, orientacion) {
  console.log('🔄 cambiarVista llamada:', { nuevaVista, cantidadContadores: contadores.length, orientacion });
  
  vistaActual = nuevaVista;
  contadoresActuales = contadores;
  orientacionActual = orientacion;
  
  if (nuevaVista === 'single') {
    console.log('👁️ Activando vista SINGLE');
    singleView.classList.add('active');
    multiView.classList.remove('active');
    if (contadores.length === 1) {
      console.log('📊 Actualizando contador single:', contadores[0].nombre);
      actualizarVistaSingle(contadores[0]);
    } else {
      console.warn('⚠️ Vista single pero no hay exactamente 1 contador');
    }
  } else {
    console.log('👁️👁️ Activando vista MULTI');
    singleView.classList.remove('active');
    multiView.classList.add('active');
    console.log('📊 Recreando vista multi con', contadores.length, 'contadores');
    recrearVistaMulti(contadores, orientacion);
  }
  
  console.log('✅ Cambio de vista completado');
}

// ==============================================
// VISTA SINGLE
// ==============================================
function actualizarVistaSingle(contador) {
  // Actualizar texto
  textoEl.textContent = contador.texto || '';
  
  // Actualizar contador
  const minutos = Math.floor(contador.tiempoRestante / 60);
  const segundos = contador.tiempoRestante % 60;
  contadorEl.textContent = `${String(minutos).padStart(2,'0')}:${String(segundos).padStart(2,'0')}`;
  
  // Estilos
  contadorEl.style.color = contador.colorContador;
  contadorEl.style.fontSize = contador.tamanoContador;
  textoEl.style.color = contador.colorTexto;
  textoEl.style.fontSize = contador.tamanoTexto;
  document.body.style.backgroundColor = contador.colorFondo || '#000';
  
  // Posición del contador
  if (contador.posicionContador) {
    contadorContainer.style.top = `${contador.posicionContador.top}%`;
    contadorContainer.style.left = `${contador.posicionContador.left}%`;
  }
  
  // Logo
  actualizarLogo(contador.logo, logoContainer);
  
  // Iconos
  actualizarIconos(contador.iconos, iconosContainer);
  
  // Audio - reproducir solo UNA vez usando timestampReproduccion del backend
  if (contador.audio && contador.audio.reproduciendo && contador.audio.timestampReproduccion) {
    // El backend marcó que debe reproducir
    if (!audioReproducido) {
      if (contador.audio.archivo) {
        console.log(`🔊 Reproduciendo audio: ${contador.audio.archivo} (modo: ${contador.audio.modo})`);
        audioPlayer.src = `/audio/${contador.audio.archivo}`;
        audioPlayer.play().catch(e => console.error('Error reproduciendo audio:', e));
        audioReproducido = true;
        console.log(`✅ Audio iniciado, no se volverá a reproducir`);
      }
    }
  }
  
  // Resetear flag solo cuando el backend limpia el timestamp
  if (!contador.audio.timestampReproduccion && audioReproducido) {
    console.log(`🔄 Backend limpió timestamp, reseteando flag de audio`);
    audioReproducido = false;
  }
  
  // Parpadeo
  gestionarParpadeo(contador, contadorEl, finEl);
  
  // Mesas
  actualizarTablaMesas(contador.mesas, contador.configMesas, tablaMesasEl);
}

// Click en contador para iniciar
contadorEl.addEventListener('click', async () => {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    
    if (!data.contadorActivo && data.tiempoRestante > 0) {
      await fetch(`${API}/start`, { method: 'POST' });
    }
  } catch (error) {
    console.error('Error al iniciar contador:', error);
  }
});

// ==============================================
// VISTA MULTI
// ==============================================
function recrearVistaMulti(contadores, orientacion) {
  contadoresActuales = contadores;
  orientacionActual = orientacion;
  
  gridContainer.innerHTML = '';
  gridContainer.className = 'grid-container';
  
  const count = contadores.length;
  if (count === 1) {
    gridContainer.classList.add('grid-1');
  } else if (count <= 6) {
    gridContainer.classList.add(`grid-${count}`, orientacion);
  } else {
    gridContainer.classList.add('grid-6', orientacion);
  }
  
  contadores.forEach(contador => {
    const box = crearContadorBox(contador);
    gridContainer.appendChild(box);
  });
}

function actualizarVistaMulti(contadores, orientacion) {
  // Verificar si cambió la estructura
  const nuevosIds = contadores.map(c => c.id).sort().join(',');
  const actualesIds = contadoresActuales.map(c => c.id).sort().join(',');
  
  if (nuevosIds !== actualesIds || orientacion !== orientacionActual) {
    recrearVistaMulti(contadores, orientacion);
    return;
  }
  
  // Solo actualizar datos
  contadores.forEach(contador => {
    actualizarContadorBox(contador);
  });
}

function crearContadorBox(contador) {
  const box = document.createElement('div');
  box.className = 'contador-box';
  box.id = `contador-${contador.id}`;
  box.style.backgroundColor = contador.colorFondo || '#000';
  
  if (contador.contadorActivo) {
    box.classList.add('activo');
  }
  
  box.innerHTML = `
    <div class="nombre-contador">${contador.nombre}</div>
    
    <div class="logo-multi" id="logo-${contador.id}"></div>
    
    <div class="iconos-box" id="iconos-${contador.id}"></div>
    
    <div class="texto-box" style="color: ${contador.colorTexto}; font-size: ${parseFloat(contador.tamanoTexto) / 2}vh;">
      ${contador.texto}
    </div>
    
    <div class="contador-display" 
         style="color: ${contador.colorContador}; font-size: ${parseFloat(contador.tamanoContador) / 2}vh;"
         onclick="toggleContador('${contador.id}')">
      ${formatoTiempo(contador.tiempoRestante)}
    </div>
    
    <div class="fin-mensaje-box" id="fin-${contador.id}"></div>
    
    <div id="mesas-${contador.id}"></div>
    
    <audio id="audio-${contador.id}"></audio>
  `;
  
  return box;
}

function actualizarContadorBox(contador) {
  const box = document.getElementById(`contador-${contador.id}`);
  if (!box) return;
  
  // Actualizar clase activo
  if (contador.contadorActivo) {
    box.classList.add('activo');
  } else {
    box.classList.remove('activo');
  }
  
  // Actualizar tiempo
  const display = box.querySelector('.contador-display');
  if (display) {
    display.textContent = formatoTiempo(contador.tiempoRestante);
    display.style.color = contador.colorContador;
  }
  
  // Actualizar texto
  const texto = box.querySelector('.texto-box');
  if (texto) {
    texto.textContent = contador.texto;
    texto.style.color = contador.colorTexto;
  }
  
  // Actualizar fondo
  box.style.backgroundColor = contador.colorFondo || '#000';
  
  // Logo
  const logoDiv = document.getElementById(`logo-${contador.id}`);
  if (logoDiv) {
    actualizarLogo(contador.logo, logoDiv);
  }
  
  // Iconos
  const iconosDiv = document.getElementById(`iconos-${contador.id}`);
  if (iconosDiv) {
    actualizarIconos(contador.iconos, iconosDiv);
  }
  
  // Audio - reproducir solo UNA vez usando timestampReproduccion del backend
  const audioEl = document.getElementById(`audio-${contador.id}`);
  if (contador.audio && contador.audio.reproduciendo && contador.audio.timestampReproduccion && audioEl) {
    // El backend marcó que debe reproducir
    if (!audioPlayers[contador.id]) {
      console.log(`🔊 [${contador.nombre}] Reproduciendo audio: ${contador.audio.archivo}`);
      audioEl.src = `/audio/${contador.audio.archivo}`;
      audioEl.play().catch(e => console.error(`Error en audio ${contador.nombre}:`, e));
      audioPlayers[contador.id] = true;
      console.log(`✅ [${contador.nombre}] Audio iniciado, no se volverá a reproducir`);
    }
  }
  
  // Resetear flag solo cuando el backend limpia el timestamp
  if (!contador.audio.timestampReproduccion && audioPlayers[contador.id]) {
    console.log(`🔄 [${contador.nombre}] Backend limpió timestamp, reseteando flag de audio`);
    audioPlayers[contador.id] = false;
  }
  
  // Parpadeo
  const finElBox = document.getElementById(`fin-${contador.id}`);
  gestionarParpadeoMulti(contador, display, finElBox);
  
  // Mesas
  const mesasDiv = document.getElementById(`mesas-${contador.id}`);
  if (mesasDiv) {
    actualizarTablaMesas(contador.mesas, contador.configMesas, mesasDiv);
  }
}

window.toggleContador = async function(id) {
  const contador = contadoresActuales.find(c => c.id === id);
  if (!contador) return;
  
  if (!contador.contadorActivo && contador.tiempoRestante > 0) {
    await fetch(`${API}/contador/${id}/start`, { method: 'POST' });
  }
};

// ==============================================
// FUNCIONES COMUNES
// ==============================================
function formatoTiempo(segundos) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function actualizarLogo(logo, container) {
  if (!logo || !logo.archivo) {
    container.innerHTML = '';
    return;
  }
  
  // Determinar ruta del logo
  let src = '/logo.png'; // Fallback por defecto
  
  if (logo.archivo.startsWith('logo_')) {
    src = `/logos/${logo.archivo}`;
  } else if (logo.archivo === 'logo.png') {
    src = '/logo.png';
  } else {
    src = `/logos/${logo.archivo}`;
  }
  
  const img = document.createElement('img');
  img.src = src;
  img.alt = logo.nombre || 'Logo';
  
  // Fallback si falla la carga
  img.onerror = function() {
    console.warn(`Logo ${src} no encontrado, usando /logo.png`);
    this.src = '/logo.png';
    this.onerror = null; // Evitar loop infinito
  };
  
  container.innerHTML = '';
  container.appendChild(img);
  container.style.width = `${logo.tamano || 340}px`;
  container.style.left = `${logo.posX || 10}%`;
  container.style.top = `${logo.posY || 10}%`;
}

function actualizarIconos(iconos, container) {
  if (!iconos || iconos.length === 0) {
    container.innerHTML = '';
    return;
  }
  
  iconos.forEach(icono => {
    if (!icono.visible) {
      const existente = container.querySelector(`#icono-${icono.id}`);
      if (existente) existente.remove();
      return;
    }
    
    let img = container.querySelector(`#icono-${icono.id}`);
    
    if (!img) {
      img = document.createElement('img');
      img.id = `icono-${icono.id}`;
      img.className = 'icono-dinamico';
      container.appendChild(img);
    }
    
    img.src = `/iconos/${icono.archivo}`;
    img.alt = icono.nombre || 'Icono';
    
    // Para vista single, usar el tamaño del icono
    // Para vista multi, reducir proporcionalmente
    const esMulti = container.classList.contains('iconos-box');
    const tamano = esMulti ? icono.tamano / 5 : icono.tamano;
    
    img.style.width = `${tamano}px`;
    img.style.left = `${icono.posX}%`;
    img.style.top = `${icono.posY}%`;
  });
  
  // Eliminar iconos que ya no existen
  const iconosActuales = Array.from(container.querySelectorAll('.icono-dinamico'));
  iconosActuales.forEach(img => {
    const id = img.id.replace('icono-', '');
    if (!iconos.find(i => i.id === id)) {
      img.remove();
    }
  });
}

function gestionarParpadeo(contador, displayEl, finEl) {
  const tiempoTranscurrido = contador.tiempoFinalizacion ? (Date.now() - contador.tiempoFinalizacion) : 0;
  const debeParpadear = contador.tiempoRestante === 0 && 
                        contador.tiempoFinalizacion && 
                        tiempoTranscurrido < DURACION_PARPADEO;
  
  if (debeParpadear) {
    finEl.textContent = '¡Tiempo Terminado!';
    
    if (!parpadeoIntervals['single']) {
      let visible = true;
      parpadeoIntervals['single'] = setInterval(() => {
        displayEl.style.visibility = visible ? 'hidden' : 'visible';
        visible = !visible;
      }, 500);
      
      setTimeout(() => {
        if (parpadeoIntervals['single']) {
          clearInterval(parpadeoIntervals['single']);
          parpadeoIntervals['single'] = null;
          displayEl.style.visibility = 'visible';
        }
      }, DURACION_PARPADEO);
    }
  } else {
    finEl.textContent = '';
    if (parpadeoIntervals['single']) {
      clearInterval(parpadeoIntervals['single']);
      parpadeoIntervals['single'] = null;
      displayEl.style.visibility = 'visible';
    }
  }
}

function gestionarParpadeoMulti(contador, displayEl, finEl) {
  const tiempoTranscurrido = contador.tiempoFinalizacion ? (Date.now() - contador.tiempoFinalizacion) : 0;
  const debeParpadear = contador.tiempoRestante === 0 && 
                        contador.tiempoFinalizacion && 
                        tiempoTranscurrido < DURACION_PARPADEO;
  
  if (debeParpadear) {
    if (finEl) finEl.textContent = '¡Tiempo Terminado!';
    
    if (!parpadeoIntervals[contador.id]) {
      let visible = true;
      parpadeoIntervals[contador.id] = setInterval(() => {
        if (displayEl) displayEl.style.visibility = visible ? 'hidden' : 'visible';
        visible = !visible;
      }, 500);
      
      setTimeout(() => {
        if (parpadeoIntervals[contador.id]) {
          clearInterval(parpadeoIntervals[contador.id]);
          parpadeoIntervals[contador.id] = null;
          if (displayEl) displayEl.style.visibility = 'visible';
        }
      }, DURACION_PARPADEO);
    }
  } else {
    if (finEl) finEl.textContent = '';
    if (parpadeoIntervals[contador.id]) {
      clearInterval(parpadeoIntervals[contador.id]);
      parpadeoIntervals[contador.id] = null;
      if (displayEl) displayEl.style.visibility = 'visible';
    }
  }
}

function actualizarTablaMesas(mesas, config, container) {
  if (!mesas || mesas.length === 0) {
    if (container.innerHTML !== '') container.innerHTML = '';
    ultimoHashMesas = '';
    return;
  }
  
  const mesasActivas = mesas.filter(m => m.activa);
  if (mesasActivas.length === 0) {
    if (container.innerHTML !== '') container.innerHTML = '';
    ultimoHashMesas = '';
    return;
  }
  
  // Control de tiempo de visualización usando timestamp de INICIO DEL CONTADOR
  if (config && config.tiempoVisible !== null && config.tiempoVisible !== undefined) {
    // Hay un límite de tiempo configurado
    if (!config.timestampContadorInicio) {
      // El contador NO ha iniciado aún
      console.log(`⏸️ Mesas visibles - Contador no iniciado. Se ocultarán ${config.tiempoVisible}s después de iniciar.`);
      // Mostrar las mesas - se ocultarán cuando el contador inicie
    } else {
      // El contador ya inició, calcular tiempo transcurrido desde el inicio
      const tiempoTranscurrido = (Date.now() - config.timestampContadorInicio) / 1000;
      
      console.log(`⏱️ Tiempo mesas desde inicio de contador:`, {
        timestampInicio: config.timestampContadorInicio,
        timestampInicioDate: new Date(config.timestampContadorInicio).toLocaleString(),
        ahora: Date.now(),
        ahoraDate: new Date().toLocaleString(),
        transcurrido: Math.floor(tiempoTranscurrido),
        limite: config.tiempoVisible,
        debe_ocultar: tiempoTranscurrido > config.tiempoVisible
      });
      
      if (tiempoTranscurrido > config.tiempoVisible) {
        console.log(`🚫 Ocultando mesas: tiempo expirado (${Math.floor(tiempoTranscurrido)}s > ${config.tiempoVisible}s)`);
        if (container.innerHTML !== '') container.innerHTML = '';
        ultimoHashMesas = '';
        return;
      }
    }
  } else {
    // tiempoVisible es null/undefined → INDEFINIDO, mostrar siempre
    console.log(`♾️ Mesas configuradas como indefinidas (siempre visibles)`);
  }
  
  // Crear hash de las mesas + config para detectar cambios
  const hashData = JSON.stringify({
    mesas: mesasActivas.map(m => `${m.mesa}|${m.jugador1}|${m.jugador2}`),
    columnas: config?.columnas,
    altura: config?.altura,
    tituloMesa: config?.tituloMesa,
    tituloEmparejamiento: config?.tituloEmparejamiento
  });
  
  // Si no ha cambiado nada, no regenerar HTML
  if (hashData === ultimoHashMesas) {
    return;  // No hacer nada, evitar regeneración
  }
  
  // Guardar nuevo hash
  ultimoHashMesas = hashData;
  
  // Configuración visual
  const columnas = config?.columnas || 2;
  const altura = config?.altura || 30;
  
  // Debug: Mostrar configuración en consola
  console.log(`📋 Config Mesas (ACTUALIZADO):`, {
    columnas,
    altura,
    mesasActivas: mesasActivas.length,
    'config completo': config,
    'config.columnas específico': config?.columnas,
    'timestamp': new Date().toISOString()
  });
  
  // IMPORTANTE: Forzar recalculo de columnas
  const columnasReales = parseInt(columnas) || 2;
  console.log(`🔢 Columnas a usar: ${columnasReales}`);
  
  const colorCabecera = config?.colorCabecera || '#ff3b3b';
  const colorFondo = config?.colorFondo || '#141414';
  const colorNumero = config?.colorNumero || '#ff8800';
  const colorVS = config?.colorVS || '#ff3b3b';
  const tamCabecera = config?.tamCabecera || 2.5;
  const tamFilas = config?.tamFilas || 2.2;
  const tamNumero = config?.tamNumero || 2.5;
  const posicion = config?.posicion || 'bottom-center';
  const margen = config?.margen || 20;
  const ancho = config?.ancho || 90;
  const tituloMesa = config?.tituloMesa || 'Mesa';
  const tituloEmparejamiento = config?.tituloEmparejamiento || 'Emparejamiento';
  
  // Calcular altura uniforme de filas
  const mesasPorColumna = Math.ceil(mesasActivas.length / columnasReales);
  const alturaFilaPx = Math.max(25, Math.min(60, (altura * window.innerHeight / 100) / (mesasPorColumna + 1.5)));
  
  // Dividir mesas en columnasReales grupos
  const gruposMesas = [];
  for (let i = 0; i < columnasReales; i++) {
    gruposMesas.push([]);
  }
  
  // Distribuir mesas entre las columnas
  mesasActivas.forEach((mesa, index) => {
    const columnaIndex = index % columnasReales;
    gruposMesas[columnaIndex].push(mesa);
  });
  
  console.log(`📊 Distribución de mesas en ${columnasReales} columnas:`, gruposMesas.map(g => g.length));
  
  let html = '<div style="';
  
  // Posición
  if (posicion === 'top-left') html += `position:absolute; top:${margen}px; left:${margen}px;`;
  else if (posicion === 'top-center') html += `position:absolute; top:${margen}px; left:50%; transform:translateX(-50%);`;
  else if (posicion === 'top-right') html += `position:absolute; top:${margen}px; right:${margen}px;`;
  else if (posicion === 'bottom-left') html += `position:absolute; bottom:${margen}px; left:${margen}px;`;
  else if (posicion === 'bottom-center') html += `position:absolute; bottom:${margen}px; left:50%; transform:translateX(-50%);`;
  else if (posicion === 'bottom-right') html += `position:absolute; bottom:${margen}px; right:${margen}px;`;
  
  html += `width:${ancho}%; max-height:${altura}vh; overflow-y:auto; z-index:100; display:flex; gap:10px; flex-wrap:wrap; justify-content:center;">`;
  
  // Generar una tabla por cada columna
  gruposMesas.forEach((grupoMesas, colIndex) => {
    if (grupoMesas.length === 0) return; // Skip columnas vacías
    
    const anchoTabla = columnasReales === 1 ? '100%' : `calc(${100 / columnasReales}% - 10px)`;
    
    html += `<div style="flex:1; min-width:${anchoTabla}; max-width:${anchoTabla};">`;
    html += `<table style="width:100%; border-collapse:collapse; background:${colorFondo}; border-radius:5px; table-layout:fixed;">`;
    html += `<thead><tr style="background:${colorCabecera}; height:${alturaFilaPx * 1.2}px;">`;
    html += `<th class="header-mesa" style="padding:4px; font-size:${tamCabecera}vh; width:15%; text-align:center; vertical-align:middle; line-height:1.2; overflow:hidden;">${tituloMesa}</th>`;
    html += `<th class="header-emparejamiento" style="padding:4px; font-size:${tamCabecera}vh; width:85%; text-align:left; vertical-align:middle; line-height:1.2; overflow:hidden;">${tituloEmparejamiento}</th>`;
    html += `</tr></thead><tbody>`;
    
    grupoMesas.forEach(m => {
      let emparejamiento;
      if (m.jugador2 === '' || m.jugador2.toLowerCase() === 'bye') {
        emparejamiento = `${m.jugador1} <span style="color:#888; font-style:italic;">- BYE</span>`;
      } else {
        emparejamiento = `${m.jugador1} <span style="color:${colorVS}; font-weight:bold; padding:0 5px;">vs</span> ${m.jugador2}`;
      }
      
      html += `<tr style="border-bottom:1px solid #333; height:${alturaFilaPx}px;">`;
      html += `<td class="mesa-num" style="padding:4px; font-size:${tamNumero}vh; color:${colorNumero}; font-weight:bold; text-align:center; vertical-align:middle; line-height:1.2; overflow:hidden;">${m.mesa}</td>`;
      html += `<td class="emparejamiento-cell" style="padding:4px; font-size:${tamFilas}vh; text-align:left; vertical-align:middle; overflow:hidden;">`;
      html += `<div style="line-height:1.2; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${emparejamiento}</div>`;
      html += `</td></tr>`;
    });
    
    html += '</tbody></table></div>';
  });
  
  html += '</div>'; // Cerrar div contenedor principal
  
  container.innerHTML = html;
  
  // Auto-ajuste de fuente para headers y celdas
  setTimeout(() => {
    // Ajustar headers si se desbordan
    container.querySelectorAll('.header-mesa, .header-emparejamiento').forEach(header => {
      if (header.scrollWidth > header.clientWidth) {
        let fontSize = parseFloat(window.getComputedStyle(header).fontSize);
        while (header.scrollWidth > header.clientWidth && fontSize > 8) {
          fontSize -= 0.5;
          header.style.fontSize = fontSize + 'px';
        }
      }
    });
    
    // Ajustar celdas de emparejamiento
    container.querySelectorAll('.emparejamiento-cell').forEach(cell => {
      const div = cell.querySelector('div');
      if (div && div.scrollWidth > cell.clientWidth) {
        let fontSize = parseFloat(window.getComputedStyle(div).fontSize);
        while (div.scrollWidth > cell.clientWidth && fontSize > 8) {
          fontSize -= 0.5;
          div.style.fontSize = fontSize + 'px';
        }
      }
    });
    
    // Ajustar números de mesa si son muy largos
    container.querySelectorAll('.mesa-num').forEach(cell => {
      if (cell.scrollWidth > cell.clientWidth) {
        let fontSize = parseFloat(window.getComputedStyle(cell).fontSize);
        while (cell.scrollWidth > cell.clientWidth && fontSize > 8) {
          fontSize -= 0.5;
          cell.style.fontSize = fontSize + 'px';
        }
      }
    });
  }, 50);
}

// ==============================================
// INICIALIZAR
// ==============================================
setInterval(actualizar, 1000);
actualizar();