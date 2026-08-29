# Sistema de Monitoreo Industrial — Comparación Clásica de Sensores Binarios

## Descripción del proyecto

Este repositorio contiene la implementación clásica correspondiente al proyecto de la materia **Fundamentos de Computación Cuántica**, cuyo propósito general es analizar un problema computacional sencillo desde dos enfoques distintos: una solución clásica y una solución cuántica basada en el algoritmo de Deutsch.

El problema seleccionado consiste en comparar las lecturas de dos sensores binarios, identificados como sensor A y sensor B. Cada sensor puede presentar únicamente dos estados posibles: 0 (estado normal) o 1 (estado alterado). El sistema debe determinar si ambos sensores se encuentran en el mismo estado o si existe una diferencia entre sus lecturas.

Este repositorio corresponde específicamente a la solución clásica del problema, implementada como una aplicación de escritorio con interfaz gráfica que simula el comportamiento de un sistema de monitoreo industrial. La contraparte cuántica del proyecto, basada en el algoritmo de Deutsch, se documenta por separado en el reporte formal de la materia.

## Objetivo

Desarrollar una implementación funcional que permita:

- Generar lecturas simuladas de dos sensores binarios.
- Comparar dichas lecturas mediante una condición lógica directa (`sensor_a == sensor_b`).
- Visualizar el resultado de la comparación en tiempo real mediante una interfaz gráfica.
- Representar estadísticamente el comportamiento del sistema mediante gráficas de apoyo.

## Funcionalidades

- **Generación de lecturas individuales o simuladas por lote**, con una probabilidad del 15% de que los sensores presenten una inconsistencia entre sí.
- **Historial de lecturas** mostrado en una tabla, con indicadores de lecturas consistentes y alertas detectadas.
- **Panel de gráficas independiente**, accesible desde un botón dedicado, que incluye:
  - Un diagrama de barras que resume la cantidad total de lecturas consistentes frente a las alertas detectadas.
  - Un diagrama de caja (boxplot) que representa la distribución de las lecturas crudas simuladas de cada sensor antes de aplicar el umbral de decisión que las convierte en valores binarios.

## Tecnologías utilizadas

- **Python 3**
- **tkinter** — interfaz gráfica de usuario
- **matplotlib** — generación de gráficas estadísticas embebidas en la interfaz

## Instalación y ejecución

El proyecto fue desarrollado y probado en un entorno Linux basado en Arch (Omarchy). Los pasos de instalación son los siguientes:

### 1. Instalar tkinter a nivel de sistema

`tkinter` no se instala mediante `pip`, ya que depende de la librería Tcl/Tk del sistema operativo:

```bash
sudo pacman -S tk
```

### 2. Instalar matplotlib

```bash
pip install matplotlib --break-system-packages
```

Alternativamente, se puede utilizar un entorno virtual:

```bash
python3 -m venv venv
source venv/bin/activate
pip install matplotlib
```

### 3. Ejecutar el programa

```bash
python3 monitor_industrial.py
```

## Estructura del sistema

El programa está organizado en una sola clase (`SistemaMonitoreo`) que administra tanto la interfaz gráfica como la lógica de comparación:

- `generar_lectura_cruda()` — simula una lectura continua tipo voltaje para cada sensor, a partir de la cual se obtiene posteriormente el valor binario.
- `nueva_lectura()` — genera un caso de prueba y aplica el umbral de decisión (0.5) para clasificar cada sensor como normal o alterado.
- `procesar_lectura()` — realiza la comparación clásica entre ambos sensores y actualiza la interfaz, el historial y los contadores.
- `actualizar_graficas()` — redibuja las gráficas de barras y de caja con base en los datos acumulados durante la sesión.

## Autores

- Yahir Alejandro Pérez Felipe
- Patricio Daniel Puente Ortiz

## Materia

Fundamentos de Computación Cuántica — Tecmilenio
Profesor: Edson Edgardo Samaniego Pantoja