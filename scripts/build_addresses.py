"""Build the bundled California address sample from DataSF's public EAS data."""

import json
from pathlib import Path

import requests


SOURCE = "https://data.sfgov.org/resource/ramy-di5m.json"
OUT = Path(__file__).resolve().parents[1] / "data" / "addresses.js"
TARGET = 10_000


def main():
    addresses = []
    seen = set()
    offset = 0
    while len(addresses) < TARGET:
        response = requests.get(
            SOURCE,
            params={
                "$select": "address_number,address_number_suffix,street_full_street_name,zip_code",
                "$where": "address_number IS NOT NULL AND street_full_street_name IS NOT NULL AND zip_code IS NOT NULL",
                "$order": "eas_fullid",
                "$limit": 5000,
                "$offset": offset,
            },
            timeout=90,
        )
        response.raise_for_status()
        rows = response.json()
        if not rows:
            break
        for row in rows:
            number = str(row.get("address_number", "")).strip()
            suffix = str(row.get("address_number_suffix", "")).strip()
            street = str(row.get("street_full_street_name", "")).strip()
            zip_code = str(row.get("zip_code", "")).strip()
            if not number.isdigit() or not street or not zip_code.isdigit() or len(zip_code) != 5:
                continue
            address = f"{number}{suffix} {street}".title()
            key = (address.casefold(), zip_code)
            if key in seen:
                continue
            seen.add(key)
            addresses.append([address, "San Francisco", "CA", zip_code])
            if len(addresses) == TARGET:
                break
        offset += len(rows)
        print(f"scanned {offset:,}, collected {len(addresses):,}")
    if len(addresses) < TARGET:
        raise RuntimeError(f"Only found {len(addresses)} unique addresses")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("globalThis.CA_ADDRESSES = " + json.dumps(addresses, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")
    print(f"saved {len(addresses):,} addresses to {OUT} ({OUT.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
