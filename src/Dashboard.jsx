import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, ReferenceLine, Legend
} from "recharts";

// ---------- DATOS (dataset sintético generado para portafolio — no corresponde a ninguna empresa real) ----------

const RESUMEN = {
  masa_salarial: 1601380,
  presupuesto_total: 67258,
  presupuesto_pct: 0.042,
  inflacion_proy: 0.061,
  presupuesto_usado: 67256,
  n_empleados: 300,
  n_no_cumple: 68,
  n_riesgo_mercado: 117,
  brecha_genero_pp_promedio: 1.95,
};

const GASTO_AREA = [
  { area: "Operaciones", gasto: 17645, tope: 20177, rotacion: 0.09 },
  { area: "Comercial", gasto: 14197, tope: 20177, rotacion: 0.14 },
  { area: "Tecnología", gasto: 18931, tope: 20177, rotacion: 0.18 },
  { area: "Riesgo", gasto: 7376, tope: 20177, rotacion: 0.07 },
  { area: "Finanzas", gasto: 5627, tope: 20177, rotacion: 0.06 },
  { area: "Talento Humano", gasto: 3480, tope: 20177, rotacion: 0.05 },
];

const BRECHA_GENERO = [
  { banda: "Analista", Femenino: 91.6, Masculino: 94.5 },
  { banda: "Analista Senior", Femenino: 89.5, Masculino: 95.8 },
  { banda: "Coordinador", Femenino: 90.6, Masculino: 95.9 },
  { banda: "Jefe", Femenino: 92.4, Masculino: 90.7 },
  { banda: "Gerente", Femenino: 94.4, Masculino: 91.4 },
];

const TOP10 = [
  { id: "E022", area: "Operaciones", banda: "Coordinador", genero: "M", desempeno: 5, compa: 0.804 },
  { id: "E206", area: "Comercial", banda: "Coordinador", genero: "M", desempeno: 4, compa: 0.882 },
  { id: "E063", area: "Finanzas", banda: "Analista Senior", genero: "F", desempeno: 4, compa: 0.765 },
  { id: "E220", area: "Tecnología", banda: "Analista Senior", genero: "F", desempeno: 4, compa: 0.757 },
  { id: "E213", area: "Comercial", banda: "Analista Senior", genero: "M", desempeno: 4, compa: 0.857 },
  { id: "E185", area: "Tecnología", banda: "Jefe", genero: "M", desempeno: 4, compa: 0.851 },
  { id: "E072", area: "Tecnología", banda: "Jefe", genero: "M", desempeno: 4, compa: 0.824 },
  { id: "E252", area: "Comercial", banda: "Gerente", genero: "M", desempeno: 5, compa: 0.838 },
  { id: "E273", area: "Operaciones", banda: "Analista", genero: "M", desempeno: 4, compa: 0.926 },
  { id: "E109", area: "Tecnología", banda: "Analista", genero: "M", desempeno: 3, compa: 0.852 },
];

const RIESGOS = [
  { t: "Datos de mercado agregados por banda", d: "Se usó un único percentil 50 por banda salarial. En la práctica real, el mercado varía por sub-función dentro de cada banda; esto puede subestimar brechas en roles muy especializados (p. ej. ciencia de datos dentro de Tecnología)." },
  { t: "Supuesto de rotación como proxy de riesgo", d: "Se asumió que la tasa de rotación histórica por área predice el riesgo futuro de fuga. No incorpora señales individuales (entrevistas de salida, clima, ofertas externas conocidas)." },
  { t: "Sin distinción de razón de compa-ratio bajo", d: "Un compa-ratio bajo puede deberse a ingreso reciente en banda (aún no madura) o a compresión salarial real. El modelo no distingue ambos casos; se recomienda validar antigüedad en banda, no solo antigüedad total." },
  { t: "Tope por área puede penalizar áreas pequeñas", d: "Talento Humano y Finanzas usan menos del 30% del tope por tener menos casos de alta prioridad, no porque su equidad esté resuelta. Vale la pena revisar si hay casos individuales de riesgo no capturados por el promedio de área." },
];

const NAVY = "#16233F";
const GOLD = "#B08D2B";
const ROSE = "#B0473F";
const TEAL = "#3F6E64";
const BG = "#F4F3EF";
const INK = "#1C1B19";

function Money({ v }) {
  return <span>${Math.round(v).toLocaleString("es-CO")}</span>;
}

export default function Dashboard() {
  const [tab, setTab] = useState("diagnostico");

  const brechaInflacion = ((RESUMEN.inflacion_proy - RESUMEN.presupuesto_pct) * 100).toFixed(1);

  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: INK }}>

      {/* HEADER */}
      <header style={{ borderBottom: `1px solid #D9D6CC`, padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 600, marginBottom: 6 }}>
            Banco Aurora · Comité de Compensación 2026
          </div>
          <h1 className="serif" style={{ fontSize: 34, fontWeight: 600, margin: 0, color: NAVY, lineHeight: 1.15 }}>
            Propuesta de distribución del presupuesto de incrementos
          </h1>
          <p style={{ fontSize: 14, color: "#5C5A54", marginTop: 8, maxWidth: 640 }}>
            Diagnóstico de equidad salarial y recomendación de asignación del 4.2% de la masa salarial,
            frente a una inflación proyectada del 6.1%.
          </p>
        </div>
      </header>

      {/* KPI STRIP */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "#D9D6CC", border: "1px solid #D9D6CC" }}>
          {[
            { label: "Presupuesto vs. inflación", value: `−${brechaInflacion} pp`, sub: "brecha sin cubrir", color: ROSE },
            { label: "Empleados bajo mercado", value: RESUMEN.n_riesgo_mercado, sub: `de ${RESUMEN.n_empleados} (compa-ratio < 0.90)`, color: NAVY },
            { label: "No aplican incremento", value: RESUMEN.n_no_cumple, sub: "desempeño no cumple (1–2)", color: NAVY },
            { label: "Brecha de género promedio", value: `${RESUMEN.brecha_genero_pp_promedio} pp`, sub: "compa-ratio, bandas técnicas", color: GOLD },
          ].map((k) => (
            <div key={k.label} style={{ background: BG, padding: "18px 16px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8A8778", marginBottom: 8 }}>{k.label}</div>
              <div className="mono" style={{ fontSize: 26, fontWeight: 500, color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 12, color: "#8A8778", marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TABS */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 0", display: "flex", gap: 4 }}>
        {[
          { id: "diagnostico", label: "Diagnóstico" },
          { id: "distribucion", label: "Distribución propuesta" },
          { id: "prioridad", label: "Casos prioritarios" },
          { id: "riesgos", label: "Riesgos y supuestos" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="tab-btn"
            style={{
              padding: "10px 16px",
              fontSize: 13,
              fontWeight: 500,
              border: "none",
              borderBottom: tab === t.id ? `2px solid ${NAVY}` : "2px solid transparent",
              background: "transparent",
              color: tab === t.id ? NAVY : "#8A8778",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 60px" }}>
        {tab === "diagnostico" && (
          <div>
            <h2 className="serif" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Presupuesto disponible vs. costo de vida</h2>
            <p style={{ fontSize: 13, color: "#5C5A54", marginBottom: 20, maxWidth: 620 }}>
              El presupuesto aprobado cubre el 4.2% de la masa salarial; la inflación proyectada es 6.1%.
              No todos los colaboradores pueden recibir un incremento que iguale el costo de vida — se requiere criterio de priorización.
            </p>
            <div style={{ background: "#fff", border: "1px solid #E4E1D8", padding: 20, marginBottom: 32 }}>
              <div style={{ position: "relative", height: 36, background: "#EFEDE5" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(RESUMEN.presupuesto_pct / RESUMEN.inflacion_proy) * 100}%`, background: NAVY }} />
                <div style={{ position: "absolute", left: `${(RESUMEN.presupuesto_pct / RESUMEN.inflacion_proy) * 100}%`, top: 0, bottom: 0, width: `${100 - (RESUMEN.presupuesto_pct / RESUMEN.inflacion_proy) * 100}%`, background: `repeating-linear-gradient(45deg, ${ROSE}22, ${ROSE}22 6px, transparent 6px, transparent 12px)`, borderLeft: `2px dashed ${ROSE}` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12 }}>
                <span className="mono" style={{ color: NAVY }}>4.2% presupuesto aprobado</span>
                <span className="mono" style={{ color: ROSE }}>6.1% inflación proyectada</span>
              </div>
            </div>

            <h2 className="serif" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Brecha de género por banda (compa-ratio)</h2>
            <p style={{ fontSize: 13, color: "#5C5A54", marginBottom: 16, maxWidth: 620 }}>
              Compa-ratio = salario actual / mediana de mercado. Las brechas más marcadas están en Analista Senior y Coordinador,
              donde el personal femenino gana en promedio 5–6 puntos porcentuales menos frente al mercado que sus pares masculinos.
            </p>
            <div style={{ background: "#fff", border: "1px solid #E4E1D8", padding: "20px 12px" }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={BRECHA_GENERO} barGap={4}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#E4E1D8" vertical={false} />
                  <XAxis dataKey="banda" tick={{ fontSize: 11, fill: "#5C5A54" }} axisLine={{ stroke: "#D9D6CC" }} tickLine={false} />
                  <YAxis domain={[80, 100]} tick={{ fontSize: 11, fill: "#5C5A54" }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip contentStyle={{ fontSize: 12, border: "1px solid #D9D6CC" }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Femenino" fill={ROSE} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Masculino" fill={NAVY} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "distribucion" && (
          <div>
            <h2 className="serif" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Asignación del presupuesto por área</h2>
            <p style={{ fontSize: 13, color: "#5C5A54", marginBottom: 20, maxWidth: 640 }}>
              Criterio de priorización: colaboradores con desempeño "cumple" (3+), compa-ratio bajo frente a mercado,
              y área con mayor rotación voluntaria reciben incrementos por encima del mínimo de política (3.5%), hasta el tope del 30% del presupuesto por área.
            </p>
            <div style={{ background: "#fff", border: "1px solid #E4E1D8", padding: "20px 12px", marginBottom: 24 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={GASTO_AREA} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#E4E1D8" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#5C5A54" }} axisLine={{ stroke: "#D9D6CC" }} tickLine={false} />
                  <YAxis type="category" dataKey="area" width={110} tick={{ fontSize: 12, fill: INK }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => `$${v.toLocaleString("es-CO")}`} contentStyle={{ fontSize: 12, border: "1px solid #D9D6CC" }} />
                  <ReferenceLine x={20177} stroke={ROSE} strokeDasharray="4 4" label={{ value: "Tope 30%", fontSize: 11, fill: ROSE, position: "top" }} />
                  <Bar dataKey="gasto" radius={[0, 3, 3, 0]}>
                    {GASTO_AREA.map((d, i) => (
                      <Cell key={i} fill={d.gasto / d.tope > 0.85 ? ROSE : d.gasto / d.tope > 0.5 ? GOLD : TEAL} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {GASTO_AREA.map((d) => (
                <div key={d.area} style={{ background: "#fff", border: "1px solid #E4E1D8", padding: 14 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: NAVY }}>{d.area}</div>
                  <div className="mono" style={{ fontSize: 18, marginTop: 4 }}><Money v={d.gasto} /></div>
                  <div style={{ fontSize: 11, color: "#8A8778", marginTop: 2 }}>{(d.gasto / d.tope * 100).toFixed(0)}% del tope · rotación {(d.rotacion * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "prioridad" && (
          <div>
            <h2 className="serif" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>10 casos más urgentes</h2>
            <p style={{ fontSize: 13, color: "#5C5A54", marginBottom: 20, maxWidth: 640 }}>
              Seleccionados por score de prioridad: compa-ratio bajo + desempeño alto + antigüedad + rotación del área.
              Reciben el incremento máximo permitido (8%) dentro del presupuesto disponible.
            </p>
            <div style={{ background: "#fff", border: "1px solid #E4E1D8", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: NAVY, color: "#fff" }}>
                    {["ID", "Área", "Banda", "Género", "Desempeño", "Compa-ratio", "Incremento"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "10px 12px", fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TOP10.map((r, i) => (
                    <tr key={r.id} style={{ background: i % 2 ? "#FAF9F6" : "#fff", borderBottom: "1px solid #E4E1D8" }}>
                      <td className="mono" style={{ padding: "9px 12px" }}>{r.id}</td>
                      <td style={{ padding: "9px 12px" }}>{r.area}</td>
                      <td style={{ padding: "9px 12px" }}>{r.banda}</td>
                      <td style={{ padding: "9px 12px" }}>{r.genero}</td>
                      <td style={{ padding: "9px 12px" }}>{r.desempeno}</td>
                      <td className="mono" style={{ padding: "9px 12px", color: r.compa < 0.85 ? ROSE : INK }}>{r.compa.toFixed(3)}</td>
                      <td className="mono" style={{ padding: "9px 12px", color: GOLD, fontWeight: 600 }}>+8.0%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "riesgos" && (
          <div>
            <h2 className="serif" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Riesgos, supuestos y qué podría salir mal</h2>
            <p style={{ fontSize: 13, color: "#5C5A54", marginBottom: 20, maxWidth: 640 }}>
              Transparencia sobre las limitaciones del análisis para que el Comité tome la decisión con contexto completo.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: "#D9D6CC", border: "1px solid #D9D6CC" }}>
              {RIESGOS.map((r, i) => (
                <div key={i} style={{ background: "#fff", padding: "16px 18px", display: "flex", gap: 16 }}>
                  <div className="mono" style={{ color: GOLD, fontSize: 13, fontWeight: 600, minWidth: 22 }}>{String(i + 1).padStart(2, "0")}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: NAVY, marginBottom: 3 }}>{r.t}</div>
                    <div style={{ fontSize: 13, color: "#5C5A54", lineHeight: 1.5 }}>{r.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #D9D6CC", padding: "18px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: "#8A8778" }}>
          Banco Aurora es una entidad ficticia. Dataset sintético de 300 registros generado para fines de portafolio profesional.
        </p>
      </footer>
    </div>
  );
}
