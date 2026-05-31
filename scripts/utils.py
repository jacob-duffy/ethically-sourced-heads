import base64
import hashlib


def decode_base64(b64: str) -> bytes:
    pad = 4 - (len(b64) % 4)
    if pad != 4:
        b64 += '=' * pad
    return base64.b64decode(b64)


def hash_from_base64(b64: str) -> int:
    decoded = decode_base64(b64)
    digest = hashlib.sha256(decoded).digest()
    return int.from_bytes(digest, 'big')
