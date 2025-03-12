import base64

def encrypt_string(s: str) -> str:
    return base64.b64encode(s.encode('utf-8')).decode('utf-8')

def decrypt_string(enc: str) -> str:
    return base64.b64decode(enc.encode('utf-8')).decode('utf-8')

if __name__ == "__main__":
    original = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjZmNlcW1qanZ6dndoZHR0dWlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NDQ1OTUsImV4cCI6MjA1NTEyMDU5NX0.2WnN1GVQTO1yPP3Dgkx5sI2xIEmmy6cKe2tbD2v2gzk"
    encrypted = encrypt_string(original)
    decrypted = decrypt_string(encrypted)

    print("Оригинал:", original)
    print("Зашифровано:", encrypted)
    print("Расшифровано:", decrypted)