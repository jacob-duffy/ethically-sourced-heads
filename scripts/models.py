from __future__ import annotations

import json

from dataclasses import dataclass, field, asdict

from scripts.log import get_logger
from scripts.utils import hash_from_base64, decode_base64


log = get_logger(__file__)


def parse_texture_url(texture_b64: str) -> str:
    utf8 = decode_base64(texture_b64).decode('utf-8')
    texture_data = json.loads(utf8)
    return texture_data["textures"]["SKIN"]["url"]


@dataclass
class PlayerHeadData:
    name: str
    rarity: str
    texture_b64: str
    texture_url: str
    stock_level: int = 0
    price: dict = field(default_factory=dict)
    tags: list[str] = field(default_factory=list)

    def __hash__(self) -> int:
        return hash_from_base64(self.texture_b64)

    def to_dict(self) -> dict:
        return asdict(self)

    @classmethod
    def from_raw_input(cls, nbt: dict) -> PlayerHeadData | None:
        try:
            if "texture_b64" not in nbt:
                raise ValueError(f"Missing texture_b64 in {nbt}")
            if "texture_url" not in nbt:
                nbt["texture_url"] = parse_texture_url(nbt["texture_b64"])
            return PlayerHeadData(**nbt)
        except Exception as e:
            log.exception(f"Failed to generate player head from {nbt}: {e}")
            return None