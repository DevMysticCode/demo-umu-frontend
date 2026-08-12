"""
Generate 3D-style icons matching the umu app's existing icon set
(public/op-icons/) using OpenAI's image generation API.

Setup:
    pip install openai
    setx OPENAI_API_KEY "sk-..."          (or set for current shell only:
                                            $env:OPENAI_API_KEY = "sk-...")

Run (from the project root):
    python scripts/generate-icons.py

Each entry in ICONS below is generated and saved straight into
public/op-icons/ at the path the component already references, so no
code changes are needed afterwards — just reload the dev server.
"""

import base64
from pathlib import Path

from openai import OpenAI

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = PROJECT_ROOT / "public" / "op-icons"

# Shared style description, distilled from the existing icon set
# (wallet.png, key.png, shield.png, clock.png, priceTagPound2.png,
# idCard.png, propertyPassportCard.png): a single 3D-rendered object,
# glossy/matte plastic material, soft isometric-ish perspective, gentle
# drop shadow, friendly rounded "toy" proportions, teal (#00A19A /
# #4DD4CE) as the primary accent color with white/cream and occasional
# navy (#231D45) or gold details, centered on a plain white background,
# no text, no other objects in frame.
STYLE = (
    "3D rendered icon in a soft glossy plastic / matte toy material, "
    "isometric-ish perspective tilted slightly to the right, gentle "
    "soft drop shadow beneath the object, rounded friendly proportions, "
    "primary color teal (#00A19A) with white and cream accents, "
    "occasional deep navy (#231D45) or gold details, centered composition, "
    "plain solid white background, no text, no additional objects, "
    "single clean subject, high quality product-render style, "
    "square image, ample padding around the subject"
)

# Only icons confirmed genuinely missing from public/op-icons/ (searched
# and not found) belong here. Add more entries as new gaps come up.
ICONS = [
    {
        # Used in the "Every car has a logbook" callout on the claim
        # explainer drawer (components/property/PassportClaimBox.vue).
        "path": "misc/car.png",
        "prompt": (
            f"A small simple family car (side-view three-quarter angle, "
            f"hatchback or sedan silhouette, clearly a car), {STYLE}"
        ),
    },
]


def main() -> None:
    client = OpenAI()
    for icon in ICONS:
        out_path = OUT_DIR / icon["path"]
        out_path.parent.mkdir(parents=True, exist_ok=True)
        print(f"Generating {icon['path']} ...")
        result = client.images.generate(
            model="gpt-image-1",
            prompt=icon["prompt"],
            size="1024x1024",
            background="opaque",
            n=1,
        )
        image_bytes = base64.b64decode(result.data[0].b64_json)
        out_path.write_bytes(image_bytes)
        print(f"  saved -> {out_path}")

    print("\nDone. Reload the dev server / hard-refresh to see the new icon(s).")


if __name__ == "__main__":
    main()
