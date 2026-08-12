import numpy as np
import pandas as pd

np.random.seed(42)

N = 300

areas = ["Tecnología", "Operaciones", "Comercial", "Riesgo", "Finanzas", "Talento Humano"]
area_weights = [0.22, 0.28, 0.20, 0.12, 0.10, 0.08]

bandas = ["Analista", "Analista Senior", "Coordinador", "Jefe", "Gerente"]
banda_base_salary = {  # salario base mensual en COP (miles)
    "Analista": 3200,
    "Analista Senior": 4500,
    "Coordinador": 6800,
    "Jefe": 9500,
    "Gerente": 15000,
}
banda_weights = [0.35, 0.30, 0.20, 0.10, 0.05]

genero_opts = ["Femenino", "Masculino"]

rows = []
for i in range(1, N + 1):
    area = np.random.choice(areas, p=area_weights)
    banda = np.random.choice(bandas, p=banda_weights)
    genero = np.random.choice(genero_opts, p=[0.47, 0.53])
    antiguedad = round(np.random.gamma(shape=2.2, scale=1.8), 1)
    antiguedad = min(antiguedad, 22)

    # desempeño: 1-5, correlacionado levemente con antigüedad, con ruido
    desempeno_raw = 3.0 + 0.03 * antiguedad + np.random.normal(0, 0.9)
    desempeno = int(np.clip(round(desempeno_raw), 1, 5))

    base = banda_base_salary[banda]
    # ruido individual +/- 15%
    salario = base * np.random.uniform(0.85, 1.15)
    # penalización de brecha de género simulada (para que el caso tenga sentido analítico): ~4-6% en promedio, con ruido
    if genero == "Femenino":
        salario *= np.random.uniform(0.90, 1.00)
    salario = round(salario, -1)  # redondear a decenas de miles

    # percentil de mercado simulado por banda (compa-ratio target)
    mercado_p50 = base * np.random.uniform(1.02, 1.10)
    compa_ratio = round(salario / mercado_p50, 3)

    rows.append({
        "id_empleado": f"E{i:03d}",
        "area": area,
        "banda": banda,
        "genero": genero,
        "antiguedad_anios": antiguedad,
        "desempeno": desempeno,
        "salario_actual": int(salario),
        "mercado_p50_banda": int(mercado_p50),
        "compa_ratio": compa_ratio,
    })

df = pd.DataFrame(rows)

# Tasa de rotación voluntaria por área (dato agregado simulado, como en el caso original)
rotacion = pd.DataFrame({
    "area": areas,
    "rotacion_voluntaria_2025": [0.18, 0.09, 0.14, 0.07, 0.06, 0.05],
})

df.to_csv("/home/claude/project/empleados_sinteticos.csv", index=False)
rotacion.to_csv("/home/claude/project/rotacion_por_area.csv", index=False)

print(df.shape)
print(df.head())
print(rotacion)
