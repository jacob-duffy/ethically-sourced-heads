from __future__ import annotations

import datetime
import json
import subprocess
import urllib.error
import urllib.request

from collections import Counter
from pathlib import Path

from scripts.config import Config
from scripts.log import get_logger
from scripts.models import PlayerHeadData


log = get_logger(__file__)


DataCache = dict[str, PlayerHeadData]

# -----------------------------------------------------------------------------


cfg = Config()


def load_untracked_data() -> DataCache:
    """
    Loads JSON files from the input dir and attempts to load them into
    PlayerHeadData objects. Successfully loaded items get sent to the output dir
    and the failed items stay in the original file in the input dir.
    """
    dataset = []
    dataset_unique = {}
    filepaths = list(cfg.unprocessed_dir.glob("*.json"))

    if not filepaths:
        log.info(f"No files to load in {cfg.unprocessed_dir}")
        return {}

    for path in filepaths:
        results = {True: [], False: []}

        # Load raw nbt data into player heads
        with open(path, encoding="utf-8") as file:
            json_data = json.load(file)
        for d in json_data:
            if ph := PlayerHeadData.from_raw_input(d):
                dataset.append(ph)
                dataset_unique[ph.texture_b64] = ph
            results[ph is not None].append(d)

        # Write successful entries to output directory
        if results[True]:
            with open(cfg.processed_dir / path.name, "w", encoding="utf-8") as file:
                json.dump(results[True], file, indent=2)
            log.info(f"Moved {path.name} to tracked directory.")

        # Write failed entries back to input directory
        if results[False]:
            with open(path, "w", encoding="utf-8") as file:
                json.dump(results[False], file, indent=2)
        else:
            # Delete the file if all entries were successful
            path.unlink()

    # track stocks
    stock_counter = Counter(dataset)
    for k, v in stock_counter.items():
        dataset_unique[k.texture_b64].stock_level = v

    log.info(f"{len(dataset)} heads loaded from {len(filepaths)} untracked files.")

    return dataset_unique


def load_frontend_data() -> DataCache:
    """
    Loads the data used by the frontend into PlayerHeadData objects. If the frontend
    file does not exist it is created as an empty JSON compatible file.
    """

    if not cfg.transformed_data_file.exists():
        raw_data = {
            "generated_at": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
            "heads": []
        }
        with open(cfg.transformed_data_file, "w", encoding="utf-8") as file:
            json.dump(raw_data, file, indent=2)
        log.info(f"Frontend data created at {cfg.transformed_data_file}")
    else:
        with open(cfg.transformed_data_file, "r", encoding="utf-8") as file:
            raw_data = json.load(file)
        log.info(f"Frontend data loaded at {cfg.transformed_data_file}")

    data = {}
    for h in raw_data.get("heads", []):
        if ph := PlayerHeadData.from_raw_input(h):
            data[ph.texture_b64] = ph

    log.info(f"{len(data)} unique heads loaded from remote data.")

    return data


def update_frontend_data(local: DataCache, remote: DataCache) -> None:
    """
    Updates the remote data with local data. The iterates over remote data to
    update stock flag if texture_b64 is within local data.
    """

    if len(local) == 0:
        log.info("No update needed on frontend data.")
        return

    new_textures = set(local) - set(remote)
    updated_textures = set(local) & set(remote)
    log.info(f"{len(new_textures)} unique player heads to be added.")
    log.info(f"{len(updated_textures)} unique player heads to be updated.")

    remote.update(local)
    for k in remote:
        if k not in local:
            remote[k].stock_level = 0

    output = {
        "generated_at": datetime.datetime.now().strftime("%Y-%m-%dT%H:%M:%S"),
        "heads": [v.to_dict() for v in remote.values()]
    }

    with open(cfg.transformed_data_file, "w", encoding="utf-8") as file:
        json.dump(output, file, indent=2)

    log.info(f"Frontend data updated at {cfg.transformed_data_file}")


def get_missing_textures(data: DataCache) -> None:
    """
    Downloads missing texture files from textures.minecraft.net. Compares the texture_b64
    hash against existing texture files in texture_dir, downloading any that are missing.
    Logs the count of newly downloaded textures and any errors encountered.
    """
    texture_map = {p.stem: p for p in cfg.texture_dir.glob("*.png")}
    count = 0

    for k, v in data.items():
        try:
            if k not in texture_map:
                urllib.request.urlretrieve(v.texture_url, cfg.texture_dir / f"{k}.png")
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
    local_data = load_untracked_data()
    remote_data = load_frontend_data()
    update_frontend_data(local_data, remote_data)
    get_missing_textures(remote_data)
    # commit_changes()

# -----------------------------------------------------------------------------


if __name__ == "__main__":
    main()
