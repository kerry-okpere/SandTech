const fs = require("fs");
const {
  calculate_top_facilities,
  calculate_neonatal_metrics,
  calculate_performance,
  calculate_trends,
} = require("./data_pipeline/metrics");

// danfo DataFrame -> array of plain row objects
const rows = (df) => {
  const cols = df.columns;
  return df.values.map((r) => Object.fromEntries(cols.map((c, i) => [c, r[i]])));
};

async function main() {
  const deliveries = rows((await calculate_top_facilities()).head(10)).map((r) => ({
    name: r.facility_name,
    value: r.total_deliveries,
  }));

  const mortality = rows((await calculate_neonatal_metrics()).head(10)).map((r) => ({
    name: r.facility_name,
    value: +r.neonatal_mortality_rate.toFixed(1),
  }));

  const performance = rows((await calculate_performance()).head(10)).map((r) => ({
    name: r.facility_name,
    completeness: Math.round(r.hmis_reporting_completeness * 100),
    readiness: +(r.facility_readiness_score * 100).toFixed(1),
  }));

  const trend = rows(await calculate_trends()).map((r) => ({
    quarter: r.quarter,
    value: +r.neonatal_mortality_rate.toFixed(1),
  }));

  fs.writeFileSync("bulletin.json", JSON.stringify({ deliveries, mortality, performance, trend }, null, 2));
  console.log("Wrote bulletin.json");
}

main().catch((e) => {
  console.error("ERROR:", e);
  process.exit(1);
});
