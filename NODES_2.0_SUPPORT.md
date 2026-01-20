# Nodes 2.0 Support - Testing Guide

## ✅ What Was Added

Your Niutonian Themes now support **BOTH** Classic Nodes and Nodes 2.0!

### Dual-Mode Architecture:
- **Classic Mode (Canvas)**: Uses your existing canvas-based rendering
- **Nodes 2.0 Mode (DOM)**: Uses new CSS-based rendering with custom properties

## 🧪 How to Test

### Step 1: Test in Classic Mode (Default)
1. Open ComfyUI
2. Your themes should work exactly as before
3. Try switching themes via menu or `Alt + 1-9`
4. ✅ Everything should look the same as before

### Step 2: Enable Nodes 2.0
1. Go to **Settings** (gear icon)
2. Find **"Modern Node Design (Nodes 2.0)"** under Experimental
3. Toggle it **ON**
4. ComfyUI will reload

### Step 3: Test Themes in Nodes 2.0 Mode
1. Right-click canvas → **"🎨 Niutonian Theme"**
2. Try switching between themes
3. Check the browser console (F12) for messages like:
   ```
   [NiutonianNodeStyles] 🎨 Applying Nodes 2.0 theme: Modern Dark
   ```

### Step 4: Test Mode Switching
1. With a theme applied, go back to Settings
2. Toggle **"Modern Node Design (Nodes 2.0)"** OFF
3. ComfyUI will reload to Classic mode
4. Your theme should still be applied (canvas-based)
5. Toggle it back ON
6. Theme should switch to CSS-based rendering

## 🎨 What Works in Nodes 2.0

✅ **Fully Supported:**
- All 11 built-in themes
- Custom themes
- Theme colors (backgrounds, borders, text)
- Shadow effects
- Corner radius
- Glow effects
- Glass effects
- Scanlines (cyberpunk theme)
- Executing node animations
- Per-node themes
- Theme toggle/disable

⚠️ **Differences from Classic:**
- Rendering is DOM-based (HTML elements) instead of canvas
- Some visual effects may look slightly different
- Performance characteristics differ (generally better)

## 🐛 Troubleshooting

### Theme not applying in Nodes 2.0?
1. Open browser console (F12)
2. Look for error messages
3. Check if you see: `[NiutonianNodeStyles] 🎨 Applying Nodes 2.0 theme`
4. Try hard refresh: `Ctrl + Shift + R`

### Theme looks different in Nodes 2.0?
This is normal! DOM rendering vs canvas rendering will have slight visual differences. The colors and effects are the same, but the rendering method is different.

### Switching modes doesn't update theme?
1. Try manually switching themes after mode change
2. Check console for errors
3. Hard refresh the page

## 📝 Technical Details

### How It Works:

**Detection:**
```javascript
isVueNodesEnabled() // Checks if Nodes 2.0 is active
```

**Classic Mode:**
- Uses `LiteGraph` canvas API
- Overrides `drawNodeShape`, `drawTitleBarBackground`
- Direct canvas manipulation with `ctx.fillStyle`, etc.

**Nodes 2.0 Mode:**
- Uses CSS custom properties
- Injects `<style>` tag with theme CSS
- Maps theme colors to `--component-node-*` variables

**Auto-Switching:**
- Listens for `Comfy.VueNodes.Enabled` setting changes
- Automatically applies appropriate theming method
- Seamless transition between modes

## 🎯 Next Steps

1. **Test thoroughly** in both modes
2. **Report any issues** you find
3. **Compare visual differences** between modes
4. **Test all 11 themes** in Nodes 2.0
5. **Test custom themes** you've created

## 💾 Backup

Your backup is at: `F:\CLAUDE\NIUTONIAN_LITEGRAPH\ComfyUI-Niutonian-Themes copy`

If anything goes wrong, you can restore from there!

---

**Happy Testing! 🎨✨**
