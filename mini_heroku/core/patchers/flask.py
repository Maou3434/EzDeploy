import os
import re


def patch_flask(app_dir):
    """
    Looks for app.run(...) in Python files and replaces it
    with PORT-based execution.
    """

    for root, _, files in os.walk(app_dir):
        for file in files:
            if not file.endswith(".py"):
                continue

            path = os.path.join(root, file)

            with open(path, "r", encoding="utf-8") as f:
                lines = f.readlines()

            patched_lines = []
            modified = False

            for line in lines:
                match = re.search(r"^(\s*)app\.run\s*\(", line)
                if match:
                    indent = match.group(1)
                    patched_lines.append(f"{indent}import os\n")
                    patched_lines.append(f"{indent}port = int(os.environ.get('PORT', 5000))\n")
                    patched_lines.append(f"{indent}app.run(host='0.0.0.0', port=port)\n")
                    modified = True
                else:
                    patched_lines.append(line)


            if modified:
                with open(path, "w", encoding="utf-8") as f:
                    f.writelines(patched_lines)

                return True  # Patched successfully

    return False  # No patchable pattern found
