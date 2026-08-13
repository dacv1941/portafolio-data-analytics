import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ---------- MODELO EXPORTADO (Regresión Logística entrenada en Python — sklearn, AUC 0.782) ----------
// Dataset: UCI Statlog German Credit Data (1,000 solicitantes reales)

const MODELO = {
  intercept: -0.22954031658214885,
  features: ["duration", "amount", "age", "installment_rate", "present_residence", "number_credits", "people_liable", "chk_no_account", "chk_negative", "hist_critical", "housing_own", "emp_unemployed"],
  coef: [0.2665602379522573, 0.17555271469638528, -0.1531391114425691, 0.2956027852651177, -0.02672300833723159, 0.1642107838663211, 0.058722752485610034, -0.7835013046742785, 0.0, -0.42680758157676296, -0.1955447722787023, 0.14543419858219525],
  medias: [20.804, 3213.154666666667, 35.413333333333334, 2.949333333333333, 2.8293333333333335, 1.3973333333333333, 1.1586666666666667, 0.39466666666666667, 0.0, 0.296, 0.7133333333333334, 0.050666666666666665],
  desv: [11.858284755112491, 2699.0979303114505, 10.988228044391668, 1.1231352941159354, 1.1052328060438468, 0.560469644336089, 0.36536496213451497, 0.4887789775439292, 1.0, 0.45649096376598736, 0.4522044768563099, 0.21931610874615562],
};

function scoreRiesgo(vals) {
  let z = MODELO.intercept;
  MODELO.features.forEach((f, i) => {
    const std = (vals[f] - MODELO.medias[i]) / MODELO.desv[i];
    z += MODELO.coef[i] * std;
  });
  return 1 / (1 + Math.exp(-z));
}

const RESUMEN = { n: 1000, tasa_default: 0.30, auc: 0.782 };

const POR_STATUS = [
  { cat: "Sin cuenta corriente", tasa: 11.7 },
  { cat: "Saldo negativo", tasa: 49.3 },
  { cat: "$0-200 DM", tasa: 39.0 },
  { cat: "≥$200 DM / nómina", tasa: 22.2 },
];

const POR_HISTORIAL = [
  { cat: "Cuenta crítica / otros créditos", tasa: 17.1 },
  { cat: "Créditos pagados a tiempo", tasa: 31.9 },
  { cat: "Retraso en el pasado", tasa: 31.8 },
  { cat: "Todos pagados en este banco", tasa: 57.1 },
  { cat: "Sin créditos previos", tasa: 62.5 },
];

const POR_MONTO = [
  { cat: "<$2k", tasa: 28.0 },
  { cat: "$2k-5k", tasa: 26.6 },
  { cat: "$5k-10k", tasa: 36.5 },
  { cat: ">$10k", tasa: 60.0 },
];

const POR_DURACION = [
  { cat: "0-12 meses", tasa: 21.2 },
  { cat: "13-24 meses", tasa: 29.7 },
  { cat: "25-36 meses", tasa: 39.9 },
  { cat: "37+ meses", tasa: 51.7 },
];

const IMPORTANCIA = [
  { variable: "Sin cuenta corriente activa", val: 0.784, efecto: "−" },
  { variable: "Historial crediticio crítico", val: 0.427, efecto: "−" },
  { variable: "Cuota como % del ingreso", val: 0.296, efecto: "+" },
  { variable: "Plazo del crédito (meses)", val: 0.267, efecto: "+" },
  { variable: "Vivienda propia", val: 0.196, efecto: "−" },
  { variable: "Monto del crédito", val: 0.176, efecto: "+" },
  { variable: "Número de créditos activos", val: 0.164, efecto: "+" },
  { variable: "Edad", val: 0.153, efecto: "−" },
  { variable: "Actualmente desempleado", val: 0.145, efecto: "+" },
];

const INK = "#181A17";
const NAVY = "#1E2A44";
const GOLD = "#A9812F";
const GREEN = "#2F6B4F";
const RED = "#B23A2E";
const SAND = "#F5F3EE";
const MUTED = "#7C7A70";
const LINE = "#DEDACD";

function Bar1D({ value, max = 0.8, color }) {
  return (
    <div style={{ background: "#ECE9DF", height: 8, borderRadius: 4, overflow: "hidden" }}>
      <div style={{ width: `${(value / max) * 100}%`, height: "100%", background: color }} />
    </div>
  );
}

export default function CreditRiskDashboard() {
  const [tab, setTab] = useState("calculadora");

  const [form, setForm] = useState({
    duration: 24, amount: 3000, age: 35, installment_rate: 3,
    present_residence: 2, number_credits: 1, people_liable: 1,
    chk_no_account: 1, hist_critical: 0, housing_own: 1, emp_unemployed: 0,
    chk_negative: 0,
  });

  const prob = useMemo(() => scoreRiesgo(form), [form]);
  const nivel = prob < 0.3 ? "Bajo" : prob < 0.55 ? "Medio" : "Alto";
  const color = prob < 0.3 ? GREEN : prob < 0.55 ? GOLD : RED;

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div style={{ background: SAND, minHeight: "100vh", fontFamily: "'IBM Plex Sans', sans-serif", color: INK }}>
      <style>{`
        .serif3 { font-family: 'Newsreader', serif; }
        .mono3 { font-family: 'IBM Plex Mono', monospace; }
        input[type=range] { -webkit-appearance: none; height: 4px; background: #DEDACD; border-radius: 2px; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${NAVY}; cursor: pointer; }
      `}</style>

      <header style={{ borderBottom: `1px solid ${LINE}`, padding: "28px 24px 20px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: GOLD, fontWeight: 600, marginBottom: 6 }}>
            Data Science · Credit Scoring
          </div>
          <h1 className="serif3" style={{ fontSize: 34, fontWeight: 600, margin: 0, color: NAVY, lineHeight: 1.15 }}>
            Modelo de scoring de riesgo crediticio
          </h1>
          <p style={{ fontSize: 14, color: MUTED, marginTop: 8, maxWidth: 640 }}>
            Regresión logística entrenada sobre 1,000 solicitudes reales (UCI Statlog German Credit Data),
            con calculadora de riesgo en vivo — el mismo modelo corriendo en tu navegador.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 24px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, background: LINE, border: `1px solid ${LINE}` }}>
          {[
            { label: "Solicitantes analizados", value: RESUMEN.n, sub: "dataset UCI" },
            { label: "Tasa de default histórica", value: `${(RESUMEN.tasa_default * 100).toFixed(0)}%`, sub: "base real" },
            { label: "AUC del modelo", value: RESUMEN.auc.toFixed(3), sub: "regresión logística" },
          ].map((k) => (
            <div key={k.label} style={{ background: SAND, padding: "18px 16px" }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: 8 }}>{k.label}</div>
              <div className="mono3" style={{ fontSize: 24, fontWeight: 500, color: NAVY }}>{k.value}</div>
              <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 0", display: "flex", gap: 4, flexWrap: "wrap" }}>
        {[
          { id: "calculadora", label: "★ Calculadora en vivo" },
          { id: "diagnostico", label: "Diagnóstico" },
          { id: "modelo", label: "Variables del modelo" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "10px 16px", fontSize: 13, fontWeight: 500, border: "none",
            borderBottom: tab === t.id ? `2px solid ${NAVY}` : "2px solid transparent",
            background: "transparent", color: tab === t.id ? NAVY : MUTED, cursor: "pointer",
          }}>{t.label}</button>
        ))}
      </div>

      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "24px 24px 60px" }}>
        {tab === "calculadora" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: NAVY, marginBottom: 18 }}>Perfil del solicitante</div>

              {[
                { key: "duration", label: "Plazo del crédito (meses)", min: 4, max: 72, step: 1 },
                { key: "amount", label: "Monto solicitado ($)", min: 250, max: 18000, step: 250 },
                { key: "age", label: "Edad", min: 18, max: 75, step: 1 },
                { key: "installment_rate", label: "Cuota como % del ingreso (1=bajo, 4=alto)", min: 1, max: 4, step: 1 },
                { key: "number_credits", label: "Número de créditos activos", min: 1, max: 4, step: 1 },
              ].map((f) => (
                <div key={f.key} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: MUTED, marginBottom: 6 }}>
                    <span>{f.label}</span>
                    <span className="mono3" style={{ color: NAVY, fontWeight: 600 }}>{form[f.key]}</span>
                  </div>
                  <input type="range" min={f.min} max={f.max} step={f.step} value={form[f.key]}
                    onChange={(e) => set(f.key, Number(e.target.value))} style={{ width: "100%" }} />
                </div>
              ))}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
                {[
                  { key: "chk_no_account", label: "Sin cuenta corriente" },
                  { key: "hist_critical", label: "Historial crediticio crítico" },
                  { key: "housing_own", label: "Vivienda propia" },
                  { key: "emp_unemployed", label: "Actualmente desempleado" },
                ].map((c) => (
                  <label key={c.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: INK, cursor: "pointer" }}>
                    <input type="checkbox" checked={!!form[c.key]} onChange={(e) => set(c.key, e.target.checked ? 1 : 0)} />
                    {c.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 24, height: "fit-content", position: "sticky", top: 20 }}>
              <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: MUTED, marginBottom: 10 }}>
                Probabilidad estimada de default
              </div>
              <div className="mono3" style={{ fontSize: 46, fontWeight: 500, color }}>{(prob * 100).toFixed(1)}%</div>
              <div style={{ display: "inline-block", padding: "4px 12px", background: `${color}18`, color, fontSize: 12, fontWeight: 600, borderRadius: 3, marginTop: 6 }}>
                Riesgo {nivel}
              </div>
              <div style={{ marginTop: 18, height: 10, background: "#ECE9DF", borderRadius: 5, overflow: "hidden" }}>
                <div style={{ width: `${prob * 100}%`, height: "100%", background: color, transition: "width 0.2s ease" }} />
              </div>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 16, lineHeight: 1.5 }}>
                Cálculo en tiempo real usando los coeficientes exactos del modelo entrenado en Python
                (regresión logística estandarizada), ejecutándose aquí mismo en JavaScript.
              </p>
            </div>
          </div>
        )}

        {tab === "diagnostico" && (
          <div>
            <h2 className="serif3" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>¿Qué perfiles concentran el riesgo?</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 640 }}>
              Tasa de default general: 30%. Estos cortes muestran dónde se concentra el riesgo real.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { title: "Por estado de cuenta corriente", data: POR_STATUS },
                { title: "Por historial crediticio", data: POR_HISTORIAL },
                { title: "Por monto del crédito", data: POR_MONTO },
                { title: "Por plazo del crédito", data: POR_DURACION },
              ].map((s) => (
                <div key={s.title} style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>{s.title}</div>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={s.data} layout="vertical" margin={{ left: 10 }}>
                      <XAxis type="number" hide domain={[0, 65]} />
                      <YAxis type="category" dataKey="cat" width={150} tick={{ fontSize: 10.5 }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey="tasa" radius={[0, 4, 4, 0]}>
                        {s.data.map((d, i) => <Cell key={i} fill={d.tasa > 40 ? RED : d.tasa > 25 ? GOLD : GREEN} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "modelo" && (
          <div>
            <h2 className="serif3" style={{ fontSize: 20, color: NAVY, marginBottom: 4 }}>Importancia de variables</h2>
            <p style={{ fontSize: 13, color: MUTED, marginBottom: 20, maxWidth: 640 }}>
              Magnitud del coeficiente estandarizado (regresión logística). El signo indica si la variable
              aumenta (+) o reduce (−) la probabilidad de default.
            </p>
            <div style={{ background: "#fff", border: `1px solid ${LINE}`, padding: 20 }}>
              {IMPORTANCIA.map((v) => (
                <div key={v.variable} style={{ display: "grid", gridTemplateColumns: "220px 1fr 30px", alignItems: "center", gap: 12, padding: "9px 0" }}>
                  <div style={{ fontSize: 13 }}>{v.variable}</div>
                  <Bar1D value={v.val} color={v.efecto === "+" ? RED : GREEN} />
                  <div className="mono3" style={{ fontSize: 12, textAlign: "right", color: v.efecto === "+" ? RED : GREEN, fontWeight: 600 }}>{v.efecto}</div>
                </div>
              ))}
            </div>
            <p style={{ fontSize: 12, color: MUTED, marginTop: 16, maxWidth: 640, lineHeight: 1.5 }}>
              No tener cuenta corriente activa es, contraintuitivamente, la señal más fuerte de <strong>bajo</strong> riesgo —
              en este dataset corresponde a solicitantes ya evaluados como estables por el banco. El historial
              crediticio crítico y el plazo largo del crédito son las señales de riesgo más consistentes.
            </p>
          </div>
        )}
      </main>

      <footer style={{ borderTop: `1px solid ${LINE}`, padding: "18px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 11, color: MUTED }}>
          Dataset público: UCI Statlog (German Credit Data), 1,000 registros reales, Prof. Hofmann (1994), licencia CC BY 4.0.
        </p>
      </footer>
    </div>
  );
}
