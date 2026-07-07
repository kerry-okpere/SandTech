# Neonatal Health Bulletin

A small pipeline that turns the DHIS2-style CSV exports into a quarterly bulletin.
It reads the raw data, computes a few facility metrics with Danfo.js, and renders
them as charts in a plain HTML page.

## Project
https://github.com/kerry-okpere/SandTech

## Setup
You'll need Node (v18+). Then:
For setting up environment:
```
npm install
```

For running the pipeline:  
```
node index.js
```

run this to view in the browser:
```
npm run serve
```

Go to http://localhost:8000/bulletin.html.

## Updating the data

To update the data, just swap the files and regenerate:
1. Replace `data_pipeline/data/clinical_neonatal.csv` with the new export
   (keep the same filename and column headers).
2. Run `node index.js` again, to override `bulletin.json` with the new numbers.
3. Refresh the browser (or `npm run serve` again).

Same goes for any of the other CSVs in `data_pipeline/data/`. 

## Layout

```
data_pipeline/
  data/            the DHIS2 CSV exports
  metrics/
    index.js       DHIS2DataLoader + the four metric functions
index.js           runs the metrics and writes bulletin.json
bulletin.html      the dashboard (fetches bulletin.json)
```

## Project

https://github.com/kerry-okpere/SandTech
