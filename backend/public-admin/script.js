const API = `${window.location.origin}/api`;
const estadoEl = document.getElementById('estadoTiempo');

// ============================================
// Sistema de tabs
// ============================================
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Desactivar todos los tabs
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    // Activar tab seleccionado
    tab.classList.add('active');
    document.querySelector(`[data-content="${tabName}"]`).classList.add('active');
    
    // Si es el tab de biblioteca, cargarla
    if (tabName === 'biblioteca') {
      cargarBiblioteca();
    }
    
    // Si es el tab de iconos o audio, cargar biblioteca para selectores
    if (tabName === 'iconos' || tabName === 'audio') {
      fetch(`${API}/biblioteca`)
        .then(res => res.json())
        .then(data => actualizarSelectoresBiblioteca(data))
        .catch(console.error);
    }
  });
});

// Event listeners para cambiar entre subir y biblioteca
document.addEventListener('DOMContentLoaded', () => {
  // Iconos
  document.querySelectorAll('input[name="iconoOrigen"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'subir') {
        document.getElementById('iconoSubirDiv').style.display = 'block';
        document.getElementById('iconoBibliotecaDiv').style.display = 'none';
      } else {
        document.getElementById('iconoSubirDiv').style.display = 'none';
        document.getElementById('iconoBibliotecaDiv').style.display = 'block';
      }
    });
  });
  
  // Logos
  document.querySelectorAll('input[name="logoOrigen"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'subir') {
        document.getElementById('logoSubirDiv').style.display = 'block';
        document.getElementById('logoBibliotecaDiv').style.display = 'none';
      } else {
        document.getElementById('logoSubirDiv').style.display = 'none';
        document.getElementById('logoBibliotecaDiv').style.display = 'block';
      }
    });
  });
  
  // Audios
  document.querySelectorAll('input[name="audioOrigen"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'subir') {
        document.getElementById('audioSubirDiv').style.display = 'block';
        document.getElementById('audioBibliotecaDiv').style.display = 'none';
      } else {
        document.getElementById('audioSubirDiv').style.display = 'none';
        document.getElementById('audioBibliotecaDiv').style.display = 'block';
      }
    });
  });
});

// ============================================
// Biblioteca de archivos
// ============================================
async function cargarBiblioteca() {
  try {
    const res = await fetch(`${API}/biblioteca`);
    const data = await res.json();
    
    // Actualizar selectores de biblioteca
    actualizarSelectoresBiblioteca(data);
    
    // Iconos
    const iconosContainer = document.getElementById('bibliotecaIconos');
    iconosContainer.innerHTML = '';
    if (data.iconos && data.iconos.length > 0) {
      data.iconos.forEach(archivo => {
        const item = document.createElement('div');
        item.className = 'biblioteca-item';
        item.innerHTML = `
          <button class="delete" onclick="eliminarArchivoBiblioteca('iconos', '${archivo}')">🗑️</button>
          <button class="primary" onclick="renombrarArchivoBiblioteca('iconos', '${archivo}')" style="margin-bottom:5px;">✏️ Renombrar</button>
          <img src="/iconos/${archivo}" alt="${archivo}">
          <div class="nombre">${archivo}</div>
        `;
        iconosContainer.appendChild(item);
      });
    } else {
      iconosContainer.innerHTML = '<p style="text-align:center; color:#888;">No hay iconos</p>';
    }
    
    // Logos
    const logosContainer = document.getElementById('bibliotecaLogos');
    logosContainer.innerHTML = '';
    if (data.logos && data.logos.length > 0) {
      data.logos.forEach(archivo => {
        const item = document.createElement('div');
        item.className = 'biblioteca-item';
        item.innerHTML = `
          <button class="delete" onclick="eliminarArchivoBiblioteca('logos', '${archivo}')">🗑️</button>
          <button class="primary" onclick="renombrarArchivoBiblioteca('logos', '${archivo}')" style="margin-bottom:5px;">✏️ Renombrar</button>
          <img src="/logos/${archivo}" alt="${archivo}">
          <div class="nombre">${archivo}</div>
        `;
        logosContainer.appendChild(item);
      });
    } else {
      logosContainer.innerHTML = '<p style="text-align:center; color:#888;">No hay logos</p>';
    }
    
    // Audios
    const audiosContainer = document.getElementById('bibliotecaAudios');
    audiosContainer.innerHTML = '';
    if (data.audios && data.audios.length > 0) {
      data.audios.forEach(archivo => {
        const item = document.createElement('div');
        item.className = 'biblioteca-item';
        item.innerHTML = `
          <button class="delete" onclick="eliminarArchivoBiblioteca('audios', '${archivo}')">🗑️</button>
          <button class="primary" onclick="renombrarArchivoBiblioteca('audios', '${archivo}')" style="margin-bottom:5px;">✏️ Renombrar</button>
          <audio controls src="/audio/${archivo}"></audio>
          <div class="nombre">${archivo}</div>
        `;
        audiosContainer.appendChild(item);
      });
    } else {
      audiosContainer.innerHTML = '<p style="text-align:center; color:#888;">No hay audios</p>';
    }
  } catch (error) {
    console.error('Error cargando biblioteca:', error);
  }
}

function actualizarSelectoresBiblioteca(data) {
  // Selector de iconos
  const iconoSelect = document.getElementById('iconoBibliotecaSelect');
  if (iconoSelect) {
    iconoSelect.innerHTML = '<option value="">-- Seleccionar de biblioteca --</option>';
    if (data.iconos && data.iconos.length > 0) {
      data.iconos.forEach(archivo => {
        const option = document.createElement('option');
        option.value = archivo;
        option.textContent = archivo;
        iconoSelect.appendChild(option);
      });
    }
  }
  
  // Selector de logos
  const logoSelect = document.getElementById('logoBibliotecaSelect');
  if (logoSelect) {
    logoSelect.innerHTML = '<option value="">-- Seleccionar de biblioteca --</option>';
    if (data.logos && data.logos.length > 0) {
      data.logos.forEach(archivo => {
        const option = document.createElement('option');
        option.value = archivo;
        option.textContent = archivo;
        logoSelect.appendChild(option);
      });
    }
  }
  
  // Selector de audios
  const audioSelect = document.getElementById('audioBibliotecaSelect');
  if (audioSelect) {
    audioSelect.innerHTML = '<option value="">-- Seleccionar de biblioteca --</option>';
    if (data.audios && data.audios.length > 0) {
      data.audios.forEach(archivo => {
        const option = document.createElement('option');
        option.value = archivo;
        option.textContent = archivo;
        audioSelect.appendChild(option);
      });
    }
  }
}

window.eliminarArchivoBiblioteca = async (tipo, archivo) => {
  if (!confirm(`¿Eliminar ${archivo}?`)) return;
  
  try {
    await fetch(`${API}/biblioteca/${tipo}/${archivo}`, { method: 'DELETE' });
    cargarBiblioteca();
  } catch (error) {
    alert('Error al eliminar archivo');
  }
};

window.renombrarArchivoBiblioteca = async (tipo, archivoActual) => {
  // Obtener extensión del archivo actual
  const extension = archivoActual.match(/\.\w+$/);
  const extStr = extension ? extension[0] : '';
  
  // Sugerir un nombre base sin el prefijo timestamp
  let nombreSugerido = archivoActual;
  if (tipo === 'iconos') {
    nombreSugerido = archivoActual.replace(/^icono_\d+/, 'mi_icono');
  } else if (tipo === 'logos') {
    nombreSugerido = archivoActual.replace(/^logo_\d+/, 'mi_logo');
  } else if (tipo === 'audios') {
    nombreSugerido = archivoActual.replace(/^audio_\d+/, 'mi_audio');
  }
  
  const nuevoNombre = prompt(
    `Renombrar ${tipo.slice(0, -1)}:\n\nNombre actual: ${archivoActual}\nNuevo nombre:`, 
    nombreSugerido
  );
  
  if (!nuevoNombre || nuevoNombre.trim() === '' || nuevoNombre === archivoActual) {
    return;
  }
  
  // Agregar extensión si no la tiene
  const nombreCompleto = nuevoNombre.endsWith(extStr) ? nuevoNombre : nuevoNombre + extStr;
  
  if (nombreCompleto === archivoActual) {
    return;
  }
  
  try {
    const res = await fetch(`${API}/biblioteca/${tipo}/renombrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivoActual, nuevoNombre: nombreCompleto })
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert(`✅ Archivo renombrado a: ${nombreCompleto}`);
      cargarBiblioteca();
      actualizarEstado(); // Recargar estado por si hay referencias
    } else {
      alert(`❌ Error: ${data.message}`);
    }
  } catch (error) {
    console.error('Error renombrando archivo:', error);
    alert('❌ Error al renombrar archivo');
  }
};


// ============================================
// Gestión de contadores
// ============================================
async function cargarContadores() {
  try {
    const res = await fetch(`${API}/contadores`);
    const data = await res.json();
    
    const lista = document.getElementById('listaContadores');
    lista.innerHTML = '';
    
    const totalContadores = data.contadores.length;

    data.contadores.forEach(c => {
      const div = document.createElement('div');
      div.className = `contador-item ${c.activo ? 'activo' : ''}`;

      const visibleCheck = c.visible ? 'checked' : '';
      const puedeEliminar = totalContadores > 1;

      div.innerHTML = `
        <div>
          <strong id="nombre-${c.id}">${c.nombre}</strong>
          ${c.activo ? '<span style="color:#2a5;"> ✓ Editando</span>' : ''}
          <button onclick="renombrarContador('${c.id}')" style="margin-left:10px; padding:3px 8px; font-size:0.9em;">✏️ Renombrar</button>
          <br>
          <label style="margin-top:8px; display:inline-block;">
            <input type="checkbox" ${visibleCheck} onchange="toggleVisible('${c.id}', this.checked)">
            📺 Mostrar en pantalla
          </label>
        </div>
        <div>
          ${!c.activo ? `<button onclick="cambiarContador('${c.id}')">Editar</button>` : ''}
          <button onclick="gestionarMesas('${c.id}')">🎯 Mesas</button>
          <button onclick="guardarConfiguracion('${c.id}')">💾 Guardar Config</button>
          <button class="danger" onclick="eliminarContador('${c.id}')" ${!puedeEliminar ? 'disabled title="Debe haber al menos un contador"' : ''}>Eliminar</button>
        </div>
      `;
      
      lista.appendChild(div);
    });
  } catch (error) {
    console.error('Error cargando contadores:', error);
  }
}

window.renombrarContador = async (id) => {
  const nombreActual = document.getElementById(`nombre-${id}`).textContent;
  const nuevoNombre = prompt('Nuevo nombre para el contador:', nombreActual);
  
  if (!nuevoNombre || nuevoNombre.trim() === '') return;
  if (nuevoNombre === nombreActual) return;
  
  try {
    const res = await fetch(`${API}/contadores/${id}/nombre`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoNombre })
    });
    const data = await res.json();
    
    if (data.success) {
      cargarContadores();
      actualizarEstado();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    alert('Error al renombrar contador');
  }
};

window.gestionarMesas = async (id) => {
  await cambiarContador(id);
  document.querySelector('[data-tab="mesas"]').click();
  alert(`Ahora puedes cargar mesas para este contador. Las mesas se guardarán independientemente para cada torneo.`);
};

window.toggleVisible = async (id, visible) => {
  try {
    const res = await fetch(`${API}/contadores`);
    const data = await res.json();
    
    let visibles = data.visibles || [];
    
    if (visible) {
      if (!visibles.includes(id)) visibles.push(id);
    } else {
      visibles = visibles.filter(cid => cid !== id);
    }
    
    await fetch(`${API}/contadores/visibles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: visibles })
    });
    
    cargarContadores();
  } catch (error) {
    alert('Error cambiando visibilidad');
  }
};

window.guardarConfiguracion = async (contadorId) => {
  const nombre = prompt('Nombre para esta configuración:');
  if (!nombre) return;
  
  try {
    const res = await fetch(`${API}/configuraciones/guardar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, contadorId })
    });
    const data = await res.json();
    
    if (data.success) {
      alert('Configuración guardada correctamente');
      cargarConfiguraciones();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    alert('Error guardando configuración');
  }
};

window.cambiarContador = async (id) => {
  try {
    await fetch(`${API}/contadores/cambiar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    cargarContadores();
    actualizarEstado();
    cargarIconos();
    cargarMesasActuales();
  } catch (error) {
    alert('Error al cambiar contador');
  }
};

window.eliminarContador = async (id) => {
  if (!confirm('¿Eliminar este contador? Se perderán todos sus datos.')) return;

  try {
    const res = await fetch(`${API}/contadores/${id}`, { method: 'DELETE' });
    const data = await res.json();

    if (!data.success) {
      alert('No se pudo eliminar: ' + data.message);
      return;
    }

    cargarContadores();
    actualizarEstado();
    cargarIconos();
    cargarMesasActuales();
  } catch (error) {
    alert('Error al eliminar contador');
  }
};

document.getElementById('crearContadorBtn').addEventListener('click', async () => {
  const nombre = document.getElementById('nuevoContadorNombre').value.trim();
  if (!nombre) {
    alert('Introduce un nombre para el contador');
    return;
  }
  
  try {
    const res = await fetch(`${API}/contadores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre })
    });
    const data = await res.json();
    
    if (data.success) {
      document.getElementById('nuevoContadorNombre').value = '';
      cargarContadores();
      alert(`Contador "${nombre}" creado correctamente`);
    }
  } catch (error) {
    alert('Error al crear contador');
  }
});

// ============================================
// Gestión de iconos
// ============================================
async function cargarIconos() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    
    const lista = document.getElementById('listaIconos');
    lista.innerHTML = '<h3>Iconos actuales:</h3>';
    
    if (!data.iconos || data.iconos.length === 0) {
      lista.innerHTML += '<p style="text-align:center; color:#888;">No hay iconos configurados</p>';
      return;
    }
    
    data.iconos.forEach(icono => {
      const div = document.createElement('div');
      div.className = 'icono-item';
      
      div.innerHTML = `
        <img src="/iconos/${icono.archivo}" class="icono-preview">
        <div class="icono-controls">
          <div><strong>${icono.nombre}</strong></div>
          <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
            <label>Tamaño: <input type="number" value="${icono.tamano}" min="20" max="500"
              onchange="actualizarIcono('${icono.id}', 'tamano', this.value)"></label>
            <label>X: <input type="number" value="${icono.posX}" min="0" max="100" id="iconoPosX-${icono.id}"
              onchange="actualizarIcono('${icono.id}', 'posX', this.value)"></label>
            <span style="display:inline-flex; gap:4px;">
              <button class="btn-cruceta" onclick="ajustarIconoPos('${icono.id}', 'posX', -1)">◄</button>
              <button class="btn-cruceta" onclick="ajustarIconoPos('${icono.id}', 'posX', 1)">►</button>
            </span>
            <label>Y: <input type="number" value="${icono.posY}" min="0" max="100" id="iconoPosY-${icono.id}"
              onchange="actualizarIcono('${icono.id}', 'posY', this.value)"></label>
            <span style="display:inline-flex; gap:4px;">
              <button class="btn-cruceta" onclick="ajustarIconoPos('${icono.id}', 'posY', -1)">▲</button>
              <button class="btn-cruceta" onclick="ajustarIconoPos('${icono.id}', 'posY', 1)">▼</button>
            </span>
          </div>
          <div>
            <label>
              <input type="checkbox" ${icono.visible ? 'checked' : ''}
                onchange="actualizarIcono('${icono.id}', 'visible', this.checked)">
              Visible
            </label>
          </div>
        </div>
        <button class="danger" onclick="eliminarIcono('${icono.id}')">Eliminar</button>
      `;
      
      lista.appendChild(div);
    });
  } catch (error) {
    console.error('Error cargando iconos:', error);
  }
}

window.ajustarIconoPos = async (id, campo, delta) => {
  const input = document.getElementById(`icono${campo === 'posX' ? 'PosX' : 'PosY'}-${id}`);
  if (!input) return;
  const nuevoValor = Math.max(0, Math.min(100, parseInt(input.value) + delta));
  input.value = nuevoValor;
  await actualizarIcono(id, campo, nuevoValor);
};

window.actualizarIcono = async (id, campo, valor) => {
  try {
    const body = {};
    body[campo] = campo === 'visible' ? valor : parseInt(valor);
    
    await fetch(`${API}/iconos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  } catch (error) {
    console.error('Error actualizando icono:', error);
  }
};

window.eliminarIcono = async (id) => {
  if (!confirm('¿Eliminar este icono?')) return;
  
  try {
    await fetch(`${API}/iconos/${id}`, { method: 'DELETE' });
    cargarIconos();
  } catch (error) {
    alert('Error al eliminar icono');
  }
};

document.getElementById('subirIconoBtn').addEventListener('click', async () => {
  const origen = document.querySelector('input[name="iconoOrigen"]:checked').value;
  const nombre = document.getElementById('iconoNombre').value || 'Icono';
  const tamano = document.getElementById('iconoTamano').value;
  const posX = document.getElementById('iconoPosX').value;
  const posY = document.getElementById('iconoPosY').value;
  
  if (origen === 'subir') {
    const fileInput = document.getElementById('iconoFile');
    if (!fileInput.files[0]) {
      alert('Selecciona una imagen primero');
      return;
    }

    const formData = new FormData();
    formData.append('icono', fileInput.files[0]);
    formData.append('nombre', nombre);
    formData.append('tamano', tamano);
    formData.append('posX', posX);
    formData.append('posY', posY);

    try {
      const res = await fetch(`${API}/iconos`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Icono subido correctamente');
        fileInput.value = '';
        document.getElementById('iconoNombre').value = '';
        cargarIconos();
      }
    } catch (error) {
      alert('Error al subir icono');
    }
  } else {
    // Seleccionar desde biblioteca
    const archivo = document.getElementById('iconoBibliotecaSelect').value;
    if (!archivo) {
      alert('Selecciona un icono de la biblioteca');
      return;
    }
    
    try {
      const res = await fetch(`${API}/iconos/desde-biblioteca`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archivo, nombre, tamano, posX, posY })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Icono añadido correctamente');
        document.getElementById('iconoNombre').value = '';
        cargarIconos();
      }
    } catch (error) {
      alert('Error al añadir icono');
    }
  }
});

// ============================================
// Gestión de Logo
// ============================================
document.getElementById('subirLogoBtn').addEventListener('click', async () => {
  const origen = document.querySelector('input[name="logoOrigen"]:checked').value;
  
  if (origen === 'subir') {
    const fileInput = document.getElementById('logoFile');
    if (!fileInput.files[0]) {
      alert('Selecciona una imagen primero');
      return;
    }

    const formData = new FormData();
    formData.append('logo', fileInput.files[0]);

    try {
      const res = await fetch(`${API}/logo`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Logo actualizado correctamente');
        fileInput.value = '';
        document.getElementById('logoPreview').src = `/logo.png?t=${Date.now()}`;
      }
    } catch (error) {
      alert('Error al subir logo');
    }
  } else {
    // Seleccionar desde biblioteca
    const archivo = document.getElementById('logoBibliotecaSelect').value;
    if (!archivo) {
      alert('Selecciona un logo de la biblioteca');
      return;
    }
    
    try {
      const res = await fetch(`${API}/logo/desde-biblioteca`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archivo })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Logo actualizado correctamente');
        document.getElementById('logoPreview').src = `/logo.png?t=${Date.now()}`;
      }
    } catch (error) {
      alert('Error al actualizar logo');
    }
  }
});

// ============================================
// Control de tiempo y estado
// ============================================
function formatoTiempo(segundos){
  const m = Math.floor(segundos/60);
  const s = segundos % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

async function actualizarEstado(){
  try{
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    estadoEl.textContent = `Tiempo restante: ${formatoTiempo(data.tiempoRestante)} | Estado: ${data.contadorActivo ? 'Activo':'Detenido'}`;
    if(data.tiempoFinalizacion) estadoEl.textContent += ' | ¡Tiempo terminado!';
    document.title = `Contador: ${formatoTiempo(data.tiempoRestante)}`;
    document.getElementById('tituloPanel').textContent = `Panel de Control - ${formatoTiempo(data.tiempoRestante)}`;
    
    // Audio status se actualiza en actualizarEstadoAudio()
  }catch(e){
    estadoEl.textContent = 'Error al conectar con el servidor';
  }
}

setInterval(actualizarEstado,1000);
actualizarEstado();
cargarContadores();
cargarIconos();
cargarConfiguraciones();
cargarOrientacion();
actualizarEstadoAudio(); // Cargar estado del audio
cargarBibliotecaAudios(); // Cargar lista de audios disponibles

// ============================================
// Control de orientación
// ============================================
async function cargarOrientacion() {
  try {
    const res = await fetch(`${API}/contadores/visibles`);
    const data = await res.json();
    
    const orientacion = data.orientacion || 'horizontal';
    
    if (orientacion === 'horizontal') {
      document.getElementById('orientacionH').checked = true;
    } else {
      document.getElementById('orientacionV').checked = true;
    }
  } catch (error) {
    console.error('Error cargando orientación:', error);
  }
}

document.querySelectorAll('input[name="orientacion"]').forEach(radio => {
  radio.addEventListener('change', async (e) => {
    try {
      await fetch(`${API}/contadores/orientacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orientacion: e.target.value })
      });
    } catch (error) {
      console.error('Error cambiando orientación:', error);
    }
  });
});

// ============================================
// Gestión de configuraciones guardadas
// ============================================
async function cargarConfiguraciones() {
  try {
    const res = await fetch(`${API}/configuraciones`);
    const data = await res.json();
    
    const contenedor = document.getElementById('listaConfiguraciones');
    if (!contenedor) return;
    
    if (!data.configuraciones || data.configuraciones.length === 0) {
      contenedor.innerHTML = '<p style="text-align:center; color:#888;">No hay configuraciones guardadas</p>';
      return;
    }
    
    contenedor.innerHTML = '<h3>Configuraciones guardadas:</h3>';
    
    data.configuraciones.forEach(config => {
      const div = document.createElement('div');
      div.className = 'config-item';
      
      const fecha = new Date(config.fecha).toLocaleString('es-ES');
      
      div.innerHTML = `
        <div>
          <strong>${config.nombre}</strong><br>
          <small>Torneo: ${config.contadorNombre} | Guardado: ${fecha}</small>
        </div>
        <div>
          <button class="primary" onclick="cargarConfig('${config.id}')">🔥 Cargar en actual</button>
          <button onclick="crearDesdePlantilla('${config.id}', '${config.nombre.replace(/'/g, "\\'")}')">+ Nuevo contador</button>
          <button class="danger" onclick="eliminarConfig('${config.id}')">🗑️</button>
        </div>
      `;
      
      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error('Error cargando configuraciones:', error);
  }
}

window.cargarConfig = async (configId) => {
  if (!confirm('¿Cargar esta configuración en el contador actual? Se sobrescribirá la configuración actual.')) return;
  
  try {
    const res = await fetch(`${API}/configuraciones/cargar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configId })
    });
    const data = await res.json();
    
    if (data.success) {
      alert('Configuración cargada correctamente');
      actualizarEstado();
      cargarIconos();
      cargarMesasActuales();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    alert('Error cargando configuración');
  }
};

window.crearDesdePlantilla = async (configId, configNombre) => {
  const nombre = prompt('Nombre para el nuevo contador:', `${configNombre} (copia)`);
  if (!nombre || nombre.trim() === '') return;

  try {
    const res = await fetch(`${API}/contadores/desde-plantilla`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ configId, nombre: nombre.trim() })
    });
    const data = await res.json();

    if (data.success) {
      alert(`Contador "${data.nombre}" creado correctamente`);
      cargarContadores();
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    alert('Error creando contador desde plantilla');
  }
};

window.eliminarConfig = async (configId) => {
  if (!confirm('¿Eliminar esta configuración permanentemente?')) return;
  
  try {
    await fetch(`${API}/configuraciones/${configId}`, { method: 'DELETE' });
    alert('Configuración eliminada');
    cargarConfiguraciones();
  } catch (error) {
    alert('Error eliminando configuración');
  }
};

document.getElementById('startBtn').addEventListener('click',()=>fetch(`${API}/start`,{method:'POST'}));
document.getElementById('stopBtn').addEventListener('click',()=>fetch(`${API}/stop`,{method:'POST'}));
document.getElementById('resetBtn').addEventListener('click',()=>fetch(`${API}/reset`,{method:'POST'}));

document.querySelectorAll('.setTiempo').forEach(btn=>{
  btn.addEventListener('click', async ()=>{
    const minutos = parseInt(btn.dataset.minutos);
    await fetch(`${API}/setTime`, {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({ tiempo:minutos*60, iniciar:false })
    });
  });
});

document.getElementById('customBtn').addEventListener('click', async ()=>{
  const h = parseInt(document.getElementById('customHoras').value)||0;
  const m = parseInt(document.getElementById('customMinutos').value)||0;
  const s = parseInt(document.getElementById('customSegundos').value)||0;
  const total = h*3600 + m*60 + s;
  await fetch(`${API}/setTime`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ tiempo: total, iniciar:false })
  });
});

document.getElementById('setTextBtn').addEventListener('click', async ()=>{
  const texto = document.getElementById('textoInput').value;
  await fetch(`${API}/texto`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({ texto })
  });
});

document.getElementById('setStyleBtn').addEventListener('click', async ()=>{
  const data = {
    colorContador: document.getElementById('colorContador').value,
    tamanoContador: document.getElementById('tamanoContador').value+'vh',
    colorTexto: document.getElementById('colorTexto').value,
    tamanoTexto: document.getElementById('tamanoTexto').value+'vh',
    colorFondo: document.getElementById('colorFondo').value
  };
  await fetch(`${API}/estilo`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(data)});
});

// ============================================
// Control de tamaño de texto
// ============================================
let tamanoTextoActual = 10;

window.ajustarTamanoTexto = async function(delta) {
  tamanoTextoActual = Math.max(1, Math.min(30, tamanoTextoActual + delta));
  document.getElementById('tamanoTextoSlider').value = tamanoTextoActual;
  document.getElementById('tamanoTexto').value = tamanoTextoActual;
  document.getElementById('tamanoTextoValue').textContent = tamanoTextoActual;
  await fetch(`${API}/estilo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tamanoTexto: tamanoTextoActual + 'vh' })
  });
};

window.setTamanoTextoDirecto = async function(tamano) {
  tamanoTextoActual = tamano;
  document.getElementById('tamanoTextoSlider').value = tamano;
  document.getElementById('tamanoTexto').value = tamano;
  document.getElementById('tamanoTextoValue').textContent = tamano;
  await fetch(`${API}/estilo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tamanoTexto: tamano + 'vh' })
  });
};

window.actualizarTamanoTextoSlider = async function(value) {
  tamanoTextoActual = parseInt(value);
  document.getElementById('tamanoTexto').value = tamanoTextoActual;
  document.getElementById('tamanoTextoValue').textContent = tamanoTextoActual;
  await fetch(`${API}/estilo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tamanoTexto: tamanoTextoActual + 'vh' })
  });
};

// Cargar tamaño de texto actual al cambiar al tab de estilos
document.querySelector('[data-tab="estilos"]').addEventListener('click', async () => {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    tamanoTextoActual = parseInt(data.tamanoTexto) || 10;
    document.getElementById('tamanoTextoSlider').value = tamanoTextoActual;
    document.getElementById('tamanoTexto').value = tamanoTextoActual;
    document.getElementById('tamanoTextoValue').textContent = tamanoTextoActual;
  } catch(e) {}
});

// ============================================
// Audio
// ============================================
document.getElementById('uploadAudioBtn').addEventListener('click', async () => {
  const origen = document.querySelector('input[name="audioOrigen"]:checked').value;
  const modo = document.querySelector('input[name="audioModo"]:checked').value;
  const segundosAntes = parseInt(document.getElementById('audioSegundosAntes').value) || 30;
  
  if (origen === 'subir') {
    const fileInput = document.getElementById('audioFile');
    if (!fileInput.files[0]) {
      alert('Selecciona un archivo de audio primero');
      return;
    }

    const formData = new FormData();
    formData.append('audio', fileInput.files[0]);
    formData.append('modo', modo);
    formData.append('segundosAntes', segundosAntes);

    try {
      const res = await fetch(`${API}/upload-audio`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        let mensaje = `Audio subido correctamente. Duración: ${data.duracion}s - Modo: `;
        if (modo === 'final') {
          mensaje += 'Al final (00:00)';
        } else {
          mensaje += `${data.segundosAntes}s antes del final`;
        }
        alert(mensaje);
        fileInput.value = '';
        actualizarEstadoAudio();
      }
    } catch (error) {
      alert('Error al subir audio');
    }
  } else {
    // Seleccionar desde biblioteca
    const archivo = document.getElementById('audioBibliotecaSelect').value;
    if (!archivo) {
      alert('Selecciona un audio de la biblioteca');
      return;
    }
    
    try {
      const res = await fetch(`${API}/audio/desde-biblioteca`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archivo, modo, segundosAntes })
      });
      const data = await res.json();
      
      if (data.success) {
        let mensaje = `Audio configurado correctamente. Duración: ${data.duracion}s - Modo: `;
        if (modo === 'final') {
          mensaje += 'Al final (00:00)';
        } else {
          mensaje += `${data.segundosAntes}s antes del final`;
        }
        alert(mensaje);
        actualizarEstadoAudio();
      }
    } catch (error) {
      alert('Error al configurar audio');
    }
  }
});

// ============================================
// Funciones Helper para Audio
// ============================================

// Función para establecer segundos antes del final
window.setAudioSegundos = function(segundos) {
  document.getElementById('audioSegundosAntes').value = segundos;
  
  // Actualizar botones activos
  document.querySelectorAll('#audioSegundosConfig .tiempo-btn').forEach(btn => {
    btn.classList.remove('primary', 'active');
  });
  if (event && event.target) {
    event.target.classList.add('primary', 'active');
  }
};

// Mostrar/ocultar sección de segundos según modo
document.querySelectorAll('input[name="audioModo"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const config = document.getElementById('audioSegundosConfig');
    if (e.target.value === 'antes_final') {
      config.style.display = 'block';
    } else {
      config.style.display = 'none';
    }
  });
});

// Mostrar/ocultar sección de upload vs biblioteca
document.querySelectorAll('input[name="audioOrigen"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    if (e.target.value === 'subir') {
      document.getElementById('audioSubirDiv').style.display = 'block';
      document.getElementById('audioBibliotecaDiv').style.display = 'none';
    } else {
      document.getElementById('audioSubirDiv').style.display = 'none';
      document.getElementById('audioBibliotecaDiv').style.display = 'block';
    }
  });
});

// Función para actualizar el estado visual del audio
async function actualizarEstadoAudio() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    
    if (data.audio && data.audio.archivo) {
      document.getElementById('audioArchivoActual').textContent = data.audio.archivo;
      document.getElementById('audioDuracionActual').textContent = `${data.audio.duracion} segundos`;
      
      let modoTexto = '';
      if (data.audio.modo === 'final') {
        modoTexto = '🏁 Al final del contador (00:00)';
        document.getElementById('audioSegundosInfo').style.display = 'none';
      } else {
        modoTexto = '⏰ Antes del final';
        document.getElementById('audioSegundosInfo').style.display = 'block';
        document.getElementById('audioSegundosActual').textContent = `${data.audio.segundosAntes} segundos antes de que termine`;
      }
      
      document.getElementById('audioModoActual').textContent = modoTexto;
      
      // Cambiar el borde para indicar que hay audio
      document.getElementById('audioStatusDetallado').style.borderLeftColor = '#2a5';
    } else {
      document.getElementById('audioArchivoActual').textContent = 'Ninguno';
      document.getElementById('audioDuracionActual').textContent = '-';
      document.getElementById('audioModoActual').textContent = '-';
      document.getElementById('audioSegundosInfo').style.display = 'none';
      document.getElementById('audioStatusDetallado').style.borderLeftColor = '#888';
    }
  } catch (e) {
    console.error('Error actualizando estado de audio:', e);
  }
}

// Función para cargar biblioteca de audios
async function cargarBibliotecaAudios() {
  try {
    const res = await fetch(`${API}/audio/biblioteca`);
    const data = await res.json();
    
    const select = document.getElementById('audioBibliotecaSelect');
    select.innerHTML = '<option value="">-- Seleccionar audio --</option>';
    
    if (data.audios && data.audios.length > 0) {
      data.audios.forEach(audio => {
        const option = document.createElement('option');
        option.value = audio.nombre;
        option.textContent = audio.nombre;
        select.appendChild(option);
      });
    }
  } catch (e) {
    console.error('Error cargando biblioteca de audios:', e);
  }
}


// ============================================
// Eventos de Audio
// ============================================

document.getElementById('deleteAudioBtn').addEventListener('click', async () => {
  if (!confirm('¿Seguro que quieres eliminar el audio?')) return;
  
  try {
    const res = await fetch(`${API}/audio`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      alert('Audio eliminado');
      actualizarEstadoAudio();
    }
  } catch (error) {
    alert('Error al eliminar audio');
  }
});

// ============================================
// Parser de mesas con soporte UTF-8
// ============================================

/**
 * Convierte "Apellidos, Nombre" + "Nick" a "Nick - Nombre Apellidos"
 * Ejemplos:
 *   convertirNombreFormato("Meijide, Pedro", "Erjam")
 *     → "Erjam - Pedro Meijide"
 *
 *   convertirNombreFormato("Silvela Sánchez, Francisco Javier", "Silvela")
 *     → "Silvela - Francisco Javier Silvela Sánchez"
 */
function convertirNombreFormato(nombreApellidos, nick) {
  if (!nick) {
    const partes = nombreApellidos.split(',').map(p => p.trim());
    if (partes.length === 2) {
      return `${partes[1]} ${partes[0]}`;
    }
    return nombreApellidos;
  }

  const partes = nombreApellidos.split(',').map(p => p.trim());

  if (partes.length !== 2) {
    return `${nick} - ${nombreApellidos}`;
  }

  const apellidos = partes[0];
  const nombre = partes[1];

  return `${nick} - ${nombre} ${apellidos}`;
}

function parsearTextoTorneo(texto) {
  const emparejamientos = [];
  let ronda = null;  // Detectar la ronda
  
  // Limpiar y dividir en líneas, eliminando vacías
  const lineas = texto.split('\n')
    .map(l => l.replace(/\t/g, '').trim())  // Eliminar tabs y trimear
    .filter(l => l.length > 0);  // Solo líneas no vacías
  
  console.log(`📝 Analizando ${lineas.length} líneas...`);
  
  // Detectar ronda: priorizar "Round X (In Progress)" o "Round X in progress"
  for (const linea of lineas) {
    const matchActiva = linea.match(/^Round\s+(\d+)\s*(?:\(In Progress\)|in progress)$/i);
    if (matchActiva) {
      ronda = `Round ${matchActiva[1]}`;
      console.log(`🎯 Ronda activa detectada: ${ronda}`);
      break;
    }
  }
  // Si no hay ronda activa, buscar "Round X in progress" como texto suelto
  if (!ronda) {
    for (const linea of lineas) {
      const matchRonda = linea.match(/Round\s+(\d+)\s+in\s+progress/i);
      if (matchRonda) {
        ronda = `Round ${matchRonda[1]}`;
        console.log(`🎯 Ronda detectada por texto: ${ronda}`);
        break;
      }
    }
  }
  
  // Palabras clave a ignorar
  const ignorar = /^(organize|events|games|organization|settings|documentation|support|admin|details|players|standings|pairings|tournament|controls|control|rounds|phases|and|message|por|favor|se|dan|minutos|tras|ese|tiempo|matches|status|round|in|progress|swiss|phase|upcoming|view|manage|result|actions|record|judge|at|table|page|of|row|rows|selected|riftbound|summoner|skirmish|january)$/i;
  
  let i = 0;
  while (i < lineas.length) {
    const linea = lineas[i];
    
    console.log(`[${i}] "${linea}"`);
    
    // Ignorar palabras clave
    if (ignorar.test(linea)) {
      console.log(`  → Ignorar palabra clave`);
      i++;
      continue;
    }
    
    // Detectar "No table" (BYE)
    if (linea.match(/^no\s+table$/i)) {
      console.log(`  → NO TABLE detectado`);
      i++;
      
      // Buscar el nombre del jugador (tiene coma)
      while (i < lineas.length && !lineas[i].includes(',')) {
        if (ignorar.test(lineas[i])) {
          i++;
          continue;
        }
        i++;
      }
      
      if (i >= lineas.length) {
        i++;
        continue;
      }
      
      const nombre = lineas[i];
      console.log(`  → Nombre BYE: "${nombre}"`);
      i++;
      
      // Buscar el nick (no tiene coma, no es estadística)
      let nick = '';
      if (i < lineas.length && 
          !lineas[i].includes(',') && 
          !lineas[i].match(/^\(\d+\)\s+\d+-\d+-\d+$/) &&
          !lineas[i].match(/has\s+a\s+bye/i) &&
          !ignorar.test(lineas[i])) {
        nick = lineas[i];
        console.log(`  → Nick BYE: "${nick}"`);
        i++;
      }
      
      // Saltar hasta "has a bye"
      while (i < lineas.length && !lineas[i].match(/has\s+a\s+bye/i)) {
        i++;
      }
      
      // NUEVO FORMATO: Nick Nombre Apellidos
      const jugador = convertirNombreFormato(nombre, nick);
      emparejamientos.push({
        mesa: 0,
        jugador1: jugador,
        jugador2: 'BYE',
        activa: true
      });
      console.log(`  ✅ BYE: ${jugador}`);
      
      i++; // Saltar "has a bye"
      continue;
    }
    
    // Detectar "Table X"
    const matchTable = linea.match(/^table\s+(\d+)$/i);
    if (matchTable) {
      const mesa = parseInt(matchTable[1]);
      console.log(`  → TABLE ${mesa} detectado`);
      i++;
      
      const jugadores = [];
      
      // Leer 2 jugadores
      for (let j = 0; j < 2; j++) {
        // Buscar nombre (tiene coma)
        while (i < lineas.length && !lineas[i].includes(',')) {
          if (ignorar.test(lineas[i]) || lineas[i].match(/^\(\d+\)\s+\d+-\d+-\d+$/)) {
            i++;
            continue;
          }
          break;
        }
        
        if (i >= lineas.length || !lineas[i].includes(',')) {
          break;
        }
        
        const nombre = lineas[i];
        console.log(`  → Jugador ${j+1} nombre: "${nombre}"`);
        i++;
        
        // Buscar nick (no tiene coma, no es estadística, no es "Table")
        let nick = '';
        if (i < lineas.length && 
            !lineas[i].includes(',') && 
            !lineas[i].match(/^\(\d+\)\s+\d+-\d+-\d+$/) &&
            !lineas[i].match(/^table\s+\d+$/i) &&
            !ignorar.test(lineas[i])) {
          nick = lineas[i];
          console.log(`  → Jugador ${j+1} nick: "${nick}"`);
          i++;
        }
        
        jugadores.push({ nombre, nick });
        
        // Saltar estadísticas
        while (i < lineas.length && lineas[i].match(/^\(\d+\)\s+\d+-\d+-\d+$/)) {
          i++;
        }
      }
      
      // Crear emparejamiento si tenemos 2 jugadores
      if (jugadores.length === 2) {
        // NUEVO FORMATO: Nick Nombre Apellidos
        const j1 = convertirNombreFormato(jugadores[0].nombre, jugadores[0].nick);
        const j2 = convertirNombreFormato(jugadores[1].nombre, jugadores[1].nick);
        
        emparejamientos.push({
          mesa,
          jugador1: j1,
          jugador2: j2,
          activa: true
        });
        
        console.log(`  ✅ Mesa ${mesa}: ${j1} vs ${j2}`);
      } else {
        console.log(`  ⚠️ Mesa ${mesa}: Solo ${jugadores.length} jugador(es)`);
      }
      
      continue;
    }
    
    i++;
  }
  
  console.log(`\n✅ RESULTADO: ${emparejamientos.length} emparejamientos detectados`);
  
  // Retornar emparejamientos y ronda
  return { emparejamientos, ronda };
}

document.getElementById('parseMesasBtn').addEventListener('click', async () => {
  const texto = document.getElementById('mesasInput').value.trim();
  if (!texto) {
    alert('Pega el texto del torneo en el área de texto');
    return;
  }

  const resultado = parsearTextoTorneo(texto);
  let emparejamientos = resultado.emparejamientos;
  const ronda = resultado.ronda;
  
  if (ronda) {
    console.log(`✅ Ronda detectada: ${ronda}`);
  }
  
  if (emparejamientos.length === 0) {
    const lineas = texto.split('\n').filter(l => l.trim() && l.includes('|'));
    
    for (const linea of lineas) {
      const partes = linea.split('|').map(p => p.trim());
      if (partes.length >= 2) {
        emparejamientos.push({
          mesa: parseInt(partes[0]),
          jugador1: partes[1] || '',
          jugador2: partes[2] || '',
          activa: true
        });
      }
    }
  }

  if (emparejamientos.length === 0) {
    alert('No se pudieron detectar mesas en el texto.');
    return;
  }

  try {
    const res = await fetch(`${API}/create-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emparejamientos, ronda })
    });
    const data = await res.json();
    
    if (data.ok) {
      // Escribir la ronda en el campo de texto para que sea editable
      if (ronda) {
        const textoRonda = `🎯 ${ronda}`;
        document.getElementById('textoInput').value = textoRonda;
        await fetch(`${API}/texto`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texto: textoRonda })
        });
      }
      alert(`${emparejamientos.length} mesas cargadas correctamente`);
      mostrarPreviewMesas(data.mesas);
    }
  } catch (error) {
    alert('Error al cargar mesas');
  }
});

document.getElementById('clearMesasBtn').addEventListener('click', async () => {
  if (!confirm('¿Seguro que quieres limpiar todas las mesas?')) return;
  
  try {
    await fetch(`${API}/mesas`, { method: 'DELETE' });
    alert('Mesas limpiadas');
    document.getElementById('mesasPreview').innerHTML = '';
    document.getElementById('mesasInput').value = '';
  } catch (error) {
    alert('Error al limpiar mesas');
  }
});

function mostrarPreviewMesas(mesas) {
  const preview = document.getElementById('mesasPreview');
  preview.innerHTML = '<h3>Mesas cargadas (editables):</h3>';
  
  mesas.forEach((m, index) => {
    const div = document.createElement('div');
    div.className = 'mesa-item';
    div.id = `mesa-${index}`;
    
    if (m.jugador2 === '' || m.jugador2.toLowerCase() === 'bye') {
      div.innerHTML = `
        Mesa: <input type="number" value="${m.mesa}" onchange="actualizarMesa(${index}, 'mesa', this.value)">
        - <input type="text" value="${m.jugador1}" onchange="actualizarMesa(${index}, 'jugador1', this.value)" style="width:300px;">
        - BYE
        <button class="danger" onclick="eliminarMesa(${index})">🗑️</button>
      `;
    } else {
      div.innerHTML = `
        Mesa: <input type="number" value="${m.mesa}" onchange="actualizarMesa(${index}, 'mesa', this.value)">
        - <input type="text" value="${m.jugador1}" onchange="actualizarMesa(${index}, 'jugador1', this.value)" style="width:250px;">
        vs <input type="text" value="${m.jugador2}" onchange="actualizarMesa(${index}, 'jugador2', this.value)" style="width:250px;">
        <button class="danger" onclick="eliminarMesa(${index})">🗑️</button>
      `;
    }
    
    preview.appendChild(div);
  });
}

// Variables globales para mesas editables
let mesasEditables = [];

window.actualizarMesa = async (index, campo, valor) => {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    mesasEditables = data.mesas || [];
    
    if (mesasEditables[index]) {
      if (campo === 'mesa') {
        mesasEditables[index].mesa = parseInt(valor);
      } else {
        mesasEditables[index][campo] = valor;
      }
      
      await fetch(`${API}/create-table`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emparejamientos: mesasEditables })
      });
    }
  } catch (error) {
    console.error('Error actualizando mesa:', error);
  }
};

window.eliminarMesa = async (index) => {
  if (!confirm('¿Eliminar esta mesa?')) return;
  
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    mesasEditables = data.mesas || [];
    
    mesasEditables.splice(index, 1);
    
    await fetch(`${API}/create-table`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emparejamientos: mesasEditables })
    });
    
    mostrarPreviewMesas(mesasEditables);
  } catch (error) {
    alert('Error al eliminar mesa');
  }
};

async function cargarMesasActuales() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    if (data.mesas && data.mesas.length > 0) {
      mesasEditables = data.mesas;
      mostrarPreviewMesas(data.mesas);
    }
  } catch (error) {
    console.error('Error cargando mesas:', error);
  }
}

cargarMesasActuales();

// ============================================
// Configuración Visual de Mesas
// ============================================
document.getElementById('aplicarConfigMesas').addEventListener('click', aplicarConfigMesas);

document.getElementById('resetConfigMesas').addEventListener('click', async () => {
  if (!confirm('¿Restaurar valores por defecto?')) return;
  
  // Valores por defecto
  document.getElementById('mesasColumnas').value = 2;
  document.getElementById('mesasAltura').value = 30;
  document.getElementById('mesasColorCabecera').value = '#ff3b3b';
  document.getElementById('mesasColorFondo').value = '#141414';
  document.getElementById('mesasColorNumero').value = '#ff8800';
  document.getElementById('mesasColorVS').value = '#ff3b3b';
  document.getElementById('mesasTamCabecera').value = 2.5;
  document.getElementById('mesasTamFilas').value = 2.2;
  document.getElementById('mesasTamNumero').value = 2.5;
  document.getElementById('mesasPosicion').value = 'bottom-center';
  document.getElementById('mesasMargen').value = 20;
  document.getElementById('mesasAncho').value = 90;
  
  // Aplicar valores por defecto
  document.getElementById('aplicarConfigMesas').click();
});

// Cargar configuración actual de mesas
// Cargar configuración al cambiar al tab - función definida más abajo
document.querySelector('[data-tab="config-mesas"]').addEventListener('click', cargarConfigMesas);

// Cargar posición al cambiar al tab de posición
document.querySelector('[data-tab="posicion"]').addEventListener('click', cargarPosicionContador);

// ============================================
// Control de Posición del Contador
// ============================================
let posicionContadorActual = { top: 50, left: 50, tamano: 40 };

async function cargarPosicionContador() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    
    if (data.posicionContador) {
      posicionContadorActual.top = data.posicionContador.top || 50;
      posicionContadorActual.left = data.posicionContador.left || 50;
    }
    
    if (data.tamanoContador) {
      posicionContadorActual.tamano = parseInt(data.tamanoContador) || 40;
    }
    
    // Actualizar controles
    document.getElementById('posXSlider').value = posicionContadorActual.left;
    document.getElementById('posYSlider').value = posicionContadorActual.top;
    document.getElementById('tamanoSlider').value = posicionContadorActual.tamano;
    
    actualizarDisplayPosicion();
  } catch (error) {
    console.error('Error cargando posición:', error);
  }
}

function actualizarDisplayPosicion() {
  document.getElementById('posXValue').textContent = Math.round(posicionContadorActual.left);
  document.getElementById('posYValue').textContent = Math.round(posicionContadorActual.top);
  document.getElementById('tamanoContadorValue').textContent = Math.round(posicionContadorActual.tamano);
  
  document.getElementById('previewX').textContent = Math.round(posicionContadorActual.left);
  document.getElementById('previewY').textContent = Math.round(posicionContadorActual.top);
  document.getElementById('previewTamano').textContent = Math.round(posicionContadorActual.tamano);
  
  // Iluminar botón de posición correspondiente
  const posiciones = [
    { x: 25, y: 25, texto: '⬉ Superior Izq' },
    { x: 50, y: 25, texto: '⬆ Superior Centro' },
    { x: 75, y: 25, texto: '⬈ Superior Der' },
    { x: 25, y: 50, texto: '⬅ Centro Izq' },
    { x: 50, y: 50, texto: '⊙ Centro' },
    { x: 75, y: 50, texto: '➡ Centro Der' },
    { x: 25, y: 75, texto: '⬋ Inferior Izq' },
    { x: 50, y: 75, texto: '⬇ Inferior Centro' },
    { x: 75, y: 75, texto: '⬊ Inferior Der' }
  ];
  
  // Remover primary de todos los botones de posición
  document.querySelectorAll('[onclick^="setPosicionContador"]').forEach(btn => {
    btn.classList.remove('primary');
  });
  
  // Iluminar el botón correspondiente (con tolerancia de ±3)
  const posicionActual = posiciones.find(p => 
    Math.abs(p.x - posicionContadorActual.left) <= 3 && 
    Math.abs(p.y - posicionContadorActual.top) <= 3
  );
  
  if (posicionActual) {
    document.querySelectorAll('[onclick^="setPosicionContador"]').forEach(btn => {
      if (btn.onclick.toString().includes(`setPosicionContador(${posicionActual.x}, ${posicionActual.y})`)) {
        btn.classList.add('primary');
      }
    });
  }
  
  // Iluminar botón de tamaño correspondiente
  const tamanos = [20, 30, 40, 60, 80];
  
  // Remover primary de todos los botones de tamaño
  document.querySelectorAll('[onclick^="setTamanoContador"]').forEach(btn => {
    btn.classList.remove('primary');
  });
  
  // Iluminar el botón correspondiente
  const tamanoExacto = tamanos.find(t => t === posicionContadorActual.tamano);
  if (tamanoExacto) {
    document.querySelectorAll('[onclick^="setTamanoContador"]').forEach(btn => {
      if (btn.onclick.toString().includes(`setTamanoContador(${tamanoExacto})`)) {
        btn.classList.add('primary');
      }
    });
  }
}

window.setPosicionContador = async function(left, top) {
  posicionContadorActual.left = left;
  posicionContadorActual.top = top;
  
  document.getElementById('posXSlider').value = left;
  document.getElementById('posYSlider').value = top;
  
  actualizarDisplayPosicion();
  await guardarPosicionContador();
};

window.ajustarPosX = async function(delta) {
  posicionContadorActual.left = Math.max(0, Math.min(100, posicionContadorActual.left + delta));
  document.getElementById('posXSlider').value = posicionContadorActual.left;
  actualizarDisplayPosicion();
  await guardarPosicionContador();
};

window.ajustarPosY = async function(delta) {
  posicionContadorActual.top = Math.max(0, Math.min(100, posicionContadorActual.top + delta));
  document.getElementById('posYSlider').value = posicionContadorActual.top;
  actualizarDisplayPosicion();
  await guardarPosicionContador();
};

window.actualizarPosXSlider = async function(value) {
  posicionContadorActual.left = parseFloat(value);
  actualizarDisplayPosicion();
  await guardarPosicionContador();
};

window.actualizarPosYSlider = async function(value) {
  posicionContadorActual.top = parseFloat(value);
  actualizarDisplayPosicion();
  await guardarPosicionContador();
};

window.ajustarTamano = async function(delta) {
  posicionContadorActual.tamano = Math.max(10, Math.min(90, posicionContadorActual.tamano + delta));
  document.getElementById('tamanoSlider').value = posicionContadorActual.tamano;
  actualizarDisplayPosicion();
  await guardarTamanoContador();
};

window.setTamanoContador = async function(tamano) {
  posicionContadorActual.tamano = tamano;
  document.getElementById('tamanoSlider').value = tamano;
  actualizarDisplayPosicion();
  await guardarTamanoContador();
};

window.actualizarTamanoSlider = async function(value) {
  posicionContadorActual.tamano = parseFloat(value);
  actualizarDisplayPosicion();
  await guardarTamanoContador();
};

async function guardarPosicionContador() {
  try {
    await fetch(`${API}/posicion-contador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        top: posicionContadorActual.top,
        left: posicionContadorActual.left
      })
    });
  } catch (error) {
    console.error('Error guardando posición:', error);
  }
}

async function guardarTamanoContador() {
  try {
    await fetch(`${API}/estilo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tamanoContador: `${posicionContadorActual.tamano}vh`
      })
    });
  } catch (error) {
    console.error('Error guardando tamaño:', error);
  }
}

// ============================================
// Control de Tiempo de Mesas
// ============================================
document.querySelectorAll('input[name="tiempoMesas"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    const configDiv = document.getElementById('tiempoMesasConfig');
    if (e.target.value === 'temporal') {
      configDiv.style.display = 'block';
    } else {
      configDiv.style.display = 'none';
    }
  });
});

window.setTiempoMesas = function(segundos) {
  // Remover clase active de todos los botones de tiempo
  document.querySelectorAll('.tiempo-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.classList.remove('primary');
  });
  
  // Agregar clase active al botón clickeado
  if (event && event.target) {
    event.target.classList.add('active');
    event.target.classList.add('primary');
  }
  
  // Actualizar valor
  document.getElementById('tiempoMesasDuracion').value = segundos;
  
  // Marcar radio temporal
  document.querySelector('input[name="tiempoMesas"][value="temporal"]').checked = true;
  document.getElementById('tiempoMesasConfig').style.display = 'block';
};

// ============================================
// Funciones de Config Mesas
// ============================================
async function cargarConfigMesas() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    
    if (data.configMesas) {
      const config = data.configMesas;
      
      document.getElementById('mesasColumnas').value = config.columnas || 2;
      document.getElementById('mesasAltura').value = config.altura || 30;
      document.getElementById('mesasColorCabecera').value = config.colorCabecera || '#ff3b3b';
      document.getElementById('mesasColorFondo').value = config.colorFondo || '#141414';
      document.getElementById('mesasColorNumero').value = config.colorNumero || '#ff8800';
      document.getElementById('mesasColorVS').value = config.colorVS || '#ff3b3b';
      document.getElementById('mesasTamCabecera').value = config.tamCabecera || 2.5;
      document.getElementById('mesasTamFilas').value = config.tamFilas || 2.2;
      document.getElementById('mesasTamNumero').value = config.tamNumero || 2.5;
      document.getElementById('mesasPosicion').value = config.posicion || 'bottom-center';
      document.getElementById('mesasMargen').value = config.margen || 20;
      document.getElementById('mesasAncho').value = config.ancho || 90;
      
      // Configurar tiempo de visualización
      if (config.tiempoVisible === null || config.tiempoVisible === undefined) {
        document.getElementById('tiempoMesasIndefinido').checked = true;
        document.getElementById('tiempoMesasConfig').style.display = 'none';
      } else {
        document.querySelector('input[name="tiempoMesas"][value="temporal"]').checked = true;
        document.getElementById('tiempoMesasDuracion').value = config.tiempoVisible;
        document.getElementById('tiempoMesasConfig').style.display = 'block';
      }
    }
  } catch (error) {
    console.error('Error cargando configuración de mesas:', error);
  }
}

// Función helper para establecer tiempo de mesas
window.setTiempoMesas = function(segundos) {
  document.getElementById('tiempoMesasDuracion').value = segundos;
  
  // Actualizar botones activos
  document.querySelectorAll('.tiempo-btn').forEach(btn => {
    btn.classList.remove('primary', 'active');
  });
  event.target.classList.add('primary', 'active');
};

async function aplicarConfigMesas() {
  try {
    const tipoTiempo = document.querySelector('input[name="tiempoMesas"]:checked').value;
    
    const config = {
      columnas: parseInt(document.getElementById('mesasColumnas').value),
      altura: parseInt(document.getElementById('mesasAltura').value),
      colorCabecera: document.getElementById('mesasColorCabecera').value,
      colorFondo: document.getElementById('mesasColorFondo').value,
      colorNumero: document.getElementById('mesasColorNumero').value,
      colorVS: document.getElementById('mesasColorVS').value,
      tamCabecera: parseFloat(document.getElementById('mesasTamCabecera').value),
      tamFilas: parseFloat(document.getElementById('mesasTamFilas').value),
      tamNumero: parseFloat(document.getElementById('mesasTamNumero').value),
      posicion: document.getElementById('mesasPosicion').value,
      margen: parseInt(document.getElementById('mesasMargen').value),
      ancho: parseInt(document.getElementById('mesasAncho').value),
      tiempoVisible: tipoTiempo === 'indefinido' ? null : parseInt(document.getElementById('tiempoMesasDuracion').value),
      tituloMesa: document.getElementById('mesasTituloMesa').value || 'Mesa',
      tituloEmparejamiento: document.getElementById('mesasTituloEmparejamiento').value || 'Emparejamiento'
    };
    
    const res = await fetch(`${API}/mesas/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    
    const data = await res.json();
    
    if (data.success) {
      alert('✅ Configuración de mesas actualizada');
    } else {
      alert('❌ Error: ' + data.message);
    }
  } catch (error) {
    alert('❌ Error aplicando configuración de mesas');
    console.error(error);
  }
}

async function resetConfigMesas() {
  if (!confirm('¿Restaurar valores por defecto?')) return;
  
  document.getElementById('mesasColumnas').value = 2;
  document.getElementById('mesasAltura').value = 30;
  document.getElementById('mesasColorCabecera').value = '#ff3b3b';
  document.getElementById('mesasColorFondo').value = '#141414';
  document.getElementById('mesasColorNumero').value = '#ff8800';
  document.getElementById('mesasColorVS').value = '#ff3b3b';
  document.getElementById('mesasTamCabecera').value = 2.5;
  document.getElementById('mesasTamFilas').value = 2.2;
  document.getElementById('mesasTamNumero').value = 2.5;
  document.getElementById('mesasPosicion').value = 'bottom-center';
  document.getElementById('mesasMargen').value = 20;
  document.getElementById('mesasAncho').value = 90;
  document.getElementById('tiempoMesasIndefinido').checked = true;
  document.getElementById('tiempoMesasConfig').style.display = 'none';
  document.getElementById('mesasTituloMesa').value = 'Mesa';
  document.getElementById('mesasTituloEmparejamiento').value = 'Emparejamiento';
  
  await aplicarConfigMesas();
}

// ============================================
// Gestión del Logo
// ============================================

// Variables globales del logo
let logoTamanoActual = 340;
let logoPosXActual = 10;
let logoPosYActual = 10;

// Cargar configuración actual del logo
async function cargarConfigLogo() {
  try {
    const res = await fetch(`${API}/status`);
    const data = await res.json();
    
    if (data.logo) {
      logoTamanoActual = data.logo.tamano || 340;
      logoPosXActual = data.logo.posX || 10;
      logoPosYActual = data.logo.posY || 10;
      
      // Actualizar UI
      document.getElementById('logoTamanoSlider').value = logoTamanoActual;
      document.getElementById('logoTamanoValue').textContent = logoTamanoActual;
      document.getElementById('previewLogoTamano').textContent = logoTamanoActual;
      
      document.getElementById('logoPosXSlider').value = logoPosXActual;
      document.getElementById('logoPosXValue').textContent = logoPosXActual;
      document.getElementById('previewLogoPosX').textContent = logoPosXActual;
      
      document.getElementById('logoPosYSlider').value = logoPosYActual;
      document.getElementById('logoPosYValue').textContent = logoPosYActual;
      document.getElementById('previewLogoPosY').textContent = logoPosYActual;
      
      // Iluminar botón de tamaño correspondiente
      const botonesTamano = {
        150: 'Pequeño (150px)',
        250: 'Mediano (250px)',
        340: 'Normal (340px)',
        450: 'Grande (450px)',
        600: 'Muy Grande (600px)'
      };
      
      // Remover primary de todos los botones de tamaño
      document.querySelectorAll('[onclick^="setLogoTamano"]').forEach(btn => {
        btn.classList.remove('primary');
      });
      
      // Iluminar el botón correspondiente
      const tamanoExacto = Object.keys(botonesTamano).find(t => parseInt(t) === logoTamanoActual);
      if (tamanoExacto) {
        document.querySelectorAll('[onclick^="setLogoTamano"]').forEach(btn => {
          if (btn.onclick.toString().includes(`setLogoTamano(${tamanoExacto})`)) {
            btn.classList.add('primary');
          }
        });
      }
      
      // Iluminar botón de posición correspondiente
      const posiciones = [
        { x: 5, y: 5, texto: '⬉ Superior Izq' },
        { x: 50, y: 5, texto: '⬆ Superior Centro' },
        { x: 95, y: 5, texto: '⬈ Superior Der' },
        { x: 5, y: 50, texto: '⬅ Centro Izq' },
        { x: 50, y: 50, texto: '⊙ Centro' },
        { x: 95, y: 50, texto: '➡ Centro Der' },
        { x: 5, y: 95, texto: '⬋ Inferior Izq' },
        { x: 50, y: 95, texto: '⬇ Inferior Centro' },
        { x: 95, y: 95, texto: '⬊ Inferior Der' }
      ];
      
      // Remover primary de todos los botones de posición
      document.querySelectorAll('[onclick^="setPosicionLogo"]').forEach(btn => {
        btn.classList.remove('primary');
      });
      
      // Iluminar el botón correspondiente (con tolerancia de ±3)
      const posicionActual = posiciones.find(p => 
        Math.abs(p.x - logoPosXActual) <= 3 && Math.abs(p.y - logoPosYActual) <= 3
      );
      
      if (posicionActual) {
        document.querySelectorAll('[onclick^="setPosicionLogo"]').forEach(btn => {
          if (btn.onclick.toString().includes(`setPosicionLogo(${posicionActual.x}, ${posicionActual.y})`)) {
            btn.classList.add('primary');
          }
        });
      }
      
      // Mostrar preview del logo
      const preview = document.getElementById('logoActualPreview');
      if (data.logo.archivo) {
        const src = data.logo.archivo.startsWith('logo_') ? `/logos/${data.logo.archivo}` : '/logo.png';
        preview.innerHTML = `
          <img src="${src}" alt="${data.logo.nombre || 'Logo'}" 
               style="max-width:300px; max-height:200px; object-fit:contain;"
               onerror="this.src='/logo.png'">
          <p style="margin-top:10px; color:#aaa;">${data.logo.nombre || 'Logo'}</p>
        `;
      } else {
        preview.innerHTML = '<p style="color:#888;">No hay logo configurado</p>';
      }
    }
  } catch (error) {
    console.error('Error cargando config logo:', error);
  }
}

// Función auxiliar para iluminar botones según estado actual
function iluminarBotonesLogo() {
  // Iluminar botón de tamaño correspondiente
  const botonesTamano = [150, 250, 340, 450, 600];
  
  // Remover primary de todos los botones de tamaño
  document.querySelectorAll('[onclick^="setLogoTamano"]').forEach(btn => {
    btn.classList.remove('primary');
  });
  
  // Iluminar el botón correspondiente
  const tamanoExacto = botonesTamano.find(t => t === logoTamanoActual);
  if (tamanoExacto) {
    document.querySelectorAll('[onclick^="setLogoTamano"]').forEach(btn => {
      if (btn.onclick.toString().includes(`setLogoTamano(${tamanoExacto})`)) {
        btn.classList.add('primary');
      }
    });
  }
  
  // Iluminar botón de posición correspondiente
  const posiciones = [
    { x: 5, y: 5 },
    { x: 50, y: 5 },
    { x: 95, y: 5 },
    { x: 5, y: 50 },
    { x: 50, y: 50 },
    { x: 95, y: 50 },
    { x: 5, y: 95 },
    { x: 50, y: 95 },
    { x: 95, y: 95 }
  ];
  
  // Remover primary de todos los botones de posición
  document.querySelectorAll('[onclick^="setPosicionLogo"]').forEach(btn => {
    btn.classList.remove('primary');
  });
  
  // Iluminar el botón correspondiente (con tolerancia de ±3)
  const posicionActual = posiciones.find(p => 
    Math.abs(p.x - logoPosXActual) <= 3 && Math.abs(p.y - logoPosYActual) <= 3
  );
  
  if (posicionActual) {
    document.querySelectorAll('[onclick^="setPosicionLogo"]').forEach(btn => {
      if (btn.onclick.toString().includes(`setPosicionLogo(${posicionActual.x}, ${posicionActual.y})`)) {
        btn.classList.add('primary');
      }
    });
  }
}

// Control de tamaño
window.ajustarLogoTamano = async function(delta) {
  logoTamanoActual = Math.max(50, Math.min(800, logoTamanoActual + delta));
  document.getElementById('logoTamanoSlider').value = logoTamanoActual;
  actualizarLogoTamanoSlider(logoTamanoActual);
  iluminarBotonesLogo();
  await guardarConfigLogo();
};

window.setLogoTamano = async function(tamano) {
  logoTamanoActual = tamano;
  document.getElementById('logoTamanoSlider').value = tamano;
  actualizarLogoTamanoSlider(tamano);
  iluminarBotonesLogo();
  await guardarConfigLogo();
};

window.actualizarLogoTamanoSlider = async function(value) {
  logoTamanoActual = parseInt(value);
  document.getElementById('logoTamanoValue').textContent = logoTamanoActual;
  document.getElementById('previewLogoTamano').textContent = logoTamanoActual;
  iluminarBotonesLogo();
  await guardarConfigLogo();
};

// Control de posición X
window.ajustarLogoPosX = async function(delta) {
  logoPosXActual = Math.max(0, Math.min(100, logoPosXActual + delta));
  document.getElementById('logoPosXSlider').value = logoPosXActual;
  actualizarLogoPosXSlider(logoPosXActual);
  iluminarBotonesLogo();
  await guardarConfigLogo();
};

window.actualizarLogoPosXSlider = async function(value) {
  logoPosXActual = parseInt(value);
  document.getElementById('logoPosXValue').textContent = logoPosXActual;
  document.getElementById('previewLogoPosX').textContent = logoPosXActual;
  iluminarBotonesLogo();
  await guardarConfigLogo();
};

// Control de posición Y
window.ajustarLogoPosY = async function(delta) {
  logoPosYActual = Math.max(0, Math.min(100, logoPosYActual + delta));
  document.getElementById('logoPosYSlider').value = logoPosYActual;
  actualizarLogoPosYSlider(logoPosYActual);
  iluminarBotonesLogo();
  await guardarConfigLogo();
};

window.actualizarLogoPosYSlider = async function(value) {
  logoPosYActual = parseInt(value);
  document.getElementById('logoPosYValue').textContent = logoPosYActual;
  document.getElementById('previewLogoPosY').textContent = logoPosYActual;
  iluminarBotonesLogo();
  await guardarConfigLogo();
};

// Posiciones predefinidas
window.setPosicionLogo = async function(x, y) {
  logoPosXActual = x;
  logoPosYActual = y;
  
  document.getElementById('logoPosXSlider').value = x;
  document.getElementById('logoPosXValue').textContent = x;
  document.getElementById('previewLogoPosX').textContent = x;
  
  document.getElementById('logoPosYSlider').value = y;
  document.getElementById('logoPosYValue').textContent = y;
  document.getElementById('previewLogoPosY').textContent = y;
  
  iluminarBotonesLogo();
  await guardarConfigLogo();
};

// Guardar configuración del logo
async function guardarConfigLogo() {
  try {
    await fetch(`${API}/logo/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tamano: logoTamanoActual,
        posX: logoPosXActual,
        posY: logoPosYActual
      })
    });
  } catch (error) {
    console.error('Error guardando config logo:', error);
  }
}

// Subir logo
document.getElementById('subirLogoBtn').addEventListener('click', async () => {
  const fileInput = document.getElementById('logoFileInput');
  const nombreInput = document.getElementById('logoNombreInput');
  
  if (!fileInput.files[0]) {
    alert('Selecciona una imagen primero');
    return;
  }
  
  const formData = new FormData();
  formData.append('logo', fileInput.files[0]);
  formData.append('nombre', nombreInput.value || 'Logo');
  
  try {
    const res = await fetch(`${API}/logo`, {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    
    if (data.success) {
      alert('✅ Logo subido correctamente');
      fileInput.value = '';
      nombreInput.value = '';
      cargarConfigLogo();
      cargarBiblioteca();
    } else {
      alert('❌ Error: ' + data.message);
    }
  } catch (error) {
    alert('❌ Error al subir logo');
    console.error(error);
  }
});

// Eliminar logo
document.getElementById('eliminarLogoBtn').addEventListener('click', async () => {
  if (!confirm('¿Eliminar el logo actual?')) return;
  
  try {
    const res = await fetch(`${API}/logo`, { method: 'DELETE' });
    const data = await res.json();
    
    if (data.success) {
      alert('✅ Logo eliminado');
      cargarConfigLogo();
    } else {
      alert('❌ Error: ' + data.message);
    }
  } catch (error) {
    alert('❌ Error al eliminar logo');
    console.error(error);
  }
});

// Usar logo de biblioteca
document.getElementById('usarLogoBibliotecaBtn').addEventListener('click', async () => {
  const select = document.getElementById('logoBibliotecaSelect');
  const archivo = select.value;
  
  if (!archivo) {
    alert('Selecciona un logo de la biblioteca');
    return;
  }
  
  try {
    const res = await fetch(`${API}/logo/usar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archivo, nombre: archivo })
    });
    const data = await res.json();
    
    if (data.success) {
      alert('✅ Logo aplicado correctamente');
      cargarConfigLogo();
    } else {
      alert('❌ Error: ' + data.message);
    }
  } catch (error) {
    alert('❌ Error al aplicar logo');
    console.error(error);
  }
});

// Cargar config al abrir tab
document.querySelector('[data-tab="logo"]').addEventListener('click', cargarConfigLogo);

// ============================================
// Advertencia: Contador no visible
// ============================================

// Agregar advertencia al cambiar de contador
const cambiarContadorOriginal = window.cambiarContador;
window.cambiarContador = async function(id) {
  await cambiarContadorOriginal(id);
  
  // Verificar si el contador está visible
  try {
    const res = await fetch(`${API}/contadores`);
    const data = await res.json();
    
    const contador = data.contadores.find(c => c.id === id);
    if (contador && !contador.visible) {
      // Mostrar advertencia
      if (!document.getElementById('advertenciaNoVisible')) {
        const advertencia = document.createElement('div');
        advertencia.id = 'advertenciaNoVisible';
        advertencia.style.cssText = `
          position: fixed;
          top: 70px;
          left: 50%;
          transform: translateX(-50%);
          background: #ff9800;
          color: #000;
          padding: 15px 25px;
          border-radius: 8px;
          font-weight: bold;
          z-index: 10000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          max-width: 600px;
          text-align: center;
        `;
        advertencia.innerHTML = `
          ⚠️ Este contador NO está visible en el frontend<br>
          <small style="font-weight:normal;">Marca "📺 Mostrar en pantalla" para verlo</small>
          <button onclick="this.parentElement.remove()" 
                  style="margin-left:15px; padding:5px 10px; background:#fff; border:none; border-radius:4px; cursor:pointer;">
            ✕ Cerrar
          </button>
        `;
        document.body.appendChild(advertencia);
      }
    } else {
      // Eliminar advertencia si existe
      const advertencia = document.getElementById('advertenciaNoVisible');
      if (advertencia) advertencia.remove();
    }
  } catch (error) {
    console.error('Error verificando visibilidad:', error);
  }
};