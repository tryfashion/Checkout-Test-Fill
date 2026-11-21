"""Bundle common names from SSA's 1990s list and the 2010 US Census surnames."""

import io
import json
from pathlib import Path

import pandas as pd
import requests


# First 50 boy/girl names transcribed from SSA's published 1990s top names table.
# https://www.ssa.gov/oact/babynames/decades/names1990s.html
BOYS = "Michael Christopher Matthew Joshua Jacob Nicholas Andrew Daniel Tyler Joseph Brandon David James Ryan John Zachary Justin William Anthony Robert Jonathan Austin Alexander Kyle Kevin Thomas Cody Jordan Eric Benjamin Aaron Christian Samuel Dylan Steven Brian Jose Timothy Nathan Adam Richard Patrick Charles Sean Jason Cameron Jeremy Mark Stephen Jesse".split()
GIRLS = "Jessica Ashley Emily Sarah Samantha Amanda Brittany Elizabeth Taylor Megan Hannah Kayla Lauren Stephanie Rachel Jennifer Nicole Alexis Victoria Amber Alyssa Courtney Rebecca Danielle Jasmine Brianna Katherine Alexandra Madison Morgan Melissa Michelle Kelsey Chelsea Anna Kimberly Tiffany Olivia Mary Christina Allison Abigail Sara Shelby Heather Haley Maria Kaitlyn Laura Erin".split()
SOURCE = "https://www2.census.gov/topics/genealogy/2010surnames/Names_2010Census_Top1000.xlsx"
OUT = Path(__file__).resolve().parents[1] / "data" / "names.js"
EXCLUDED_SURNAMES = {"Price"}  # Genuine surname, but confusing in a checkout test form.


def main():
    response = requests.get(SOURCE, timeout=30)
    response.raise_for_status()
    table = pd.read_excel(io.BytesIO(response.content), header=None)
    surnames = []
    for name, rank in table.iloc[:, :2].itertuples(index=False, name=None):
        if isinstance(rank, (int, float)) and 1 <= rank <= 100 and isinstance(name, str) and name.title() not in EXCLUDED_SURNAMES:
            surnames.append(name.title())
    if len(surnames) != 99:
        raise RuntimeError(f"Expected 99 surnames after exclusion; found {len(surnames)}")
    first = BOYS + GIRLS
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("globalThis.TEST_NAMES = " + json.dumps({"first": first, "last": surnames}, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"saved {len(first)} first names, {len(surnames)} surnames to {OUT}")


if __name__ == "__main__":
    main()
