// Niutonian Node Styles - Professional ComfyUI Theme
// Non-invasive styling that preserves LiteGraph layout

import { app } from "/scripts/app.js";
import { api } from "/scripts/api.js";

// Import LGraphEventMode for bypass detection
const LGraphEventMode = globalThis?.LiteGraph?.LGraphEventMode || { BYPASS: 4 };

const NS = "niutonian_node_styles";
const STORAGE_KEY = `${NS}.stylePack`;
const CUSTOM_THEMES_KEY = `${NS}.customThemes`;

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR HELPERS (Customizer + Import/Export)
// - <input type="color"> only accepts #RRGGBB, so we normalize any rgba()/named
//   colors into hex for UI display.
// - Internally we keep the original CSS strings (rgba, hex, etc.) for rendering.
// ═══════════════════════════════════════════════════════════════════════════════

function clampByte(n) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(255, Math.round(x)));
}

function rgbToHex(r, g, b) {
  return (
    "#" +
    [clampByte(r), clampByte(g), clampByte(b)]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
  );
}

function cssColorToHex(input, fallback = "#000000") {
  if (!input || typeof input !== "string") return fallback;
  const s = input.trim();
  if (/^#([0-9a-fA-F]{6})$/.test(s)) return s;
  if (/^#([0-9a-fA-F]{3})$/.test(s)) {
    const m = s.slice(1);
    return "#" + m.split("").map((c) => c + c).join("");
  }

  // rgba()/rgb()
  const rgbMatch = s.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbMatch) {
    const parts = rgbMatch[1].split(",").map((p) => p.trim());
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    if ([r, g, b].every((v) => Number.isFinite(v))) return rgbToHex(r, g, b);
  }

  // Fallback: let the browser resolve named colors / hsl() / etc.
  try {
    const tmp = document.createElement("div");
    tmp.style.color = s;
    tmp.style.display = "none";
    document.body.appendChild(tmp);
    const resolved = getComputedStyle(tmp).color; // "rgb(r,g,b)" or "rgba(r,g,b,a)"
    document.body.removeChild(tmp);
    const m = resolved.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (m) return rgbToHex(parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10));
  } catch (e) {
    // ignore
  }
  return fallback;
}

function safeThemeIdFromName(name) {
  const base = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .slice(0, 60);
  return base || `custom_${Date.now()}`;
}

function safeDownloadName(name) {
  const base = String(name || "theme")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 80);
  return base || "theme";
}

// Load custom themes from localStorage
function loadCustomThemes() {
  try {
    const stored = localStorage.getItem(CUSTOM_THEMES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch(e) {
    console.warn("[NiutonianNodeStyles] Failed to load custom themes:", e);
    return {};
  }
}

// Save custom themes to localStorage
function saveCustomThemes(customThemes) {
  try {
    localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(customThemes));
  } catch(e) {
    console.error("[NiutonianNodeStyles] Failed to save custom themes:", e);
  }
}

// Get all themes (built-in + custom)
function getAllThemes() {
  const customThemes = loadCustomThemes();
  return { ...STYLE_PACKS, ...customThemes };
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE PACKS - Only colors and visual effects, no layout changes
// ═══════════════════════════════════════════════════════════════════════════════

const STYLE_PACKS = {
  modern: {
    name: "Modern Dark",
    node_bg: "#1f1f28",
    node_selected: "#2a2a35",
    node_title_bg: "#16213e",
    node_title_color: "#ffffff",
    border_color: "#3d5a80",
    border_selected: "#ee6c4d",
    shadow_color: "rgba(0,0,0,0.5)",
    shadow_size: 12,
    corner_radius: 8,
    executing_color: "#ee6c4d",
    glow_color: "#ee6c4d",
    glow_intensity: 20,
    glass_opacity: 0.08,
    node_opacity: 1.0,
    bypass_color: "#666666",
    error_color: "#8b2635",
  },
  glass: {
    name: "Glassmorphism", 
    node_bg: "rgba(40,40,55,0.85)",
    node_selected: "rgba(60,60,80,0.9)",
    node_title_bg: "rgba(50,50,70,0.8)",
    node_title_color: "#ffffff",
    border_color: "rgba(255,255,255,0.2)",
    border_selected: "#00d4ff",
    shadow_color: "rgba(0,0,0,0.4)",
    shadow_size: 20,
    corner_radius: 16,
    glass: true,
    executing_color: "#00d4ff",
    glow_color: "#00d4ff",
    glow_intensity: 25,
    glass_opacity: 0.12,
    node_opacity: 0.85,
    bypass_color: "#555555",
    error_color: "#cc4444",
  },
  neon: {
    name: "Neon Glow",
    node_bg: "#0a0a0a",
    node_selected: "#141414", 
    node_title_bg: "#0f0f0f",
    node_title_color: "#39ff14",
    border_color: "#1a1a1a",
    border_selected: "#ff00ff",
    shadow_color: "rgba(255,0,255,0.5)",
    shadow_size: 30,
    corner_radius: 4,
    glow: true,
    executing_color: "#39ff14",
    glow_color: "#ff00ff",
    glow_intensity: 35,
    glass_opacity: 0.06,
    node_opacity: 1.0,
    bypass_color: "#444444",
    error_color: "#ff1744",
  },
  minimal: {
    name: "Minimal Clean",
    node_bg: "#2d2d2d",
    node_selected: "#3d3d3d",
    node_title_bg: "#383838",
    node_title_color: "#e0e0e0",
    border_color: "#4a4a4a",
    border_selected: "#ffffff",
    shadow_color: "rgba(0,0,0,0.25)",
    shadow_size: 6,
    corner_radius: 4,
    executing_color: "#ffffff",
    glow_color: "#ffffff",
    glow_intensity: 15,
    glass_opacity: 0.04,
    node_opacity: 1.0,
    bypass_color: "#777777",
    error_color: "#d32f2f",
  },
  ocean: {
    name: "Ocean Deep",
    node_bg: "#0d1b2a",
    node_selected: "#1b263b",
    node_title_bg: "#1b3a4b",
    node_title_color: "#a9d6e5",
    border_color: "#468faf",
    border_selected: "#61e8e1",
    shadow_color: "rgba(0,50,80,0.4)",
    shadow_size: 15,
    corner_radius: 10,
    executing_color: "#61e8e1",
    glow_color: "#61e8e1",
    glow_intensity: 22,
    glass_opacity: 0.10,
    node_opacity: 1.0,
    bypass_color: "#2a4a5a",
    error_color: "#c62828",
  },
  sunset: {
    name: "Sunset Warm",
    node_bg: "#2d1b1b",
    node_selected: "#3d2828",
    node_title_bg: "#4a2c2a",
    node_title_color: "#ffd6a5",
    border_color: "#9c4a3b",
    border_selected: "#ff7b54",
    shadow_color: "rgba(80,30,20,0.4)",
    shadow_size: 14,
    corner_radius: 10,
    executing_color: "#ffb347",
    glow_color: "#ff7b54",
    glow_intensity: 18,
    glass_opacity: 0.08,
    node_opacity: 1.0,
    bypass_color: "#5a3a2a",
    error_color: "#d84315",
  },
  cyberpunk: {
    name: "Cyberpunk",
    node_bg: "#0a0a0f",
    node_selected: "#12121a",
    node_title_bg: "#1a1a25",
    node_title_color: "#00ffff",
    border_color: "#ff00ff",
    border_selected: "#00ffff",
    shadow_color: "rgba(255,0,255,0.5)",
    shadow_size: 20,
    corner_radius: 2,
    glow: true,
    scanlines: true,
    executing_color: "#00ffff",
    glow_color: "#ff00ff",
    glow_intensity: 30,
    glass_opacity: 0.05,
    node_opacity: 1.0,
    bypass_color: "#333333",
    error_color: "#ff073a",
  },
  forest: {
    name: "Forest Night",
    node_bg: "#1a2f1a",
    node_selected: "#2a4a2a",
    node_title_bg: "#1f3d1f",
    node_title_color: "#c8e6c9",
    border_color: "#2e7d32",
    border_selected: "#81c784",
    shadow_color: "rgba(0,0,0,0.45)",
    shadow_size: 14,
    corner_radius: 8,
    executing_color: "#69f0ae",
    glow_color: "#81c784",
    glow_intensity: 20,
    glass_opacity: 0.09,
    node_opacity: 1.0,
    bypass_color: "#4a5a4a",
    error_color: "#c62828",
  },
  midnight: {
    name: "Midnight Purple",
    node_bg: "#1a1025",
    node_selected: "#2d1b40",
    node_title_bg: "#251538",
    node_title_color: "#e1bee7",
    border_color: "#4a148c",
    border_selected: "#ce93d8",
    shadow_color: "rgba(74,20,140,0.4)",
    shadow_size: 16,
    corner_radius: 10,
    glow: true,
    executing_color: "#ea80fc",
    glow_color: "#ce93d8",
    glow_intensity: 28,
    glass_opacity: 0.11,
    node_opacity: 1.0,
    bypass_color: "#4a3a5a",
    error_color: "#ad1457",
  },
  ember: {
    name: "Ember Glow",
    node_bg: "#1f1410",
    node_selected: "#3d2518",
    node_title_bg: "#2a1a12",
    node_title_color: "#ffccbc",
    border_color: "#bf360c",
    border_selected: "#ff6e40",
    shadow_color: "rgba(191,54,12,0.35)",
    shadow_size: 18,
    corner_radius: 6,
    glow: true,
    executing_color: "#ff9e80",
    glow_color: "#ff6e40",
    glow_intensity: 25,
    glass_opacity: 0.07,
    node_opacity: 1.0,
    bypass_color: "#5a3a2a",
    error_color: "#d84315",
  },
};

// Node type accent colors
const NODE_ACCENTS = {
  "Load": "#4ecdc4",
  "Checkpoint": "#f7b731",
  "LoRA": "#fed330",
  "CLIP": "#a55eea",
  "VAE": "#20bf6b",
  "KSampler": "#eb3b5a",
  "Sampler": "#fc5c65",
  "ControlNet": "#8854d0",
  "IPAdapter": "#3867d6",
  "Image": "#0fb9b1",
  "Preview": "#2bcbba",
  "Save": "#45aaf2",
  "Latent": "#f368e0",
  "Conditioning": "#a55eea",
  "Encode": "#8854d0",
  "Mask": "#fa8231",
  "default": "#778ca3",
};

function getAccent(node) {
  const type = node?.type || "";
  for (const [key, color] of Object.entries(NODE_ACCENTS)) {
    if (key !== "default" && type.includes(key)) return color;
  }
  return NODE_ACCENTS.default;
}

function getPackId() {
  return localStorage.getItem(STORAGE_KEY) || "modern";
}

function setPackId(id) {
  localStorage.setItem(STORAGE_KEY, id);
}

function getPack() {
  const packId = getPackId();
  // When disabled, return a neutral theme that mimics original ComfyUI
  if (packId === 'disabled') {
    return {
      name: "Disabled",
      node_bg: "#353535",
      node_selected: "#666666",
      node_title_bg: "#353535",
      node_title_color: "#ffffff",
      border_color: "#666666",
      border_selected: "#ffffff",
      shadow_color: "rgba(0,0,0,0.3)",
      shadow_size: 4,
      corner_radius: 0,
      executing_color: "#00ff00",
      glow_color: "#ffffff",
      glow_intensity: 0,
      glass_opacity: 0,
      node_opacity: 1.0,
      bypass_color: "#666666",
      error_color: "#ff0000",
      glass: false,
      glow: false,
      scanlines: false,
    };
  }
  const allThemes = getAllThemes();
  return allThemes[packId] || STYLE_PACKS.modern;
}

// Get theme for a specific node (checks for per-node override first)
function getNodePack(node) {
  // If global theme is disabled, always return disabled theme
  if (getPackId() === 'disabled') {
    return getPack();
  }
  
  // Check if node has a per-node theme override
  if (node && node._niutonianTheme) {
    const allThemes = getAllThemes();
    const nodeTheme = allThemes[node._niutonianTheme];
    if (nodeTheme) {
      return nodeTheme;
    }
  }
  
  // Fall back to global theme
  return getPack();
}

// Set per-node theme override
function setNodeTheme(node, themeId) {
  if (!node) return;
  
  if (themeId === null || themeId === 'global') {
    // Remove per-node override, use global theme
    delete node._niutonianTheme;
  } else {
    node._niutonianTheme = themeId;
  }
  
  // Force redraw
  node.setDirtyCanvas(true, true);
  if (app.canvas) {
    app.canvas.setDirty(true, true);
  }
}

// Get the current theme ID for a node (returns 'global' if using global theme)
function getNodeThemeId(node) {
  if (node && node._niutonianTheme) {
    return node._niutonianTheme;
  }
  return 'global';
}


// ═══════════════════════════════════════════════════════════════════════════════
// NODES 2.0 (VUE) SUPPORT
// ═══════════════════════════════════════════════════════════════════════════════

const NODES2_STYLE_ID = `${NS}-nodes2-style`;
let nodes2Observer = null;

function isVueNodesEnabled() {
  try {
    return !!app?.ui?.settings?.getSettingValue?.("Comfy.VueNodes.Enabled", false);
  } catch (e) {
    return false;
  }
}

function ensureNodes2StyleTag() {
  let style = document.getElementById(NODES2_STYLE_ID);
  if (!style) {
    style = document.createElement("style");
    style.id = NODES2_STYLE_ID;
    document.head.appendChild(style);
  }
  return style;
}

function getDomNodeId(el) {
  // Nodes 2.0 has changed a few times; try a handful of likely attributes
  return (
    el?.dataset?.nodeId ||
    el?.dataset?.id ||
    el?.dataset?.node_id ||
    el?.getAttribute?.("data-node-id") ||
    el?.getAttribute?.("data-id") ||
    null
  );
}

function applyNodes2PerNodeThemes() {
  if (!isVueNodesEnabled()) return;
  const nodes = app?.graph?._nodes;
  if (!Array.isArray(nodes) || nodes.length === 0) return;

  const map = new Map(nodes.map((n) => [String(n.id), n]));
  const domNodes = document.querySelectorAll(".lg-node, .comfy-node, [data-comfy-node]");

  for (const el of domNodes) {
    const rawId = getDomNodeId(el);
    if (!rawId) continue;

    // Some builds prefix ids like "workflow:123"; try both
    const idStr = String(rawId);
    const node = map.get(idStr) || map.get(idStr.split(":").pop());
    if (!node) continue;

    // Manual colors override everything in legacy; in Nodes 2.0 we mirror that behavior
    const hasManualColor =
      (node.color && node.color !== globalThis?.LiteGraph?.NODE_DEFAULT_COLOR) ||
      (node.bgcolor && node.bgcolor !== globalThis?.LiteGraph?.NODE_DEFAULT_BGCOLOR);
    if (hasManualColor) {
      el.style.removeProperty("--component-node-background");
      el.style.removeProperty("--component-node-background-selected");
      el.style.removeProperty("--component-node-border");
      el.style.removeProperty("--component-node-border-selected");
      el.style.removeProperty("--component-node-title-background");
      el.style.removeProperty("--component-node-title-color");
      continue;
    }

    const perNodeThemeId = getNodeThemeId(node);
    if (perNodeThemeId !== "global") {
      const pack = getNodePack(node);
      el.style.setProperty("--component-node-background", pack.node_bg);
      el.style.setProperty("--component-node-background-selected", pack.node_selected);
      el.style.setProperty("--component-node-border", pack.border_color);
      el.style.setProperty("--component-node-border-selected", pack.border_selected);
      el.style.setProperty("--component-node-title-background", pack.node_title_bg);
      el.style.setProperty("--component-node-title-color", pack.node_title_color);
    } else {
      // Inherit global vars
      el.style.removeProperty("--component-node-background");
      el.style.removeProperty("--component-node-background-selected");
      el.style.removeProperty("--component-node-border");
      el.style.removeProperty("--component-node-border-selected");
      el.style.removeProperty("--component-node-title-background");
      el.style.removeProperty("--component-node-title-color");
    }
  }
}

function ensureNodes2Observer() {
  if (nodes2Observer) return;
  try {
    nodes2Observer = new MutationObserver(() => {
      // Lightweight; only touches style props when needed
      applyNodes2PerNodeThemes();
    });
    nodes2Observer.observe(document.body, { subtree: true, childList: true, attributes: true });
  } catch (e) {
    console.warn("[NiutonianNodeStyles] Nodes 2.0 observer setup failed:", e);
  }
}

function clearNodes2Theme() {
  const style = document.getElementById(NODES2_STYLE_ID);
  if (style) style.remove();

  // Clear variables we set (leave other themes alone)
  const root = document.documentElement;
  const vars = [
    "--component-node-background",
    "--component-node-background-selected",
    "--component-node-border",
    "--component-node-border-selected",
    "--component-node-title-background",
    "--component-node-title-color",
    "--niutonian-node-radius",
    "--niutonian-node-shadow",
    "--niutonian-node-opacity",
    "--niutonian-glow-color",
    "--niutonian-glow-intensity",
    "--niutonian-glass-opacity",
  ];
  for (const v of vars) root.style.removeProperty(v);
}

function applyNodes2Theme(pack) {
  // If disabled -> remove our styling
  if (getPackId() === "disabled") {
    clearNodes2Theme();
    return true;
  }

  const root = document.documentElement;

  // CSS custom properties used by ComfyUI Nodes 2.0 (documented/observed)
  root.style.setProperty("--component-node-background", pack.node_bg);
  root.style.setProperty("--component-node-background-selected", pack.node_selected);
  root.style.setProperty("--component-node-border", pack.border_color);
  root.style.setProperty("--component-node-border-selected", pack.border_selected);
  root.style.setProperty("--component-node-title-background", pack.node_title_bg);
  root.style.setProperty("--component-node-title-color", pack.node_title_color);

  // Our own variables for effects
  root.style.setProperty("--niutonian-node-radius", `${pack.corner_radius || 0}px`);
  root.style.setProperty(
    "--niutonian-node-shadow",
    `0 0 ${Math.max(0, pack.shadow_size || 0)}px ${pack.shadow_color || "rgba(0,0,0,0.3)"}`
  );
  root.style.setProperty("--niutonian-node-opacity", `${pack.node_opacity ?? 1.0}`);
  root.style.setProperty("--niutonian-glow-color", pack.glow_color || pack.border_selected);
  root.style.setProperty("--niutonian-glow-intensity", `${pack.glow_intensity || 0}px`);
  root.style.setProperty("--niutonian-glass-opacity", `${pack.glass_opacity || 0}`);

  const style = ensureNodes2StyleTag();

  // NOTE:
  // Nodes 2.0 is DOM-rendered. We style the most stable selectors we've observed:
  //  - .lg-node is currently used for node root containers
  //  - selection state varies between versions, so we include several candidates
  //  - header/title elements vary, so we target common patterns.
  style.textContent = `
/* Niutonian Themes - Nodes 2.0 (Vue) */

:root {
  --niutonian-node-radius: var(--niutonian-node-radius);
}

/* Base node container */
.lg-node,
.comfy-node,
[data-comfy-node] {
  background-color: var(--component-node-background) !important;
  border-color: var(--component-node-border) !important;
  border-radius: var(--niutonian-node-radius) !important;
  box-shadow: var(--niutonian-node-shadow) !important;
  opacity: var(--niutonian-node-opacity) !important;
}

/* Selected node */
.lg-node.selected,
.lg-node.is-selected,
.lg-node--selected,
.comfy-node.selected,
.comfy-node.is-selected,
[data-comfy-node].selected,
[data-comfy-node].is-selected {
  background-color: var(--component-node-background-selected) !important;
  border-color: var(--component-node-border-selected) !important;
  box-shadow:
    var(--niutonian-node-shadow),
    0 0 var(--niutonian-glow-intensity) var(--niutonian-glow-color) !important;
}

/* Header / title bar */
.lg-node .title,
.lg-node .header,
.lg-node [class*="title"],
.lg-node [class*="header"],
.comfy-node .title,
.comfy-node .header,
[data-comfy-node] .title,
[data-comfy-node] .header {
  background: var(--component-node-title-background) !important;
  color: var(--component-node-title-color) !important;
}

/* Executing: ComfyUI sets various running classes; cover the common ones */
.lg-node.running,
.lg-node.is-running,
.lg-node--running,
.comfy-node.running,
.comfy-node.is-running,
[data-comfy-node].running,
[data-comfy-node].is-running {
  box-shadow:
    var(--niutonian-node-shadow),
    0 0 calc(var(--niutonian-glow-intensity) + 8px) ${pack.executing_color || "#00ff88"} !important;
}

/* Glass effect overlay */
.lg-node::before,
.comfy-node::before,
[data-comfy-node]::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--niutonian-node-radius);
  pointer-events: none;
  background: rgba(255,255,255,var(--niutonian-glass-opacity));
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: ${pack.glass ? "block" : "none"};
}

/* Scanlines (Cyberpunk) */
.lg-node::after,
.comfy-node::after,
[data-comfy-node]::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--niutonian-node-radius);
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    rgba(255,255,255,0.03),
    rgba(255,255,255,0.03) 1px,
    rgba(0,0,0,0) 2px,
    rgba(0,0,0,0) 4px
  );
  mix-blend-mode: overlay;
  opacity: 0.6;
  display: ${pack.scanlines ? "block" : "none"};
}
`;

  // Per-node themes in Nodes 2.0: best-effort mapping from DOM nodes to graph nodes.
  // If ComfyUI changes DOM attributes, global theming still works, but per-node may not.
  ensureNodes2Observer();
  // Apply once now (and then the observer keeps it in sync)
  queueMicrotask(() => applyNodes2PerNodeThemes());

  console.log("[NiutonianNodeStyles] 🎨 Applying Nodes 2.0 theme:", pack.name);
  return true;
}


// ═══════════════════════════════════════════════════════════════════════════════
// APPLY THEME BY MODIFYING LITEGRAPH DEFAULTS (legacy canvas, non-invasive)
// ═══════════════════════════════════════════════════════════════════════════════

let appliedClassic = false;

function applyTheme() {
  const LiteGraph = globalThis?.LiteGraph;
  const LGraphCanvas = globalThis?.LGraphCanvas;
  const LGraphNode = globalThis?.LGraphNode;
  
  if (!LiteGraph || !LGraphCanvas || appliedClassic) return false;
  appliedClassic = true;
  
  const pack = getPack();
  
  // Apply to LiteGraph defaults - this affects all nodes without breaking layout
  LiteGraph.NODE_DEFAULT_COLOR = pack.node_bg;
  LiteGraph.NODE_DEFAULT_BGCOLOR = pack.node_bg;
  LiteGraph.NODE_DEFAULT_BOXCOLOR = "#ffffff"; // White box for visibility
  LiteGraph.NODE_TITLE_COLOR = "#ffffff"; // Force white title text for visibility
  LiteGraph.NODE_SELECTED_TITLE_COLOR = "#ffffff"; // Ensure selected title is visible
  LiteGraph.NODE_TEXT_COLOR = "#ffffff"; // White text
  LiteGraph.NODE_DEFAULT_SHAPE = "box";
  
  // Also set the canvas title color
  if (LGraphCanvas.prototype) {
    LGraphCanvas.prototype.node_title_color = "#ffffff";
  }
  
  // Widget colors
  LiteGraph.WIDGET_BGCOLOR = "rgba(0,0,0,0.3)";
  LiteGraph.WIDGET_OUTLINE_COLOR = pack.border_color;
  LiteGraph.WIDGET_TEXT_COLOR = "#ddd";
  LiteGraph.WIDGET_SECONDARY_TEXT_COLOR = "#999";
  
  // Link colors
  LiteGraph.LINK_COLOR = "#9A9";
  LiteGraph.EVENT_LINK_COLOR = "#A86";
  LiteGraph.CONNECTING_LINK_COLOR = "#AFA";
  
  // Override the running stroke style color for all nodes
  // This hooks into ComfyUI's strokeStyles system
  if (LGraphNode && LGraphNode.prototype) {
    const originalOnAdded = LGraphNode.prototype.onAdded;
    LGraphNode.prototype.onAdded = function(graph) {
      if (originalOnAdded) {
        originalOnAdded.call(this, graph);
      }
      // Override the running stroke style to use our theme color
      if (this.strokeStyles && this.strokeStyles['running']) {
        const originalRunning = this.strokeStyles['running'];
        const execColor = getPack().executing_color || "#00ff88";
        this.strokeStyles['running'] = function() {
          const result = originalRunning.call(this);
          if (result) {
            return { color: execColor, lineWidth: 3 };
          }
          return result;
        };
      }
    };
    
    // Hook into node serialization to save per-node theme
    const originalSerialize = LGraphNode.prototype.serialize;
    LGraphNode.prototype.serialize = function() {
      const data = originalSerialize ? originalSerialize.call(this) : {};
      // Save per-node theme if set
      if (this._niutonianTheme) {
        data._niutonianTheme = this._niutonianTheme;
      }
      return data;
    };
    
    // Hook into node configuration to restore per-node theme
    const originalConfigure = LGraphNode.prototype.configure;
    LGraphNode.prototype.configure = function(data) {
      if (originalConfigure) {
        originalConfigure.call(this, data);
      }
      // Restore per-node theme if saved
      if (data._niutonianTheme) {
        this._niutonianTheme = data._niutonianTheme;
      }
    };
  }
  
  // Override drawTitleBarBackground to NOT draw a separate header
  // This gives a cleaner unified look - the title text will draw on top of our node background
  const originalDrawTitleBarBackground = LGraphNode.prototype.drawTitleBarBackground;
  LGraphNode.prototype.drawTitleBarBackground = function(ctx, options = {}) {
    // If theme is disabled, use original rendering
    if (getPackId() === 'disabled') {
      return originalDrawTitleBarBackground.call(this, ctx, options);
    }
    
    // Use per-node theme if set, otherwise global theme
    const pack = getNodePack(this);
    const accent = getAccent(this);
    const titleH = options.title_height || LiteGraph.NODE_TITLE_HEIGHT || 30;
    const collapsed = this.flags?.collapsed;
    // Use collapsed width for collapsed nodes
    const w = collapsed ? (this._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH || 80) : this.size[0];
    
    // Check if node has manual colors set by user
    const hasManualColor = (this.color && this.color !== LiteGraph.NODE_DEFAULT_COLOR) || 
                          (this.bgcolor && this.bgcolor !== LiteGraph.NODE_DEFAULT_BGCOLOR);
    
    // If node has manual colors, use original drawing
    if (hasManualColor) {
      return originalDrawTitleBarBackground.call(this, ctx, options);
    }
    
    // Skip if transparent or no title
    if (this.title_mode === LiteGraph.TRANSPARENT_TITLE) {
      return;
    }
    
    // For collapsed nodes, we still need to draw the background
    if (collapsed) {
      const r = Math.min(pack.corner_radius, 12);
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(0, -titleH, w, titleH, r);
      ctx.fillStyle = pack.node_title_bg;
      if (LiteGraph.DEFAULT_SHADOW_COLOR) {
        ctx.shadowColor = LiteGraph.DEFAULT_SHADOW_COLOR;
      }
      ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.restore();
      return;
    }
    
    // For non-collapsed: just draw a subtle accent line at the bottom of title area
    // The node background is already drawn by drawNodeShape
    ctx.save();
    ctx.fillStyle = accent;
    ctx.fillRect(0, -2, w, 2);
    ctx.restore();
  };
  
  // Store original drawNodeShape
  const originalDrawNodeShape = LGraphCanvas.prototype.drawNodeShape;
  
  // Override drawNodeShape for custom styling while preserving layout
  LGraphCanvas.prototype.drawNodeShape = function(node, ctx, size, fgcolor, bgcolor, selected, mouse_over) {
    // If theme is disabled, use original rendering
    if (getPackId() === 'disabled') {
      return originalDrawNodeShape.call(this, node, ctx, size, fgcolor, bgcolor, selected, mouse_over);
    }
    
    // Use per-node theme if set, otherwise global theme
    const pack = getNodePack(node);
    const accent = getAccent(node);
    
    // Check if node has manual colors set by user
    const hasManualColor = (node.color && node.color !== LiteGraph.NODE_DEFAULT_COLOR) || 
                          (node.bgcolor && node.bgcolor !== LiteGraph.NODE_DEFAULT_BGCOLOR);
    
    // If node has manual colors, use original drawing and skip theme effects
    if (hasManualColor) {
      return originalDrawNodeShape.call(this, node, ctx, size, fgcolor, bgcolor, selected, mouse_over);
    }
    
    // Detect if node is currently executing
    let isExecuting = false;
    try {
      // Check our custom flag first (set by API events)
      if (node.is_executing === true) {
        isExecuting = true;
      }
      // Also check ComfyUI's strokeStyles if available
      if (!isExecuting && node.strokeStyles && typeof node.strokeStyles['running'] === 'function') {
        const runningResult = node.strokeStyles['running'].call(node);
        if (runningResult) {
          isExecuting = true;
        }
      }
    } catch(e) {}
    
    // Get the node's bounding rect (includes title area)
    // LiteGraph draws with body at (0,0) and title at negative Y
    const titleMode = node.title_mode ?? node.constructor.title_mode ?? LiteGraph.NORMAL_TITLE;
    const renderTitle = titleMode !== LiteGraph.TRANSPARENT_TITLE && titleMode !== LiteGraph.NO_TITLE;
    const collapsed = node.flags?.collapsed;
    const titleH = renderTitle ? (LiteGraph.NODE_TITLE_HEIGHT || 30) : 0;
    
    // Body dimensions (what LiteGraph passes as size)
    // For collapsed nodes, use the collapsed width from LiteGraph
    const w = collapsed ? (node._collapsed_width || LiteGraph.NODE_COLLAPSED_WIDTH || 80) : size[0];
    const h = size[1];
    const r = Math.min(pack.corner_radius, 12);
    
    // Full node area including title (title is at negative Y)
    const fullY = renderTitle ? -titleH : 0;
    const fullH = renderTitle ? h + titleH : h;
    
    ctx.save();
    
    // === SHADOW ===
    const execColor = pack.executing_color || "#00ff88";
    if (pack.shadow_size > 0) {
      if (isExecuting) {
        ctx.shadowColor = execColor;
        ctx.shadowBlur = pack.shadow_size * 3;
      } else if (pack.glow && selected) {
        const glowColor = pack.glow_color || pack.border_selected;
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = pack.shadow_size * 1.5;
      } else {
        ctx.shadowColor = pack.shadow_color;
        ctx.shadowBlur = pack.shadow_size;
      }
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = isExecuting ? 0 : (selected ? 0 : 4);
    }
    
    // === FULL NODE BACKGROUND (title + body) ===
    ctx.beginPath();
    if (collapsed) {
      // Collapsed node - just the title bar
      ctx.roundRect(0, fullY, w, titleH, r);
    } else {
      ctx.roundRect(0, fullY, w, fullH, r);
    }
    
    // Apply node opacity
    const nodeOpacity = pack.node_opacity || 1.0;
    ctx.globalAlpha = nodeOpacity;
    
    // Detect if node is bypassed
    const LGraphEventMode = globalThis?.LiteGraph?.LGraphEventMode || { BYPASS: 4 };
    const isBypassed = node.mode === LGraphEventMode.BYPASS;
    
    // Detect if node has errors
    const hasErrors = node.has_errors === true;
    
    if (isExecuting) {
      ctx.fillStyle = pack.node_selected;
    } else if (hasErrors) {
      ctx.fillStyle = pack.error_color || "#ff0000";
    } else if (isBypassed) {
      ctx.fillStyle = pack.bypass_color || "#666666";
    } else {
      ctx.fillStyle = selected ? pack.node_selected : pack.node_bg;
    }
    ctx.fill();
    
    // Reset alpha for other elements
    ctx.globalAlpha = 1.0;
    
    // Clear shadow for rest
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    
    // === GLASS EFFECT ===
    if (pack.glass && !collapsed) {
      const glassOpacity = pack.glass_opacity || 0.08;
      const grad = ctx.createLinearGradient(0, fullY, 0, fullY + fullH);
      grad.addColorStop(0, `rgba(255,255,255,${glassOpacity})`);
      grad.addColorStop(0.3, `rgba(255,255,255,${glassOpacity * 0.25})`);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(0, fullY, w, fullH, r);
      ctx.fill();
    }

    // Note: Title bar is drawn by drawTitleBarBackground which we override
    // to use our theme colors. We don't draw it here to avoid double-drawing.
    
    // === BORDER ===
    ctx.beginPath();
    if (collapsed) {
      ctx.roundRect(0.5, fullY + 0.5, w - 1, titleH - 1, r);
    } else {
      ctx.roundRect(0.5, fullY + 0.5, w - 1, fullH - 1, r);
    }
    if (isExecuting) {
      ctx.strokeStyle = execColor;
      ctx.lineWidth = 3;
    } else {
      ctx.strokeStyle = selected ? pack.border_selected : pack.border_color;
      ctx.lineWidth = selected ? 2 : 1;
    }
    ctx.stroke();
    
    // === GLOW FOR SELECTED (neon theme) ===
    if (selected && pack.glow && !isExecuting) {
      const glowColor = pack.glow_color || pack.border_selected;
      const glowIntensity = pack.glow_intensity || 20;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = glowIntensity;
      ctx.beginPath();
      ctx.roundRect(0, fullY, w, collapsed ? titleH : fullH, r);
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // === EXECUTING GLOW ===
    if (isExecuting) {
      ctx.shadowColor = execColor;
      ctx.shadowBlur = 25;
      ctx.beginPath();
      ctx.roundRect(0, fullY, w, collapsed ? titleH : fullH, r);
      ctx.strokeStyle = execColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // === SCANLINES (cyberpunk theme) ===
    if (pack.scanlines && !collapsed) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = "#00ffff";
      for (let sy = fullY; sy < fullY + fullH; sy += 3) {
        ctx.fillRect(0, sy, w, 1);
      }
      ctx.restore();
    }
    
    // === PROGRESS BAR (for executing nodes like KSampler) ===
    // Draw at top of body area (Y=0)
    if (node.progress != null && node.progress > 0 && !collapsed) {
      const progressColor = isExecuting ? execColor : accent;
      ctx.save();
      ctx.fillStyle = progressColor;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(0, 0, w * node.progress, 6);
      // Add a subtle glow effect
      ctx.shadowColor = progressColor;
      ctx.shadowBlur = 8;
      ctx.fillRect(0, 0, w * node.progress, 4);
      ctx.restore();
    }
    
    ctx.restore();
    
    // CRITICAL: Call onDrawBackground for image/video previews
    // This is where ComfyUI renders images in Preview/Save nodes
    if (node.onDrawBackground) {
      node.onDrawBackground(ctx);
    }
    
    // Draw title bar, title box, and title text
    // These are normally called by the original drawNodeShape after onDrawBackground
    const shouldRenderTitle = renderTitle; // reuse the variable from above
    
    if (shouldRenderTitle || titleMode === LiteGraph.TRANSPARENT_TITLE) {
      // Draw title bar background (our themed version)
      node.drawTitleBarBackground(ctx, {
        scale: this.ds?.scale || 1,
        low_quality: this.low_quality || false
      });
      
      // Draw title box (collapse button)
      node.drawTitleBox(ctx, {
        scale: this.ds?.scale || 1,
        low_quality: this.low_quality || false,
        box_size: 10
      });
      
      // Draw title text
      node.drawTitleText(ctx, {
        scale: this.ds?.scale || 1,
        default_title_color: this.node_title_color || "#ffffff",
        low_quality: this.low_quality || false
      });
      
      // Custom title render callback
      if (node.onDrawTitle) {
        node.onDrawTitle(ctx);
      }
    }
  };
  
  // Also apply theme to group nodes
  if (LGraphCanvas && LGraphCanvas.prototype.drawGroup) {
    const originalDrawGroup = LGraphCanvas.prototype.drawGroup;
    LGraphCanvas.prototype.drawGroup = function(group, ctx) {
      // If theme is disabled, use original rendering
      if (getPackId() === 'disabled') {
        return originalDrawGroup.call(this, group, ctx);
      }
      
      if (!group) return;
      
      const pack = getPack();
      
      // Store original group colors
      const originalColor = group.color;
      const originalFont = group.font;
      
      // Apply theme colors to group
      if (!group._originalColor) {
        group._originalColor = group.color;
      }
      
      // Use theme colors for group
      group.color = pack.node_bg;
      group.font = `${LiteGraph.NODE_TEXT_SIZE}px Arial`;
      
      // Call original draw function
      const result = originalDrawGroup.call(this, group, ctx);
      
      // Draw themed group styling
      if (group.size && group.pos) {
        const [x, y] = group.pos;
        const [w, h] = group.size;
        const r = Math.min(pack.corner_radius, 12);
        
        ctx.save();
        
        // Group background with theme colors
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = pack.node_selected;
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, r);
        ctx.fill();
        
        // Group border
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = pack.border_color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x + 1, y + 1, w - 2, h - 2, r);
        ctx.stroke();
        
        // Group title background
        if (group.title) {
          ctx.globalAlpha = 0.8;
          ctx.fillStyle = pack.node_title_bg;
          ctx.beginPath();
          ctx.roundRect(x, y, w, 30, [r, r, 0, 0]);
          ctx.fill();
          
          // Group title text
          ctx.globalAlpha = 1;
          ctx.fillStyle = pack.node_title_color;
          ctx.font = `bold ${LiteGraph.NODE_TEXT_SIZE + 2}px Arial`;
          ctx.textAlign = "center";
          ctx.fillText(group.title, x + w * 0.5, y + 20);
        }
        
        ctx.restore();
      }
      
      return result;
    };
  }

  console.log("[NiutonianNodeStyles] ✨ Theme applied:", pack.name);
  return true;
}

// Re-apply theme when pack changes
function reapplyTheme() {
  const LiteGraph = globalThis?.LiteGraph;
  const LGraphCanvas = globalThis?.LGraphCanvas;
  const pack = getPack();

  // Nodes 2.0 (Vue) uses DOM + CSS. We can re-apply instantly without touching LiteGraph.
  if (isVueNodesEnabled()) {
    applyNodes2Theme(pack);
    return;
  } else {
    // Ensure Nodes 2.0 stylesheet doesn't leak into legacy mode.
    clearNodes2Theme();
  }
  
  // Update LiteGraph color constants for the new theme
  if (LiteGraph) {
    LiteGraph.NODE_DEFAULT_COLOR = pack.node_bg;
    LiteGraph.NODE_DEFAULT_BGCOLOR = pack.node_bg;
    LiteGraph.NODE_DEFAULT_BOXCOLOR = "#ffffff";
    LiteGraph.NODE_TITLE_COLOR = "#ffffff"; // Force white for visibility
    LiteGraph.NODE_SELECTED_TITLE_COLOR = "#ffffff";
    LiteGraph.NODE_TEXT_COLOR = "#ffffff";
    LiteGraph.WIDGET_OUTLINE_COLOR = pack.border_color;
  }
  
  // Update canvas title color
  if (LGraphCanvas?.prototype) {
    LGraphCanvas.prototype.node_title_color = "#ffffff";
  }
  
  // Also update the active canvas instance
  if (app.canvas) {
    app.canvas.node_title_color = "#ffffff";
  }
  
  // Force all nodes to recalculate their size to match the new theme
  try {
    if (app.graph && app.graph._nodes) {
      for (const node of app.graph._nodes) {
        // Recalculate the node size based on current content
        const newSize = node.computeSize();
        // Only resize if the new size is larger (don't shrink user-resized nodes)
        if (newSize[0] > node.size[0] || newSize[1] > node.size[1]) {
          node.size[0] = Math.max(node.size[0], newSize[0]);
          node.size[1] = Math.max(node.size[1], newSize[1]);
        }
        // Mark node as dirty to force redraw
        node.setDirtyCanvas(true, true);
      }
    }
  } catch(e) {
    console.warn("[NiutonianNodeStyles] Could not resize nodes:", e);
  }
  
  // Force redraw
  try {
    app.canvas?.setDirty(true, true);
    app.graph?.setDirtyCanvas(true, true);
    globalThis.LGraphCanvas?.active_canvas?.setDirty(true, true);
  } catch(e) {}
}


// ═══════════════════════════════════════════════════════════════════════════════
// THEME EXPORT/IMPORT
// ═══════════════════════════════════════════════════════════════════════════════

// Export theme to JSON file
function exportTheme(theme, filename) {
  const themeName = theme?.name || "Custom Theme";
  const themeId = theme?.theme_id || safeThemeIdFromName(themeName);
  const exportData = {
    version: "1.1",
    type: "niutonian_theme",
    theme_id: themeId,
    theme: { ...theme, theme_id: themeId },
    exported_at: new Date().toISOString(),
    exported_by: "Niutonian Theme Customizer"
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = filename || `${safeDownloadName(themeName)}_theme.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Import theme from JSON file
function importTheme(callback) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.style.display = 'none';
  
  input.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        
        // Validate import data
        if (!importData.theme && !importData.themes) {
          alert('Invalid theme file format. No theme data found.');
          return;
        }
        
        if (!importData.type || (!importData.type.includes('niutonian_theme'))) {
          alert('Invalid theme file format. Please select a valid Niutonian theme file.');
          return;
        }
        
        let theme;
        if (importData.type === 'niutonian_theme_collection') {
          // For collections, we'll handle this in the callback
          callback(null, importData);
        } else {
          // Single theme
          theme = importData.theme;

          // Carry over theme_id if provided (older files may omit it)
          const inferredId = importData.theme_id || theme?.theme_id || safeThemeIdFromName(theme?.name);
          theme = { ...theme, theme_id: inferredId };
          
          // Ensure theme has required properties
          const requiredProps = ['name', 'node_bg', 'node_selected', 'border_color'];
          const missingProps = requiredProps.filter(prop => !theme[prop]);
          if (missingProps.length > 0) {
            alert(`Invalid theme file. Missing required properties: ${missingProps.join(', ')}`);
            return;
          }
          
          callback(theme, importData);
        }
      } catch (error) {
        console.error('[NiutonianNodeStyles] JSON parse error:', error);
        alert('Error reading theme file. Please ensure it\'s a valid JSON file.');
      }
    };
    
    reader.onerror = () => {
      alert('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
    document.body.removeChild(input);
  });
  
  document.body.appendChild(input);
  input.click();
}

// Export all custom themes
function exportAllCustomThemes() {
  const customThemes = loadCustomThemes();
  const themeCount = Object.keys(customThemes).length;
  
  if (themeCount === 0) {
    alert('No custom themes to export. Create some custom themes first!');
    return;
  }
  
  // Ensure every exported theme carries its id for round-tripping.
  const normalized = {};
  for (const [id, t] of Object.entries(customThemes)) {
    normalized[id] = { ...t, theme_id: t?.theme_id || id };
  }

  const exportData = {
    version: "1.1",
    type: "niutonian_theme_collection",
    themes: normalized,
    theme_count: themeCount,
    exported_at: new Date().toISOString(),
    exported_by: "Niutonian Theme Customizer"
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `niutonian_custom_themes_${themeCount}_themes.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
  
  alert(`Exported ${themeCount} custom themes successfully!`);
}

// Import theme collection
function importThemeCollection(callback) {
  importTheme((theme, importData) => {
    try {
      if (importData.type === 'niutonian_theme_collection') {
        // Multiple themes
        const themes = importData.themes;
        const themeCount = Object.keys(themes).length;
        
        if (confirm(`This file contains ${themeCount} themes. Do you want to import all of them?`)) {
          const customThemes = loadCustomThemes();
          let importedCount = 0;
          let skippedCount = 0;
          
          for (const [rawId, themeDataRaw] of Object.entries(themes)) {
            const themeId = safeThemeIdFromName(themeDataRaw?.theme_id || rawId || themeDataRaw?.name);
            const themeData = { ...themeDataRaw, theme_id: themeId };

            // Built-ins live in STYLE_PACKS; treat them like existing.
            const alreadyExists = !!customThemes[themeId] || !!STYLE_PACKS[themeId];

            if (alreadyExists) {
              if (confirm(`Theme "${themeData.name}" already exists. Do you want to overwrite it?`)) {
                customThemes[themeId] = themeData;
                importedCount++;
              } else {
                skippedCount++;
              }
            } else {
              customThemes[themeId] = themeData;
              importedCount++;
            }
          }
          
          saveCustomThemes(customThemes);
          alert(`Import complete! Imported: ${importedCount}, Skipped: ${skippedCount}`);
          
          if (callback) callback();
        }
      } else if (importData.type === 'niutonian_theme') {
        // Single theme - import it directly
        const customThemes = loadCustomThemes();
        const themeId = safeThemeIdFromName(importData.theme_id || theme?.theme_id || theme?.name);
        theme = { ...theme, theme_id: themeId };
        
        if (customThemes[themeId] || getAllThemes()[themeId]) {
          if (confirm(`Theme "${theme.name}" already exists. Do you want to overwrite it?`)) {
            customThemes[themeId] = theme;
            saveCustomThemes(customThemes);
            alert(`Theme "${theme.name}" imported successfully!`);
            if (callback) callback();
          }
        } else {
          customThemes[themeId] = theme;
          saveCustomThemes(customThemes);
          alert(`Theme "${theme.name}" imported successfully!`);
          if (callback) callback();
        }
      } else {
        alert('Invalid theme file format. Please select a valid Niutonian theme file.');
      }
    } catch (error) {
      console.error('[NiutonianNodeStyles] Import error:', error);
      alert('Error importing theme. Please check the console for details.');
    }
  });
}


// ═══════════════════════════════════════════════════════════════════════════════
// THEME CUSTOMIZER
// ═══════════════════════════════════════════════════════════════════════════════

// Create theme customizer dialog
function createThemeCustomizer() {
  // Remove existing customizer if any
  const existing = document.getElementById('niutonian-theme-customizer');
  if (existing) existing.remove();

  const dialog = document.createElement('div');
  dialog.id = 'niutonian-theme-customizer';
  dialog.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 600px;
    max-height: 80vh;
    background: #2a2a2a;
    border: 2px solid #555;
    border-radius: 8px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    z-index: 10000;
    font-family: Arial, sans-serif;
    color: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  const currentPack = getPack();
  const currentPackId = getPackId();
  const isCustomTheme = !STYLE_PACKS[currentPackId];

  // Normalize any rgba()/named colors to hex for <input type="color">.
  const ui = {
    node_bg: cssColorToHex(currentPack.node_bg, "#2a2a2a"),
    node_selected: cssColorToHex(currentPack.node_selected, "#3a3a3a"),
    node_title_bg: cssColorToHex(currentPack.node_title_bg, "#333333"),
    node_title_color: cssColorToHex(currentPack.node_title_color, "#ffffff"),
    border_color: cssColorToHex(currentPack.border_color, "#555555"),
    border_selected: cssColorToHex(currentPack.border_selected, "#007acc"),
    executing_color: cssColorToHex(currentPack.executing_color, "#00ff88"),
    glow_color: cssColorToHex(currentPack.glow_color || currentPack.border_selected, "#007acc"),
    bypass_color: cssColorToHex(currentPack.bypass_color || "#666666", "#666666"),
    error_color: cssColorToHex(currentPack.error_color || "#ff0000", "#ff0000"),
    shadow_color: cssColorToHex(currentPack.shadow_color || "rgba(0,0,0,0.5)", "#000000"),
  };

  dialog.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #555; background: #333;">
      <h2 style="margin: 0; color: #fff; font-size: 18px;">🎨 Theme Customizer</h2>
      <button id="close-customizer" style="position: absolute; top: 15px; right: 15px; background: #666; border: none; color: #fff; width: 25px; height: 25px; border-radius: 50%; cursor: pointer;">×</button>
    </div>
    
    <div style="padding: 20px; overflow-y: auto; flex: 1;">
      <div style="margin-bottom: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Theme Name:</label>
        <input type="text" id="theme-name" value="${isCustomTheme ? (currentPack.name || currentPackId) : (currentPack.name || '')}" placeholder="Enter custom theme name" 
               style="width: 100%; padding: 8px; background: #444; border: 1px solid #666; color: #fff; border-radius: 4px;">
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Node Background:</label>
          <input type="color" id="node-bg" value="${ui.node_bg}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Selected Background:</label>
          <input type="color" id="node-selected" value="${ui.node_selected}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Title Background:</label>
          <input type="color" id="node-title-bg" value="${ui.node_title_bg}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Title Text:</label>
          <input type="color" id="node-title-color" value="${ui.node_title_color}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Border Color:</label>
          <input type="color" id="border-color" value="${ui.border_color}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Selected Border:</label>
          <input type="color" id="border-selected" value="${ui.border_selected}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Executing Color:</label>
          <input type="color" id="executing-color" value="${ui.executing_color}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Glow Color:</label>
          <input type="color" id="glow-color" value="${ui.glow_color}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Bypass Color:</label>
          <input type="color" id="bypass-color" value="${ui.bypass_color}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Error Color:</label>
          <input type="color" id="error-color" value="${ui.error_color}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
        
        <div>
          <label style="display: block; margin-bottom: 5px; font-weight: bold;">Shadow Color:</label>
          <input type="color" id="shadow-color" value="${ui.shadow_color}" style="width: 100%; height: 35px; border: none; border-radius: 4px;">
        </div>
      </div>

      <div style="margin-top: 20px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Shadow Size: <span id="shadow-size-value">${currentPack.shadow_size}</span>px</label>
        <input type="range" id="shadow-size" min="0" max="50" value="${currentPack.shadow_size}" 
               style="width: 100%; accent-color: #007acc;">
      </div>

      <div style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Corner Radius: <span id="corner-radius-value">${currentPack.corner_radius}</span>px</label>
        <input type="range" id="corner-radius" min="0" max="20" value="${currentPack.corner_radius}" 
               style="width: 100%; accent-color: #007acc;">
      </div>

      <div style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Glow Intensity: <span id="glow-intensity-value">${currentPack.glow_intensity || 20}</span>px</label>
        <input type="range" id="glow-intensity" min="5" max="50" value="${currentPack.glow_intensity || 20}" 
               style="width: 100%; accent-color: #007acc;">
      </div>

      <div style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Glass Opacity: <span id="glass-opacity-value">${Math.round((currentPack.glass_opacity || 0.08) * 100)}</span>%</label>
        <input type="range" id="glass-opacity" min="1" max="20" value="${Math.round((currentPack.glass_opacity || 0.08) * 100)}" 
               style="width: 100%; accent-color: #007acc;">
      </div>

      <div style="margin-top: 15px;">
        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Node Opacity: <span id="node-opacity-value">${Math.round((currentPack.node_opacity || 1.0) * 100)}</span>%</label>
        <input type="range" id="node-opacity" min="10" max="100" value="${Math.round((currentPack.node_opacity || 1.0) * 100)}" 
               style="width: 100%; accent-color: #007acc;">
      </div>

      <div style="margin-top: 20px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="glass-effect" ${currentPack.glass ? 'checked' : ''} style="margin-right: 8px;">
          Glass Effect
        </label>
        
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="glow-effect" ${currentPack.glow ? 'checked' : ''} style="margin-right: 8px;">
          Glow Effect
        </label>
        
        <label style="display: flex; align-items: center; cursor: pointer;">
          <input type="checkbox" id="scanlines-effect" ${currentPack.scanlines ? 'checked' : ''} style="margin-right: 8px;">
          Scanlines
        </label>
      </div>
    </div>

    <div style="padding: 20px; border-top: 1px solid #555; background: #333; display: flex; gap: 10px; justify-content: space-between;">
      <div style="display: flex; gap: 8px;">
        <button id="export-theme" style="padding: 8px 16px; background: #6f42c1; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px;">Export</button>
        <button id="import-theme" style="padding: 8px 16px; background: #fd7e14; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px;">Import</button>
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="preview-theme" style="padding: 8px 16px; background: #007acc; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px;">Preview</button>
        <button id="save-theme" style="padding: 8px 16px; background: #28a745; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px;">Save Theme</button>
        <button id="save-as-theme" style="padding: 8px 16px; background: #17a2b8; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px;">Save As Custom</button>
        <button id="delete-theme" style="padding: 8px 16px; background: #dc3545; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px; ${isCustomTheme ? '' : 'display: none;'}">Delete</button>
        <button id="cancel-customizer" style="padding: 8px 16px; background: #666; border: none; color: #fff; border-radius: 4px; cursor: pointer; font-size: 13px;">Cancel</button>
      </div>
    </div>
  `;

  document.body.appendChild(dialog);

  // Add event listeners
  const shadowSizeSlider = dialog.querySelector('#shadow-size');
  const shadowSizeValue = dialog.querySelector('#shadow-size-value');
  const cornerRadiusSlider = dialog.querySelector('#corner-radius');
  const cornerRadiusValue = dialog.querySelector('#corner-radius-value');
  const glowIntensitySlider = dialog.querySelector('#glow-intensity');
  const glowIntensityValue = dialog.querySelector('#glow-intensity-value');
  const glassOpacitySlider = dialog.querySelector('#glass-opacity');
  const glassOpacityValue = dialog.querySelector('#glass-opacity-value');
  const nodeOpacitySlider = dialog.querySelector('#node-opacity');
  const nodeOpacityValue = dialog.querySelector('#node-opacity-value');

  shadowSizeSlider.addEventListener('input', () => {
    shadowSizeValue.textContent = shadowSizeSlider.value;
  });

  cornerRadiusSlider.addEventListener('input', () => {
    cornerRadiusValue.textContent = cornerRadiusSlider.value;
  });

  glowIntensitySlider.addEventListener('input', () => {
    glowIntensityValue.textContent = glowIntensitySlider.value;
  });

  glassOpacitySlider.addEventListener('input', () => {
    glassOpacityValue.textContent = glassOpacitySlider.value;
  });

  nodeOpacitySlider.addEventListener('input', () => {
    nodeOpacityValue.textContent = nodeOpacitySlider.value;
  });

  // Export theme
  dialog.querySelector('#export-theme').addEventListener('click', () => {
    const currentTheme = getThemeFromDialog(dialog);
    const themeName = currentTheme.name || currentPack.name || 'Custom Theme';
    currentTheme.name = themeName;
    
    exportTheme(currentTheme);
    alert(`Theme "${themeName}" exported successfully!`);
  });

  // Import theme
  dialog.querySelector('#import-theme').addEventListener('click', () => {
    importTheme((theme, importData) => {
      try {
        if (!theme && importData.type === 'niutonian_theme_collection') {
          alert('This is a theme collection file. Please use the main menu "Import Themes" option to import collections.');
          return;
        }
        
        if (!theme) {
          alert('No theme data found in the file.');
          return;
        }
        
        // Ask if user wants to load the imported theme into the customizer
        if (confirm(`Import theme "${theme.name}"? This will replace the current customizer settings.`)) {
          // Update all the form fields with imported theme data
          dialog.querySelector('#theme-name').value = theme.name || '';
          dialog.querySelector('#node-bg').value = cssColorToHex(theme.node_bg || '#2a2a2a', '#2a2a2a');
          dialog.querySelector('#node-selected').value = cssColorToHex(theme.node_selected || '#3a3a3a', '#3a3a3a');
          dialog.querySelector('#node-title-bg').value = cssColorToHex(theme.node_title_bg || '#333333', '#333333');
          dialog.querySelector('#node-title-color').value = cssColorToHex(theme.node_title_color || '#ffffff', '#ffffff');
          dialog.querySelector('#border-color').value = cssColorToHex(theme.border_color || '#555555', '#555555');
          dialog.querySelector('#border-selected').value = cssColorToHex(theme.border_selected || '#007acc', '#007acc');
          dialog.querySelector('#executing-color').value = cssColorToHex(theme.executing_color || '#00ff88', '#00ff88');
          dialog.querySelector('#glow-color').value = cssColorToHex(theme.glow_color || '#007acc', '#007acc');
          dialog.querySelector('#bypass-color').value = cssColorToHex(theme.bypass_color || '#666666', '#666666');
          dialog.querySelector('#error-color').value = cssColorToHex(theme.error_color || '#ff0000', '#ff0000');
          
          // Shadow color conversion (supports rgba(), named colors, etc.)
          dialog.querySelector('#shadow-color').value = cssColorToHex(theme.shadow_color || 'rgba(0,0,0,0.5)', '#000000');
          
          // Update sliders
          const shadowSize = theme.shadow_size || 12;
          dialog.querySelector('#shadow-size').value = shadowSize;
          dialog.querySelector('#shadow-size-value').textContent = shadowSize;
          
          const cornerRadius = theme.corner_radius || 8;
          dialog.querySelector('#corner-radius').value = cornerRadius;
          dialog.querySelector('#corner-radius-value').textContent = cornerRadius;
          
          const glowIntensity = theme.glow_intensity || 20;
          dialog.querySelector('#glow-intensity').value = glowIntensity;
          dialog.querySelector('#glow-intensity-value').textContent = glowIntensity;
          
          const glassOpacity = Math.round((theme.glass_opacity || 0.08) * 100);
          dialog.querySelector('#glass-opacity').value = glassOpacity;
          dialog.querySelector('#glass-opacity-value').textContent = glassOpacity;
          
          const nodeOpacity = Math.round((theme.node_opacity || 1.0) * 100);
          dialog.querySelector('#node-opacity').value = nodeOpacity;
          dialog.querySelector('#node-opacity-value').textContent = nodeOpacity;
          
          // Update checkboxes
          dialog.querySelector('#glass-effect').checked = theme.glass || false;
          dialog.querySelector('#glow-effect').checked = theme.glow || false;
          dialog.querySelector('#scanlines-effect').checked = theme.scanlines || false;
          
          alert(`Theme "${theme.name}" loaded into customizer! You can now preview, modify, or save it.`);
        }
      } catch (error) {
        console.error('[NiutonianNodeStyles] Customizer import error:', error);
        alert('Error loading theme into customizer. Please check the console for details.');
      }
    });
  });

  // Close dialog
  function closeDialog() {
    dialog.remove();
  }

  dialog.querySelector('#close-customizer').addEventListener('click', closeDialog);
  dialog.querySelector('#cancel-customizer').addEventListener('click', closeDialog);

  // Preview theme
  dialog.querySelector('#preview-theme').addEventListener('click', () => {
    const previewTheme = getThemeFromDialog(dialog);
    previewThemeTemporarily(previewTheme);
  });

  // Save theme (overwrite current)
  dialog.querySelector('#save-theme').addEventListener('click', () => {
    const themeName = dialog.querySelector('#theme-name').value.trim();
    if (!themeName) {
      alert('Please enter a theme name');
      return;
    }

    // Check if trying to overwrite a built-in theme
    if (STYLE_PACKS[currentPackId] && !isCustomTheme) {
      alert('Cannot overwrite built-in themes. Use "Save As Custom" to create a new theme based on this one.');
      return;
    }

    const newTheme = getThemeFromDialog(dialog);
    newTheme.name = themeName;

    // Save to custom themes
    const customThemes = loadCustomThemes();
    const themeId = themeName.toLowerCase().replace(/\s+/g, '_');
    customThemes[themeId] = newTheme;
    saveCustomThemes(customThemes);

    // Apply the theme
    setPackId(themeId);
    reapplyTheme();

    const action = isCustomTheme ? 'updated' : 'saved';
    alert(`Theme "${themeName}" ${action} successfully!`);
    closeDialog();
  });

  // Save as custom theme (always prompt for new name)
  dialog.querySelector('#save-as-theme').addEventListener('click', () => {
    // Suggest a default name based on current theme
    const currentThemeName = currentPack.name || 'Custom Theme';
    const suggestedName = isCustomTheme ? 
      `${currentThemeName} Copy` : 
      `Custom ${currentThemeName}`;
    
    // Create a dialog to get the new theme name
    const newThemeName = prompt(`Enter a name for the new custom theme:`, suggestedName);
    if (!newThemeName || !newThemeName.trim()) {
      return;
    }

    const themeId = newThemeName.toLowerCase().replace(/\s+/g, '_');
    const customThemes = loadCustomThemes();
    const allThemes = getAllThemes();

    // Check if theme name already exists
    if (allThemes[themeId]) {
      if (!confirm(`A theme named "${newThemeName}" already exists. Do you want to overwrite it?`)) {
        return;
      }
    }

    const newTheme = getThemeFromDialog(dialog);
    newTheme.name = newThemeName.trim();

    // Save to custom themes
    customThemes[themeId] = newTheme;
    saveCustomThemes(customThemes);

    // Apply the new theme
    setPackId(themeId);
    reapplyTheme();

    alert(`Custom theme "${newThemeName}" created and applied successfully!`);
    closeDialog();
  });

  // Delete theme
  const deleteBtn = dialog.querySelector('#delete-theme');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete the theme "${currentPack.name}"?`)) {
        const customThemes = loadCustomThemes();
        delete customThemes[currentPackId];
        saveCustomThemes(customThemes);

        // Switch to default theme
        setPackId('modern');
        reapplyTheme();

        alert('Theme deleted successfully!');
        closeDialog();
      }
    });
  }

  return dialog;
}

// Get theme configuration from dialog inputs
function getThemeFromDialog(dialog) {
  const shadowColor = dialog.querySelector('#shadow-color').value;
  const shadowColorRgba = hexToRgba(shadowColor, 0.5);

  return {
    name: dialog.querySelector('#theme-name').value.trim(),
    node_bg: dialog.querySelector('#node-bg').value,
    node_selected: dialog.querySelector('#node-selected').value,
    node_title_bg: dialog.querySelector('#node-title-bg').value,
    node_title_color: dialog.querySelector('#node-title-color').value,
    border_color: dialog.querySelector('#border-color').value,
    border_selected: dialog.querySelector('#border-selected').value,
    executing_color: dialog.querySelector('#executing-color').value,
    glow_color: dialog.querySelector('#glow-color').value,
    bypass_color: dialog.querySelector('#bypass-color').value,
    error_color: dialog.querySelector('#error-color').value,
    shadow_color: shadowColorRgba,
    shadow_size: parseInt(dialog.querySelector('#shadow-size').value),
    corner_radius: parseInt(dialog.querySelector('#corner-radius').value),
    glow_intensity: parseInt(dialog.querySelector('#glow-intensity').value),
    glass_opacity: parseInt(dialog.querySelector('#glass-opacity').value) / 100,
    node_opacity: parseInt(dialog.querySelector('#node-opacity').value) / 100,
    glass: dialog.querySelector('#glass-effect').checked,
    glow: dialog.querySelector('#glow-effect').checked,
    scanlines: dialog.querySelector('#scanlines-effect').checked,
  };
}

// Convert hex color to rgba
function hexToRgba(hex, alpha = 1) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Preview theme temporarily
function previewThemeTemporarily(theme) {
  // Store current theme
  const originalPackId = getPackId();
  
  // Apply preview theme temporarily
  const customThemes = loadCustomThemes();
  customThemes['__preview__'] = theme;
  saveCustomThemes(customThemes);
  
  setPackId('__preview__');
  reapplyTheme();
  
  // Revert after 3 seconds
  setTimeout(() => {
    const customThemes = loadCustomThemes();
    delete customThemes['__preview__'];
    saveCustomThemes(customThemes);
    
    setPackId(originalPackId);
    reapplyTheme();
  }, 3000);
}


// ═══════════════════════════════════════════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════════════════════════════════════════

function buildMenu() {
  const currentPack = getPackId();
  const allThemes = getAllThemes();
  const customThemes = loadCustomThemes();
  
  // Start with disable option
  const themeOptions = [
    {
      content: `${currentPack === 'disabled' ? "✓ " : "  "}⏸️ Disable Theme`,
      callback: () => {
        setPackId('disabled');
        reapplyTheme();
        console.log("[NiutonianNodeStyles] Theme disabled");
      },
    },
    null, // separator
  ];
  
  // Add all themes
  Object.entries(allThemes).forEach(([id, pack]) => {
    themeOptions.push({
      content: `${currentPack === id ? "✓ " : "  "}${pack.name}${!STYLE_PACKS[id] ? " (Custom)" : ""}`,
      callback: () => {
        setPackId(id);
        reapplyTheme();
        console.log("[NiutonianNodeStyles] Switched to:", pack.name);
      },
    });
  });

  // Add separator and customizer options
  themeOptions.push(null); // separator
  themeOptions.push({
    content: "🎨 Customize Theme...",
    callback: () => {
      createThemeCustomizer();
    },
  });

  themeOptions.push({
    content: "➕ Create New Theme...",
    callback: () => {
      // Create customizer with default values
      const defaultTheme = {
        name: "",
        node_bg: "#2a2a2a",
        node_selected: "#3a3a3a",
        node_title_bg: "#333333",
        node_title_color: "#ffffff",
        border_color: "#555555",
        border_selected: "#007acc",
        executing_color: "#00ff88",
        glow_color: "#007acc",
        bypass_color: "#666666",
        error_color: "#ff0000",
        shadow_color: "rgba(0,0,0,0.5)",
        shadow_size: 12,
        corner_radius: 8,
        glow_intensity: 20,
        glass_opacity: 0.08,
        node_opacity: 1.0,
        glass: false,
        glow: false,
        scanlines: false,
      };
      
      // Temporarily set preview theme
      const customThemes = loadCustomThemes();
      customThemes['__new__'] = defaultTheme;
      saveCustomThemes(customThemes);
      
      const originalPackId = getPackId();
      setPackId('__new__');
      reapplyTheme();
      
      createThemeCustomizer();
      
      // Clean up when dialog is closed
      setTimeout(() => {
        const customThemes = loadCustomThemes();
        if (customThemes['__new__']) {
          delete customThemes['__new__'];
          saveCustomThemes(customThemes);
          if (getPackId() === '__new__') {
            setPackId(originalPackId);
            reapplyTheme();
          }
        }
      }, 100);
    },
  });

  // Add separator and import/export options
  themeOptions.push(null); // separator
  
  themeOptions.push({
    content: "📤 Export All Custom Themes",
    callback: () => {
      exportAllCustomThemes();
    },
  });

  themeOptions.push({
    content: "📥 Import Themes...",
    callback: () => {
      importThemeCollection();
    },
  });

  return [
    null,
    {
      content: "🎨 Niutonian Theme",
      has_submenu: true,
      submenu: {
        options: themeOptions,
      },
    },
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTENSION
// ═══════════════════════════════════════════════════════════════════════════════

app.registerExtension({
  name: "Niutonian.NodeStyles",
  
  async setup() {
    console.log("[NiutonianNodeStyles] 🚀 Loading...");

    // Apply the right theming layer depending on whether Nodes 2.0 is enabled.
    // - Nodes 2.0: CSS variables + injected stylesheet
    // - Legacy canvas: LiteGraph hooks
    const initialVue = isVueNodesEnabled();
    if (initialVue) {
      applyNodes2Theme(getPack());
    } else {
      applyTheme();
      // Retry until LiteGraph is ready (legacy canvas mode only)
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (isVueNodesEnabled() || applyTheme() || attempts >= 50) {
          clearInterval(interval);
        }
      }, 200);
    }

    // Watch for mode switches (Nodes 2.0 <-> Legacy) and re-apply the active pack.
    // ComfyUI reloads on toggle in most builds, but not always (and extensions can hot-reload).
    let lastVue = initialVue;
    setInterval(() => {
      const nowVue = isVueNodesEnabled();
      if (nowVue !== lastVue) {
        lastVue = nowVue;
        // When switching to legacy, remove Nodes 2.0 CSS to avoid leaking styles.
        if (!nowVue) clearNodes2Theme();
        reapplyTheme();
      }
    }, 1000);
    
    // Keyboard shortcuts (Alt+1 through Alt+0 for 10 themes)
    document.addEventListener("keydown", (e) => {
      if (e.altKey && e.key >= "0" && e.key <= "9") {
        const packIds = Object.keys(STYLE_PACKS);
        // Alt+1 = index 0, Alt+2 = index 1, ..., Alt+0 = index 9
        const index = e.key === "0" ? 9 : parseInt(e.key) - 1;
        if (index < packIds.length) {
          setPackId(packIds[index]);
          reapplyTheme();
        }
        e.preventDefault();
      }
    });
    
    // Track currently executing node ID
    let currentExecutingNodeId = null;
    
    // Listen for execution events to track running nodes
    api.addEventListener("executing", ({ detail }) => {
      // detail is the node ID (string or null when execution completes)
      currentExecutingNodeId = detail;
      
      if (app.graph && app.graph._nodes) {
        for (const node of app.graph._nodes) {
          // Mark node as executing if its ID matches
          node.is_executing = (detail !== null && String(node.id) === String(detail));
        }
        // Force immediate redraw
        if (app.canvas) {
          app.canvas.setDirty(true, true);
          app.canvas.draw(true, true);
        }
      }
    });
    
    api.addEventListener("executed", ({ detail }) => {
      // Clear execution state for the completed node
      // detail.node contains the node ID that finished
      if (app.graph && app.graph._nodes && detail?.node) {
        for (const node of app.graph._nodes) {
          if (String(node.id) === String(detail.node)) {
            node.is_executing = false;
          }
        }
        if (app.canvas) {
          app.canvas.setDirty(true, true);
        }
      }
    });
    
    api.addEventListener("execution_start", ({ detail }) => {
      // Clear all execution states at start of new prompt
      currentExecutingNodeId = null;
      if (app.graph && app.graph._nodes) {
        for (const node of app.graph._nodes) {
          node.is_executing = false;
        }
      }
    });
    
    api.addEventListener("execution_error", ({ detail }) => {
      // Clear all execution states on error
      currentExecutingNodeId = null;
      if (app.graph && app.graph._nodes) {
        for (const node of app.graph._nodes) {
          node.is_executing = false;
        }
        if (app.canvas) {
          app.canvas.setDirty(true, true);
        }
      }
    });
    
    // Also listen to progress events - these fire during node execution
    api.addEventListener("progress", ({ detail }) => {
      // detail contains: { value, max, prompt_id, node }
      // The 'node' field is the currently executing node ID
      if (detail?.node && app.graph && app.graph._nodes) {
        const execNodeId = String(detail.node);
        for (const node of app.graph._nodes) {
          // Check if this node matches the executing node
          // Handle both simple IDs and execution IDs (with colons for subgraphs)
          const nodeIdStr = String(node.id);
          node.is_executing = (nodeIdStr === execNodeId || execNodeId.endsWith(':' + nodeIdStr));
        }
        if (app.canvas) {
          app.canvas.setDirty(true, true);
        }
      }
    });
    
    // Add per-node theme menu to node context menu
    // This is done through ComfyUI's extension API
  },
  
  // Add per-node theme options to node context menu
  nodeCreated(node) {
    // Store original getExtraMenuOptions if it exists
    const originalGetExtraMenuOptions = node.getExtraMenuOptions;
    
    node.getExtraMenuOptions = function(canvas, options) {
      // Call original if it exists
      if (originalGetExtraMenuOptions) {
        originalGetExtraMenuOptions.call(this, canvas, options);
      }
      
      // Don't add theme options if global theme is disabled
      if (getPackId() === 'disabled') {
        return;
      }
      
      // Build per-node theme submenu
      const nodeThemeOptions = buildNodeThemeMenu(this);
      
      // Add separator and theme submenu
      options.push(null); // separator
      options.push({
        content: "🎨 Node Theme",
        has_submenu: true,
        submenu: {
          options: nodeThemeOptions,
        },
      });
    };
  },
});

// Build per-node theme menu options
function buildNodeThemeMenu(node) {
  const currentNodeTheme = getNodeThemeId(node);
  const globalThemeId = getPackId();
  const allThemes = getAllThemes();
  
  const options = [];
  
  // Option to use global theme (remove per-node override)
  options.push({
    content: `${currentNodeTheme === 'global' ? "✓ " : "  "}🌐 Use Global Theme (${getPack().name})`,
    callback: () => {
      setNodeTheme(node, 'global');
    },
  });
  
  options.push(null); // separator
  
  // Add all available themes
  Object.entries(allThemes).forEach(([id, pack]) => {
    const isSelected = currentNodeTheme === id;
    const isCustom = !STYLE_PACKS[id];
    options.push({
      content: `${isSelected ? "✓ " : "  "}${pack.name}${isCustom ? " (Custom)" : ""}`,
      callback: () => {
        setNodeTheme(node, id);
      },
    });
  });
  
  return options;
}

// Also add to LiteGraph menu
setTimeout(() => {
  const LGC = globalThis?.LGraphCanvas;
  if (LGC) {
    const orig = LGC.prototype.getCanvasMenuOptions;
    LGC.prototype.getCanvasMenuOptions = function() {
      return [...(orig?.call(this) || []), ...buildMenu()];
    };
  }
}, 2000);

export { STYLE_PACKS, getPackId, setPackId };
