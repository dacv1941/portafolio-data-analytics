import numpy as np
import pandas as pd
from datetime import date

np.random.seed(7)

empresa = "Grupo Vantia" # empresa ficticia

departamentos = {
    "Comercial": 1.00,
    "Operaciones": 1.15,
    "Tecnología": 0.85,
    "Marketing": 0.60,
    "Administración": 0.45,
    "Recursos Humanos": 0.35,
}

categorias = {
    "Nómina": 0.55,
    "Marketing y publicidad": 0.12,
    "Tecnología y software": 0.10,
    "Viajes y viáticos": 0.08,
    "Arrendamientos": 0.09,
    "Otros gastos operativos": 0.06,
}

meses = pd.date_range("2025-01-01", "2025-12-01", freq="MS")

rows = []
for depto, peso_depto in departamentos.items():
    presupuesto_mensual_base = 180_000_000 * peso_depto / 12  # COP, presupuesto anual total ~180M repartido

    for mes in meses:
        estacionalidad = 1.0
        if mes.month in [6, 12]:  # bonificaciones / cierre de año
            estacionalidad = 1.25
        elif mes.month in [1, 2]:
            estacionalidad = 0.9

        for cat, peso_cat in categorias.items():
            presupuestado = presupuesto_mensual_base * peso_cat * estacionalidad
            # ejecución real con desviación aleatoria; algunas categorías con sesgo de sobreejecución
            sesgo = 1.0
            if cat == "Marketing y publicidad" and depto == "Comercial":
                sesgo = 1.18  # sobreejecución típica
            if cat == "Tecnología y software" and depto == "Tecnología":
                sesgo = 1.22
            if cat == "Nómina":
                sesgo = 1.02  # nómina rara vez baja de lo presupuestado

            ruido = np.random.normal(1.0, 0.09)
            ejecutado = presupuestado * sesgo * ruido

            rows.append({
                "fecha": mes.date().isoformat(),
                "anio": mes.year,
                "mes_num": mes.month,
                "mes_nombre": mes.strftime("%B"),
                "departamento": depto,
                "categoria": cat,
                "presupuestado": round(presupuestado, -3),
                "ejecutado": round(ejecutado, -3),
            })

df = pd.DataFrame(rows)
df["variacion"] = df["ejecutado"] - df["presupuestado"]
df["variacion_pct"] = (df["variacion"] / df["presupuestado"] * 100).round(1)

df.to_csv("/home/claude/proyecto-03-powerbi/Fact_Presupuesto.csv", index=False)

# Dimensión de fecha (útil para Power BI)
dim_fecha = pd.DataFrame({"fecha": meses.date})
dim_fecha["anio"] = pd.to_datetime(dim_fecha["fecha"]).dt.year
dim_fecha["mes_num"] = pd.to_datetime(dim_fecha["fecha"]).dt.month
dim_fecha["mes_nombre"] = pd.to_datetime(dim_fecha["fecha"]).dt.strftime("%B")
dim_fecha["trimestre"] = pd.to_datetime(dim_fecha["fecha"]).dt.quarter
dim_fecha.to_csv("/home/claude/proyecto-03-powerbi/Dim_Fecha.csv", index=False)

print(df.shape)
print(df.head())
print("\nTotal presupuestado 2025:", df["presupuestado"].sum())
print("Total ejecutado 2025:", df["ejecutado"].sum())
print("Variación total:", df["variacion"].sum())
