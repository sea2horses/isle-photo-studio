#!/usr/bin/env python3

import argparse
import base64
import re
import unicodedata
from pathlib import Path

from bs4 import BeautifulSoup


MIME_EXTENSIONS = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "image/bmp": ".bmp",
    "image/x-icon": ".ico",
    "image/vnd.microsoft.icon": ".ico",
    "image/avif": ".avif",
}


def slugify(value: str) -> str:
    """
    Convert text into a filesystem-friendly slug.

    Example:
        "My Cool Image!" -> "my-cool-image"
    """
    value = unicodedata.normalize("NFKD", value)
    value = value.encode("ascii", "ignore").decode("ascii")
    value = value.lower().strip()

    value = re.sub(r"[^\w\s-]", "", value)
    value = re.sub(r"[\s_-]+", "-", value)
    value = value.strip("-")

    return value or "image"


def unique_path(directory: Path, stem: str, extension: str) -> Path:
    """
    Return a non-conflicting file path.

    image.png
    image-2.png
    image-3.png
    ...
    """
    path = directory / f"{stem}{extension}"

    if not path.exists():
        return path

    counter = 2

    while True:
        path = directory / f"{stem}-{counter}{extension}"

        if not path.exists():
            return path

        counter += 1


def extract_base64_images(html_path: Path) -> None:
    if not html_path.exists():
        raise FileNotFoundError(f"HTML file does not exist: {html_path}")

    if not html_path.is_file():
        raise ValueError(f"Path is not a file: {html_path}")

    html = html_path.read_text(encoding="utf-8")
    soup = BeautifulSoup(html, "html.parser")

    assets_dir = html_path.parent / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)

    # data:image/png;base64,...
    data_uri_pattern = re.compile(
        r"^data:(image/[^;,]+);base64,(.+)$",
        re.IGNORECASE | re.DOTALL,
    )

    extracted = 0

    for index, img in enumerate(soup.find_all("img"), start=1):
        src = img.get("src")

        if not src:
            continue

        match = data_uri_pattern.match(src)

        if not match:
            continue

        mime_type = match.group(1).lower()
        encoded_data = match.group(2)

        extension = MIME_EXTENSIONS.get(mime_type)

        if extension is None:
            print(f"Skipping unsupported image type: {mime_type}")
            continue

        alt = img.get("alt", "").strip()
        stem = slugify(alt) if alt else f"image-{index}"

        output_path = unique_path(
            directory=assets_dir,
            stem=stem,
            extension=extension,
        )

        try:
            image_data = base64.b64decode(encoded_data, validate=True)
        except ValueError as exc:
            print(f"Failed to decode image #{index}: {exc}")
            continue

        output_path.write_bytes(image_data)

        # Use POSIX separators because this is an HTML URL,
        # even when running on Windows.
        img["src"] = f"assets/{output_path.name}"

        extracted += 1

        print(
            f"Extracted: {output_path.name} "
            f"({mime_type}, {len(image_data)} bytes)"
        )

    html_path.write_text(str(soup), encoding="utf-8")

    print()
    print(f"Extracted {extracted} image(s).")
    print(f"Assets directory: {assets_dir}")
    print(f"Updated HTML: {html_path}")


def main() -> None:
    parser = argparse.ArgumentParser(
        description=(
            "Extract Base64-encoded images from an HTML file "
            "into an assets directory."
        )
    )

    parser.add_argument(
        "html",
        type=Path,
        help="Path to the HTML document",
    )

    args = parser.parse_args()

    extract_base64_images(args.html)


if __name__ == "__main__":
    main()
