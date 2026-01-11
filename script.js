let rawData = {};
let chartInstance = null;

fetch("./data/Data.xlsx")
  .then(res => res.arrayBuffer())
  .then(buffer => {
    const workbook = XLSX.read(buffer, { type: "array" });

    workbook.SheetNames.forEach(sheetName => {
      rawData[sheetName] = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName],
        { defval: null }
      );
    });

    console.log("Loaded Data:", rawData);
    updateDashboard();
  });

function normalizePhone(phone) {
  if (!phone) return null;
  return phone.toString().replace(/\D/g, "").slice(-10);
}

function parseExcelDate(value) {
  if (typeof value === "number") {
    const utcDays = Math.floor(value - 25569);
    const utcValue = utcDays * 86400;
    return new Date(utcValue * 1000);
  }
  return new Date(value);
}

function getISOWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getFullYear()}-${String(weekNo).padStart(2, "0")}`;
}

function getTimeKey(dateValue, granularity) {
  const date = parseExcelDate(dateValue);

  if (granularity === "daily")
    return date.toISOString().split("T")[0];

  if (granularity === "weekly")
    return getISOWeek(date);

  if (granularity === "monthly")
    return `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, "0")}`;
}


function aggregateData(dataView, granularity) {
  const sourceData = rawData[dataView] || [];
  const resultMap = {};

  sourceData.forEach(row => {
    let entityId, date;

    if (dataView === "Orders_Raw") {
      entityId = normalizePhone(row.Phone);
      date = row["Order Date"];
    }

    if (dataView === "Sessions_Raw") {
      entityId = row["Device ID"];
      date = row["Session Date"];
    }

    if (dataView === "Calls_Raw") {
      entityId = normalizePhone(row.Phone);
      date = row["Call Date"];
    }

    if (!entityId || !date) return;

    const timeKey = getTimeKey(date, granularity);
    const uniqueKey = `${entityId}_${timeKey}`;

    if (!resultMap[uniqueKey]) {
      resultMap[uniqueKey] = {
        entityId,
        timeKey,
        count: 0
      };
    }

    resultMap[uniqueKey].count += 1;
  });

  return Object.values(resultMap);
}

function summarizeByTime(aggregatedData) {
  const summary = {};

  aggregatedData.forEach(item => {
    if (!summary[item.timeKey]) {
      summary[item.timeKey] = 0;
    }
    summary[item.timeKey] += item.count;
  });

  return summary;
}


function computeCallToOrderConversion(granularity) {
  const orders = aggregateData("Orders_Raw", granularity);
  const calls = aggregateData("Calls_Raw", granularity);

  const orderSet = new Set(
    orders.map(o => `${o.entityId}_${o.timeKey}`)
  );

  let matched = 0;

  calls.forEach(c => {
    if (orderSet.has(`${c.entityId}_${c.timeKey}`)) {
      matched++;
    }
  });

  return calls.length === 0
    ? 0
    : ((matched / calls.length) * 100).toFixed(2);
}

function renderChart(dataView, granularity) {
  const aggregated = aggregateData(dataView, granularity);
  const summary = summarizeByTime(aggregated);

  const labels = Object.keys(summary).sort(
    (a, b) => new Date(a) - new Date(b)
  );
  const values = labels.map(label => summary[label]);

  const ctx = document.getElementById("chart").getContext("2d");

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: `${dataView.replace("_Raw", "")} (${granularity})`,
        data: values
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

function updateDashboard() {
  const dataViewSelect = document.getElementById("dataView").value;
  const granularity = document.getElementById("granularity").value;

  const dataViewMap = {
    orders: "Orders_Raw",
    sessions: "Sessions_Raw",
    calls: "Calls_Raw"
  };

  const dataView = dataViewMap[dataViewSelect];

  renderChart(dataView, granularity);

  if (dataView === "Orders_Raw" || dataView === "Calls_Raw") {
  const conversion = computeCallToOrderConversion(granularity);
  document.getElementById("metric").innerText =
    `Call → Order Conversion: ${conversion}%`;
} else {
  document.getElementById("metric").innerText = "";
}
}

document.getElementById("dataView").addEventListener("change", updateDashboard);
document.getElementById("granularity").addEventListener("change", updateDashboard);
