import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    classification_report, roc_auc_score, confusion_matrix, roc_curve
)
import json

df = pd.read_csv("/home/claude/attrition_raw.csv", encoding="utf-8-sig")
print("Shape:", df.shape)
print("Attrition rate:", df["Attrition"].value_counts(normalize=True).round(3).to_dict())

# ---- Limpieza básica ----
drop_cols = ["EmployeeCount", "EmployeeNumber", "Over18", "StandardHours"]
df = df.drop(columns=[c for c in drop_cols if c in df.columns])

df["Attrition_bin"] = (df["Attrition"] == "Yes").astype(int)

# ---- EDA: tasas de attrition por variable clave ----
eda = {}
eda["por_overtime"] = df.groupby("OverTime")["Attrition_bin"].mean().round(3).to_dict()
eda["por_departamento"] = df.groupby("Department")["Attrition_bin"].mean().round(3).to_dict()
eda["por_jobrole"] = df.groupby("JobRole")["Attrition_bin"].mean().round(3).sort_values(ascending=False).to_dict()
eda["por_worklifebalance"] = df.groupby("WorkLifeBalance")["Attrition_bin"].mean().round(3).to_dict()
eda["por_maritalstatus"] = df.groupby("MaritalStatus")["Attrition_bin"].mean().round(3).to_dict()
eda["por_businesstravel"] = df.groupby("BusinessTravel")["Attrition_bin"].mean().round(3).to_dict()

# ingreso: bins
df["income_bin"] = pd.cut(df["MonthlyIncome"], bins=[0, 3000, 6000, 10000, 20000],
                            labels=["<3k", "3k-6k", "6k-10k", ">10k"])
eda["por_ingreso"] = df.groupby("income_bin", observed=True)["Attrition_bin"].mean().round(3).to_dict()

# antigüedad
df["tenure_bin"] = pd.cut(df["YearsAtCompany"], bins=[-1, 2, 5, 10, 40],
                            labels=["0-2 años", "3-5 años", "6-10 años", "10+ años"])
eda["por_antiguedad"] = df.groupby("tenure_bin", observed=True)["Attrition_bin"].mean().round(3).to_dict()

print("\n=== EDA ===")
for k, v in eda.items():
    print(k, v)

# ---- Modelado: Regresión Logística (interpretable) + Random Forest (mejor performance) ----
cat_cols = df.select_dtypes(include="object").columns.tolist()
cat_cols = [c for c in cat_cols if c != "Attrition"]
num_cols = [c for c in df.select_dtypes(include=np.number).columns if c not in ["Attrition_bin"]]

X = df[cat_cols + num_cols].copy()
y = df["Attrition_bin"]

encoders = {}
for c in cat_cols:
    le = LabelEncoder()
    X[c] = le.fit_transform(X[c])
    encoders[c] = le

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s = scaler.transform(X_test)

# Regresión logística
logreg = LogisticRegression(max_iter=2000, class_weight="balanced", random_state=42)
logreg.fit(X_train_s, y_train)
y_pred_lr = logreg.predict(X_test_s)
y_proba_lr = logreg.predict_proba(X_test_s)[:, 1]

print("\n=== LOGISTIC REGRESSION ===")
print(classification_report(y_test, y_pred_lr))
print("AUC:", round(roc_auc_score(y_test, y_proba_lr), 3))

# Random Forest
rf = RandomForestClassifier(n_estimators=300, max_depth=6, class_weight="balanced", random_state=42)
rf.fit(X_train, y_train)
y_pred_rf = rf.predict(X_test)
y_proba_rf = rf.predict_proba(X_test)[:, 1]

print("\n=== RANDOM FOREST ===")
print(classification_report(y_test, y_pred_rf))
print("AUC:", round(roc_auc_score(y_test, y_proba_rf), 3))

# Importancia de variables (Random Forest)
importances = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
print("\n=== TOP 10 VARIABLES MÁS IMPORTANTES (Random Forest) ===")
print(importances.head(10))

# Coeficientes logísticos (dirección del efecto) para las variables top del RF
top_vars = importances.head(10).index.tolist()
coef_map = dict(zip(X.columns, logreg.coef_[0]))
print("\n=== DIRECCIÓN DEL EFECTO (coef. regresión logística, top variables RF) ===")
for v in top_vars:
    print(f"{v}: {coef_map[v]:+.3f}")

# ROC curve data para el dashboard
fpr, tpr, _ = roc_curve(y_test, y_proba_rf)
roc_points = [{"fpr": round(f, 3), "tpr": round(t, 3)} for f, t in zip(fpr[::5], tpr[::5])]

# Confusion matrix
cm = confusion_matrix(y_test, y_pred_rf).tolist()

# Score de riesgo para todos los empleados (para identificar top-N en riesgo)
df["risk_score"] = rf.predict_proba(X)[:, 1]
top_riesgo = df.sort_values("risk_score", ascending=False).head(15)

resultado = {
    "n_empleados": int(len(df)),
    "attrition_rate": float(df["Attrition_bin"].mean()),
    "eda": eda,
    "auc_logreg": float(round(roc_auc_score(y_test, y_proba_lr), 3)),
    "auc_rf": float(round(roc_auc_score(y_test, y_proba_rf), 3)),
    "top_variables": {k: float(round(v, 4)) for k, v in importances.head(10).items()},
    "direccion_efecto": {k: float(round(coef_map[k], 3)) for k in top_vars},
    "roc_points": roc_points,
    "confusion_matrix": cm,
    "top15_riesgo": top_riesgo[["Age", "Department", "JobRole", "OverTime", "MonthlyIncome",
                                  "YearsAtCompany", "WorkLifeBalance", "risk_score"]].round(3).to_dict(orient="records"),
}

with open("/home/claude/attrition_resultado.json", "w") as f:
    json.dump(resultado, f, indent=2, ensure_ascii=False)

df.to_csv("/home/claude/attrition_con_scores.csv", index=False)
print("\nOK - attrition_resultado.json generado")
