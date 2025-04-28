---
title: Vaccine refusal
style: ../styles/dashboard.css
toc: false
---

## Vaccine refusal

```js
import { FileAttachment, resize } from "observablehq:stdlib";
import * as topojson from "npm:topojson-client";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

import Scrubber from "../components/Scrubber.js";
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
const vaccRefusal = await FileAttachment("../data/vacc_refusal.csv").csv().then((d) => d.map(coerceRow));
```

```js
const topoCounties = await FileAttachment("../data/us_counties.json").json();
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
const yearValInput = Scrubber(d3.range(2016, 2023), {
    delay: 400,
    loopDelay: 1000,
    autoplay: false,
    loop: false,
});
const yearVal = view(yearValInput);

function topoPlot(year, { width } = {}) {
    const out = filterRefusal(vaccRefusal, year);

    const plt = Plot.plot({
        projection: "identity",
        width: width,
        height: 550,
        margin: 0,
        color: {
            type: "diverging",
            scheme: "BuRd",
            pivot: 0.05,
            symmetric: false,
            unknown: "lightgray",
            // legend: true,
            // width: 500,
            // height: 60,
            label: "Vaccine refusal proportion",
            // percent: true, // convert prop to percent
            domain: [0, 0.1], // restrict range, seems to respect percent conversion
        },
        marks: [
            Plot.geo(
                geoCounties,
                {
                    fill: (d) => out.get(d.properties.GEOID),
                    title: (d) => `${d.properties.NAMELSAD}, ${d.properties.STUSPS}\nprop. = ${roundProp(out.get(d.properties.GEOID))}`,
                    tip: true,
                    strokeWidth: 2,
                    className: "county-border",
                }
            ),
            Plot.geo(
                stateMesh,
                {
                    stroke: "var(--plot-background)",
                    strokeWidth: 0.5,
                    className: "state-mesh",
                }
            ),
        ]
    });

    const outlineColor = "#ffffff";
    d3.select(plt)
        .select(".county-border")
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

```js
const plt = topoPlot(yearVal, { width });
const legendOptions = {
    width: 500,
    height: 60,
}
const legend = plt.legend("color", legendOptions);
```

<div class="grid grid-cols-1">
    <div class="card">
        <div>
            ${yearValInput}
        </div>
        <!-- ${resize((width) => topoPlot(yearVal, {width}))} -->
        ${plt}
        ${legend}
    </div>
</div>

<!-- <div style="min-height: 100vh"></div> -->
