import numpy as np
import pandas as pd

np.random.seed(123)

N = 600
TRUE_EFFECT = 8.0  # efecto causal REAL del programa (lo conocemos porque los datos son sintéticos,
                     # esto nos permite verificar qué tan bien lo recupera cada método)

departamentos = ["Comercial", "Servicio al Cliente", "Operaciones"]

# ---- Covariables basales (pre-programa) ----
tenure = np.random.gamma(shape=2.5, scale=1.6, size=N).round(1)
tenure = np.clip(tenure, 0.2, 15)

age = np.clip(np.random.normal(34, 8, N), 20, 60).round(0)

depto = np.random.choice(departamentos, N, p=[0.42, 0.33, 0.25])

educacion = np.random.choice(["Bachillerato", "Técnico", "Universitario", "Posgrado"], N,
                               p=[0.20, 0.35, 0.35, 0.10])

# desempeño BASAL (antes del programa) — variable clave, confusor
desempeno_pre = np.clip(np.random.normal(65, 12, N) + tenure * 0.8, 20, 100).round(1)

# ---- Asignación al tratamiento: NO aleatoria, depende del desempeño basal y antigüedad ----
# Esto crea el sesgo de selección: los "mejores" empleados son más propensos a recibir el programa
logit_treat = (
    -3.2
    + 0.045 * desempeno_pre
    + 0.12 * tenure
    + 0.01 * age
    + np.where(depto == "Comercial", 0.35, 0)
)
prob_treat = 1 / (1 + np.exp(-logit_treat))
tratamiento = (np.random.uniform(0, 1, N) < prob_treat).astype(int)

print("Tasa de tratamiento:", tratamiento.mean().round(3))
print("Desempeño basal promedio - tratados:", desempeno_pre[tratamiento == 1].mean().round(2))
print("Desempeño basal promedio - control:", desempeno_pre[tratamiento == 0].mean().round(2))

# ---- Resultado (desempeño post-programa) ----
# El desempeño post depende del basal (persistencia), una tendencia general, el efecto causal real
# del tratamiento, y ruido. IMPORTANTE: el desempeño basal afecta tanto la asignación como el resultado
# -> es un confusor clásico.
tendencia_general = 3.0  # todos mejoran un poco con el tiempo, tratados o no
ruido = np.random.normal(0, 7, N)

desempeno_post = (
    desempeno_pre * 0.75  # persistencia/regresión a la media parcial
    + tendencia_general
    + TRUE_EFFECT * tratamiento
    + ruido
)
desempeno_post = np.clip(desempeno_post, 20, 100).round(1)

df = pd.DataFrame({
    "id_empleado": [f"E{i:03d}" for i in range(1, N + 1)],
    "departamento": depto,
    "educacion": educacion,
    "antiguedad_anios": tenure,
    "edad": age,
    "desempeno_pre": desempeno_pre,
    "tratamiento": tratamiento,
    "desempeno_post": desempeno_post,
})

df.to_csv("/home/claude/proyecto-04-causal/datos_capacitacion.csv", index=False)

print("\nShape:", df.shape)
print(df.head())

# ---- Comparación naive (ingenua) ----
naive_diff = df.loc[df.tratamiento == 1, "desempeno_post"].mean() - df.loc[df.tratamiento == 0, "desempeno_post"].mean()
print(f"\nDiferencia NAIVE (tratados - control): {naive_diff:.2f} puntos")
print(f"Efecto causal REAL (conocido, por ser datos sintéticos): {TRUE_EFFECT:.2f} puntos")
print(f"Sesgo de la comparación naive: {naive_diff - TRUE_EFFECT:.2f} puntos ({(naive_diff/TRUE_EFFECT - 1)*100:.0f}% de sobreestimación)")
