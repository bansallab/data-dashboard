import random
import sys

import polars as pl


def main() -> int:
    df = pl.read_csv(
        "./src/data/ac.v.df456.no23.csv",
        schema_overrides={
            "county_fips": pl.String,
            "year": pl.Int64,
            "annual_ratio": pl.String,
        },
        columns=["county_fips", "year", "annual_ratio"],
        # null_values="NA",
    ).sort("year", "county_fips")

    df.write_csv(sys.stdout)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
