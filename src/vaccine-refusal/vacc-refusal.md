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

    // get interior state borders only
    const stateMesh = topojson.mesh(topoCounties, topoCounties.objects.counties, function(a, b) {
        const fipsA = a.properties.STATEFP + a.properties.COUNTYFP;
        const fipsB = b.properties.STATEFP + b.properties.COUNTYFP;

        return fipsA - fipsA % 1000 !== fipsB - fipsB % 1000;
    })

    return [topoCounties, geoCounties, stateMesh]
}

const [topoCounties, geoCounties, stateMesh] = await loadGeoData();
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
const yearValInput = Scrubber(d3.range(2016, 2023), {
    delay: 400,
    loopDelay: 1000,
    autoplay: false,
    loop: false,
});
const yearVal = view(yearValInput);

function vaccRefusalPlot(year, { width } = {}) {
    const data = filterRefusal(vaccRefusal, year);
    // const percent = d3.format(".2%");

    // TODO: ideally the margin is also relative to width/height
    // TODO: this might need extra translation too
    // TODO: is there some inefficient re-render here?
    const xMargin = width * 0.03;
    const yMargin = 0.01;
    const plt = Plot.plot({
        // or: scale(1300).translate([975/2, 610/2])?
        // also see d3-geo projection code
        // https://github.com/d3/d3-geo/blob/8c53a90ae70c94bace73ecb02f2c792c649c86ba/src/projection/albersUsa.js#L20
        projection: ({width, height}) => geoIdentity().fitSize([width - (xMargin * 2), height - (yMargin * height)], geoCounties),
        width: Math.max(width, 1300),
        height: 750, // forces height
        margin: 0,
        // svg element inline styles
        // style: {
        //     padding: "10px",
        // },
        // NOTE: for pct formatting: pivot = 5, percent = true, domain = [0, 10], symmetric = true
        color: {
            type: "diverging",
            scheme: "BuRd",
            unknown: "lightgray",
            pivot: 0.05, // center point
            symmetric: true,
            // percent: true, // convert prop to percent
            domain: [0, 0.1], // restrict range, seems to respect percent conversion
            label: "Vaccine refusal prop.", // will affect tip
        },
        marks: [
            Plot.geo(
                geoCounties,
                {
                    fill: (d) => data.get(d.properties.GEOID),
                    // NOTE: use either title channel *or* all other channels but not both
                    // with title, I'm really stuffing the data value into it which appears to be non-standard; won't get the small color square
                    // title: (d) => `${d.properties.NAMELSAD}, ${d.properties.STUSPS}\nprop. = ${roundProp(data.get(d.properties.GEOID))}`,
                    // alt to title:
                    channels: {
                        location: {
                            label: "",
                            value: (d) => `${d.properties.NAMELSAD}, ${d.properties.STUSPS}`,
                        },
                    },
                    tip: {
                        fontSize: 16,
                        // lineHeight: 1.2,
                        // fontWeight: "bold",
                        format: {
                            location: true,
                            fill: true,
                        },
                    },
                    className: "county-borders",
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
            // Plot.tip(
            //     geoCounties,
            //     Plot.pointer(
            //         Plot.centroid({
            //             // title: (d) => [d.properties.NAMELSAD, d.properties.STUSPS].join("\n\n"),
            //             // title: (d) => `${d.properties.NAMELSAD}, ${d.properties.STUSPS}`,
            //             // title: (d) => `${d.properties.NAMELSAD}, ${d.properties.STUSPS}\nprop. = ${roundProp(data.get(d.properties.GEOID))}`,
            //             fontSize: 18,
            //             anchor: "bottom",
            //             pointerSize: 12,
            //         }),
            //     ),
            // ),
        ]
    });

    const outlineColor = "#ffffff";
    d3.select(plt)
        .select(".county-borders")
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
// resize() helper only needed when rendering within inline ${}?
const plt = vaccRefusalPlot(yearVal, { width });
const legendOptions = {
    width: 500,
    height: 65,
    label: "", // can override tip label
}
const legend = plt.legend("color", legendOptions);
```

```js
const start = 2016;
const end = 2023;
display(Array.from({length: end - start}, (_, i) => i + start));
```

<div class="card">
    <h1>${yearVal}</h1>
    <div class="scrubber-container">
        ${yearValInput}
    </div>
    <div class="plot-container">
        <!-- ${resize((width) => vaccRefusalPlot(yearVal, { width }))} -->
        ${plt}
    </div>
    <div class="legend-container">
        ${legend}
    </div>
</div>

<!-- <div style="min-height: 100vh"></div> -->
