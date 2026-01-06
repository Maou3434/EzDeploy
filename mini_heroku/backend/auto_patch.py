from core.detector import detect_runtime
from core.patchers.flask import patch_flask
from core.patchers.node import patch_node


def auto_patch(app_path, runtime=None):
    """
    Attempts to patch application to be PORT-env compliant.
    Returns True if patched or already compliant, False otherwise.
    """
    if runtime is None:
        runtime = detect_runtime(app_path)
        print(f"Detected runtime: {runtime}")

    if runtime == "python":
        return patch_flask(app_path)

    if runtime == "node":
        return patch_node(app_path)

    return False
