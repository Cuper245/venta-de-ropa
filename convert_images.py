from PIL import Image
from pathlib import Path

INPUT_FOLDER = Path("images")
OUTPUT_FOLDER = Path("images_web")

MAX_WIDTH = 1200
QUALITY = 82

OUTPUT_FOLDER.mkdir(exist_ok=True)

extensions = {".jpg", ".jpeg", ".png", ".webp"}

for file in INPUT_FOLDER.iterdir():

    if file.suffix.lower() not in extensions:
        continue

    try:
        with Image.open(file) as img:

            # Corrige orientación de algunas fotos de celular
            from PIL import ImageOps
            img = ImageOps.exif_transpose(img)

            # WebP funciona mejor en RGB
            if img.mode not in ("RGB", "RGBA"):
                img = img.convert("RGB")

            width, height = img.size

            if width > MAX_WIDTH:
                new_height = int(
                    height * (MAX_WIDTH / width)
                )

                img = img.resize(
                    (MAX_WIDTH, new_height),
                    Image.Resampling.LANCZOS
                )

            output_file = (
                OUTPUT_FOLDER /
                f"{file.stem}.webp"
            )

            img.save(
                output_file,
                "WEBP",
                quality=QUALITY,
                method=6
            )

            original_mb = file.stat().st_size / 1024 / 1024
            new_mb = output_file.stat().st_size / 1024 / 1024

            print(
                f"{file.name}: "
                f"{original_mb:.2f} MB -> "
                f"{new_mb:.2f} MB"
            )

    except Exception as e:
        print(
            f"Error con {file.name}: {e}"
        )