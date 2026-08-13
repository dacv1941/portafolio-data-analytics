import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell, Legend
} from "recharts";

// ---------- DATOS REALES (IBM HR Analytics Employee Attrition Dataset, fuente pública) ----------

const RESUMEN = {
  n_empleados: 1470,
  attrition_rate: 0.161,
  auc_logreg: 0.80,
  auc_rf: 0.77,
};

const POR_OVERTIME = [
  { cat: "Sin horas extra", tasa: 10.4 },
  { cat: "Con horas extra", tasa: 30.5 },
];

const POR_INGRESO = [
  { cat: "<$3k", tasa: 28.6 },
  { cat: "$3k-6k", tasa: 12.7 },
  { cat: "$6k-10k", tasa: 12.0 },
  { cat: ">$10k", tasa: 8.9 },
];

const POR_ANTIGUEDAD = [
  { cat: "0-2 años", tasa: 29.8 },
  { cat: "3-5 años", tasa: 13.8 },
  { cat: "6-10 años", tasa: 12.3 },
  { cat: "10+ años", tasa: 8.1 },
];

const POR_JOBROLE = [
  { cat: "Sales Rep.", tasa: 39.8 },
  { cat: "Lab Technician", tasa: 23.9 },
  { cat: "HR", tasa: 23.1 },
  { cat: "Sales Exec.", tasa: 17.5 },
  { cat: "Research Sci.", tasa: 16.1 },
  { cat: "Healthcare Rep.", tasa: 6.9 },
  { cat: "Manufacturing Dir.", tasa: 6.9 },
  { cat: "Manager", tasa: 4.9 },
  { cat: "Research Dir.", tasa: 2.5 },
];

const TOP_VARIABLES = [
  { variable: "Ingreso mensual", importancia: 8.6, efecto: "−" },
  { variable: "Edad", importancia: 7.7, efecto: "−" },
  { variable: "Horas extra", importancia: 7.5, efecto: "+" },
  { variable: "Años de experiencia total", importancia: 6.8, efecto: "−" },
  { variable: "Años en la compañía", importancia: 6.0, efecto: "+" },
  { variable: "Años con el mismo jefe", importancia: 5.0, efecto: "−" },
  { variable: "Tarifa diaria", importancia: 4.9, efecto: "−" },
  { variable: "Nivel de acciones (stock)", importancia: 4.9, efecto: "−" },
  { variable: "Distancia al trabajo", importancia: 3.9, efecto: "+" },
  { variable: "Empresas previas trabajadas", importancia: 3.7, efecto: "+" },
];

const ROC = [
  { fpr: 0, tpr: 0 }, { fpr: 0.03, tpr: 0.14 }, { fpr: 0.06, tpr: 0.36 },
  { fpr: 0.1, tpr: 0.44 }, { fpr: 0.15, tpr: 0.56 }, { fpr: 0.22, tpr: 0.66 },
  { fpr: 0.3, tpr: 0.75 }, { fpr: 0.42, tpr: 0.83 }, { fpr: 0.58, tpr: 0.9 },
  { fpr: 0.78, tpr: 0.97 }, { fpr: 1, tpr: 1 },
];

const CONFUSION = { vp: 20, fp: 19, fn: 39, vn: 290 };

const TOP15 = [
  { edad: 19, dept: "Sales", rol: "Sales Representative", overtime: true, ingreso: 2121, antig: 1, riesgo: 0.921 },
  { edad: 26, dept: "R&D", rol: "Laboratory Technician", overtime: true, ingreso: 2340, antig: 1, riesgo: 0.918 },
  { edad: 19, dept: "Sales", rol: "Sales Representative", overtime: true, ingreso: 1675, antig: 0, riesgo: 0.916 },
  { edad: 29, dept: "R&D", rol: "Research Scientist", overtime: true, ingreso: 2439, antig: 1, riesgo: 0.899 },
  { edad: 22, dept: "R&D", rol: "Research Scientist", overtime: true, ingreso: 2472, antig: 1, riesgo: 0.896 },
];

const RECOMENDACIONES = [
  { t: "Revisar la política de horas extra en Sales y Laboratory", d: "El grupo con horas extra tiene 3x más rotación (30.5% vs 10.4%). Es la señal individual más fuerte y accionable de todo el modelo." },
  { t: "Programa de retención para los primeros 2 años", d: "El 29.8% de los empleados con 0-2 años de antigüedad rotan, casi el triple que empleados con 10+ años. El período crítico de onboarding necesita seguimiento activo." },
  { t: "Revisión salarial focalizada en el segmento <$3k", d: "Este grupo tiene 28.6% de rotación, más del doble que el resto. No requiere un ajuste general, sino uno dirigido a este segmento específico." },
  { t: "Atención especial a Sales Representative", d: "39.8% de rotación, el rol más alto de toda la compañía — casi 4 de cada 10 personas en ese rol se van. Vale la pena una entrevista de causa raíz específica para este rol." },
];

const INK = "#171B1A";
const TEAL = "#1F4B43";
const CORAL = "#C1573D";
const SAND = "#F3F1EA";
const MUTED = "#7A8580";
const LINE = "#DDD9CE";

function Bar1D({ value, max = 40, color }) {
  return (
    <div style={{ background: "#EDEBE2", height: 8, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color }} />
    </div>
  );
}

export default function AttritionDashboard() {
  const [tab, setTab] = useState("diagnostico");

  return (
    <div style={{ background: SAND, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: INK }}>
      <style>{`
        .serif2 { font-family: 'Newsreader', serif; }
        .mono2 { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <header style={{ borderBottom: `1px solid ${LINE}`, padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: CORAL, fontWeight: 600, marginBottom: 6 }}>
            People Analytics · Modelo Predictivo
          </div>
          <h1 className="serif2" style={{ fontSize: 34, fontWeight: 600, margin: 0, color: TEAL, lineHeight: 1.15 }}>
            Predicción de rotación de personal (Attrition)
          </h1>
          <p style={{ fontSize: 14, color: MUTED, marginTop: 8, maxWidth: 640 }}>
            Modelo de clasificación sobre 1,470 empleados (dataset público IBM HR Analytics) para identificar
            qué variables predicen la rotación voluntaria y priorizar acciones de retención.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: LINE, border: `1px solid ${LINE}` }}>
          {[
            { label: "Empleados analizados", value: RESUMEN.n_empleados, sub: "dataset IBM HR" },
            { label: "Tasa de rotación real", value: `${(RESUMEN.attrition_rate * 100).toFixed(1)}%`, sub: "base histórica" },
            { label: "AUC del modelo", value: RESUMEN.auc_logreg.toFixed(2), sub: "regresión logística" },
            { label: "Variable más predictiva", value: "Horas extra", sub: "3x más rotación" },
          ].map((k) => (
            <div key={k.label} style={{ background: SAND, padding: "18px 16px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: 8 }}>{k.label}</div>
              <div className="mono2" style={{ fontSize: 24, fontWeight: 500, color: TEAL }}>{k.value}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 0", display: "flex", gap: 4, flexWrap: "wrap" }}>
        {[
          { id: "diagnostico", label: "Diagnóstico exploratorio" },
          { id: "modelo", label: "Modelo predictivo" },
          { id: "riesgo", label: "Casos de mayor riesgo" },
          { id: "recomendaciones", label: "Recomendaciones" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "10px 16px", fontSize: 13, fontWeight: 500, border: "none",
              borderBottom: tab === t.id ? `2px solid ${TEAL}` : "2px solid transparent",
              background: "transparent", color: tab === t.id ? TEAL : MUTED, cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 60px" }}>
        {tab === "diagnostico" && (
          <div>
            <h2 className="serif2" style={{ fontSize: 20, color: TEAL, marginBottom: 4 }}>¿Quién se va, y por qué?</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 640 }}>
              La tasa de rotación general es del 16.1%. Estos cortes muestran dónde se concentra el riesgo real.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Rotación por horas extra</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={POR_OVERTIME} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide domain={[0, 40]} />
                    <YAxis type="category" dataKey="cat" width={110} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="tasa" radius={[0, 4, 4, 0]}>
                      {POR_OVERTIME.map((d, i) => <Cell key={i} fill={i === 1 ? CORAL : TEAL} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Rotación por rango de ingreso</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={POR_INGRESO} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide domain={[0, 40]} />
                    <YAxis type="category" dataKey="cat" width={70} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="tasa" radius={[0, 4, 4, 0]}>
                      {POR_INGRESO.map((d, i) => <Cell key={i} fill={i === 0 ? CORAL : TEAL} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Rotación por antigüedad</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={POR_ANTIGUEDAD} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide domain={[0, 40]} />
                    <YAxis type="category" dataKey="cat" width={70} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="tasa" radius={[0, 4, 4, 0]}>
                      {POR_ANTIGUEDAD.map((d, i) => <Cell key={i} fill={i === 0 ? CORAL : TEAL} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Rotación por rol (top 5 más altos)</div>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={POR_JOBROLE.slice(0, 5)} layout="vertical" margin={{ left: 10 }}>
                    <XAxis type="number" hide domain={[0, 40]} />
                    <YAxis type="category" dataKey="cat" width={100} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => `${v}%`} />
                    <Bar dataKey="tasa" radius={[0, 4, 4, 0]} fill={CORAL} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {tab === "modelo" && (
          <div>
            <h2 className="serif2" style={{ fontSize: 20, color: TEAL, marginBottom: 4 }}>Variables más predictivas</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 640 }}>
              Importancia de variables (Random Forest) + dirección del efecto (regresión logística).
              El signo indica si la variable aumenta (+) o reduce (−) la probabilidad de rotación.
            </p>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 18, marginBottom: 24 }}>
              {TOP_VARIABLES.map((v) => (
                <div key={v.variable} style={{ display: "grid", gridTemplateColumns: "180px 1fr 40px", alignItems: "center", gap: 12, padding: "8px 0" }}>
                  <div style={{ fontSize: 13 }}>{v.variable}</div>
                  <Bar1D value={v.importancia} color={v.efecto === "+" ? CORAL : TEAL} />
                  <div className="mono2" style={{ fontSize: 12, textAlign: "right", color: v.efecto === "+" ? CORAL : TEAL, fontWeight: 600 }}>{v.efecto}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 16 }}>
              <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Curva ROC — Random Forest</div>
                <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>AUC = {RESUMEN.auc_rf.toFixed(2)}</div>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={ROC}>
                    <CartesianGrid strokeDasharray="2 4" stroke={LINE} />
                    <XAxis dataKey="fpr" tick={{ fontSize: 10 }} domain={[0, 1]} type="number" />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 1]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="tpr" stroke={TEAL} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 18 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Matriz de confusión</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ background: `${TEAL}15`, padding: 12, textAlign: "center" }}>
                    <div className="mono2" style={{ fontSize: 22, color: TEAL }}>{CONFUSION.vn}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>Verdaderos negativos</div>
                  </div>
                  <div style={{ background: `${CORAL}15`, padding: 12, textAlign: "center" }}>
                    <div className="mono2" style={{ fontSize: 22, color: CORAL }}>{CONFUSION.fp}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>Falsos positivos</div>
                  </div>
                  <div style={{ background: `${CORAL}15`, padding: 12, textAlign: "center" }}>
                    <div className="mono2" style={{ fontSize: 22, color: CORAL }}>{CONFUSION.fn}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>Falsos negativos</div>
                  </div>
                  <div style={{ background: `${TEAL}15`, padding: 12, textAlign: "center" }}>
                    <div className="mono2" style={{ fontSize: 22, color: TEAL }}>{CONFUSION.vp}</div>
                    <div style={{ fontSize: 10, color: MUTED }}>Verdaderos positivos</div>
                  </div>
                </div>
                <p style={{ fontSize: 11, color: MUTED, marginTop: 10 }}>
                  El modelo detecta 20 de 59 casos reales de rotación en el set de prueba — útil como filtro de priorización, no como verdad absoluta.
                </p>
              </div>
            </div>
          </div>
        )}

        {tab === "riesgo" && (
          <div>
            <h2 className="serif2" style={{ fontSize: 20, color: TEAL, marginBottom: 4 }}>Empleados con mayor score de riesgo</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 640 }}>
              Probabilidad estimada de rotación según el modelo. Útil para priorizar conversaciones 1:1 de retención.
            </p>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: TEAL, color: "#fff" }}>
                    {["Edad", "Depto.", "Rol", "Horas extra", "Ingreso", "Antigüedad", "Score de riesgo"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500, fontSize: 11, textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOP15.map((r, i) => (
                    <tr key={i} style={{ background: i % 2 ? "#FAF9F5" : "#fff", borderBottom: `1px solid ${LINE}` }}>
                      <td style={{ padding: "9px 12px" }}>{r.edad}</td>
                      <td style={{ padding: "9px 12px" }}>{r.dept}</td>
                      <td style={{ padding: "9px 12px" }}>{r.rol}</td>
                      <td style={{ padding: "9px 12px", color: r.overtime ? CORAL : INK }}>{r.overtime ? "Sí" : "No"}</td>
                      <td className="mono2" style={{ padding: "9px 12px" }}>${r.ingreso.toLocaleString()}</td>
                      <td style={{ padding: "9px 12px" }}>{r.antig} año(s)</td>
                      <td className="mono2" style={{ padding: "9px 12px", color: CORAL, fontWeight: 600 }}>{(r.riesgo * 100).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "recomendaciones" && (
          <div>
            <h2 className="serif2" style={{ fontSize: 20, color: TEAL, marginBottom: 4 }}>Acciones recomendadas</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 640 }}>
              Basadas en las variables de mayor impacto, priorizadas por facilidad de implementación.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: LINE, border: `1px solid ${LINE}` }}>
              {RECOMENDACIONES.map((r, i) => (
                <div key={i} style={{ background: "#fff", padding: "16px 18px", display: "flex", gap: 16 }}>
                  <div className="mono2" style={{ color: CORAL, fontSize: 13, fontWeight: 600, minWidth: 22 }}>{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: TEAL, marginBottom: 3 }}>{r.t}</div>
                    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>{r.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${LINE}`, padding: "18px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: MUTED }}>
          Dataset público: IBM HR Analytics Employee Attrition &amp; Performance (1,470 registros, datos ficticios generados por IBM).
        </p>
      </footer>
    </div>
  );
}
