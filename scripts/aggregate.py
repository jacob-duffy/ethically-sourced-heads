from __future__ import annotations

import base64
import datetime
import json
import logging
import subprocess
import urllib.error
import urllib.request

from dataclasses import dataclass, field
from pathlib import Path


# -----------------------------------------------------------------------------


log = logging.getLogger(__file__)
log.setLevel(logging.INFO)

handler = logging.StreamHandler()
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s [%(levelname)s] %(message)s')
handler.setFormatter(formatter)
log.addHandler(handler)


# -----------------------------------------------------------------------------


@dataclass
class PlayerHeadData:
    name: str
    rarity: str
    texture_b64: str
    texture_url: str
    in_stock: bool = True
    price: dict = field(default_factory=dict)
    tags: list[str] = field(default_factory=list)

    @staticmethod
    def parse_texture_url(texture_b64) -> str:
        pad = 4 - (len(texture_b64) % 4)
        if pad != 4:
            texture_b64 += '=' * pad
        texture_data = json.loads(base64.b64decode(texture_b64).decode("utf-8"))
        return texture_data["textures"]["SKIN"]["url"]

    @classmethod
    def from_raw_input(cls, nbt: dict) -> PlayerHeadData | None:
        try:
            if "texture_url" not in nbt:
                nbt["texture_url"] = cls.parse_texture_url(nbt["texture_b64"])
            return PlayerHeadData(**nbt)
        except Exception as e:
            log.exception(f"Failed to generate player head from {nbt}: {e}")
            return None


class PlayerHeadEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, PlayerHeadData):
            return obj.__dict__
        return super().default(obj)


DataCache = dict[str, PlayerHeadData]


# -----------------------------------------------------------------------------


def ensure_directory_structure() -> dict[str]:
    """
    Creates the directory structure needed to properly handle data aggregation.
    """
    struct = {
        "untracked":    Path(__file__).parent / "input" / "untracked",
        "tracked":      Path(__file__).parent / "input" / "tracked",
        "frontend":     Path(__file__).parent.parent / "frontend" / "public",
        "texture":      Path(__file__).parent.parent / "frontend" / "public" / "textures"
    }
    for directory in struct.values():
        directory.mkdir(parents=True, exist_ok=True)
        log.info(f"{directory} is ready for use.")
    return struct


def load_untracked_data(input_dir: Path, output_dir: Path) -> DataCache:
    """
    Loads JSON files from the input dir and attempts to load them into
    PlayerHeadData objects. Successfully loaded items get sent to the output dir
    and the failed items stay in the original file in the input dir.
    """
    data = {}
    filepaths = list(input_dir.glob("*.json"))

    if not filepaths:
        log.info(f"No files to load in {input_dir}")
        return {}

    for path in filepaths:
        results = {True: [], False: []}
        player_heads = {}

        # Load raw nbt data into player heads
        with open(path, encoding="utf-8") as file:
            json_data = json.load(file)
        for d in json_data:
            if ph := PlayerHeadData.from_raw_input(d):
                player_heads[ph.texture_b64] = ph
            results[ph is not None].append(d)

        # Write successful entries to output directory
        if results[True]:
            with open(output_dir / path.name, "w", encoding="utf-8") as file:
                json.dump(results[True], file, indent=2)
            log.info(f"Moved {path.name} to tracked directory.")

        # Write failed entries back to input directory
        if results[False]:
            with open(path, "w", encoding="utf-8") as file:
                json.dump(results[False], file, indent=2)
        else:
            # Delete the file if all entries were successful
            path.unlink()

        data.update(player_heads)

    log.info(f"{len(data)} unique heads loaded from {len(filepaths)} untracked files.")

    return data


def load_frontend_data(frontend_dir: Path) -> DataCache:
    """
    Loads the data used by the frontend into PlayerHeadData objects. If the frontend
    file does not exist it is created as an empty JSON compatible file.
    """
    data_filepath = frontend_dir / "heads.json"

    if not data_filepath.exists():
        raw_data = {}
        with open(data_filepath, "w", encoding="utf-8") as file:
            json.dump(raw_data, file)
        log.info(f"Frontend data created at {data_filepath}")
    else:
        with open(data_filepath, "r", encoding="utf-8") as file:
            raw_data = json.load(file)
        log.info(f"Frontend data loaded at {data_filepath}")

    data = {}
    for h in raw_data.get("heads", []):
        if ph := PlayerHeadData.from_raw_input(h):
            data[ph.texture_b64] = ph

    log.info(f"{len(data)} unique heads loaded from remote data.")

    return data


def update_frontend_data(local: DataCache, remote: DataCache, frontend_dir: Path) -> None:
    """
    Updates the remote data with local data. The iterates over remote data to
    update stock flag if texture_b64 is within local data.
    """

    if len(local) == 0:
        log.info("No update needed on frontend data.")
        return

    log.info(f"{abs(len(local) - len(remote))} unique player heads to be added.")
    log.info(f"{len(remote)} unique player heads to be updated.")

    remote.update(local)
    for k in remote:
        if k not in local:
            remote[k].in_stock = False

    output = {
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "heads": list(remote.values())
    }

    data_filepath = frontend_dir / "heads.json"
    with open(data_filepath, "w", encoding="utf-8") as file:
        json.dump(output, file, cls=PlayerHeadEncoder, indent=2)

    log.info(f"Frontend data updated at {data_filepath}")


def get_missing_textures(data: DataCache, texture_dir: Path) -> None:
    """
    Downloads missing texture files from textures.minecraft.net. Compares the texture_b64
    hash against existing texture files in texture_dir, downloading any that are missing.
    Logs the count of newly downloaded textures and any errors encountered.
    """
    texture_map = {p.stem: p for p in texture_dir.glob("*.png")}
    count = 0

    for k, v in data.items():
        try:
            if k not in texture_map:
                urllib.request.urlretrieve(v.texture_url, texture_dir / f"{k}.png")
                count += 1
        except urllib.error.HTTPError as e:
            log.error(f"HTTP error downloading texture {k}: {e.code} {e.reason}")
        except urllib.error.URLError as e:
            log.error(f"URL error downloading texture {k}: {e.reason}")
        except Exception as e:
            log.exception(f"Failed to retrieve texture {k}: {e}")

    if count:
        log.info(f"Updated {count} missing textures.")
    else:
        log.info("No textures were updated.")


def commit_changes() -> None:
    try:
        r = Path(__file__).parent.parent
        subprocess.run(["git", "add", "."], cwd=r, check=True)
        subprocess.run(["git", "commit", "-m", "auto: stock update"], cwd=r, check=True)
        subprocess.run(["git", "push"], cwd=r, check=True)
        log.info("Successfully committed and pushed to GitHub")
    except subprocess.CalledProcessError as e:
        log.error(f"Git operation failed: {e}")
    except FileNotFoundError:
        log.error("Git not found in PATH")


def main() -> None:
    directories = ensure_directory_structure()
    local_data = load_untracked_data(directories["untracked"], directories["tracked"])
    remote_data = load_frontend_data(directories["frontend"])
    update_frontend_data(local_data, remote_data, directories["frontend"])
    get_missing_textures(remote_data, directories["texture"])
    # commit_changes()

# -----------------------------------------------------------------------------


if __name__ == "__main__":
    main()
