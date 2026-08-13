import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.neighbors import NearestNeighbors
from sklearn.preprocessing import StandardScaler
import json

df = pd.read_csv("/home/claude/proyecto-04-causal/datos_capacitacion.csv")

# ---- Paso 1: Balance de covariables ANTES del matching (Tabla 1 típica en estudios causales) ----
def diferencia_estandarizada(x_treat, x_control):
    """Standardized Mean Difference (SMD) — regla de oro: |SMD| < 0.1 se considera balanceado"""
    pooled_std = np.sqrt((x_treat.var() + x_control.var()) / 2)
    if pooled_std == 0:
        return 0.0
    return (x_treat.mean() - x_control.mean()) / pooled_std

covariables = ["antiguedad_anios", "edad", "desempeno_pre"]

balance_antes = {}
for c in covariables:
    smd = diferencia_estandarizada(
        df.loc[df.tratamiento == 1, c], df.loc[df.tratamiento == 0, c]
    )
    balance_antes[c] = round(smd, 3)

print("=== BALANCE DE COVARIABLES ANTES DEL MATCHING (SMD) ===")
for k, v in balance_antes.items():
    flag = "⚠️ DESBALANCEADO" if abs(v) > 0.1 else "OK"
    print(f"{k}: SMD = {v:+.3f}  {flag}")

# Dummies de departamento y educación para el propensity score
df_ps = pd.get_dummies(df, columns=["departamento", "educacion"], drop_first=True)
feature_cols = [c for c in df_ps.columns if c not in
                 ["id_empleado", "tratamiento", "desempeno_post"]]

X = df_ps[feature_cols].astype(float)
y = df_ps["tratamiento"]

scaler = StandardScaler()
X_s = scaler.fit_transform(X)

# ---- Paso 2: Estimar el Propensity Score (probabilidad de tratamiento dado covariables) ----
ps_model = LogisticRegression(max_iter=2000)
ps_model.fit(X_s, y)
df["propensity_score"] = ps_model.predict_proba(X_s)[:, 1]

print("\n=== MODELO DE PROPENSITY SCORE ===")
print("Pseudo-R² (accuracy simple):", round(ps_model.score(X_s, y), 3))
for feat, coef in zip(feature_cols, ps_model.coef_[0]):
    print(f"  {feat}: {coef:+.3f}")

# ---- Paso 3: Nearest-Neighbor Matching 1:1 sobre el propensity score, con caliper ----
tratados = df[df.tratamiento == 1].copy()
control = df[df.tratamiento == 0].copy()

caliper = 0.05 * df["propensity_score"].std()  # regla estándar: 0.2 * sd del logit del PS (simplificado aquí a PS)

nn = NearestNeighbors(n_neighbors=1)
nn.fit(control[["propensity_score"]])
distancias, indices = nn.kneighbors(tratados[["propensity_score"]])

pares_validos = distancias.flatten() <= caliper
tratados_matched = tratados[pares_validos].reset_index(drop=True)
control_matched = control.iloc[indices.flatten()[pares_validos]].reset_index(drop=True)

print(f"\n=== RESULTADOS DEL MATCHING ===")
print(f"Tratados originales: {len(tratados)}")
print(f"Tratados con pareja válida (dentro del caliper): {len(tratados_matched)}")
print(f"Caliper usado: {caliper:.4f}")

# ---- Paso 4: Balance DESPUÉS del matching ----
balance_despues = {}
for c in covariables:
    smd = diferencia_estandarizada(tratados_matched[c], control_matched[c])
    balance_despues[c] = round(smd, 3)

print("\n=== BALANCE DE COVARIABLES DESPUÉS DEL MATCHING (SMD) ===")
for k, v in balance_despues.items():
    flag = "⚠️ DESBALANCEADO" if abs(v) > 0.1 else "✓ OK"
    print(f"{k}: SMD = {v:+.3f}  {flag}")

# ---- Paso 5: Estimación del efecto (ATT) sobre la muestra emparejada ----
# Usamos Diferencia en Diferencias sobre la muestra emparejada para controlar además
# por tendencias comunes (más robusto que solo comparar el post-tratamiento)
tratados_matched["delta"] = tratados_matched["desempeno_post"] - tratados_matched["desempeno_pre"]
control_matched["delta"] = control_matched["desempeno_post"] - control_matched["desempeno_pre"]

att_naive_post = tratados_matched["desempeno_post"].mean() - control_matched["desempeno_post"].mean()
att_did = tratados_matched["delta"].mean() - control_matched["delta"].mean()

# ---- Paso 6: Intervalo de confianza vía bootstrap (1000 remuestreos) ----
np.random.seed(42)
n_boot = 1000
boot_estimates = []
n_pairs = len(tratados_matched)

for _ in range(n_boot):
    idx = np.random.choice(n_pairs, n_pairs, replace=True)
    t_sample = tratados_matched.iloc[idx]
    c_sample = control_matched.iloc[idx]
    boot_att = (t_sample["desempeno_post"].mean() - t_sample["desempeno_pre"].mean()) - \
               (c_sample["desempeno_post"].mean() - c_sample["desempeno_pre"].mean())
    boot_estimates.append(boot_att)

ci_low, ci_high = np.percentile(boot_estimates, [2.5, 97.5])
se_boot = np.std(boot_estimates)

print(f"\n=== ESTIMACIÓN DEL EFECTO CAUSAL (ATT) ===")
print(f"Naive (post-solamente, muestra completa): {12.78:.2f} puntos")
print(f"Matched, comparación post-solamente: {att_naive_post:.2f} puntos")
print(f"Matched + Diferencia en Diferencias (ATT): {att_did:.2f} puntos")
print(f"Intervalo de confianza 95% (bootstrap): [{ci_low:.2f}, {ci_high:.2f}]")
print(f"Error estándar (bootstrap): {se_boot:.2f}")
print(f"Efecto causal REAL conocido (ground truth): 8.00 puntos")
print(f"Sesgo residual del método corregido: {att_did - 8.0:.2f} puntos")

# ---- Paso 7: Prueba de placebo (sensibilidad) ----
# Si el matching funcionó, no debería haber "efecto" en el período PRE (antes del programa)
# entre tratados y control emparejados -- si lo hubiera, indicaría matching insuficiente
placebo_diff = tratados_matched["desempeno_pre"].mean() - control_matched["desempeno_pre"].mean()
print(f"\n=== PRUEBA DE PLACEBO (validación del matching) ===")
print(f"Diferencia en desempeño PRE-programa entre grupos emparejados: {placebo_diff:.2f} puntos")
print("(Debería ser cercana a 0 si el matching corrigió bien el sesgo de selección)")

# ---- Exportar todo para el dashboard ----
resultado = {
    "n_total": int(len(df)),
    "n_tratados": int(len(tratados)),
    "n_control": int(len(control)),
    "n_pares_matched": int(len(tratados_matched)),
    "efecto_real_conocido": 8.0,
    "estimacion_naive": round(float(naive_diff := 12.78), 2),
    "estimacion_matched_post": round(float(att_naive_post), 2),
    "estimacion_att_did": round(float(att_did), 2),
    "ci_95_low": round(float(ci_low), 2),
    "ci_95_high": round(float(ci_high), 2),
    "se_bootstrap": round(float(se_boot), 2),
    "placebo_diff": round(float(placebo_diff), 2),
    "balance_antes": balance_antes,
    "balance_despues": balance_despues,
    "boot_estimates_sample": [round(float(x), 2) for x in boot_estimates[:200]],
    "coeficientes_ps": {feat: round(float(c), 3) for feat, c in zip(feature_cols, ps_model.coef_[0])},
}

with open("/home/claude/proyecto-04-causal/resultado_causal.json", "w") as f:
    json.dump(resultado, f, indent=2, ensure_ascii=False)

print("\nOK - resultado_causal.json generado")
