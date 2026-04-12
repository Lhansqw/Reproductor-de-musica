#  Taller Reproductor de Música — Listas Dobles

##  Funcionalidades Extra

Además de los requerimientos base, el proyecto incluye:

-  **Color Adaptativo** — Extrae la portada del álbum desde las etiquetas ID3 del archivo `.mp3` y adapta el tema de color de la interfaz dinámicamente.
-  **Modo Shuffle** — Reorganiza aleatoriamente los nodos de la lista doblemente enlazada.
-  **Modo Loop** — Al llegar al último nodo, regresa automáticamente a la cabeza de la lista.
-  **Buscador en tiempo real** — Filtra canciones por título o artista.
-  **Cola de reproducción (Up-Next)** — Visualiza las canciones que siguen después de la actual.
-  **Reproducción de audio real** — Soporte para archivos `.mp3` locales vía `AudioContext` del navegador.
-  **Drag & Drop** — Arrastra múltiples archivos de audio directamente al reproductor.
-  **Atajos de teclado** — `Espacio` (Play/Pause), `←` `→` (Anterior/Siguiente), `↑` `↓` (Volumen).
-  **3 Visualizadores de audio en Canvas** — Barras de frecuencia, espectro completo y sistema de partículas reactivo a los bajos.

---


##  Instalación y Ejecución

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

##  Tecnologías Utilizadas

| Tecnología | Uso |
|------------|-----|
| **TypeScript** | Lógica principal, tipos, clases, interfaces |
| **HTML5 / CSS3** | Estructura y estilos Glassmorphism |
| **Vite** | Bundler y servidor de desarrollo |
| **Web Audio API** | Motor de audio y análisis de frecuencias |
| **Canvas API** | Visualizadores gráficos en tiempo real |
| **jsmediatags** | Lectura de etiquetas ID3 (título, artista, portada) |
