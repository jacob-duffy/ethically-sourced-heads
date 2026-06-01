from .config import Config


# ensure that all required directories exist before any file processing is done
_cfg = Config()
_req = [
    _cfg.py_module_dir,
    _cfg.data_dir,
    _cfg.input_data_dir,
    _cfg.unprocessed_dir,
    _cfg.processed_dir,
    _cfg.js_package_dir,
    _cfg.output_data_dir,
    _cfg.texture_dir,
]
for _path in _req:
    if not _path.exists():
        _path.mkdir(parents=True, exist_ok=True)
