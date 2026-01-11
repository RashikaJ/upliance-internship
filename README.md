📊 Data Analytics Intern Assignment – upliance.ai

📌 Overview

This project analyzes operational data using pure JavaScript to demonstrate real-world data handling, entity-level aggregation, and dynamic visualization. The solution supports dynamic time-based grouping and cross-table matching without any manual data cleaning.

📁 Dataset

The Excel file contains 4 sheets:

Orders_Raw – Customer orders data

Sessions_Raw – Device session data

Calls_Raw – Call log data

Controls – Input reference (Time Granularity & Data View)

⚠️ Raw data is not edited manually. All transformations are handled programmatically in JavaScript.

⚙️ Global Inputs

The dashboard dynamically reacts to:

Time Granularity: Daily / Weekly / Monthly

Data View: Orders / Sessions / Calls

🧠 Core Logic
1️⃣ Entity-Level Aggregation (Task 1)

Aggregation is performed at the correct entity level, not at the raw row level:

Data View	Entity Key
Orders	    Normalized Phone
Sessions	Device ID
Calls	    Normalized Phone

If an entity appears multiple times within the same time bucket, rows are merged into a single record.

2️⃣ Time-Based Grouping

Time buckets are dynamically generated:

Daily → YYYY-MM-DD

Weekly → ISO Week (YYYY-WW)

Monthly → YYYY-MM

Excel serial dates are explicitly handled to ensure accurate grouping.

3️⃣ Dynamic Visualization (Task 2)

A single bar chart dynamically updates based on:

Selected Data View

Selected Time Granularity

Built using Chart.js.

4️⃣ Cross-Table Matching & Derived Metric (Task 3)

A derived metric is computed:

Call → Order Conversion Rate

Calls and orders are matched using:

Same normalized phone number

Same time bucket

Missing or unmatched data is handled gracefully.

🛠️ Tech Stack

HTML, CSS, Vanilla JavaScript

Chart.js

SheetJS (xlsx)

🚀 Deployment

Hosted as a static frontend application

Excel file loaded and processed fully on the client side

📎 How to Run

Clone the repository

Serve using a local server (or deploy directly)

Open index.html

🧩 Key Design Decisions

Single reusable aggregation engine

Explicit Excel date handling

No hardcoded time values

Logic-first approach aligned with real-world data challenges
