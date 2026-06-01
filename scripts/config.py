from __future__ import annotations

from pathlib import Path


class Config:
    """
    Singleton class to store configuration for the project.
    """

    _instance: Config

    # directories required for file processing
    # backend
    py_module_dir: Path             = Path(__file__).parent
    data_dir: Path                  = py_module_dir / "data"
    input_data_dir: Path            = py_module_dir / "input"
    unprocessed_dir: Path           = input_data_dir / "unprocessed"
    processed_dir: Path             = input_data_dir / "processed"

    # frontend
    js_package_dir: Path            = Path(__file__).parent.parent / "frontend"
    output_data_dir: Path           = js_package_dir / "public"
    texture_dir: Path               = output_data_dir / "textures"

    # files required for file processing
    # backend
    tags_file: Path                 = data_dir / "tags.json"

    # frontend
    transformed_data_file: Path     = output_data_dir / "heads.json"

    def __new__(cls):
        if not hasattr(cls, "_instance"):
            cls._instance = super(Config, cls).__new__(cls)
        return cls._instance
