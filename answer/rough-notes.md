

Case Study 
The ministry of Health has said that they want a health data system that would aid their decision making 
- The want to keep the maternal mortality rate at a maximum 12 out of 1000 and neo-maternal at 700 out of 100k and currently they numbers are higher 

==== SHOS Health Atlas provides the ability to
visualize and provides situational awareness for improved decision-making. ======


critical Data point 
DHIS2 - used for monthly reporting (with 2-3 week delays)
WHo are the primary data entry agents (field agents or clinicians) field might face connection issues, clinician might have emergency services rendered that have not been entered due to overwork
    - Why is there a reporting delay of 2-3 weeks 
    - Is it that clinicians are not filling in the report on time 
    - Is there a backup process underway 
    - DO they have connection issues that only allow them to upload at certain days 
    - Are all channels of comms (sms, desktop, mobile etc) all set up on field to send data 

45 hospitals - use "HealthTrack" EMR (buggy, local servers)
    - How can we get the local data to the right source for consumption by DHIS or how can the EMR directly feed it 

30 clinics - use OpenMRS
    - How can openMRS connect data to DHIS

175 rural facilities - paper only
    - THis needs digitization 

Separate systems - TB program, HIV program (CommCare), immunisation (Excel)
    TB program and Hiv program are capture on CommCare
    How can we centralize data sources ?

Infrastructure - unreliable power (4-6 hrs/day rural), spotty 3G/4G


Sand HOS can help the ministry 
- Understand the location with the highest mortality rates base of the GIS, - Choropleth/bivariate, choropleth, Proportional (graduated) symbols on map (pie chart bubble), Dot density, Health map




Sand Products 
- Health Atlas - Geographic mapping and facility intelligence
    Health Atlas is probably intended to support location-based decision making
    Use Health Atlas for 
        'Disease Surveillance

        ↓

        Hotspots

        ↓

        Health Atlas'

- Health Outcome Tracker - Patient outcome analytics
    Potential report tool that the ministry can use to generate "Quarterly Health Bulletin"
    Analytics Template Toolkit could provide:
        Monthly Bulletin
        Quarterly Report
        Minister Dashboard
        District Scorecard
    *Outcome Tracker generates metrics. Toolkit formats them.

    Outcome Analytics

    ↓

    Recovery Rate
    Mortality Rate
    Readmission Rate

    ↓

    Reporting

- Health Insight Engine - AI-powered analytics and alerts: 
    This layers sits above the HealthOS
    It handles forecasting, predictions etc 
    It feeds the Apache Superset dashboard about it's findings 

- Analytics Template Toolkit via Apache Superset
    prebuilt analytics dashboards that sit on top of the standardized HealthOS data model
    use to display data across different entities with similar schema 
    Data from HealthOS is used to power the dynamic dashboard
    This is likely used in the district Health Officer layer (Check deployment one)
    *Outcome Tracker generates metrics. Toolkit formats them.

- HealthOS Data Models - Standard healthcare data transformations
    a transformation engine that maps incoming data to a canonical model, and validation logic before storing the data for analytics and AI.
    Function
        Pull raw patient files from EMR
        Ingestion layer that carries all data
        Change local terms and Standardize data in a correct format and schema
        Move the clean data into a database (Likely DHIS2)




Week 1 Arrival: You arrive on Monday. The MoH Director says,
"Our data is a mess. We
cannot make good decisions. We need you to fix it.
"

## Problem A
Assumptions 1:
Messy Data might mean that they have the data spread across multiple sources

Plausibility: The amount of time spent (40 hour/month = 10 hours/week = 2hour/day) of data preparation and the the manual effort of 'compiling' elude that that gather data from multiple sources 
Plausibility: If they already have the data source and a reusable pipeline (query, scheduler etc) this should enable them get data reports given that the data points do not change. 


Assumptions 2:
Even with the report generated the MOH cannot still make good decisions, likely because the data is stale 

Plausibility: DHIS2 has a 2-3 weeks delay so there is no real-time update on the interventions. Even when the DHIS2 excel report are generate, they are from the previous month which doesn't allow the ministry to take quick actions.

Assumptions 3:
DHIS2 is what the ministry of Health uses to undersatand and visualize the data ?

Asumption 4:
Data is messy could mean that the data sources use ver different conventions and may require a data transformation layer that a 

Diagnoses 
- Diagnose Data reservoirs - where are data sources


Goal
- Automate report generation 


Solution 
Build a single Real-time view of the healthcare system

Build a real-time data pipeline
- Build a data pipeline that captures data from multiple sources 
- Process the data to capture the right data points (patient volume, maternal health indicators (ANC visits, deliveries, complications))
- Pipe the data to a performance rating model ranking each of the 10 facilities by the standard metric (WHO minimum complication per delivery, what is the percentage mortality rate per facility per month, How many patients did each facility handle, deliveries, complications and visits), 'Health Outcome Tracker - Patient outcome analytics' can be used here 
- Pipe the data through a trend analysis model that can be filtered by quarter with   comparable charts that allow up to 3 quarterly analysis - Analytics Template Toolkit - 'Pre-built reporting templates with Apache Superset' can be used



## Problem B 
Assumptions:
The DHO are using the DHIS2 to collect data from the 10 facilities, however since this data are not real-time they are unable to use them to gain quick insight (which facilities are
operational, which have stock outs, where disease outbreaks are happening)

Plausibility: 'They make decisions based on 3-week-old data.'




