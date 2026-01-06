import os


def patch_node(app_dir):
    """
    Attempts to patch Express-style app.listen(PORT).
    """

    for root, _, files in os.walk(app_dir):
        for file in files:
            if not file.endswith(".js"):
                continue

            path = os.path.join(root, file)

            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            if "app.listen(" not in content:
                continue

            if "process.env.PORT" in content:
                return True  # Already compliant

            patched = (
                "const PORT = process.env.PORT || 3000;\n"
                + content.replace("app.listen(", "app.listen(PORT, ")
            )

            with open(path, "w", encoding="utf-8") as f:
                f.write(patched)

            return True

    return False
