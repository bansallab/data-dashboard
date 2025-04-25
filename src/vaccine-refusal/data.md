---
title: Data
---

# Data

The dashboard uses data derived from commercial medical claims from both inpatient and outpatient settings across all 50 US states and Washington, D.C from 2016 to 2022. These data are provided by the claims clearinghouse services of a US-based healthcare technology company. To identify and estimate counts of vaccine refusal instances, we rely on International Statistical Classification of Diseases and Related Health Problems, 10th revision (ICD-10) codes present in these claims. We define the following four categories of vaccine refusal based on ICD-10 codes:

Definition  | ICD-10 codes
----------- | ------------
Medical     | Z28.01, Z28.02, Z28.03, Z28.04, Z28.09, Z28.81
Refusal     | Z28.1, Z28.20, Z28.21, Z28.29, Z28.82, Z28.89
Unavailable | Z28.83
Unspecified | Z28, Z28.3, Z28.8, Z28.9

## What are some limitations of these data?

These claims data are restricted to commercial settings, meaning Medicare populations are not included. Furthermore, medical claims data are often dependent on healthcare-seeking behavior.

Due to the risk of re-identification, data for individual counties with populations smaller than 20,000 are unavailable. Instead, data for such counties are pooled with the data of neighboring counties to form more populous groups. To estimate individual counts for these grouped counties, we disaggregate counts using weights derived from the county group member's population as a proportion of the pooled population.

## Are this data available for download?

No. These data are currently not available for download.

## Disclaimer

This dashboard does not provide any medical guidance or vaccination recommendations. Use of this dashboard for commercial purposes is strictly prohibited. Georgetown University is not responsible for the accuracy, fitness for use, and merchantability of this product.

For questions or feedback, please reach out to Dr. Shweta Bansal at <b>shweta.bansal@georgetown.edu</b>.

<div class="note" label="Disclaimer">
    <p>
        This dashboard does not provide any medical guidance or vaccination recommendations. Use of this dashboard for commercial purposes is strictly prohibited. Georgetown University is not responsible for the accuracy, fitness for use, and merchantability of this product.
    </p>
    <p>
        For questions or feedback, please reach out to Dr. Shweta Bansal at <b>shweta.bansal@georgetown.edu</b>.
    </p>
</div>
