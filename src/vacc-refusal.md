---
title: Vaccine refusal
theme: dashboard
toc: false
---

## Vaccine refusal

```js
import { FileAttachment, resize } from "observablehq:stdlib";
import * as topojson from "npm:topojson-client";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

import Scrubber from "./components/Scrubber.js";
```

```js
function filterRefusal(data, year) {
    const dataFiltered = data.filter((row) => row.year === year);
    const out = new Map();
    for (let i = 0; i < dataFiltered.length; i++) {
        out.set(dataFiltered[i].county_fips, dataFiltered[i].refusal_prop)
    }

    return out;
}

const coerceRow = (d) => ({
    county_fips: d.county_fips,
    year: Number(d.year),
    refusal_prop: Number(d.annual_ratio),
});
const vaccRefusal = await FileAttachment("./data/vacc_refusal.csv").csv().then((d) => d.map(coerceRow));
```

```js
const topoCounties = await FileAttachment("./data/us_counties.json").json();
// returns GeoJSON FeatureCollection
const geoCounties = topojson.feature(topoCounties, topoCounties.objects.counties);
```

```js
// interior borders only
const stateMesh = topojson.mesh(topoCounties, topoCounties.objects.counties, function(a, b) {
    const fipsA = a.properties.STATEFP + a.properties.COUNTYFP;
    const fipsB = b.properties.STATEFP + b.properties.COUNTYFP;

    return fipsA - fipsA % 1000 !== fipsB - fipsB % 1000;
})
```

```js
const yearVal2Input = Scrubber(d3.range(2016, 2023), {
    delay: 400,
    loopDelay: 1000,
    autoplay: false,
    loop: false,
});
const yearVal2 = view(yearVal2Input);

function topoPlot(year, { width } = {}) {
    const out = filterRefusal(vaccRefusal, year);

    const plt = Plot.plot({
        projection: "identity", // or "albers-usa"
        width: width,
        color: {
            scheme: "Blues",
            unknown: "lightgray",
            type: "linear",
            legend: true,
            label: "Vaccine refusal percentage",
            percent: true, // converts prop to percent
            domain: [0, 10], // restrict range, seems to respect percent conversion
        },
        marks: [
            Plot.geo(
                geoCounties,
                {
                    fill: (d) => out.get(d.properties.GEOID),
                    title: (d) => `${d.properties.NAMELSAD}, ${d.properties.STUSPS}\npct. = ${roundProp(out.get(d.properties.GEOID))}`,
                    tip: true,
                    strokeWidth: 2,
                }
            ),
            Plot.geo(
                stateMesh,
                {
                    stroke: "var(--plot-background)",
                    strokeWidth: 0.5,
                }
            ),
        ]
    });

    const outlineColor = "blue";
    d3.select(plt)
        .selectAll("path")
        .on("mouseover", function() { d3.select(this).attr("stroke", outlineColor).raise(); })
        .on("mouseout", function() { d3.select(this).attr("stroke", null).lower(); });

    return plt;
}

function roundProp(prop) {
    if (isNaN(prop)) {
        return NaN;
    } else {
        // return pop.toFixed(2);
        return prop.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    }
}

```

<div class="grid grid-cols-1">
    <div class="card">
        <!-- <h2>Vaccine refusal proportions</h2> -->
        ${yearVal2Input}
        ${resize((width) => topoPlot(yearVal2, {width}))}
    </div>
</div>

<div style="min-height: 100vh"></div>
