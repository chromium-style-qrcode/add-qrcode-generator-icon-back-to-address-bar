#!/usr/bin/env python3
"""Generate promotional images for Chrome Web Store listing."""

from PIL import Image, ImageDraw, ImageFont
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)
ICON_PATH = os.path.join(PROJECT_DIR, "public", "icon", "128.png")
OUTPUT_DIR = os.path.join(PROJECT_DIR, "promo")

# Colors matching Chrome/extension branding
BG_COLOR = (26, 115, 232)        # Chrome blue #1a73e8
ACCENT_COLOR = (255, 255, 255)   # White
TEXT_COLOR = (255, 255, 255)      # White
SUBTITLE_COLOR = (200, 225, 255) # Light blue-white
DARK_BG = (32, 33, 36)           # Chrome dark #202124
BADGE_BG = (52, 168, 83)         # Google green


def draw_rounded_rect(draw, xy, radius, fill):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = xy
    draw.rectangle([x0 + radius, y0, x1 - radius, y1], fill=fill)
    draw.rectangle([x0, y0 + radius, x1, y1 - radius], fill=fill)
    draw.pieslice([x0, y0, x0 + 2 * radius, y0 + 2 * radius], 180, 270, fill=fill)
    draw.pieslice([x1 - 2 * radius, y0, x1, y0 + 2 * radius], 270, 360, fill=fill)
    draw.pieslice([x0, y1 - 2 * radius, x0 + 2 * radius, y1], 90, 180, fill=fill)
    draw.pieslice([x1 - 2 * radius, y1 - 2 * radius, x1, y1], 0, 90, fill=fill)


def draw_qr_pattern(draw, x, y, size, module_size=None):
    """Draw a stylized QR code pattern (decorative)."""
    if module_size is None:
        module_size = size // 12
    cols = size // module_size
    rows = size // module_size

    import random
    random.seed(42)  # Deterministic pattern

    for r in range(rows):
        for c in range(cols):
            # QR locator patterns (top-left, top-right, bottom-left corners)
            is_locator = False
            if (r < 3 and c < 3) or (r < 3 and c >= cols - 3) or (r >= rows - 3 and c < 3):
                is_locator = True

            if is_locator:
                # Draw locator pattern borders
                border_r = r % 3
                border_c = c % 3
                if border_r == 0 or border_r == 2 or border_c == 0 or border_c == 2 or (border_r == 1 and border_c == 1):
                    cx = x + c * module_size + module_size // 2
                    cy = y + r * module_size + module_size // 2
                    radius = module_size // 2
                    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius],
                                 fill=ACCENT_COLOR)
            elif random.random() > 0.45:
                cx = x + c * module_size + module_size // 2
                cy = y + r * module_size + module_size // 2
                radius = module_size // 2 - 1
                draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius],
                             fill=ACCENT_COLOR)


def try_get_font(size):
    """Try to get a suitable font, fall back to default."""
    font_paths = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/System/Library/Fonts/SFNS.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def try_get_bold_font(size):
    """Try to get a bold font."""
    font_paths = [
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNS.ttf",
    ]
    for path in font_paths:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return try_get_font(size)


def generate_small_promo(icon):
    """Generate 440x280 small promotional tile."""
    img = Image.new("RGB", (440, 280), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Gradient-like effect: darker at bottom
    for y in range(200, 280):
        alpha = (y - 200) / 80
        r = int(BG_COLOR[0] * (1 - alpha * 0.3))
        g = int(BG_COLOR[1] * (1 - alpha * 0.3))
        b = int(BG_COLOR[2] * (1 - alpha * 0.3))
        draw.line([(0, y), (440, y)], fill=(r, g, b))

    # Decorative QR pattern on the right (subtle)
    draw_qr_pattern(draw, 290, 20, 130, module_size=11)

    # Icon (centered left area)
    icon_size = 80
    icon_resized = icon.resize((icon_size, icon_size), Image.LANCZOS)
    icon_x = 40
    icon_y = 50
    # White circle background for icon
    draw.ellipse([icon_x - 8, icon_y - 8, icon_x + icon_size + 8, icon_y + icon_size + 8],
                 fill=ACCENT_COLOR)
    img.paste(icon_resized, (icon_x, icon_y), icon_resized if icon_resized.mode == 'RGBA' else None)

    # Title text
    title_font = try_get_bold_font(22)
    subtitle_font = try_get_font(14)

    draw.text((40, 150), "QR Code Generator", fill=TEXT_COLOR, font=title_font)
    draw.text((40, 180), "for Address Bar", fill=TEXT_COLOR, font=title_font)

    # Subtitle
    draw.text((40, 215), "Chromium-style QR codes with", fill=SUBTITLE_COLOR, font=subtitle_font)
    draw.text((40, 235), "Chrome dinosaur center icon", fill=SUBTITLE_COLOR, font=subtitle_font)

    return img


def generate_large_promo(icon):
    """Generate 1400x560 marquee promotional tile."""
    img = Image.new("RGB", (1400, 560), BG_COLOR)
    draw = ImageDraw.Draw(img)

    # Gradient effect
    for y in range(400, 560):
        alpha = (y - 400) / 160
        r = int(BG_COLOR[0] * (1 - alpha * 0.3))
        g = int(BG_COLOR[1] * (1 - alpha * 0.3))
        b = int(BG_COLOR[2] * (1 - alpha * 0.3))
        draw.line([(0, y), (1400, y)], fill=(r, g, b))

    # Large decorative QR pattern on the right
    draw_qr_pattern(draw, 850, 60, 480, module_size=22)

    # Icon
    icon_size = 140
    icon_resized = icon.resize((icon_size, icon_size), Image.LANCZOS)
    icon_x = 100
    icon_y = 80
    # White circle bg
    draw.ellipse([icon_x - 12, icon_y - 12, icon_x + icon_size + 12, icon_y + icon_size + 12],
                 fill=ACCENT_COLOR)
    img.paste(icon_resized, (icon_x, icon_y), icon_resized if icon_resized.mode == 'RGBA' else None)

    # Title
    title_font = try_get_bold_font(48)
    subtitle_font = try_get_font(26)
    feature_font = try_get_font(20)

    draw.text((100, 260), "QR Code Generator", fill=TEXT_COLOR, font=title_font)
    draw.text((100, 320), "for Address Bar", fill=TEXT_COLOR, font=title_font)

    # Subtitle
    draw.text((100, 395), "Restore Chromium-style QR codes with the iconic", fill=SUBTITLE_COLOR, font=subtitle_font)
    draw.text((100, 430), "Chrome dinosaur to your browser's address bar", fill=SUBTITLE_COLOR, font=subtitle_font)

    # Feature badges
    features = ["7 Languages", "Dark Mode", "WASM Powered", "Keyboard Shortcut"]
    badge_x = 100
    badge_y = 490
    for feat in features:
        bbox = draw.textbbox((0, 0), feat, font=feature_font)
        tw = bbox[2] - bbox[0]
        draw_rounded_rect(draw, (badge_x, badge_y, badge_x + tw + 24, badge_y + 32), 16, BADGE_BG)
        draw.text((badge_x + 12, badge_y + 6), feat, fill=TEXT_COLOR, font=feature_font)
        badge_x += tw + 40

    return img


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Load icon
    icon = Image.open(ICON_PATH).convert("RGBA")

    # Generate small promo (440x280)
    small = generate_small_promo(icon)
    small_path = os.path.join(OUTPUT_DIR, "promo_small_440x280.png")
    small.save(small_path, "PNG")
    print(f"Generated: {small_path}")

    # Generate large promo (1400x560)
    large = generate_large_promo(icon)
    large_path = os.path.join(OUTPUT_DIR, "promo_large_1400x560.png")
    large.save(large_path, "PNG")
    print(f"Generated: {large_path}")

    print("Done! Both promotional images have been generated.")


if __name__ == "__main__":
    main()
