import pandas as pd
import numpy as np

df = pd.read_csv("/home/claude/project/empleados_sinteticos.csv")
rot = pd.read_csv("/home/claude/project/rotacion_por_area.csv")

# ---- Parámetros del caso (ficticios, distintos al ejercicio original) ----
PRESUPUESTO_PCT = 0.042      # 4.2% de la masa salarial
INFLACION_PROY = 0.061       # 6.1%
MIN_INCREMENTO_CUMPLE = 0.035  # 3.5% para desempeño >=3
TOPE_POR_AREA = 0.30         # ninguna área puede recibir más del 30% del presupuesto total

masa_salarial = df["salario_actual"].sum()
presupuesto_total = masa_salarial * PRESUPUESTO_PCT

print("=== DIAGNÓSTICO ===")
print(f"Masa salarial total: {masa_salarial:,.0f}")
print(f"Presupuesto de incrementos ({PRESUPUESTO_PCT:.1%}): {presupuesto_total:,.0f}")
print(f"Brecha vs inflación proyectada: {INFLACION_PROY - PRESUPUESTO_PCT:.1%}")

# Brecha de género por banda (compa-ratio promedio)
brecha_genero = df.groupby(["banda", "genero"])["compa_ratio"].mean().unstack()
brecha_genero["brecha_pp"] = (brecha_genero["Masculino"] - brecha_genero["Femenino"]) * 100
print("\n=== BRECHA DE GÉNERO POR BANDA (compa-ratio) ===")
print(brecha_genero.round(3))

# Empleados por debajo del mercado (compa-ratio < 0.90) -> riesgo de fuga
df["riesgo_mercado"] = df["compa_ratio"] < 0.90
print(f"\nEmpleados con compa-ratio < 0.90 (por debajo de mercado): {df['riesgo_mercado'].sum()} de {len(df)}")

# ---- Algoritmo de distribución ----
def incremento_base(row):
    if row["desempeno"] < 3:
        return 0.0
    # base mínima de política
    inc = MIN_INCREMENTO_CUMPLE
    return inc

df["incremento_pct_base"] = df.apply(incremento_base, axis=1)

# Score de priorización: combina riesgo de mercado, desempeño alto, antigüedad y rotación del área
rot_map = rot.set_index("area")["rotacion_voluntaria_2025"].to_dict()
df["rotacion_area"] = df["area"].map(rot_map)

df["score_prioridad"] = (
    (1 - df["compa_ratio"].clip(upper=1.2)) * 40      # a menor compa-ratio, mayor score
    + (df["desempeno"] / 5) * 25                        # desempeño alto pesa
    + df["rotacion_area"] * 100 * 0.20                  # rotación del área
    + (df["antiguedad_anios"] / df["antiguedad_anios"].max()) * 15
)
df.loc[df["desempeno"] < 3, "score_prioridad"] = 0  # política: no cumple no aplica

# Ajuste iterativo simple: dar incremento extra a los de mayor score hasta agotar presupuesto,
# respetando tope por área
presupuesto_restante = presupuesto_total - (df["salario_actual"] * df["incremento_pct_base"]).sum()
tope_area_valor = presupuesto_total * TOPE_POR_AREA

gasto_por_area = (df["salario_actual"] * df["incremento_pct_base"]).groupby(df["area"]).sum().to_dict()
gasto_por_area = {a: gasto_por_area.get(a, 0) for a in df["area"].unique()}

df["incremento_pct_final"] = df["incremento_pct_base"]

orden = df[df["desempeno"] >= 3].sort_values("score_prioridad", ascending=False).index
extra_pct_paso = 0.005  # incrementos adicionales en pasos de 0.5pp

for idx in orden:
    area = df.loc[idx, "area"]
    while presupuesto_restante > 0:
        costo_paso = df.loc[idx, "salario_actual"] * extra_pct_paso
        if gasto_por_area[area] + costo_paso > tope_area_valor:
            break
        if costo_paso > presupuesto_restante:
            break
        df.loc[idx, "incremento_pct_final"] += extra_pct_paso
        gasto_por_area[area] += costo_paso
        presupuesto_restante -= costo_paso
        if df.loc[idx, "incremento_pct_final"] >= 0.08:  # tope individual razonable
            break

df["incremento_valor"] = df["salario_actual"] * df["incremento_pct_final"]
df["salario_propuesto"] = df["salario_actual"] + df["incremento_valor"]

print(f"\nPresupuesto usado: {presupuesto_total - presupuesto_restante:,.0f} de {presupuesto_total:,.0f}")
print(f"Presupuesto sin asignar: {presupuesto_restante:,.0f}")

print("\n=== GASTO POR ÁREA vs TOPE ===")
for a, v in gasto_por_area.items():
    print(f"{a}: {v:,.0f} / tope {tope_area_valor:,.0f} ({v/tope_area_valor:.1%})")

# Top 10 casos prioritarios
top10 = df[df["desempeno"] >= 3].sort_values("score_prioridad", ascending=False).head(10)
print("\n=== TOP 10 CASOS PRIORITARIOS ===")
print(top10[["id_empleado", "area", "banda", "genero", "desempeno", "compa_ratio", "incremento_pct_final"]].round(3))

df.to_csv("/home/claude/project/empleados_con_propuesta.csv", index=False)
top10.to_csv("/home/claude/project/top10_prioritarios.csv", index=False)

# Resumen para el dashboard (JSON)
import json
resumen = {
    "masa_salarial": float(masa_salarial),
    "presupuesto_total": float(presupuesto_total),
    "presupuesto_pct": PRESUPUESTO_PCT,
    "inflacion_proy": INFLACION_PROY,
    "presupuesto_usado": float(presupuesto_total - presupuesto_restante),
    "n_empleados": int(len(df)),
    "n_no_cumple": int((df["desempeno"] < 3).sum()),
    "n_riesgo_mercado": int(df["riesgo_mercado"].sum()),
    "brecha_genero_pp_promedio": float(brecha_genero["brecha_pp"].mean()),
    "gasto_por_area": {k: float(v) for k, v in gasto_por_area.items()},
    "tope_area_valor": float(tope_area_valor),
    "rotacion_por_area": rot_map,
    "brecha_genero_por_banda": brecha_genero.reset_index().round(4).to_dict(orient="records"),
}
with open("/home/claude/project/resumen.json", "w") as f:
    json.dump(resumen, f, indent=2, ensure_ascii=False)

print("\nOK - resumen.json generado")
