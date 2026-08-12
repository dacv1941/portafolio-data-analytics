# Distribución de Presupuesto de Incrementos Salariales — Banco Aurora (caso ficticio)

**Autor:** Diego Armando Castro Vera — Estadístico | Data Analyst | People Analytics
**Stack:** Python (Pandas, NumPy) · React (visualización) · Análisis estadístico aplicado a compensación

## Contexto del caso

El comité de compensación de una entidad financiera debe distribuir un presupuesto de
incrementos salariales equivalente al **4.2% de la masa salarial**, frente a una inflación
proyectada del **6.1%**. No todos los colaboradores pueden recibir un incremento que iguale
el costo de vida, por lo que se requiere un criterio de priorización basado en datos.

> Nota: "Banco Aurora" es una entidad ficticia. El dataset de 300 empleados fue generado
> sintéticamente para fines de portafolio profesional — no corresponde a datos reales de
> ninguna empresa.

## Objetivo

1. Diagnosticar el estado actual de equidad salarial (brechas de género, compa-ratio frente
   al mercado).
2. Diseñar y ejecutar un algoritmo de distribución del presupuesto que respete las políticas
   de la compañía (mínimo por desempeño, tope por área).
3. Priorizar los 10 casos más urgentes de atender.
4. Documentar riesgos, supuestos y limitaciones del análisis para el comité.

## Estructura del repositorio

```
proyecto-01-compensacion/
├── generar_datos.py         # Genera el dataset sintético de 300 empleados
├── analisis.py               # Diagnóstico de equidad + algoritmo de distribución del presupuesto
├── dashboard-compensacion.jsx  # Dashboard ejecutivo interactivo (React)
└── README.md
```

## Cómo replicarlo

```bash
pip install pandas numpy
python generar_datos.py   # genera empleados_sinteticos.csv y rotacion_por_area.csv
python analisis.py        # corre el diagnóstico y el algoritmo de distribución
```

El dashboard (`dashboard-compensacion.jsx`) está pensado para renderizarse como componente
React (por ejemplo dentro de un proyecto Vite/Create React App, o como artifact de Claude).

## Metodología de priorización

El score de prioridad combina:
- **Compa-ratio** (salario actual / mediana de mercado de la banda) — a menor compa-ratio, mayor prioridad
- **Desempeño** (solo aplican colaboradores con desempeño "cumple", 3+)
- **Rotación voluntaria del área** — áreas con más fuga de talento pesan más
- **Antigüedad** en la compañía

El presupuesto se asigna de forma iterativa a los casos de mayor score, respetando que
ninguna área reciba más del 30% del presupuesto total.

## Principales hallazgos

- Brecha de género de ~2 puntos porcentuales en compa-ratio, más marcada en las bandas
  Analista Senior y Coordinador.
- 117 de 300 colaboradores están por debajo del percentil de mercado (compa-ratio < 0.90).
- El área de Tecnología concentra el mayor riesgo de fuga (18% de rotación voluntaria) y
  requiere atención prioritaria en la asignación del presupuesto.

## Contacto

📧 dacv1941@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/diego-armando-castro-vera8a52a8177/)
