# Impact Evaluation of a Training Program — Causal Inference

**Author:** Diego Armando Castro Vera — Statistician | Data Analyst | Data Science
**Stack:** Python (Pandas, Scikit-learn, NumPy) · React · Propensity Score Matching ·
Difference-in-Differences · Bootstrap Inference

## Business problem

A company rolled out a training program for its sales and customer service staff, but
**did not assign it randomly** — managers tended to enroll employees who already had
stronger baseline performance. This is a textbook case of **selection bias**: a naive
before/after or treated/control comparison will conflate the program's true effect with
the fact that better performers were more likely to get it in the first place.

The question a statistician is actually paid to answer isn't *"did performance go up for
people in the program?"* — it's **"how much of that increase was actually caused by the
program, once we account for who was selected into it?"**

## Why this project is different from a typical ML classification case

Projects 1 and 2 in this portfolio use supervised classification (logistic regression,
random forest) to *predict* outcomes. This project answers a fundamentally different — and
harder — question: not prediction, but **causal attribution**. This is the domain of
quasi-experimental design, a core PhD-level statistics topic that most self-taught "data
analysts" never touch, and that is highly valued in People Analytics, economics, marketing
measurement, and policy evaluation roles.

## Methodology

1. **Synthetic data with known ground truth.** 600 employees, with a baseline performance
   score, tenure, age, department and education level measured *before* the program.
   Treatment assignment is deliberately correlated with baseline performance and tenure
   (the confounders), and the true causal effect is fixed at **+8.0 points** — known because
   the data is synthetic, which lets us verify how well each method recovers it.

2. **Naive comparison.** Simple mean difference in post-program outcomes between treated
   and control groups. This is what most non-statisticians would report, and it is wrong
   by construction here: **+12.78 points, a 60% overestimate.**

3. **Covariate balance diagnostics.** Standardized Mean Differences (SMD) computed for each
   covariate before matching. The standard threshold in causal inference literature is
   |SMD| < 0.10 for "balanced." Before matching, baseline performance alone has an SMD of
   **0.50** — a large imbalance confirming the selection bias.

4. **Propensity Score Matching (PSM).** A logistic regression estimates each employee's
   probability of receiving treatment given their observed covariates. 1:1 nearest-neighbor
   matching is performed on the propensity score with a caliper of 0.05 standard deviations,
   pairing each treated employee with their closest control counterpart. 392 of 411 treated
   employees (95%) find a valid match within the caliper.

5. **Post-matching balance check.** After matching, the SMD for baseline performance drops
   from 0.50 to **0.055** — now well within the "balanced" threshold, confirming the matched
   sample approximates what a randomized comparison would look like.

6. **Difference-in-Differences (DiD) on the matched sample.** Rather than comparing only
   post-program outcomes, the change (post − pre) is compared between matched treated and
   control employees. This controls for any remaining time trend common to both groups,
   producing the Average Treatment Effect on the Treated (**ATT**):
   **+8.67 points** — very close to the known true effect of 8.0.

7. **Bootstrap confidence interval.** 1,000 resamples of the matched pairs give a 95%
   confidence interval of **[7.69, 9.73]**, which comfortably contains the true effect.

8. **Placebo test.** A key validity check: if matching successfully removed selection bias,
   treated and matched control employees should look statistically identical *before* the
   program started. The pre-program difference between matched groups is **+0.61 points** —
   essentially zero, confirming the matching procedure worked as intended.

## Repository structure

```
proyecto-04-causal/
├── 01_generar_datos.py       # Synthetic data generation with intentional confounding
├── 02_matching_causal.py     # Propensity score estimation, matching, DiD, bootstrap
├── dashboard-causal.jsx      # Interactive dashboard walking through the full analysis
├── datos_capacitacion.csv    # Generated dataset
├── resultado_causal.json     # Exported results
└── README.md
```

## How to reproduce it

```bash
pip install pandas numpy scikit-learn
python 01_generar_datos.py
python 02_matching_causal.py
```

## Key takeaway for a hiring manager

Anyone can run `df.groupby("treated").mean()` and report a number. The value a trained
statistician adds is knowing **when that number is wrong**, why, and how to fix it with
a defensible, auditable method — including validating the fix with a placebo test rather
than just trusting the output. That is the skill this project is meant to demonstrate.

## Contact

📧 dacv1941@gmail.com
🔗 [LinkedIn](https://www.linkedin.com/in/diego-armando-castro-vera8a52a8177/)
