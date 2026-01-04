# Niutonian Themes - ComfyUI Theme Extension
# A professional theme pack for ComfyUI with customizable node styles
# https://github.com/Niutonian/ComfyUI-Niutonian-Themes

__version__ = "1.2.0"

# This is a frontend-only extension (no Python nodes)
# The WEB_DIRECTORY tells ComfyUI where to find the JavaScript files
WEB_DIRECTORY = "./js"

# Required for ComfyUI to recognize this as a valid extension
NODE_CLASS_MAPPINGS = {}
NODE_DISPLAY_NAME_MAPPINGS = {}

__all__ = ["NODE_CLASS_MAPPINGS", "NODE_DISPLAY_NAME_MAPPINGS", "WEB_DIRECTORY"]
