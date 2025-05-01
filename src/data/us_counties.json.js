import * as shapefile from "shapefile";
import { readFile } from "node:fs/promises";
import { geoProject } from "d3-geo-projection";
import { geoAlbersUsa } from "d3-geo";
import { topology } from "topojson-server";
import { presimplify, quantile, simplify } from "topojson-simplify";
import { quantize } from "topojson-client";

const countiesGeojson = await shapefile.read(
    ...(await Promise.all([
        readFile("./src/data/cb_2020_us_county_20m/cb_2020_us_county_20m.shp"),
        readFile("./src/data/cb_2020_us_county_20m/cb_2020_us_county_20m.dbf"),
    ]))
);

const countiesProj = geoProject(countiesGeojson, geoAlbersUsa());

let countiesTopojson = topology({ counties: countiesProj });
countiesTopojson.objects.counties.geometries =
    countiesTopojson.objects.counties.geometries.filter(
        (county) =>
            Number(county.properties.STATEFP) >= 1 &&
            Number(county.properties.STATEFP) <= 56
    );

let countiesTopoSimp = presimplify(countiesTopojson);
const minWeight = quantile(countiesTopoSimp, 0.6); // p in range [0, 1], lower is more simplified looking map
countiesTopoSimp = simplify(countiesTopoSimp, minWeight);
countiesTopoSimp = quantize(countiesTopoSimp, 1e6);

process.stdout.write(JSON.stringify(countiesTopoSimp));
