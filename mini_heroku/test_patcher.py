from auto_patch import auto_patch
from core.detector import detect_runtime

flask_path = "builds/Flask_App_1/flask_modern_app"
node_path = "builds/Node_App_1/Node_App_1"

print(f"Flask runtime: {detect_runtime(flask_path)}")
print(f"Flask patched: {auto_patch(flask_path)}")  # Runtime is detected automatically

print(f"Node runtime: {detect_runtime(node_path)}")
print(f"Node patched: {auto_patch(node_path)}")    # Runtime is detected automatically
