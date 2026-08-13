# Predicción de Rotación de Personal (Employee Attrition)

**Autor:** Diego Armando Castro Vera — Estadístico | Data Analyst | People Analytics
**Stack:** Python (Pandas, Scikit-learn) · React (visualización) · Regresión Logística · Random Forest

## Contexto del caso

Una organización quiere entender qué factores predicen que un empleado renuncie voluntariamente,
para poder actuar de forma preventiva en lugar de reactiva. Se usa el dataset público
**IBM HR Analytics Employee Attrition & Performance** (1,470 empleados, 35 variables).

## Objetivo

1. Diagnosticar en qué segmentos se concentra la rotación (EDA).
2. Entrenar y comparar dos modelos de clasificación: Regresión Logística (interpretable) y
   Random Forest (mejor poder predictivo).
3. Identificar las variables más predictivas y la dirección de su efecto.
4. Generar un score de riesgo por empleado para priorizar acciones de retención.
5. Traducir los hallazgos técnicos en recomendaciones de negocio accionables.

## Estructura del repositorio

```
proyecto-02-attrition/
├── analisis.py                 # EDA, entrenamiento de modelos, evaluación
├── dashboard-attrition.jsx     # Dashboard ejecutivo interactivo (React)
└── README.md
```

## Cómo replicarlo

```bash
pip install pandas numpy scikit-learn
python analisis.py
```

El dataset se puede descargar públicamente buscando "IBM HR Analytics Employee Attrition Dataset"
(Kaggle) o desde cualquiera de sus múltiples mirrors públicos en GitHub.

## Resultados principales

- **Tasa de rotación real:** 16.1%
- **AUC del modelo (regresión logística):** 0.80
- **AUC del modelo (Random Forest):** 0.77

### Variables más predictivas (y dirección del efecto)

| Variable | Efecto |
|---|---|
| Ingreso mensual | ↓ a mayor ingreso, menor rotación |
| Horas extra | ↑ el factor individual más fuerte |
| Antigüedad total | ↓ a más experiencia, menor rotación |
| Años con el mismo jefe | ↓ estabilidad de liderazgo reduce fuga |
| Distancia al trabajo | ↑ mayor distancia, mayor rotación |
| Número de empresas previas | ↑ historial de rotación se repite |

### Hallazgos de negocio

- Empleados con horas extra rotan **3x más** (30.5% vs 10.4%).
- El segmento con ingreso **<$3,000** tiene 28.6% de rotación, más del doble que el resto.
- Los primeros 2 años de antigüedad concentran el mayor riesgo (29.8%).
- El rol de **Sales Representative** tiene la tasa más alta de toda la compañía (39.8%).

## Metodología

Se comparó una Regresión Logística (para interpretar dirección y magnitud del efecto de cada
variable) con un Random Forest (para capturar relaciones no lineales y obtener mejor poder
predictivo). Ambos modelos se entrenaron con validación holdout (75/25) y se balanceó la clase
minoritaria (`class_weight="balanced"`) dado que solo el 16% de los casos son rotación positiva.

## Contacto

📧 dacv1941@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/diego-armando-castro-vera8a52a8177/)
