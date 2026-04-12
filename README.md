# 🎵 Taller Reproductor de Música — Listas Dobles

> **Taller Structures · TypeScript**  
> Implementación de una Lista Doblemente Enlazada aplicada a un reproductor de música con Frontend interactivo.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=flat-square&logo=vite&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)

---

## 📋 Requerimientos del Taller

Este proyecto fue desarrollado aplicando los conceptos de **"listas dobles"** en TypeScript para simular una lista de reproducción de canciones. A continuación se detalla cómo se cumple cada requerimiento:

| # | Requerimiento | Estado | Implementación |
|---|---------------|--------|----------------|
| 1 | Crear una app en **TypeScript** aplicando listas dobles | ✅ | `DoublyLinkedList.ts` + `PlaylistService.ts` |
| 2 | **Frontend** donde el usuario pueda interactuar | ✅ | Interfaz Glassmorphism con HTML/CSS/TS |
| 3 | Permitir **agregar** una canción al **inicio** | ✅ | `playlist.addFirst()` → botón modal "Inicio de la lista" |
| 4 | Permitir **agregar** una canción al **final** | ✅ | `playlist.addLast()` → botón modal "Final de la lista" |
| 5 | Permitir **agregar** una canción en **cualquier posición** | ✅ | `playlist.addAt(n)` → botón modal "Posición específica" |
| 6 | Permitir **eliminar** una canción de la lista | ✅ | `playlist.remove(id)` → botón ✕ en cada canción |
| 7 | Permitir **adelantar** canción | ✅ | `playlist.next()` → botón ⏭ y tecla `→` |
| 8 | Permitir **retroceder** canción | ✅ | `playlist.prev()` → botón ⏮ y tecla `←` |
| 9 | Otras funcionalidades pertinentes | ✅ | Ver sección de funciones extra ↓ |

---

## ✨ Funcionalidades Extra

Además de los requerimientos base, el proyecto incluye:

- 🎨 **Color Adaptativo** — Extrae la portada del álbum desde las etiquetas ID3 del archivo `.mp3` y adapta el tema de color de la interfaz dinámicamente.
- 🔀 **Modo Shuffle** — Reorganiza aleatoriamente los nodos de la lista doblemente enlazada.
- 🔁 **Modo Loop** — Al llegar al último nodo, regresa automáticamente a la cabeza de la lista.
- 🔍 **Buscador en tiempo real** — Filtra canciones por título o artista.
- 📋 **Cola de reproducción (Up-Next)** — Visualiza las canciones que siguen después de la actual.
- 🎵 **Reproducción de audio real** — Soporte para archivos `.mp3` locales vía `AudioContext` del navegador.
- 📁 **Drag & Drop** — Arrastra múltiples archivos de audio directamente al reproductor.
- ⌨️ **Atajos de teclado** — `Espacio` (Play/Pause), `←` `→` (Anterior/Siguiente), `↑` `↓` (Volumen).
- 📊 **3 Visualizadores de audio en Canvas** — Barras de frecuencia, espectro completo y sistema de partículas reactivo a los bajos.

---

## 🗂️ Estructura del Proyecto

```
src/
├── data-structures/
│   └── DoublyLinkedList.ts   # Nodo y Lista Doblemente Enlazada (desde cero)
├── models/
│   └── Song.ts               # Interfaz/tipo de la canción
├── services/
│   ├── AudioEngine.ts        # Motor de audio (AudioContext + Web Audio API)
│   ├── PlaylistService.ts    # Lógica de la playlist sobre la lista doble
│   └── VolumeController.ts   # Control de volumen con estado mute/unmute
├── visualizers/
│   ├── BarVisualizer.ts      # Barras de frecuencia (sidebar)
│   ├── FrequencyVisualizer.ts# Espectro completo de frecuencias
│   └── ParticleSystem.ts     # Partículas reactivas a los bajos
├── main.ts                   # Punto de entrada, event listeners y render
└── style.css                 # Estilos Glassmorphism + animaciones
```

---

## 🚀 Instalación y Ejecución

Asegúrate de tener instalado [Node.js](https://nodejs.org/).

```bash
# 1. Clonar el repositorio
git clone https://github.com/Lhansqw/Reproductor-de-musica.git
cd Reproductor-de-musica

# 2. Instalar dependencias
npm install

# 3. Ejecutar en modo desarrollo
npm run dev
```

Luego abre `http://localhost:5173` en tu navegador.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| **TypeScript** | Lógica principal, tipos, clases, interfaces |
| **HTML5 / CSS3** | Estructura y estilos Glassmorphism |
| **Vite** | Bundler y servidor de desarrollo |
| **Web Audio API** | Motor de audio y análisis de frecuencias |
| **Canvas API** | Visualizadores gráficos en tiempo real |
| **jsmediatags** | Lectura de etiquetas ID3 (título, artista, portada) |
