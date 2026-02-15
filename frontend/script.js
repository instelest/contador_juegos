const API = `${window.location.origin}/api`;
const contadorEl = document.getElementById('contador');
const textoEl = document.getElementById('textoContador');
const tablaMesasEl = document.getElementById('tablaMesas');
const audioPlayer = document.getElementById('audioPlayer');
const iconosContainer = document.getElementById('iconosContainer');
const logoContainer = document.getElementById('logoContainer');

let finEl = document.getElementById('finMensaje');
if(!finEl){
  finEl = document.createElement('div');
  finEl.id = 'finMensaje';
  finEl.style.fontSize = '8vh';
  finEl.style.color = '#ff0000';
  finEl.style.marginTop = '10px';
  document.getElementById('contadorContainer').appendChild(finEl);
}

let parpadeoInterval = null;
let audioReproducido = false;
const DURACION_PARPADEO = 30000;

function detenerParpadeo() {
  if(parpadeoInterval){
    clearInterval(parpadeoInterval);
    parpadeoInterval = null;
    contadorEl.style.visibility = 'visible';
  }
}

// Click en el contador para iniciar
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

// Actualizar logo con posicionamiento personalizado
function actualizarLogo(logo) {
  if (!logo || !logo.archivo) {
    logoContainer.innerHTML = '';
    return;
  }

  logoContainer.innerHTML = `<img src="/logos/${logo.archivo}" alt="Logo">`;
  
  // Aplicar posicionamiento personalizado
  const tamano = logo.tamano || 340;
  const posX = logo.posX || 10;
  const posY = logo.posY || 10;
  
  logoContainer.style.width = `${tamano}px`;
  logoContainer.style.left = `${posX}px`;
  logoContainer.style.top = `${posY}px`;
}

// Actualizar iconos dinámicos con posicionamiento XY
function actualizarIconos(iconos) {
  if (!iconos || iconos.length === 0) {
    iconosContainer.innerHTML = '';
    return;
  }

  iconos.forEach(icono => {
    if (!icono.visible) {
      const existente = document.getElementById(`icono-${icono.id}`);
      if (existente) existente.remove();
      return;
    }

    let img = document.getElementById(`icono-${icono.id}`);
    
    if (!img) {
      img = document.createElement('img');
      img.id = `icono-${icono.id}`;
      img.className = 'icono-dinamico';
      iconosContainer.appendChild(img);
    }

    img.src = `/iconos/${icono.archivo}`;
    img.style.width = `${icono.tamano}px`;
    img.style.height = 'auto';
    img.style.left = `${icono.posX}%`;
    img.style.top = `${icono.posY}%`;
  });

  // Eliminar iconos que ya no existen
  const iconosActuales = Array.from(iconosContainer.querySelectorAll('.icono-dinamico'));
  iconosActuales.forEach(img => {
    const id = img.id.replace('icono-', '');
    if (!iconos.find(i => i.id === id)) {
      img.remove();
    }
  });
}

async function actualizar(){
  try{
    // Obtener contadores visibles
    const resVisibles = await fetch(`${API}/contadores/visibles`);
    const dataVisibles = await resVisibles.json();

    // Si hay múltiples visibles → redirigir a multi
    if (dataVisibles.contadores && dataVisibles.contadores.length > 1) {
      window.location.href = '/multi.html';
      return;
    }

    // Usar el primer contador visible (no el que se está editando)
    const data = (dataVisibles.contadores && dataVisibles.contadores.length === 1)
      ? dataVisibles.contadores[0]
      : (await (await fetch(`${API}/status`)).json());

    // Texto: ocultar "Preparado para iniciar" si el contador está activo o terminó
    let textoMostrar = data.texto;
    if (textoMostrar === 'Preparado para iniciar' && (data.contadorActivo || data.tiempoFinalizacion)) {
      textoMostrar = '';
    }
    // Anteponer ronda si existe
    if (data.configMesas && data.configMesas.ronda) {
      textoEl.textContent = textoMostrar ? data.configMesas.ronda + ' - ' + textoMostrar : data.configMesas.ronda;
    } else {
      textoEl.textContent = textoMostrar;
    }

    // Contador
    let minutos = Math.floor(data.tiempoRestante/60);
    let segundos = data.tiempoRestante % 60;
    contadorEl.textContent = `${String(minutos).padStart(2,'0')}:${String(segundos).padStart(2,'0')}`;

    // Estilos
    contadorEl.style.color = data.colorContador;
    contadorEl.style.fontSize = data.tamanoContador;
    textoEl.style.color = data.colorTexto;
    textoEl.style.fontSize = data.tamanoTexto;
    if(data.colorFondo) document.body.style.backgroundColor = data.colorFondo;

    // Posición del contador
    const pos = data.posicionContador || { top: 50, left: 50 };
    const cont = document.getElementById('contadorContainer');
    cont.style.top = pos.top + '%';
    cont.style.left = pos.left + '%';
    cont.style.transform = 'translate(-50%, -50%)';

    // Actualizar logo
    actualizarLogo(data.logo);

    // Actualizar iconos
    actualizarIconos(data.iconos);

    // Control de audio
    if (data.audio && data.audio.reproduciendo && !audioReproducido) {
      if (data.audio.archivo) {
        audioPlayer.src = `/audio/${data.audio.archivo}`;
        audioPlayer.play().catch(e => console.error('Error reproduciendo audio:', e));
        audioReproducido = true;
      }
    }

    if (data.tiempoRestante > 0 && audioReproducido) {
      audioReproducido = false;
    }

    // Verificar si debe parpadear
    const tiempoTranscurrido = data.tiempoFinalizacion ? (Date.now() - data.tiempoFinalizacion) : 0;
    const debeParpadear = data.tiempoRestante === 0 && 
                          data.tiempoFinalizacion && 
                          tiempoTranscurrido < DURACION_PARPADEO;

    if(debeParpadear){
      finEl.textContent = '¡Tiempo Terminado!';
      
      if(!parpadeoInterval){
        let visible = true;
        parpadeoInterval = setInterval(()=>{
          contadorEl.style.visibility = visible ? 'hidden' : 'visible';
          visible = !visible;
        }, 500);
        
        setTimeout(detenerParpadeo, DURACION_PARPADEO);
      }
    } else {
      finEl.textContent = '';
      detenerParpadeo();
    }

    // Actualizar tabla de mesas con soporte para temporizador y ronda
    actualizarTablaMesas(data.mesas, data.configMesas);

  }catch(e){
    console.error(e);
  }
}

function actualizarTablaMesas(mesas, configMesas) {
  if (!mesas || mesas.length === 0) {
    tablaMesasEl.innerHTML = '';
    return;
  }

  // Verificar si deben mostrarse las mesas (temporizador)
  if (configMesas && configMesas.tiempoVisible !== null && configMesas.timestampContadorInicio) {
    const tiempoTranscurrido = (Date.now() - configMesas.timestampContadorInicio) / 1000;
    
    if (tiempoTranscurrido > configMesas.tiempoVisible) {
      tablaMesasEl.innerHTML = '';
      return;
    }
  }

  const mesasActivas = mesas.filter(m => m.activa);
  
  if (mesasActivas.length === 0) {
    tablaMesasEl.innerHTML = '';
    return;
  }

  const tituloMesa = (configMesas && configMesas.tituloMesa) || 'Mesa';
  const tituloEmparejamiento = (configMesas && configMesas.tituloEmparejamiento) || 'Emparejamiento';
  const columnas = (configMesas && configMesas.columnas) || 1;

  // Aplicar estilos de configMesas
  if (configMesas) {
    tablaMesasEl.style.width = (configMesas.ancho || 95) + '%';
    tablaMesasEl.style.maxHeight = (configMesas.altura || 30) + 'vh';
    tablaMesasEl.style.overflowY = 'auto';

    // Posición
    const posicion = configMesas.posicion || 'bottom-center';
    tablaMesasEl.style.position = 'absolute';
    tablaMesasEl.style.left = '50%';
    tablaMesasEl.style.transform = 'translateX(-50%)';
    if (posicion === 'top-center') {
      tablaMesasEl.style.top = (configMesas.margen || 20) + 'px';
      tablaMesasEl.style.bottom = 'auto';
    } else {
      tablaMesasEl.style.bottom = (configMesas.margen || 20) + 'px';
      tablaMesasEl.style.top = 'auto';
    }
  }

  // Dividir mesas en N grupos
  const grupos = [];
  for (let i = 0; i < columnas; i++) {
    grupos.push([]);
  }
  mesasActivas.forEach((m, idx) => {
    grupos[idx % columnas].push(m);
  });

  const colorCabecera = (configMesas && configMesas.colorCabecera) || '#ff3b3b';
  const colorFondoTabla = (configMesas && configMesas.colorFondo) || '#141414';
  const colorNumero = (configMesas && configMesas.colorNumero) || '#ff8800';
  const colorVS = (configMesas && configMesas.colorVS) || '#ff3b3b';
  const tamCabecera = (configMesas && configMesas.tamCabecera) || 2.5;
  const tamFilas = (configMesas && configMesas.tamFilas) || 2.2;
  const tamNumero = (configMesas && configMesas.tamNumero) || 2.5;

  let html = '<div class="tabla-container">';

  grupos.forEach(grupo => {
    html += `<table class="tabla-mesas" style="background-color:${colorFondoTabla};font-size:${tamFilas}vh;">
      <thead style="background-color:${colorCabecera};"><tr>
        <th style="font-size:${tamCabecera}vh;">${tituloMesa}</th>
        <th style="font-size:${tamCabecera}vh;">${tituloEmparejamiento}</th>
      </tr></thead><tbody>`;
    grupo.forEach(m => {
      let emparejamiento;
      if (m.jugador2 === '' || m.jugador2.toLowerCase() === 'bye') {
        emparejamiento = `${m.jugador1} <span class="bye">- BYE</span>`;
      } else {
        emparejamiento = `${m.jugador1} <span class="vs" style="color:${colorVS};">vs</span> ${m.jugador2}`;
      }
      html += `<tr>
        <td class="mesa-num" style="color:${colorNumero};font-size:${tamNumero}vh;">${m.mesa}</td>
        <td class="jugadores">${emparejamiento}</td>
      </tr>`;
    });
    html += '</tbody></table>';
  });

  html += '</div>';
  tablaMesasEl.innerHTML = html;
}

setInterval(actualizar, 1000);
actualizar();