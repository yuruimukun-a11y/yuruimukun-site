from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_IMAGE = Path(r"C:\Users\pcganbarutarou\Downloads\4-iZErmx_400x400 (2).jpg")
IMAGES_DIR = ROOT / "images"
FAVICON_FILES = [
    ROOT / "index.html",
    ROOT / "404.html",
    ROOT / "about.html",
    ROOT / "contact.html",
    ROOT / "privacy.html",
    ROOT / "terms.html",
    ROOT / "sleep-bgm.html",
    ROOT / "work-bgm.html",
    ROOT / "japanese-healing.html",
    ROOT / "blog" / "index.html",
    ROOT / "public" / "tracks" / "index.html",
]
FAVICON_FILES.extend(sorted((ROOT / "public" / "tracks").glob("*.html")))
FAVICON_FILES.extend(sorted((ROOT / "blog").glob("*.html")))

FAVICON_BLOCK = """  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png">"""


def load_source() -> Image.Image:
    image = Image.open(SOURCE_IMAGE).convert("RGB")
    crop = image.crop((24, 18, 344, 360))
    crop = crop.resize((1024, 1024), Image.Resampling.LANCZOS)
    crop = ImageEnhance.Contrast(crop).enhance(1.08)
    crop = ImageEnhance.Color(crop).enhance(1.05)
    crop = crop.filter(ImageFilter.UnsharpMask(radius=2, percent=110, threshold=3))
    return crop


def save_favicons(source: Image.Image) -> None:
    sizes = {
        "favicon-16x16.png": 16,
        "favicon-32x32.png": 32,
        "apple-touch-icon.png": 180,
    }

    for name, size in sizes.items():
        source.resize((size, size), Image.Resampling.LANCZOS).save(
            IMAGES_DIR / name,
            format="PNG",
            optimize=True,
        )

    source.save(ROOT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])


def save_ogp(source: Image.Image) -> None:
    canvas = Image.new("RGB", (1200, 630), "#eef4e9")

    background = source.resize((1200, 1200), Image.Resampling.LANCZOS)
    background = background.crop((0, 260, 1200, 890))
    background = background.filter(ImageFilter.GaussianBlur(radius=12))
    background = ImageEnhance.Brightness(background).enhance(1.08)
    background = ImageEnhance.Color(background).enhance(0.88)
    canvas.paste(background, (0, 0))

    card = source.resize((420, 420), Image.Resampling.LANCZOS)
    shadow = Image.new("RGBA", (520, 520), (0, 0, 0, 0))
    shadow_layer = Image.new("RGBA", (420, 420), (0, 0, 0, 54))
    shadow.alpha_composite(shadow_layer, (56, 56))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=24))
    canvas_rgba = canvas.convert("RGBA")
    canvas_rgba.alpha_composite(shadow, (390, 70))
    canvas_rgba.alpha_composite(card.convert("RGBA"), (440, 120))
    canvas_rgba.convert("RGB").save(IMAGES_DIR / "ogp.png", format="PNG", optimize=True)


def patch_html(path: Path) -> None:
    content = path.read_text(encoding="utf-8")

    if "<!-- Favicon -->" in content:
        start = content.index("<!-- Favicon -->")
        marker_positions = []
        for marker in [
            '<link rel="preconnect"',
            '<link rel="stylesheet"',
            "<style>",
            "</head>",
        ]:
            pos = content.find(marker, start)
            if pos != -1:
                marker_positions.append(pos)
        end = min(marker_positions) if marker_positions else start
        content = content[:start] + FAVICON_BLOCK + "\n\n" + content[end:]
    elif "</head>" in content:
        for marker in [
            '  <link rel="preconnect"',
            '  <link rel="stylesheet"',
            "<style>",
            "</head>",
        ]:
            if marker in content:
                content = content.replace(marker, FAVICON_BLOCK + "\n\n" + marker, 1)
                break

    path.write_text(content, encoding="utf-8")


def main() -> None:
    source = load_source()
    save_favicons(source)
    save_ogp(source)

    unique_files = []
    seen = set()
    for path in FAVICON_FILES:
        resolved = path.resolve()
        if resolved in seen or not path.exists():
            continue
        seen.add(resolved)
        unique_files.append(path)

    for path in unique_files:
        patch_html(path)


if __name__ == "__main__":
    main()
