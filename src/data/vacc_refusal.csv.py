import random
import sys

import polars as pl


def dummy() -> int:
    """
    Produce dummy proportion data
    """
    df = (
        pl.read_csv(
            "./src/data/county_month_age_vacc_refusal_age_grp_1_imputed.csv",
            schema={
                "county_fips": pl.String,
                "year_month": pl.String,
                "age_grp": pl.String,
                "unspecified": pl.Int64,
                "medical": pl.Int64,
                "refusal": pl.Int64,
                "unavailable": pl.Int64,
            },
            columns=["county_fips", "year_month"],
        )
        .rename({"county_fips": "county_fips_grp"})
        .with_columns(
            year=pl.col("year_month").str.slice(0, 4),
            county_fips=pl.col("county_fips_grp").str.split("_"),
        )
        .drop("year_month")
        .explode("county_fips")
        .drop("county_fips_grp")
        .unique(["county_fips", "year"])
        .with_columns(
            refusal_prop=pl.int_range(0, 1000).sample(pl.len(), with_replacement=True)
            / 1000
        )
    )

    random.seed(8)
    random_nulls = random.sample(range(df.height), int(df.height * 0.25))
    df = (
        df.with_row_count()
        .with_columns(
            refusal_prop=pl.when(pl.col("row_nr").is_in(random_nulls))
            .then(pl.lit("null"))
            .otherwise(pl.col("refusal_prop"))
        )
        .drop("row_nr")
        .sort("year", "county_fips")
    )

    df.write_csv(sys.stdout)

    return 0


def raw_vacc_refusal() -> int:
    pop_wts = pl.read_csv(
        "./src/data/county_fips_grp_pop_wts.csv",
        columns=[
            "county_fips",
            # "county_name",
            # "pop_2020",
            "pop_wt",
        ],
        schema={
            "county_fips": pl.String,
            "county_fips_grp": pl.String,
            "county_name": pl.String,
            "pop_2020": pl.Int64,
            "pop_grp_tot": pl.Int64,
            "pop_wt": pl.Float64,
        },
    )

    df = (
        pl.read_csv(
            "./src/data/county_month_age_vacc_refusal_age_grp_1_imputed.csv",
            schema={
                "county_fips": pl.String,
                "year_month": pl.String,
                "age_grp": pl.String,
                "unspecified": pl.Int64,
                "medical": pl.Int64,
                "refusal": pl.Int64,
                "unavailable": pl.Int64,
            },
        )
        .rename({"county_fips": "county_fips_grp"})
        .with_columns(year=pl.col("year_month").str.slice(0, 4))
        # NOTE: ignore age groups for now
        .group_by(["county_fips_grp", "year"])
        .agg(
            pl.col(col).sum()
            for col in ["unspecified", "medical", "refusal", "unavailable"]
        )
        .with_columns(county_fips=pl.col("county_fips_grp").str.split("_"))
        .explode("county_fips")
        .drop("county_fips_grp")
        .join(pop_wts, on="county_fips", how="inner", validate="m:m")
        .with_columns(
            (pl.col(col) * pl.col("pop_wt")).ceil().cast(pl.Int64)
            for col in ["unspecified", "medical", "refusal", "unavailable"]
        )
        .drop("pop_wt")
        .with_columns(
            refusal_count=pl.sum_horizontal(
                "unspecified", "medical", "refusal", "unavailable"
            )
        )
        .select(
            "county_fips",
            "year",
            # "age_grp",
            # "unspecified",
            # "medical",
            # "refusal",
            # "unavailable",
            "refusal_count",
        )
        .sort("county_fips", "year")
    )

    df.write_csv(sys.stdout)

    return 0


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
