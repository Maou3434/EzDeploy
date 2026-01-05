import os


def detect_runtime(app_path):
    """
    Detects runtime based on standard files and directory structure.
    Returns: 'python', 'node', or 'unknown'
    """
    if not os.path.exists(app_path):
        return "unknown"

    # Python detection
    if os.path.exists(os.path.join(app_path, "requirements.txt")) or \
       os.path.exists(os.path.join(app_path, "manage.py")) or \
       os.path.exists(os.path.join(app_path, "Pipfile")):
        return "python"

    # Node.js detection
    if os.path.exists(os.path.join(app_path, "package.json")) or \
       os.path.exists(os.path.join(app_path, "node_modules")):
        return "node"

    # Fallback: check file extensions in the root
    for entry in os.listdir(app_path):
        if entry.endswith(".py"):
            return "python"
        if entry.endswith(".js") or entry.endswith(".ts"):
            return "node"

    return "unknown"


if __name__ == "__main__":
    print("Flask runtime:", detect_runtime("builds/flask"))
    print("Node runtime:", detect_runtime("builds/node"))
