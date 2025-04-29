---
title: Vaccine refusal
style: ../styles/dashboard.css
toc: false
---

## Vaccine refusal

```js
import { FileAttachment, resize } from "observablehq:stdlib";
import { rewind } from "jsr:@nshiab/journalism/web";
import * as topojson from "topojson-client";
import { geoIdentity } from "d3-geo";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

import Scrubber from "../components/Scrubber.js";
```

```js
async function loadGeoData() {
    // filter: topoCounties.objects.counties.geometries which is arr of Polygon objects
    const topoCounties = await FileAttachment("../data/us_counties.json").json();
    // NOTE: fix winding order issue introduced here
    // geoCounties is GeoJSON FeatureCollection
    const geoCounties = rewind(topojson.feature(topoCounties, topoCounties.objects.counties));

    return [topoCounties, geoCounties]
}

const [topoCounties, geoCounties] = await loadGeoData();
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
// interior borders only
// TODO: include this in the geo function above?
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

function vaccRefusalPlot(year, { width } = {}) {
    const data = filterRefusal(vaccRefusal, year);

    // TODO: this appears to make sizing responsive; figure out reactive margin/padding
    const plt = Plot.plot({
        // or: scale(1300).translate([975/2, 610/2])?
        // also see d3-geo projection code
        // https://github.com/d3/d3-geo/blob/8c53a90ae70c94bace73ecb02f2c792c649c86ba/src/projection/albersUsa.js#L20
        projection: ({width, height}) => geoIdentity().fitSize([width, height], geoCounties),
        width: width,
        // margin: 0,
        // svg element inline styles
        // style: {
        //     padding: "10px",
        // },
        color: {
            type: "diverging",
            scheme: "BuRd",
            unknown: "lightgray",
            pivot: 0.05, // center point
            symmetric: false,
            legend: true,
            width: 700,
            height: 60,
            // label: "Vaccine refusal proportion",
            // percent: true, // convert prop to percent
            domain: [0, 0.1], // restrict range, seems to respect percent conversion
        },
        marks: [
            Plot.geo(
                geoCounties,
                {
                    fill: (d) => data.get(d.properties.GEOID),
                    title: (d) => `${d.properties.NAMELSAD}, ${d.properties.STUSPS}\nprop. = ${roundProp(data.get(d.properties.GEOID))}`,
                    tip: true,
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

    // HACK: this doesn't feel like a good way to get rid of empty space
    // const h = d3.select(plt).attr("height");
    // d3.select(plt).select(".plot-d6a7b5").attr("viewBox", [60, 0, 800, 600]).node();

    // move legend
    // d3.select(plt)
    //     .select("svg")
    //     .raise()
    //     .style("float", "bottom");

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
// const plt = vaccRefusalPlot(yearVal, { width });
// const legendOptions = {
//     width: 500,
//     height: 60,
// }
// const legend = plt.legend("color", legendOptions);

// display(width);
```

<div class="card">
    <div id="scrubber-container">
        ${yearValInput}
    </div>
    <div id="plot-container">
        ${resize((width) => vaccRefusalPlot(yearVal, { width }))}
    </div>
</div>

<!-- <div style="min-height: 100vh"></div> -->
