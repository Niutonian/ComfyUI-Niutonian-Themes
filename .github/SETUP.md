# GitHub Action Setup for ComfyUI Registry Publishing

This repository includes a GitHub Action that automatically publishes your custom node to the ComfyUI Registry whenever the `pyproject.toml` file is updated, using the official ComfyUI publish action.

## Setup Instructions

### 1. Add GitHub Repository Secret (REQUIRED)
1. Go to your GitHub repository: https://github.com/Niutonian/ComfyUI-Niutonian-Themes
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `REGISTRY_ACCESS_TOKEN`
6. Value: `[YOUR_COMFYUI_REGISTRY_TOKEN_HERE]`
7. Click **Add secret**

### 2. Verify Branch Configuration
The workflow is configured for the `main` branch, which matches your current setup.

### 3. Test the Publishing
To publish a new version:
1. Update the `version` field in `pyproject.toml` (currently 1.2.0)
2. Commit and push the changes to your main branch
3. The GitHub Action will automatically trigger and publish the new version
4. You can also trigger it manually from the Actions tab using "workflow_dispatch"

## How It Works

The action triggers when:
- A push is made to the main branch AND the `pyproject.toml` file is modified
- You manually trigger it from the Actions tab

The workflow uses the official `Comfy-Org/publish-node-action@main` which:
1. Reads your `pyproject.toml` configuration
2. Validates the custom node structure
3. Publishes to the ComfyUI Registry using your API token
4. Makes it available in ComfyUI Manager

## Current Configuration

- **Package Name**: comfyui-niutonian-themes
- **Current Version**: 1.2.0
- **Publisher**: @Niutonian
- **Repository**: https://github.com/Niutonian/ComfyUI-Niutonian-Themes
- **Registry URL**: https://registry.comfy.org/publishers/Niutonian/nodes/comfyui-niutonian-themes

## Troubleshooting

- **Action fails**: Check the Actions tab in your GitHub repository for error logs
- **Authentication issues**: Verify your `REGISTRY_ACCESS_TOKEN` secret is correctly set
- **Version conflicts**: Make sure you're incrementing the version number in `pyproject.toml`
- **Metadata issues**: Ensure your `pyproject.toml` has all required ComfyUI fields

## Manual Publishing Alternative

You can also publish manually using the ComfyUI CLI:
```bash
# Install comfy-cli if not already installed
pip install comfy-cli

# Publish manually
comfy node publish
# Enter your API key when prompted
```