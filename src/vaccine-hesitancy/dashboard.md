---
title: Dashboard
style: ../styles/dashboard.css
toc: false
---

# Vaccine hesitancy

```js
import { FileAttachment } from "observablehq:stdlib";
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

    // derive state borders from counties; get interior borders only
    const stateMesh = topojson.mesh(topoCounties, topoCounties.objects.counties, function(a, b) {
        const fipsA = a.properties.STATEFP + a.properties.COUNTYFP;
        const fipsB = b.properties.STATEFP + b.properties.COUNTYFP;

        return fipsA - fipsA % 1000 !== fipsB - fipsB % 1000;
    })

    return [geoCounties, stateMesh]
}

const [geoCounties, stateMesh] = await loadGeoData();
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
const start = 2016;
const end = 2023;
const years = Array.from({length: end - start}, (_, i) => i + start)
const yearValInput = Scrubber(years, {
    delay: 400,
    loopDelay: 1000,
    autoplay: false,
    loop: false,
});
const yearVal = view(yearValInput);

function vaccRefusalPlot(year, { width } = {}) {
    const data = filterRefusal(vaccRefusal, year);

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
            // scheme: "BuRd",
            scheme: "BuPu",
            unknown: "lightgray",
            pivot: 0.05, // center point
            symmetric: true,
            // percent: true, // convert prop to percent
            domain: [0, 0.1], // restrict range, seems to respect percent conversion
            label: "Vaccine hesitancy prop.", // will affect tip
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
                            label: "County",
                            value: (d) => `${d.properties.NAMELSAD}, ${d.properties.STUSPS}`,
                        },
                        countyFIPS: {
                            label: "County FIPS",
                            value: (d) => `${d.properties.GEOID}`,
                        }
                    },
                    tip: {
                        fontSize: 16,
                        lineHeight: 1.2,
                        format: {
                            location: true,
                            countyFIPS: true,
                            fill: roundProp,
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
        ]
    });

    const outlineColor = "var(--plot-background)";
    const outlineWidth = 2;
    d3.select(plt)
        .select(".county-borders")
        .selectAll("path")
        .on("mouseover", function() { d3.select(this).attr("stroke", outlineColor).attr("stroke-width", outlineWidth).raise(); })
        .on("mouseout", function() { d3.select(this).attr("stroke", null).attr("stroke-width", 0).lower(); });

    return plt;
}

function roundProp(prop) {
    if (isNaN(prop)) {
        return NaN;
    } 
    // return pop.toFixed(2);
    // return d3.format(".2%")(prop)
    return prop.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}
```

```js
const plt = vaccRefusalPlot(yearVal, { width });
const legendOptions = {
    width: 500,
    height: 65,
    // label: "", // can override tip label
}
const legend = plt.legend("color", legendOptions);
```

<div class="intro">
    <p>
        <b>
            It is crucial to monitor spatiotemporal changes in vaccine hesitancy in the United States to better understand areas of vulnerability. This can help guide public health efforts and track progress.
        </b>
    </p>
</div>

<div class="card">
    <h2>
        County-level vaccine hesitancy rates from 2016 to 2022
    </h2>
    <h3>
        Click the play button or drag the slider to see how county-level vaccine hesitancy rates change over the years (from 2016-2022). Hover your cursor over a specific county for additional details. Counties filled with light gray were deemed to have unreliable data because of a lack of overall claims data.
    </h3>
    <div class="card-container">
        <h1>${yearVal}</h1>
        <div class="scrubber-container">
            ${yearValInput}
        </div>
        <div class="plot-container">
            ${plt}
            <!-- ${resize((width) => vaccRefusalPlot(yearVal, { width }))} -->
        </div>
        <div class="legend-container">
            ${legend}
        </div>
    </div>
</div>

<div id="disclaimer" class="note" label="Disclaimer">
    <p>
        This dashboard does not provide any medical guidance or vaccination recommendations. Use of this dashboard for commercial purposes is strictly prohibited. Georgetown University is not responsible for the accuracy, fitness for use, and merchantability of this product.
    </p>
    <p>
        For questions or feedback, please reach out to Dr. Shweta Bansal at <b>shweta.bansal@georgetown.edu</b>.
    </p>
</div>

<!-- <div style="min-height: 100vh"></div> -->
