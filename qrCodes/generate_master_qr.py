import qrcode
import requests
import os

API_URL = "http://localhost:8080/api/qr_generate.php?count=10&admin_token=arco_admin"

OUTPUT_FOLDER = "master_qr_output"

def generate_qr(data):
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_Q,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)
    return qr.make_image(fill_color="black", back_color="white")

def fetch_master_keys():
    response = requests.get(API_URL)

    if response.status_code != 200:
        raise Exception(f"API error: {response.status_code}\n{response.text}")

    lines = response.text.splitlines()

    # Only keep actual keys
    keys = [line.strip() for line in lines if line.startswith("ARCO-KEY-")]

    return keys

def main():
    os.makedirs(OUTPUT_FOLDER, exist_ok=True)

    print("Fetching master keys...")
    keys = fetch_master_keys()

    print(f"Found {len(keys)} keys.\n")

    for key in keys:
        img = generate_qr(key)
        filepath = os.path.join(OUTPUT_FOLDER, f"{key}.png")
        img.save(filepath)
        print(f"Generated: {filepath}")

    print("\nDone!")

if __name__ == "__main__":
    main()
