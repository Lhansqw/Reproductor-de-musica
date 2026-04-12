#  MusicPlayer

Un reproductor de música moderno, interactivo y programado en **TypeScript**. Este proyecto comenzó como un taller sobre la estructura de datos **Lista Doblemente Enlazada (Doubly Linked List)** y ha evolucionado hacia una experiencia multimedia completa con diseño *Glassmorphism*, efectos visuales en tiempo real y múltiples características avanzadas.

---

##  Características Principales

* **Estructura de Datos Avanzada**: El manejo central de la playlist (agregar al inicio/final, insertar en posición o eliminar) y la navegación de pistas se administra puramente mediante una **Lista Doblemente Enlazada** creada desde cero en TypeScript.
* **Aspecto Visual (Glassmorphism)**: Interfaz fluida, moderna y translúcida con temas estéticos pulidos (Gradients violeta y rosa).
* **Color Adaptativo (ID3 Tags)**: Extrae automáticamente la portada del álbum de un archivo `.mp3` usando `jsmediatags` y adapta el tema de la aplicación (Color "Accent" y Auras) simulando el ecosistema del visualizador de manera dinámica.
* **3 Visualizadores Interactivos en Tiempo Real**: Construidos puramente usando `Canvas API` y las frecuencias rítmicas del `AudioContext`:
  * *BarVisualizer*: Simulador suavizado de frecuencias en el menú lateral.
  * *FrequencyVisualizer*: Espectro completo de barras inferior con indicadores de pico.
  * *ParticleSystem*: Partículas espaciales de fondo que reaccionan de manera elástica a los *bajos/bass* del audio.
* **Controles Robustos de la Lista**: Buscar canciones en tiempo real, colas dinámicas (Up-Next), modo *Shuffle* automático para intercalar posiciones, y modo interactivo de repetición (Loop).
* **Flujos de Trabajo Útiles**: Arrastra y suelta *(Drag & Drop)* múltiples archivos de audio directamente al reproductor o utiliza el formulario flotante con auto-detección del formato "Artista - Titulo".
* **Atajos de Teclado**: Soporte para barra espaciadora (Play/Pause) y flechas direccionales (Siguiente, Anterior, Volumen).

##  Arquitectura del Proyecto

El código está estructurado en módulos bajo un entorno base en el compilador web **Vite**:

* `src/data-structures/`: Contiene la lógica profunda de algoritmos y listas enlazadas.
* `src/models/`: Declaración de interfaces estáticas.
* `src/services/`: Administración del motor de audio local, la lista de reproducción conectada a las vistas, y los controladores del estado del reproductor.
* `src/visualizers/`: Clases del *Canvas API* que corren independientemente con `requestAnimationFrame`.
* `src/main.ts`: Inyección de dependencias, unificación de *Event Listeners* y comunicación con la Interfaz (HTML/DOM).

##  Instalación y Ejecución

Para iniciar el proyecto en tu máquina de manera local asegúrate de tener `Node.js` instalado:

1. **Clonar el Repositorio** e ingresar al directorio.
   ```bash
   git clone https://github.com/Lhansqw/Reproductor-de-musica.git
   cd Reproductor-de-musica
   ```
2. **Instalar Dependencias**
   ```bash
   npm install
   ```
3. **Ejecutar en modo Desarrollo (Vite)**
   ```bash
   npm run dev
   ```

## 🛠️ Tecnologías Utilizadas

* **HTML5 & Vanilla CSS**: Para toda la animación, UI semántica, y control visual en CSS variables usando Tailwind de manera sutil si se aplica conceptualmente.
* **TypeScript**: Todo el encapsulamiento para clases fuertes, interfaces rígidas de la webAudioAPI, y prevención de colisiones.
* **Vite**: Bundler ultra-rápido de dependencias.
* **jsmediatags**: Librería estática para procesar e inyectar el *ArtWork* oficial de las canciones locales en memoria `Blob` o Base64.
