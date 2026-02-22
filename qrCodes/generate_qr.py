import qrcode
import os

# === CONFIG ===
OUTPUT_FOLDER = "qr_output"

# Sticker codes (static)
STICKER_CODES = [
    "ARCO-STICKER-1.1",
    "ARCO-STICKER-1.2",
    "ARCO-STICKER-1.3",
    "ARCO-STICKER-1.4",
    "ARCO-STICKER-1.5",
    "ARCO-STICKER-2.1",
    "ARCO-STICKER-2.2",
    "ARCO-STICKER-2.3",
    "ARCO-STICKER-3.1",
    "ARCO-STICKER-3.2",
    "ARCO-STICKER-3.3",
    "ARCO-STICKER-3.4",
    "ARCO-STICKER-3.5"
]

def generate_qr(data):
    qr = qrcode.QRCode(
        version=None,  # auto size
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    return img

def main():
    # Create folder if it doesn't exist
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    for code in STICKER_CODES:
        img = generate_qr(code)
        filepath = os.path.join(OUTPUT_FOLDER, f"{code}.png")
        img.save(filepath)
        print(f"Generated: {filepath}")

    print("\nDone!")

if __name__ == "__main__":
    main()
