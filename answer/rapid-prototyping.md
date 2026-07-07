# Rapid Prototyping

**Which Sand products you will use and why**
- HealthOS Data Models: To transform and standardize the raw DHIS2 exports into a consistent healthcare data model that downstream analytics can consume. 
- Health Outcome Tracker: Compute and manage healthcare indicators like delivery volume, mortality rates, and trend analysis.
- Analytics Template Toolkit: To generate a reusable Quarterly Health Bulletin template and present the computed indicators as an HTML dashboard or PDF report.This would reduce any bulletin preparation time.

**What you would show in Week 3 (what works, what is broken)**
What works:
- Ingests the DHIS2 export.
- Calculates the bulletin metrics: top facilities by delivery volume, neonatal mortality rate, facility performance (readiness + reporting completeness), and quarter-over-quarter trend.
- Generates a simple HTML bulletin (or dashboard) displaying the computed metrics.

Known limitations / What's broken:
- in this implementation we have not made use of sand tech solutions do the data standardization layer will be implemented with it.
- ANC visit cannot be calculated because the supplied dataset does not include ANC visit data.
- Delivery is used as a proxy value for Patient volume
- Reporting timeliness cannot be calculated because submission timestamps or expected reporting dates are not available.
- Trend analysis is only implemented for the clinical neonatal dataset, since it is the only dataset containing monthly observations.
- The bulletin uses a simple template intended to demonstrate the concept and not a production-ready design.