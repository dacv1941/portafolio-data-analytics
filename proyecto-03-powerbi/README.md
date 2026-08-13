# Proyecto 3 — Análisis de Presupuesto vs. Ejecución (Power BI)

**Empresa ficticia:** Grupo Vantia
**Caso de negocio:** El equipo de Finanzas necesita monitorear mensualmente la ejecución
presupuestal por departamento y categoría de gasto, identificar sobreejecuciones y explicar
las causas al comité financiero.

## Archivos incluidos

- `Fact_Presupuesto.csv` — tabla de hechos: 432 filas (6 departamentos × 6 categorías × 12 meses de 2025)
- `Dim_Fecha.csv` — dimensión de fecha auxiliar

## Paso 1 — Importar los datos

1. Abre Power BI Desktop → **Obtener datos** → **Texto o CSV**.
2. Importa `Fact_Presupuesto.csv` y `Dim_Fecha.csv`.
3. Ve a **Transformar datos** (Power Query) y confirma que:
   - `fecha` esté como tipo **Fecha**
   - `presupuestado`, `ejecutado`, `variacion` estén como **Número decimal**
   - `variacion_pct` esté como **Número decimal**

## Paso 2 — Modelo de datos (relaciones)

1. Ve a la vista **Modelo** (ícono de la izquierda).
2. Arrastra el campo `fecha` de `Dim_Fecha` hacia el campo `fecha` de `Fact_Presupuesto` para
   crear la relación (cardinalidad 1 a muchos, con Dim_Fecha como el lado "1").
3. Esto te permite usar `Dim_Fecha` como tu tabla de fechas maestra para segmentadores (slicers)
   y jerarquías de tiempo.

## Paso 3 — Medidas DAX

Ve a `Fact_Presupuesto` → clic derecho → **Nueva medida**, y crea estas 6 medidas una por una:

```dax
Total Presupuestado = SUM(Fact_Presupuesto[presupuestado])
```

```dax
Total Ejecutado = SUM(Fact_Presupuesto[ejecutado])
```

```dax
Variación = [Total Ejecutado] - [Total Presupuestado]
```

```dax
Variación % = DIVIDE([Variación], [Total Presupuestado], 0)
```

```dax
% Ejecución = DIVIDE([Total Ejecutado], [Total Presupuestado], 0)
```

```dax
Departamentos Sobreejecutados =
CALCULATE(
    DISTINCTCOUNT(Fact_Presupuesto[departamento]),
    FILTER(
        VALUES(Fact_Presupuesto[departamento]),
        CALCULATE([Variación %]) > 0.10
    )
)
```

## Paso 4 — Diseño del dashboard (una sola página, tipo ejecutivo)

**Fila superior — Tarjetas de KPI (Card visual):**
- Total Presupuestado
- Total Ejecutado
- Variación % (formatea con regla condicional: verde si ≤0%, rojo si >5%)
- Departamentos Sobreejecutados

**Fila media — Análisis por departamento:**
- Gráfico de barras agrupadas (Clustered bar chart): eje Y = `departamento`, valores =
  `Total Presupuestado` y `Total Ejecutado` lado a lado
- Esto responde: ¿qué departamento se sale más del presupuesto?

**Fila media — Tendencia mensual:**
- Gráfico de líneas (Line chart): eje X = `mes_nombre` (ordenado por `mes_num`), valores =
  `Total Presupuestado` y `Total Ejecutado`
- Esto muestra la estacionalidad (picos en junio y diciembre)

**Fila inferior — Tabla detallada (Matrix visual):**
- Filas: `departamento` → `categoria` (jerarquía)
- Valores: `Total Presupuestado`, `Total Ejecutado`, `Variación %`
- Aplica formato condicional (íconos) a `Variación %`: 🔴 si >10%, 🟡 si 0-10%, 🟢 si ≤0%

**Segmentadores (slicers) arriba de todo:**
- Uno por `departamento`
- Uno por `mes_nombre` (o usa la jerarquía de `Dim_Fecha`)

## Paso 5 — Insight que debes poder explicar (para tu video de portafolio)

Con estos datos vas a encontrar que:
- **Tecnología** y **Comercial** son los departamentos con mayor sobreejecución, concentrada
  en las categorías de "Tecnología y software" y "Marketing y publicidad" respectivamente.
- **Nómina** casi nunca ejecuta por debajo del presupuesto (es la categoría más rígida).
- Junio y diciembre muestran picos de ejecución por bonificaciones — esto es estacionalidad
  esperada, no un problema de control presupuestal.

Practica explicar esto en 2-3 minutos como si se lo presentaras a un comité financiero:
diagnóstico → causa raíz → recomendación.

## Paso 6 — Publicar y agregar a tu portafolio

1. **Archivo → Publicar → Publicar en Power BI** (necesitas cuenta gratuita en powerbi.com).
2. En [app.powerbi.com](https://app.powerbi.com), abre tu reporte → **Archivo → Insertar
   informe → Publicar en la Web (público)**.
3. Copia el código `<iframe>` que te da Power BI.
4. Pásamelo y lo incrusto en una nueva página de tu sitio (`presupuesto.html`), agregada al
   mismo portafolio de GitHub Pages que ya tienes.

⚠️ **Advertencia de privacidad:** "Publicar en la Web" hace el reporte visible para cualquier
persona con el link, sin necesidad de iniciar sesión. Está perfecto para este dataset sintético
de portafolio — **nunca lo uses con datos reales de un cliente o empleador**.

## Contacto

📧 dacv1941@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/diego-armando-castro-vera8a52a8177/)
