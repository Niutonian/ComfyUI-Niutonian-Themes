# Debug Nodes 2.0 Theming

## Quick Debug Steps

### 1. Check if Nodes 2.0 is Actually Enabled

Open browser console (F12) and paste:

```javascript
console.log("Nodes 2.0 enabled:", app?.ui?.settings?.getSettingValue?.('Comfy.VueNodes.Enabled', false));
```

**Expected:** `true` if Nodes 2.0 is enabled

### 2. Check if Theme is Being Applied

```javascript
console.log("Current theme:", localStorage.getItem('niutonian_node_styles.stylePack'));
console.log("CSS Variables:", {
  background: getComputedStyle(document.documentElement).getPropertyValue('--component-node-background'),
  border: getComputedStyle(document.documentElement).getPropertyValue('--component-node-border'),
});
```

**Expected:** Should show your theme name and CSS variable values

### 3. Check if Nodes Exist

```javascript
console.log("Node elements:", document.querySelectorAll('.lg-node').length);
console.log("First node classes:", document.querySelector('.lg-node')?.className);
```

**Expected:** Should show number of nodes and their classes

### 4. Manually Apply Theme (Force Test)

```javascript
// Get the theme pack
const pack = {
  name: "Test Theme",
  node_bg: "#ff0000",  // Bright red for testing
  node_selected: "#00ff00",
  node_title_bg: "#0000ff",
  node_title_color: "#ffffff",
  border_color: "#ffff00",
  border_selected: "#ff00ff",
  executing_color: "#00ffff",
  glow_color: "#ff00ff",
  shadow_color: "rgba(0,0,0,0.5)",
  shadow_size: 12,
  corner_radius: 8,
  glow_intensity: 20,
  glass_opacity: 0.08,
  node_opacity: 1.0,
  bypass_color: "#666666",
  error_color: "#ff0000"
};

// Apply directly to CSS
const root = document.documentElement;
root.style.setProperty('--component-node-background', pack.node_bg);
root.style.setProperty('--component-node-border', pack.border_color);

// Also apply via direct CSS
const style = document.createElement('style');
style.id = 'debug-theme';
style.textContent = `
  .lg-node {
    background-color: ${pack.node_bg} !important;
    border-color: ${pack.border_color} !important;
    border-width: 3px !important;
  }
`;
document.head.appendChild(style);

console.log("✅ Debug theme applied - nodes should be BRIGHT RED with YELLOW borders");
```

**Expected:** Nodes should turn bright red with yellow borders

### 5. Check Existing Styles

```javascript
// Find what's overriding our styles
const node = document.querySelector('.lg-node');
if (node) {
  const styles = getComputedStyle(node);
  console.log("Node computed styles:", {
    backgroundColor: styles.backgroundColor,
    borderColor: styles.borderColor,
    borderWidth: styles.borderWidth,
  });
}
```

### 6. List All Stylesheets

```javascript
Array.from(document.styleSheets).forEach((sheet, i) => {
  try {
    console.log(`Stylesheet ${i}:`, sheet.href || 'inline', 'Rules:', sheet.cssRules?.length);
  } catch(e) {
    console.log(`Stylesheet ${i}: Cannot access (CORS)`);
  }
});
```

## Common Issues

### Issue 1: CSS Variables Not Applied
**Symptom:** Console shows theme applied but nodes don't change
**Solution:** ComfyUI might be using inline styles or higher specificity

**Fix:** Use `!important` in CSS (already added in latest version)

### Issue 2: Wrong CSS Classes
**Symptom:** `.lg-node` class doesn't exist
**Solution:** Nodes 2.0 might use different class names

**Check:** Run this to find actual node classes:
```javascript
const nodes = document.querySelectorAll('[class*="node"]');
console.log("Node-related elements:", Array.from(nodes).map(n => ({
  tag: n.tagName,
  classes: n.className,
  id: n.id
})));
```

### Issue 3: Styles Loading Too Late
**Symptom:** Theme works after manual refresh but not on initial load
**Solution:** Add delay or wait for DOM ready

### Issue 4: ComfyUI Overriding Styles
**Symptom:** Styles flash briefly then disappear
**Solution:** Increase CSS specificity or use `!important`

## Manual Theme Application

If automatic detection fails, you can manually apply themes:

```javascript
// Force apply a theme in Nodes 2.0 mode
function forceApplyTheme() {
  const themes = {
    modern: {
      node_bg: "#1f1f28",
      border_color: "#3d5a80",
      // ... other properties
    }
  };
  
  const pack = themes.modern;
  const root = document.documentElement;
  
  // Set CSS variables
  root.style.setProperty('--component-node-background', pack.node_bg);
  root.style.setProperty('--component-node-border', pack.border_color);
  
  // Inject CSS
  const style = document.createElement('style');
  style.id = 'manual-theme';
  style.textContent = `
    .lg-node {
      background-color: ${pack.node_bg} !important;
      border-color: ${pack.border_color} !important;
    }
  `;
  document.head.appendChild(style);
  
  console.log("✅ Theme manually applied");
}

forceApplyTheme();
```

## Next Steps

1. Run the debug commands above
2. Share the console output
3. We'll identify the exact issue
4. Apply the appropriate fix

---

**Need Help?** Share your console output and we'll debug together!
