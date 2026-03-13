const STORAGE_KEY = 'ox_inv:uiscale';
const BASE_CELL_VH = 5.8;
const DEFAULT_SCALE = 1.0;
const MIN_SCALE = 0.7;
const MAX_SCALE = 1.5;
const STEP = 0.05;

let currentScale = DEFAULT_SCALE;

function loadScale(): number {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const val = parseFloat(stored);
            if (!isNaN(val) && val >= MIN_SCALE && val <= MAX_SCALE) return val;
        }
    } catch { }
    return DEFAULT_SCALE;
}

function applyCssVariable(scale: number) {
    document.documentElement.style.setProperty('--cell-size', `${BASE_CELL_VH * scale}vh`);
}

currentScale = loadScale();
applyCssVariable(currentScale);

export function getScale(): number {
    return currentScale;
}

export function setScaleValue(scale: number) {
    currentScale = Math.round(Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale)) * 100) / 100;
}

export function applyScale() {
    applyCssVariable(currentScale);
    try {
        localStorage.setItem(STORAGE_KEY, String(currentScale));
    } catch { }
}

export function getCellSizePx(): number {
    return window.innerHeight * (BASE_CELL_VH / 100) * currentScale;
}

export { MIN_SCALE, MAX_SCALE, STEP, DEFAULT_SCALE };
