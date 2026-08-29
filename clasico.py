import tkinter as tk
from tkinter import ttk
import random
from datetime import datetime

import matplotlib
matplotlib.use("TkAgg")
from matplotlib.figure import Figure
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg


# SISTEMA DE MONITOREO INDUSTRIAL (MODO CLÁSICO)

class SistemaMonitoreo:

    def __init__(self, root):

        self.root = root

        self.root.title("Monitor Industrial | Sistema de Sensores")
        self.root.geometry("850x600")
        self.root.resizable(True, True)
        self.root.minsize(700, 500)

        self.lecturas = 0
        self.consistentes = 0
        self.alertas = 0

        # Historial de valores CRUDOS (continuos) de cada sensor.
        # Esto es lo que alimenta al boxplot: representan una lectura
        # simulada tipo "voltaje" antes de aplicar el umbral que la
        # convierte en 0 (normal) o 1 (alterado).
        self.historial_a = []
        self.historial_b = []

        self.ventana_graficas = None
        self.ax_barras = None
        self.ax_boxplot = None
        self.figura_graficas = None
        self.canvas_graficas = None

        self.crear_interfaz()


    # INTERFAZ

    def crear_interfaz(self):

        header = tk.Frame(self.root, bg="#1f2937", height=80)
        header.pack(fill="x")

        tk.Label(
            header, text="MONITOR INDUSTRIAL",
            font=("Arial", 20, "bold"), bg="#1f2937", fg="white"
        ).pack(pady=(15, 2))

        tk.Label(
            header, text="Sistema de detección de inconsistencias (modo clásico)",
            font=("Arial", 10), bg="#1f2937", fg="#d1d5db"
        ).pack()

        contenido = tk.Frame(self.root, padx=20, pady=15)
        contenido.pack(fill="both", expand=True)

        panel_sensores = tk.LabelFrame(
            contenido, text=" Estado de sensores ",
            font=("Arial", 11, "bold"), padx=15, pady=15
        )
        panel_sensores.pack(fill="x")

        self.crear_sensor(panel_sensores, "SENSOR A", 0)
        self.crear_sensor(panel_sensores, "SENSOR B", 1)

        panel_botones = tk.Frame(contenido)
        panel_botones.pack(pady=15)

        tk.Button(
            panel_botones, text="NUEVA LECTURA", width=18, height=2,
            font=("Arial", 10, "bold"), command=self.nueva_lectura
        ).grid(row=0, column=0, padx=5)

        tk.Button(
            panel_botones, text="INICIAR SIMULACIÓN", width=18, height=2,
            font=("Arial", 10, "bold"), command=self.simular
        ).grid(row=0, column=1, padx=5)

        tk.Button(
            panel_botones, text="LIMPIAR", width=12, height=2,
            command=self.limpiar
        ).grid(row=0, column=2, padx=5)

        tk.Button(
            panel_botones, text="VER GRÁFICAS", width=14, height=2,
            font=("Arial", 10, "bold"), bg="#1f2937", fg="white",
            command=self.abrir_ventana_graficas
        ).grid(row=0, column=3, padx=5)

        self.resultado = tk.Label(
            contenido, text="SISTEMA LISTO",
            font=("Arial", 16, "bold"), pady=5
        )
        self.resultado.pack()

        indicadores = tk.Frame(contenido)
        indicadores.pack(pady=10)

        self.lbl_lecturas = self.crear_indicador(indicadores, "LECTURAS", 0)
        self.lbl_ok = self.crear_indicador(indicadores, "CONSISTENTES", 1)
        self.lbl_alertas = self.crear_indicador(indicadores, "ALERTAS", 2)

        panel_historial = tk.LabelFrame(
            contenido, text=" Historial ", font=("Arial", 11, "bold")
        )
        panel_historial.pack(fill="both", expand=True)

        columnas = ("Lectura", "Hora", "Sensor A", "Sensor B", "Resultado")

        self.tabla = ttk.Treeview(
            panel_historial, columns=columnas, show="headings"
        )

        for columna in columnas:
            self.tabla.heading(columna, text=columna)

        self.tabla.column("Lectura", width=70, anchor="center")
        self.tabla.column("Hora", width=90, anchor="center")
        self.tabla.column("Sensor A", width=120, anchor="center")
        self.tabla.column("Sensor B", width=120, anchor="center")
        self.tabla.column("Resultado", width=220, anchor="center")

        self.tabla.pack(fill="both", expand=True, padx=5, pady=5)

        self.tabla.tag_configure("ok", background="#e8f5e9")
        self.tabla.tag_configure("alerta", background="#ffebee")


    def crear_sensor(self, padre, nombre, columna):

        marco = tk.Frame(padre)
        marco.grid(row=0, column=columna, padx=60, pady=5)

        tk.Label(marco, text=nombre, font=("Arial", 11, "bold")).pack()

        estado = tk.Label(
            marco, text="NORMAL", font=("Arial", 18, "bold"), width=12
        )
        estado.pack(pady=5)

        if nombre == "SENSOR A":
            self.estado_a = estado
        else:
            self.estado_b = estado


    def crear_indicador(self, padre, titulo, columna):

        marco = tk.Frame(padre, padx=30)
        marco.grid(row=0, column=columna)

        tk.Label(marco, text=titulo, font=("Arial", 9)).pack()

        valor = tk.Label(marco, text="0", font=("Arial", 16, "bold"))
        valor.pack()

        return valor


    # GENERAR LECTURA CRUDA (voltaje simulado)
    # Simula que el sensor en realidad entrega un valor continuo
    # cercano a 0.2 (estado normal) o a 0.8 (estado alterado), con
    # algo de ruido. Esto es lo que le da "cuerpo" al boxplot.

    def generar_lectura_cruda(self, estado):

        if estado == 0:
            valor = random.gauss(0.2, 0.08)
        else:
            valor = random.gauss(0.8, 0.08)

        # Limitar el valor entre 0 y 1 por si el ruido se pasa
        return max(0.0, min(1.0, valor))


    # NUEVA LECTURA

    def nueva_lectura(self):

        # Estado "real" que determina hacia dónde tiende el sensor A
        estado_a = random.randint(0, 1)

        # 15% de probabilidad de que el sensor B tienda hacia el
        # estado contrario (simula una inconsistencia real)
        if random.random() < 0.15:
            estado_b = 1 - estado_a
        else:
            estado_b = estado_a

        # Lecturas crudas continuas (para el boxplot)
        crudo_a = self.generar_lectura_cruda(estado_a)
        crudo_b = self.generar_lectura_cruda(estado_b)

        # Umbral de decisión: por debajo de 0.5 es NORMAL (0),
        # por encima es ALTERADO (1). Aquí es donde el problema
        # binario original (el que se compara con Deutsch en la
        # parte cuántica) sigue intacto.
        sensor_a = 0 if crudo_a < 0.5 else 1
        sensor_b = 0 if crudo_b < 0.5 else 1

        self.procesar_lectura(sensor_a, sensor_b, crudo_a, crudo_b)


    def simular(self):
        for _ in range(20):
            self.nueva_lectura()


    # PROCESAR LECTURA (comparación clásica sobre valores binarios)

    def procesar_lectura(self, sensor_a, sensor_b, crudo_a, crudo_b):

        self.lecturas += 1

        # Guardamos el valor crudo (continuo), no el binario, para
        # que el boxplot tenga dispersión real
        self.historial_a.append(crudo_a)
        self.historial_b.append(crudo_b)

        self.actualizar_sensor(self.estado_a, sensor_a)
        self.actualizar_sensor(self.estado_b, sensor_b)

        hora = datetime.now().strftime("%H:%M:%S")

        # Comparación clásica: if sensor_a == sensor_b
        if sensor_a == sensor_b:
            resultado = "LECTURA CONSISTENTE"
            etiqueta = "ok"
            self.consistentes += 1
            self.resultado.config(text="✓ LECTURA CONSISTENTE")
        else:
            resultado = "INCONSISTENCIA DETECTADA"
            etiqueta = "alerta"
            self.alertas += 1
            self.resultado.config(text="⚠️ INCONSISTENCIA DETECTADA")

        self.tabla.insert(
            "", "end",
            values=(self.lecturas, hora, sensor_a, sensor_b, resultado),
            tags=(etiqueta,)
        )

        self.actualizar_indicadores()

        if self.ventana_graficas is not None:
            self.actualizar_graficas()


    def actualizar_sensor(self, etiqueta, valor):
        if valor == 0:
            etiqueta.config(text="NORMAL")
        else:
            etiqueta.config(text="ALTERADO")


    def actualizar_indicadores(self):
        self.lbl_lecturas.config(text=str(self.lecturas))
        self.lbl_ok.config(text=str(self.consistentes))
        self.lbl_alertas.config(text=str(self.alertas))


    # VENTANA APARTE DE GRÁFICAS

    def abrir_ventana_graficas(self):

        if self.ventana_graficas is not None:
            self.ventana_graficas.lift()
            return

        self.ventana_graficas = tk.Toplevel(self.root)
        self.ventana_graficas.title("Gráficas | Monitor Industrial")
        self.ventana_graficas.geometry("800x420")
        self.ventana_graficas.minsize(600, 350)

        self.ventana_graficas.protocol(
            "WM_DELETE_WINDOW", self.cerrar_ventana_graficas
        )

        self.figura_graficas = Figure(figsize=(8, 3.8), dpi=90)
        self.ax_barras = self.figura_graficas.add_subplot(1, 2, 1)
        self.ax_boxplot = self.figura_graficas.add_subplot(1, 2, 2)

        self.canvas_graficas = FigureCanvasTkAgg(
            self.figura_graficas, master=self.ventana_graficas
        )
        self.canvas_graficas.get_tk_widget().pack(
            fill="both", expand=True, padx=10, pady=10
        )

        self.actualizar_graficas()


    def cerrar_ventana_graficas(self):
        self.ventana_graficas.destroy()
        self.ventana_graficas = None
        self.ax_barras = None
        self.ax_boxplot = None
        self.figura_graficas = None
        self.canvas_graficas = None


    def actualizar_graficas(self):

        if self.ventana_graficas is None:
            return

        # Gráfica 1: barras (consistentes vs alertas)
        self.ax_barras.clear()

        categorias = ["Consistentes", "Alertas"]
        valores = [self.consistentes, self.alertas]
        colores = ["#4caf50", "#e53935"]

        self.ax_barras.bar(categorias, valores, color=colores)
        self.ax_barras.set_ylabel("Cantidad")
        self.ax_barras.set_title(f"Total de lecturas: {self.lecturas}", fontsize=10)
        self.ax_barras.set_ylim(bottom=0)

        # Gráfica 2: boxplot (lecturas crudas, continuas)
        self.ax_boxplot.clear()

        if self.historial_a and self.historial_b:
            self.ax_boxplot.boxplot(
                [self.historial_a, self.historial_b],
                tick_labels=["Sensor A", "Sensor B"]
            )
        else:
            self.ax_boxplot.text(
                0.5, 0.5, "Sin datos todavía",
                ha="center", va="center",
                transform=self.ax_boxplot.transAxes
            )

        self.ax_boxplot.set_title("Distribución de lecturas crudas por sensor", fontsize=10)
        self.ax_boxplot.set_ylabel("Valor crudo simulado (0=normal, 1=alterado)")

        self.figura_graficas.tight_layout()
        self.canvas_graficas.draw()


    def limpiar(self):

        self.lecturas = 0
        self.consistentes = 0
        self.alertas = 0
        self.historial_a = []
        self.historial_b = []

        for elemento in self.tabla.get_children():
            self.tabla.delete(elemento)

        self.estado_a.config(text="NORMAL")
        self.estado_b.config(text="NORMAL")
        self.resultado.config(text="SISTEMA LISTO")

        self.actualizar_indicadores()

        if self.ventana_graficas is not None:
            self.actualizar_graficas()


if __name__ == "__main__":

    root = tk.Tk()
    app = SistemaMonitoreo(root)
    root.mainloop()