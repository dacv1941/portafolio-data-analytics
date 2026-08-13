import React, { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  ScatterChart, Scatter, ReferenceLine, ErrorBar, ComposedChart,
} from "recharts";

// ---------- RESULTADOS REALES (Python: PSM + Diferencia en Diferencias + Bootstrap) ----------

const R = {
  n_total: 600, n_tratados: 411, n_control: 189, n_pares: 392,
  efecto_real: 8.0,
  naive: 12.78,
  matched_post: 9.28,
  att_did: 8.67,
  ci_low: 7.69, ci_high: 9.73,
  se: 0.52,
  placebo: 0.61,
};

const BALANCE = [
  { variable: "Desempeño basal", antes: 0.500, despues: 0.055 },
  { variable: "Antigüedad", antes: 0.242, despues: -0.083 },
  { variable: "Edad", antes: 0.133, despues: 0.057 },
];

const ESTIMACIONES = [
  { metodo: "Comparación ingenua", valor: R.naive, tipo: "sesgada" },
  { metodo: "Matched (solo post)", valor: R.matched_post, tipo: "parcial" },
  { metodo: "Matched + DiD (ATT)", valor: R.att_did, tipo: "correcta" },
  { metodo: "Efecto real (ground truth)", valor: R.efecto_real, tipo: "real" },
];

// Distribución bootstrap simplificada para histograma (bins)
const BOOT_HIST = [
  { bin: "6.5-7.0", n: 12 }, { bin: "7.0-7.5", n: 38 }, { bin: "7.5-8.0", n: 89 },
  { bin: "8.0-8.5", n: 156 }, { bin: "8.5-9.0", n: 198 }, { bin: "9.0-9.5", n: 172 },
  { bin: "9.5-10.0", n: 98 }, { bin: "10.0-10.5", n: 31 }, { bin: "10.5-11.0", n: 6 },
];

const INK = "#181917";
const NAVY = "#22314F";
const GOLD = "#A9812F";
const GREEN = "#2E6B4E";
const RED = "#B23A2E";
const SAND = "#F5F3EE";
const MUTED = "#7C7A70";
const LINE = "#DEDACD";

export default function CausalDashboard() {
  const [tab, setTab] = useState("problema");

  return (
    <div style={{ background: SAND, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: INK }}>
      <style>{`
        .serif4 { font-family: 'Newsreader', serif; }
        .mono4 { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <header style={{ borderBottom: `1px solid ${LINE}`, padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 600, marginBottom: 6 }}>
            Estadística Aplicada · Inferencia Causal
          </div>
          <h1 className="serif4" style={{ fontSize: 34, fontWeight: 600, margin: 0, color: NAVY, lineHeight: 1.15 }}>
            ¿El programa de capacitación realmente funcionó?
          </h1>
          <p style={{ fontSize: 14, color: MUTED, marginTop: 8, maxWidth: 680 }}>
            Corrección de sesgo de selección con Propensity Score Matching y Diferencia en Diferencias.
            La empresa no asignó el programa al azar — asignó primero a los empleados con mejor desempeño previo.
            Esto sesga cualquier comparación simple.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: LINE, border: `1px solid ${LINE}` }}>
          {[
            { label: "Empleados analizados", value: R.n_total, sub: `${R.n_tratados} con programa` },
            { label: "Estimación ingenua", value: `+${R.naive}`, sub: "sesgada al alza", color: RED },
            { label: "Efecto causal corregido", value: `+${R.att_did}`, sub: `IC 95% [${R.ci_low}, ${R.ci_high}]`, color: GREEN },
            { label: "Sobreestimación del método naive", value: "+60%", sub: "vs. efecto real", color: RED },
          ].map((k) => (
            <div key={k.label} style={{ background: SAND, padding: "18px 16px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: 8 }}>{k.label}</div>
              <div className="mono4" style={{ fontSize: 24, fontWeight: 500, color: k.color || NAVY }}>{k.value}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 0", display: "flex", gap: 4, flexWrap: "wrap" }}>
        {[
          { id: "problema", label: "1. El problema del sesgo" },
          { id: "correccion", label: "2. Corrección (matching)" },
          { id: "efecto", label: "3. Efecto causal estimado" },
          { id: "validacion", label: "4. Validación (placebo)" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px", fontSize: 12.5, fontWeight: 500, border: "none",
            borderBottom: tab === t.id ? `2px solid ${NAVY}` : "2px solid transparent",
            background: "transparent", color: tab === t.id ? NAVY : MUTED, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 60px" }}>
        {tab === "problema" && (
          <div>
            <h2 className="serif4" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Correlación no es causalidad</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 680 }}>
              Los empleados que recibieron el programa ya tenían, en promedio, un desempeño basal de <strong>70.1</strong> puntos
              antes de empezar, frente a <strong>64.3</strong> en el grupo control. Cualquier comparación directa
              del resultado final confunde el efecto del programa con esta diferencia previa.
            </p>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Desbalance de covariables ANTES del matching</div>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>
                Diferencia de medias estandarizada (SMD). La regla estándar en estudios causales: |SMD| &lt; 0.10 se considera balanceado.
                Aquí, ninguna covariable lo está.
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={BALANCE} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke={LINE} horizontal={false} />
                  <XAxis type="number" domain={[-0.6, 0.6]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="variable" width={110} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <ReferenceLine x={0.1} stroke={GOLD} strokeDasharray="3 3" />
                  <ReferenceLine x={-0.1} stroke={GOLD} strokeDasharray="3 3" />
                  <ReferenceLine x={0} stroke={MUTED} />
                  <Bar dataKey="antes" radius={4}>
                    {BALANCE.map((d, i) => <Cell key={i} fill={RED} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: `${RED}0d`, border: `1px solid ${RED}33`, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: RED, marginBottom: 4 }}>Consecuencia de ignorar el sesgo</div>
              <div style={{ fontSize: 13, color: INK }}>
                Comparar directamente el desempeño final da <strong className="mono4">+{R.naive} puntos</strong> — un
                <strong> 60% más alto</strong> que el efecto real del programa.
              </div>
            </div>
          </div>
        )}

        {tab === "correccion" && (
          <div>
            <h2 className="serif4" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Propensity Score Matching</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 680 }}>
              Se estima la probabilidad de recibir el programa a partir de las covariables basales
              (regresión logística), y se empareja cada empleado tratado con el control más parecido
              en esa probabilidad — simulando, estadísticamente, una asignación aleatoria.
            </p>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Balance de covariables: antes vs. después del matching</div>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>
                {R.n_pares} de {R.n_tratados} tratados encontraron una pareja válida dentro del caliper (392/411 = 95%).
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={BALANCE} layout="vertical" margin={{ left: 20 }} barGap={2}>
                  <CartesianGrid strokeDasharray="2 4" stroke={LINE} horizontal={false} />
                  <XAxis type="number" domain={[-0.6, 0.6]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="variable" width={110} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <ReferenceLine x={0.1} stroke={GOLD} strokeDasharray="3 3" />
                  <ReferenceLine x={-0.1} stroke={GOLD} strokeDasharray="3 3" />
                  <ReferenceLine x={0} stroke={MUTED} />
                  <Bar dataKey="antes" name="Antes" fill={RED} radius={3} />
                  <Bar dataKey="despues" name="Después" fill={GREEN} radius={3} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ background: `${GREEN}0d`, border: `1px solid ${GREEN}33`, padding: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: GREEN, marginBottom: 4 }}>Resultado del matching</div>
              <div style={{ fontSize: 13, color: INK }}>
                El SMD de desempeño basal baja de <strong className="mono4">0.50</strong> a <strong className="mono4">0.055</strong> —
                el grupo tratado y control emparejados ahora son estadísticamente comparables.
              </div>
            </div>
          </div>
        )}

        {tab === "efecto" && (
          <div>
            <h2 className="serif4" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Estimación del efecto causal (ATT)</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 680 }}>
              Comparación de 4 métodos, del más sesgado al más riguroso.
            </p>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 20, marginBottom: 20 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={ESTIMACIONES} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke={LINE} horizontal={false} />
                  <XAxis type="number" domain={[0, 14]} tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="metodo" width={170} tick={{ fontSize: 11.5 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <ReferenceLine x={R.efecto_real} stroke={NAVY} strokeDasharray="4 4" label={{ value: "Efecto real = 8.0", fontSize: 11, fill: NAVY, position: "top" }} />
                  <Bar dataKey="valor" radius={4}>
                    {ESTIMACIONES.map((d, i) => (
                      <Cell key={i} fill={d.tipo === "sesgada" ? RED : d.tipo === "parcial" ? GOLD : d.tipo === "correcta" ? GREEN : NAVY} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Distribución bootstrap del ATT (1,000 remuestreos)</div>
              <p style={{ fontSize: 12, color: MUTED, marginBottom: 14 }}>
                Intervalo de confianza 95%: [{R.ci_low}, {R.ci_high}] — contiene el efecto real conocido (8.0).
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={BOOT_HIST}>
                  <CartesianGrid strokeDasharray="2 4" stroke={LINE} vertical={false} />
                  <XAxis dataKey="bin" tick={{ fontSize: 9.5 }} axisLine={{ stroke: LINE }} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip />
                  <ReferenceLine x="8.0-8.5" stroke={NAVY} strokeWidth={2} />
                  <Bar dataKey="n" radius={[3, 3, 0, 0]} fill={NAVY} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "validacion" && (
          <div>
            <h2 className="serif4" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Prueba de placebo</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 680 }}>
              Validación clave del método: si el matching corrigió bien el sesgo, tratados y controles
              emparejados deberían verse <strong>iguales antes</strong> de que empezara el programa. Si
              hubiera una diferencia grande ahí, significaría que el matching no funcionó.
            </p>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 24, textAlign: "center", maxWidth: 420, margin: "0 auto" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: 10 }}>
                Diferencia PRE-programa (grupos ya emparejados)
              </div>
              <div className="mono4" style={{ fontSize: 40, fontWeight: 500, color: GREEN }}>+{R.placebo}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 8 }}>puntos de diferencia (casi cero, como se esperaba)</div>
            </div>
            <div style={{ background: `${GREEN}0d`, border: `1px solid ${GREEN}33`, padding: 16, marginTop: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: GREEN, marginBottom: 4 }}>Conclusión</div>
              <div style={{ fontSize: 13, color: INK, lineHeight: 1.6 }}>
                La prueba de placebo confirma que el matching corrigió adecuadamente el sesgo de selección.
                El efecto causal estimado (+8.67 puntos, IC 95% [{R.ci_low}, {R.ci_high}]) es una estimación
                creíble y estadísticamente rigurosa del impacto real del programa — no solo una correlación.
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${LINE}`, padding: "18px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: MUTED }}>
          Datos sintéticos generados con efecto causal conocido (ground truth = 8.0) para validar la metodología.
          Empresa ficticia. Metodología: Propensity Score Matching (caliper 0.05σ) + Diferencia en Diferencias + Bootstrap (1,000 iter.).
        </p>
      </footer>
    </div>
  );
}
