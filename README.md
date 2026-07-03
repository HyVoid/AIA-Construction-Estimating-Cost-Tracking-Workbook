# AIA Construction Estimating & Cost Tracking Workbook

![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Platform](https://img.shields.io/badge/Platform-Browser%20%2B%20Excel-green.svg)
![Tool](https://img.shields.io/badge/Tool-Construction%20Decision%20Support-orange.svg)

**Build AIA-standard construction estimates, reusable assemblies, tender submissions, and execution cost baselines — using a free Excel workbook or browser-based version with no installation required.**

> ## **No signup. No installation. Free.**
>
> 🌐 **Open in Browser:** *HTML Live Version (Coming Soon)*
>
> 📥 **Download Excel:** *GitHub Release / Gumroad Download (Coming Soon)*

---

# Screenshots

### Browser Version

<!-- screenshot: browser version -->

*Interactive browser-based estimating interface showing project setup, assembly selection, and real-time AIA estimate generation.*

### Excel Version

<!-- screenshot: excel version -->

*Excel workbook displaying cost libraries, assembly structures, estimate calculations, AIA summaries, and cost tracking dashboards.*

---

# What It Helps You Track

* Complete labor, material, equipment, subcontractor, and markup cost composition for every bid item.
* Estimated project cost versus actual execution cost variance in one standardized structure.
* Reusable construction assemblies across multiple tenders and project types.
* AIA division-level cost summaries and professional tender outputs.
* Budget allocation visibility from bid preparation through project execution.
* SmartSheet-compatible project budgets without manual restructuring.

---

# Quick Start Workflow

### 1. Configure Project Parameters

Open the **Project Setup** worksheet and define the project information once:

* Project name
* Client
* Bid date
* Project type
* Overhead percentage
* Markup percentage
* Contingency allowance

These settings become the baseline assumptions for the entire estimate.

---

### 2. Import Existing Cost Data

Paste existing cost information directly into the **Cost Library** sheet.

Examples include:

* Historical project cost libraries
* Supplier pricing sheets
* Subcontractor quotations
* Existing estimating spreadsheets
* CSV exports from accounting or estimating systems

No database setup or reformatting is required.

---

### 3. Generate Estimates Automatically

Select predefined assemblies in the **Estimate Input** sheet and enter project quantities.

The workbook automatically calculates:

* Labor costs
* Material costs
* Equipment costs
* Subcontractor costs
* Overhead
* Markup
* Total bid values

Switch to the AIA summary sheets to review the completed estimate.

---

### 4. Refresh and Reuse

Update cost libraries periodically as market pricing changes.

Existing assemblies remain reusable across future projects, allowing estimates to be rebuilt quickly without reconstructing the entire cost model.

**Set a few key parameters. Drop in existing data. Get the analysis. Refresh when needed.**

---

# Why I Built This

Most construction estimating failures do not occur because estimators cannot calculate costs.

They occur because estimators repeatedly rebuild the same reasoning process under severe time pressure.

A typical tender process often looks like this:

* Previous projects are copied manually.
* Assemblies are rebuilt from memory.
* Labor and material assumptions differ between estimators.
* Bid values cannot later be reconciled to execution costs.

The result is not simply inefficiency.

It creates a much larger problem:

> The estimate becomes a one-time document rather than a reusable decision model.

I built this workbook as a productized estimating framework rather than a spreadsheet template.

For example:

### Before

A slab foundation estimate might be created using:

* historical spreadsheets,
* subcontractor quotations,
* manual labor calculations,
* separate markup worksheets.

When the project is awarded, the execution team rebuilds the budget structure from scratch.

---

### After

The estimator selects:

```
Assembly:
Slab Foundation

Quantity:
5,000 SF
```

The workbook automatically generates:

* labor budgets,
* material budgets,
* equipment allocations,
* subcontract budgets,
* overhead,
* markup,
* execution baseline values.

The same structure then becomes the project's cost control framework.

The objective is not faster spreadsheet creation.

The objective is preserving estimating logic as a reusable operational asset.

---

# Common Construction Estimating Problems This Solves

| Problem                                   | Without This Tool                      | With This Tool                                  |
| ----------------------------------------- | -------------------------------------- | ----------------------------------------------- |
| Every estimate starts from scratch        | Large amounts of repetitive work       | Standardized assembly reuse                     |
| Labor and materials are mixed together    | Cost composition becomes unclear       | Category-based cost separation                  |
| Tender estimates cannot support execution | Budgets must be rebuilt after award    | Estimate becomes execution baseline             |
| Historical estimates cannot be reused     | Knowledge remains trapped in files     | Assembly library preserves estimating knowledge |
| AIA formatting varies by estimator        | Inconsistent professional presentation | Standardized AIA outputs                        |
| SmartSheet imports require manual cleanup | Duplicate administrative work          | Direct export-compatible structures             |

---

# Who This Is For

This workbook is designed for:

* Construction estimators preparing competitive bids.
* General contractors managing repeat project types.
* Small and medium construction firms lacking dedicated estimating software.
* Project managers requiring estimate-to-actual cost tracking.
* Organizations planning future migration to Procore or similar systems.

This workbook is **not** designed for:

* Enterprise ERP replacement.
* Multi-user real-time estimating environments.
* Full construction management systems.
* Field data collection platforms.

**No spreadsheet expertise is required. Open the browser version or Excel workbook and begin estimating immediately.**

---

# About

I build lightweight analytical tools for situations where there are too many moving parts to reliably manage mentally.

The central question behind every tool is:

> **"What information must exist in one place to make the next decision confidently?"**

The **AIA Construction Estimating & Cost Tracking Workbook** is one example of this approach: transforming construction estimating from a one-time spreadsheet exercise into a reusable decision-support framework.

---

# Technical Details

<details>
<summary>For technical reviewers, Excel practitioners, and collaborators</summary>

---

## Workbook Architecture

| Layer           | Worksheets         | Purpose                        |
| --------------- | ------------------ | ------------------------------ |
| Configuration   | Project Setup      | Global estimate assumptions    |
| Master Data     | Cost Library       | Standardized cost repository   |
| Assembly Engine | Assembly Library   | Reusable estimating structures |
| Input           | Estimate Input     | Project quantity entry         |
| Calculation     | Calculation Engine | Cost expansion and allocation  |
| Reporting       | AIA Summary        | Tender outputs                 |
| Control         | Cost Tracking      | Estimate vs Actual analysis    |
| Export          | SmartSheet Export  | External integration           |

### Data Flow

```text
Project Setup
        ↓
Cost Library
        ↓
Assembly Library
        ↓
Estimate Input
        ↓
Calculation Engine
        ↓
AIA Summary
        ↓
Cost Tracking
        ↓
SmartSheet Export
```

---

## Three Traps That Catch Even Experienced Estimators

### Trap 1 — Reusing Historical Totals Instead of Historical Structures

Decision:

> Reuse previous project totals.

Problem:

The previous project cost structure differs materially.

| Item       | Project A | Project B |
| ---------- | --------- | --------- |
| Labor %    | 38%       | 52%       |
| Material % | 47%       | 31%       |

Result:

The estimate appears correct while underlying assumptions are invalid.

Correct approach:

Reuse assemblies and production factors rather than historical totals.

<details>
<summary>Formula logic</summary>

```excel
Extended Qty =
Project Quantity
*
Assembly Factor

Cost =
Extended Qty
*
Unit Cost
```

</details>

---

### Trap 2 — Treating Bid Cost as Execution Budget

Decision:

> Use tender value directly as project budget.

Problem:

Tender assumptions include:

* contingency,
* markup,
* pricing strategy.

Execution budgets require:

* operational cost baseline,
* resource allocation,
* actual tracking.

Correct approach:

Separate:

```
Bid Value
≠
Execution Budget
```

<details>
<summary>Formula logic</summary>

```excel
Execution Budget =
Direct Cost
+
Allocated Overhead
```

</details>

---

### Trap 3 — Ignoring Cost Category Separation

Decision:

> Aggregate all direct costs.

Problem:

Variance analysis becomes impossible.

Example:

| Category | Estimate | Actual  |
| -------- | -------- | ------- |
| Labor    | 120,000  | 162,000 |
| Material | 180,000  | 176,000 |

Aggregated reporting hides labor overruns.

Correct approach:

Track each cost category independently.

<details>
<summary>Formula logic</summary>

```excel
Variance =
Actual
-
Estimate

Variance % =
Variance
/
Estimate
```

</details>

---

## Example Scenario

### Project

Commercial warehouse slab foundation.

### Inputs

| Variable  | Value           |
| --------- | --------------- |
| Assembly  | Slab Foundation |
| Quantity  | 5,000 SF        |
| Labor     | $12/SF          |
| Material  | $18/SF          |
| Equipment | $4/SF           |
| Overhead  | 10%             |
| Markup    | 15%             |

---

### Calculation

```text
Labor:
5,000 × 12
=
$60,000

Material:
5,000 × 18
=
$90,000

Equipment:
5,000 × 4
=
$20,000

Direct Cost:
=
$170,000

Overhead:
=
$17,000

Subtotal:
=
$187,000

Markup:
=
$28,050

Bid Value:
=
$215,050
```

---

### Interpretation

The estimator now has:

* an AIA-compatible bid estimate,
* a reusable slab assembly,
* a project execution baseline,
* a future variance tracking framework.

The same estimate transitions directly into project cost control.

---

## Formula Reference

<details>
<summary>Assembly Expansion</summary>

```excel
Extended_Qty =
Project_Qty
*
Assembly_Factor
```

</details>

<details>
<summary>Direct Cost Calculation</summary>

```excel
Cost =
Extended_Qty
*
Unit_Cost
```

</details>

<details>
<summary>Bid Calculation</summary>

```excel
Bid =
Direct_Cost
+
Overhead
+
Markup
```

</details>

<details>
<summary>Variance Analysis</summary>

```excel
Variance =
Actual
-
Estimate

Variance % =
Variance
/
Estimate
```

</details>

---

## Validation Rules

| Field          | Rule            | Error Behavior   |
| -------------- | --------------- | ---------------- |
| Quantity       | Must be >0      | Reject input     |
| Labor Rate     | Must be ≥0      | Highlight        |
| Material Rate  | Must be ≥0      | Highlight        |
| Equipment Rate | Must be ≥0      | Highlight        |
| Overhead       | 0%-100%         | Validation error |
| Markup         | 0%-100%         | Validation error |
| Assembly Code  | Must exist      | Lookup error     |
| Cost Code      | Must exist      | Lookup error     |
| Actual Cost    | Must be numeric | Reject input     |

</details>

---

# Other Tools in This Series

* **DTC Inventory Planning Workbook** — inventory, replenishment, and purchasing decisions.
* **Project Time & Cost Analytics Workbook** — project labor allocation and profitability analysis.
* **Marketing Budget Allocation Simulator** — scenario-based marketing investment planning.
* **VAT Compliance & Calculation Dashboard** — cross-platform indirect tax analysis.
* **CRM to Accounting Integration Workbook** — operational finance data transformation.

More tools: **GitHub Profile / Gumroad Store**

---

# License

This project is licensed under the **Apache License 2.0**.

You are free to use, modify, distribute, and adapt this workbook under the terms of the Apache License 2.0.
