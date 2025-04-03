import { readFile } from "node:fs/promises";
import * as shapefile from "shapefile";
import { geoProject } from "d3-geo-projection";
import { geoAlbersUsa } from "d3-geo";
import { topology } from "topojson-server";
import { quantize } from "topojson-client";
import { presimplify, quantile, simplify } from "topojson-simplify";

const countiesGeojson = await shapefile.read(
    ...(await Promise.all([
        readFile("./src/data/cb_2020_us_county_20m/cb_2020_us_county_20m.shp"),
        readFile("./src/data/cb_2020_us_county_20m/cb_2020_us_county_20m.dbf"),
    ]))
);
const countiesProj = geoProject(countiesGeojson, geoAlbersUsa());

const countiesTopojson = topology({ counties: countiesProj });
let countiesTopoSimp = presimplify(countiesTopojson);
const minWeight = quantile(countiesTopoSimp, 0.6); // p in range [0, 1], lower is more simplified looking map
countiesTopoSimp = simplify(countiesTopoSimp, minWeight);
countiesTopoSimp = quantize(countiesTopoSimp, 1e6);

process.stdout.write(JSON.stringify(countiesTopoSimp));
