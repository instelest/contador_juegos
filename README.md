# Contador de Torneos v3.0.0

Sistema web completo para la gestión de torneos con temporizadores en tiempo real, emparejamientos de jugadores y soporte multi-torneo simultáneo.

Diseñado para tiendas de juegos, eventos competitivos y cualquier entorno que necesite cronómetros sincronizados y gestión visual de participantes.

---

## Características principales

- **Temporizador en tiempo real** con sincronización entre todas las pantallas conectadas
- **Multi-torneo** — gestiona hasta 6 torneos simultáneos con temporizadores independientes
- **Panel de administración** web completo para controlar todos los aspectos del torneo
- **Emparejamientos y mesas** — muestra los enfrentamientos de cada ronda
- **Personalización visual** — colores, tamaños, logos, iconos y posicionamiento dinámico
- **Audio** — notificaciones sonoras al finalizar o N segundos antes del fin
- **Biblioteca de archivos** — sube y gestiona logos, iconos y audios desde el panel
- **Guardado de configuraciones** — guarda y carga presets completos de torneos
- **Diseño responsive** — funciona en cualquier pantalla o resolución

---

## Capturas

| Vista principal | Multi-torneo | Panel admin |
|:-:|:-:|:-:|
| Temporizador a pantalla completa | Hasta 6 torneos en cuadrícula | Gestión completa por pestañas |

---

## Tecnologías

| Componente | Tecnología |
|------------|-----------|
| Backend | Node.js + Express |
| Frontend | HTML5, CSS3, JavaScript vanilla |
| Almacenamiento | JSON en sistema de archivos |
| Subida de archivos | Multer |

---

## Instalación rápida

### Requisitos previos

- [Node.js](https://nodejs.org/) v12 o superior
- npm (incluido con Node.js)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/instelest/contador_juegos.git
cd contador_juegos

# 2. Instalar dependencias
cd backend
npm install

# 3. Iniciar el servidor
npm start
```

O usa los scripts incluidos:

```bash
./install.sh   # Instala dependencias
./start.sh     # Inicia el servidor
```

### Acceder a la aplicación

| URL | Descripción |
|-----|-------------|
| `http://localhost:3001/` | Pantalla principal del torneo |
| `http://localhost:3001/multi.html` | Vista multi-torneo |
| `http://localhost:3001/admin` | Panel de administración |

> El puerto se configura en `backend/config.json` (por defecto: 3001).

---

## Uso

1. Abre el **panel de administración** en `/admin`
2. Crea un nuevo torneo con un nombre
3. Configura colores, tamaños y textos
4. Sube logos e iconos si lo necesitas
5. Introduce los emparejamientos y números de mesa
6. Establece la duración del temporizador
7. Marca el torneo como visible
8. Abre `/` o `/multi.html` en las pantallas de visualización
9. Pulsa **Iniciar** en el admin — todas las pantallas se sincronizan
10. Al finalizar el tiempo, suena el audio y la pantalla parpadea

---

## Configuración

El archivo `backend/config.json` permite ajustar los valores por defecto:

```json
{
  "colorContador": "#ff0000",
  "tamanoContador": "40vh",
  "colorTexto": "#ffffff",
  "tamanoTexto": "10vh",
  "colorFondo": "#000000",
  "tiempoPorDefecto": 0,
  "puerto": 3001
}
```

---

## Estructura del proyecto

```
contador_juegos/
├── backend/
│   ├── server.js              # Servidor Express principal
│   ├── config.json            # Configuración del servidor
│   ├── data.json              # Estado persistente de los torneos
│   ├── package.json           # Dependencias del backend
│   ├── limpiar-archivos.js    # Utilidad de limpieza
│   ├── public-admin/          # Panel de administración
│   │   ├── index.html
│   │   └── script.js
│   ├── audio/                 # Archivos de audio subidos
│   ├── iconos/                # Iconos subidos
│   ├── logos/                 # Logos subidos
│   └── configuraciones/       # Configuraciones guardadas
├── frontend/
│   ├── index.html             # Vista principal del torneo
│   ├── multi.html             # Vista multi-torneo
│   ├── script.js              # Lógica del frontend
│   └── style.css              # Estilos
├── install.sh                 # Script de instalación
├── start.sh                   # Script de inicio
└── docs/
    ├── API.md                 # Documentación de la API
    └── INSTALACION.md         # Guía detallada de instalación
```

---

## Documentación

- [Guía de instalación y configuración](docs/INSTALACION.md)
- [Documentación de la API REST](docs/API.md)

---

## Colaboradores

### MonsterFactory

<a href="https://monsterfactory.es">
  <strong>MonsterFactory</strong>
</a>

Agradecemos a [MonsterFactory](https://monsterfactory.es) por su colaboración activa en el desarrollo y testing de este sistema. Su experiencia organizando torneos y eventos ha sido fundamental para dar forma a las funcionalidades del contador.

Visita su tienda: **[monsterfactory.es](https://monsterfactory.es)**

---

## Licencia

Este proyecto está bajo la licencia incluida en el archivo [LICENSE](LICENSE).
