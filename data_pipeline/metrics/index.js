const dfd = require("danfojs-node");

class DHIS2DataLoader {
  async load() {
    const dir = "data_pipeline/data/";
    const [clinical, facilities, governance, operations, workers] = await Promise.all([
      dfd.readCSV(dir + "clinical_neonatal.csv"),
      dfd.readCSV(dir + "facilities.csv"),
      dfd.readCSV(dir + "governance.csv"),
      dfd.readCSV(dir + "operations.csv"),
      dfd.readCSV(dir + "healthcare_workers.csv"),
    ]);
    return { clinical, facilities, governance, operations, workers };
  }
}

const loader = new DHIS2DataLoader();

async function calculate_top_facilities() {
  // The code bellow calculates the top facilities by total deliveries
  const { clinical: clinical_df, facilities: facility_df } = await loader.load();

  // Splits your table into smaller, groups based on the facility_id.
  let aggregated_df = clinical_df.groupby(["facility_id"]).agg({ total_deliveries: "sum" });
  aggregated_df = aggregated_df.rename({ total_deliveries_sum: "total_deliveries" });

  // Sort the aggregated data by total_deliveries in descending order to get the top facilities
  let ranked_df = aggregated_df.sortValues("total_deliveries", { ascending: false });

  // Join the facility data to capture name and other preliminary information
  ranked_df = dfd.merge({
    left: ranked_df,
    right: facility_df.loc({ columns: ["facility_id", "facility_name", "district", "province"] }),
    on: ["facility_id"],
    how: "left",
  });

  return ranked_df.loc({
    columns: ["facility_id", "facility_name", "district", "province", "total_deliveries"],
  });
}

async function calculate_neonatal_metrics() {
  // This calculates the neonatal mortality rate per facility (per 1,000 live births).
  const { clinical: clinical_df, facilities: facility_df } = await loader.load();

  // A neonatal death is a baby born ALIVE that dies in its first 28 days.
  clinical_df.addColumn(
    "neonatal_deaths",
    clinical_df["neonatal_deaths_0_7d"].add(clinical_df["neonatal_deaths_8_28d"]),
    { inplace: true }
  );

  // Collapse the 12 monthly rows per facility into ONE row.
  let aggregated_df = clinical_df.groupby(["facility_id"]).agg({
    neonatal_deaths: "sum",
    live_births: "sum",
  });
  aggregated_df = aggregated_df.rename({
    neonatal_deaths_sum: "total_neonatal_deaths",
    live_births_sum: "total_live_births",
  });

  // calculate the neonatal mortality rate per 1,000 live births.
  aggregated_df.addColumn(
    "neonatal_mortality_rate",
    aggregated_df["total_neonatal_deaths"].div(aggregated_df["total_live_births"]).mul(1000),
    { inplace: true }
  );

  // Rank facilities from highest mortality rate to lowest (worst outcomes first).
  let ranked_df = aggregated_df.sortValues("neonatal_mortality_rate", { ascending: false });

  // Join the facility data to capture name and other preliminary information.
  ranked_df = dfd.merge({
    left: ranked_df,
    right: facility_df.loc({ columns: ["facility_id", "facility_name", "district", "province"] }),
    on: ["facility_id"],
    how: "left",
  });

  return ranked_df.loc({
    columns: ["facility_id", "facility_name", "district", "province", "neonatal_mortality_rate"],
  });
}

async function calculate_performance() {
  // This calculates a facility readiness score from the governance/quality indicators.
  const { facilities: facility_df, governance: governance_df } = await loader.load();

  // Rank facilities from highest reporting completeness to lowest.
  let ranked_df = governance_df.sortValues("hmis_reporting_completeness", { ascending: false });

  // Calculate the facility readiness score
  // convert yes/no to 1/0
  ranked_df.addColumn(
    "newborn_protocol_exists",
    ranked_df["newborn_protocol_exists"].map((v) => ({ yes: 1, no: 0 }[String(v).toLowerCase()])),
    { inplace: true }
  );
  ranked_df.addColumn(
    "quality_improvement_active",
    ranked_df["quality_improvement_active"].map((v) => ({ yes: 1, no: 0 }[String(v).toLowerCase()])),
    { inplace: true }
  );
  // normalize the percentage columns to a 0-1 scale
  const pct_columns = [
    "hmis_reporting_completeness",
    "death_audits_conducted_pct",
    "staff_trained_on_protocol_pct",
    "bag_mask_ventilation_competency",
    "thermal_care_protocol_compliance",
    "infection_prevention_score",
  ];
  for (const col of pct_columns) {
    ranked_df.addColumn(
      col,
      ranked_df[col].map((v) => parseFloat(String(v).replace("%", "")) / 100),
      { inplace: true }
    );
  }
  // keep supervision_visits_quarterly in a 0-1 scale to normalize the scale with other columns
  // since there is no max value like in percentage we use the max column value
  ranked_df.addColumn(
    "supervision_visits_quarterly",
    ranked_df["supervision_visits_quarterly"].div(ranked_df["supervision_visits_quarterly"].max()),
    { inplace: true }
  );
  // calculate the facility readiness score as the average of the normalized columns
  ranked_df.addColumn(
    "facility_readiness_score",
    ranked_df
      .loc({
        columns: [
          "newborn_protocol_exists",
          "quality_improvement_active",
          "hmis_reporting_completeness",
          "death_audits_conducted_pct",
          "staff_trained_on_protocol_pct",
          "bag_mask_ventilation_competency",
          "thermal_care_protocol_compliance",
          "infection_prevention_score",
          "supervision_visits_quarterly",
        ],
      })
      .mean({ axis: 1 }),
    { inplace: true }
  );

  // Join the facility data to capture name and other preliminary information.
  ranked_df = dfd.merge({
    left: ranked_df,
    right: facility_df.loc({ columns: ["facility_id", "facility_name"] }),
    on: ["facility_id"],
    how: "left",
  });

  // Rank by the readiness score itself (highest = best-prepared facility).
  ranked_df = ranked_df.sortValues("facility_readiness_score", { ascending: false });

  return ranked_df.loc({
    columns: ["facility_id", "facility_name", "hmis_reporting_completeness", "facility_readiness_score"],
  });
}

async function calculate_trends() {
  // Preliminary trend analysis: how does neonatal mortality move quarter-over-quarter
  // across the whole system (all facilities combined)?
  const { clinical: clinical_df } = await loader.load();

  // Total neonatal deaths = first 7 days + days 8-28 (timing split, so no double-counting).
  clinical_df.addColumn(
    "neonatal_deaths",
    clinical_df["neonatal_deaths_0_7d"].add(clinical_df["neonatal_deaths_8_28d"]),
    { inplace: true }
  );

  // Turn each reporting month into its calendar quarter (2024Q1, 2024Q2, ...).
  clinical_df.addColumn(
    "quarter",
    clinical_df["reporting_month"].values.map((m) => {
      const [year, month] = String(m).split("-");
      return `${year}Q${Math.ceil(parseInt(month, 10) / 3)}`;
    }),
    { inplace: true }
  );

  // Roll every facility up into ONE row per quarter (system-wide totals).
  let quarterly = clinical_df.groupby(["quarter"]).agg({
    total_deliveries: "sum",
    live_births: "sum",
    neonatal_deaths: "sum",
  });
  quarterly = quarterly.rename({
    total_deliveries_sum: "total_deliveries",
    live_births_sum: "total_live_births",
    neonatal_deaths_sum: "total_neonatal_deaths",
  });
  quarterly = quarterly.sortValues("quarter", { ascending: true });

  // Rate per quarter: sum the numerator AND denominator first, then divide once (ratio of sums).
  quarterly.addColumn(
    "neonatal_mortality_rate",
    quarterly["total_neonatal_deaths"].div(quarterly["total_live_births"]).mul(1000),
    { inplace: true }
  );

  // The trend itself: how did the rate change vs the previous quarter?
  // A positive change = mortality rising (worse); negative = improving.
  const rates = quarterly["neonatal_mortality_rate"].values;
  quarterly.addColumn(
    "change_vs_prev_qtr",
    rates.map((r, i) => (i === 0 ? NaN : r - rates[i - 1])),
    { inplace: true }
  );
  quarterly.addColumn(
    "pct_change_vs_prev_qtr",
    rates.map((r, i) => (i === 0 ? NaN : ((r - rates[i - 1]) / rates[i - 1]) * 100)),
    { inplace: true }
  );

  return quarterly;
}

module.exports = {
  DHIS2DataLoader,
  calculate_top_facilities,
  calculate_neonatal_metrics,
  calculate_performance,
  calculate_trends,
};
