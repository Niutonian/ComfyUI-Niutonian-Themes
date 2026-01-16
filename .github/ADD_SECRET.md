# Adding Your Registry API Key to GitHub

## Step-by-Step Instructions

1. **Go to your GitHub repository**: https://github.com/Niutonian/ComfyUI-Niutonian-Themes

2. **Navigate to Settings**:
   - Click the **Settings** tab at the top of your repository

3. **Go to Secrets and Variables**:
   - In the left sidebar, click **Secrets and variables**
   - Then click **Actions**

4. **Create New Repository Secret**:
   - Click **New repository secret**
   - **Name**: `REGISTRY_ACCESS_TOKEN`
   - **Secret**: `[YOUR_COMFYUI_REGISTRY_TOKEN_HERE]`
   - Click **Add secret**

## What Happens Next

Once you add the secret:
1. The GitHub Action is ready to publish automatically
2. Any time you update the version in `pyproject.toml` and push to main, it will publish
3. You can also trigger it manually from the Actions tab

## Test the Setup

To test the publishing:
1. Update the version in `pyproject.toml` (currently 1.2.0 → 1.2.1)
2. Commit and push the change
3. Check the Actions tab to see the publishing workflow run
4. Your updated node should appear on the ComfyUI Registry

**Important**: Keep this API key secure and don't share it publicly!