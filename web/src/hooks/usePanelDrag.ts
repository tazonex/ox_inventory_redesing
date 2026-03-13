import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_PREFIX = 'ox_inventory_panel_pos';

interface Position {
    x: number;
    y: number;
}

const getStoredPosition = (key: string): Position | null => {
    try {
        const stored = localStorage.getItem(`${STORAGE_PREFIX}_${key}`);
        if (stored) {
            const pos = JSON.parse(stored) as Position;
            if (typeof pos.x === 'number' && typeof pos.y === 'number') return pos;
        }
    } catch { }
    return null;
};

const storePosition = (key: string, pos: Position) => {
    try {
        localStorage.setItem(`${STORAGE_PREFIX}_${key}`, JSON.stringify(pos));
    } catch { }
};

export const clearStoredPosition = (key: string) => {
    try {
        localStorage.removeItem(`${STORAGE_PREFIX}_${key}`);
    } catch { }
};

const clampPosition = (x: number, y: number, elWidth: number, elHeight: number): Position => {
    const maxX = window.innerWidth - Math.min(200, elWidth * 0.3);
    const maxY = window.innerHeight - Math.min(100, elHeight * 0.25);
    const minY = -(elHeight * 0.75);
    return {
        x: Math.max(-elWidth + 200, Math.min(x, maxX)),
        y: Math.max(minY, Math.min(y, maxY)),
    };
};

export const usePanelDrag = (panelKey: string = 'primary') => {
    const [position, setPosition] = useState<Position | null>(() => getStoredPosition(panelKey));
    const panelRef = useRef<HTMLDivElement | null>(null);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef<Position>({ x: 0, y: 0 });
    const currentPosRef = useRef<Position | null>(position);
    const rafRef = useRef<number>(0);

    // Keep currentPosRef in sync with state
    currentPosRef.current = position;

    const onMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        const interactiveSelectors = 'input, button, select, textarea, [role="slider"], .inventory-slot, .inventory-grid-container, .ctx-menu-wrapper, .inventory-search-container';
        if (target.closest(interactiveSelectors)) return;

        e.preventDefault();
        const panel = panelRef.current;
        if (!panel) return;

        isDraggingRef.current = true;
        const rect = panel.getBoundingClientRect();
        dragOffsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        const onMouseMove = (e: MouseEvent) => {
            if (!isDraggingRef.current || !panelRef.current) return;

            // Cancel previous frame to avoid stacking
            if (rafRef.current) cancelAnimationFrame(rafRef.current);

            rafRef.current = requestAnimationFrame(() => {
                const panel = panelRef.current;
                if (!panel) return;

                const rect = panel.getBoundingClientRect();
                const newPos = clampPosition(
                    e.clientX - dragOffsetRef.current.x,
                    e.clientY - dragOffsetRef.current.y,
                    rect.width,
                    rect.height
                );

                // Direct DOM update — no React re-render during drag
                panel.style.position = 'fixed';
                panel.style.left = `${newPos.x}px`;
                panel.style.top = `${newPos.y}px`;
                panel.style.transform = 'none';
                currentPosRef.current = newPos;
            });
        };

        const onMouseUp = () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';

            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
                rafRef.current = 0;
            }

            // Persist position to state + localStorage only on release
            const finalPos = currentPosRef.current;
            if (finalPos) {
                setPosition(finalPos);
                storePosition(panelKey, finalPos);
            }
        };

        window.addEventListener('mousemove', onMouseMove, { passive: true });
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [panelKey]);

    const resetPosition = useCallback(() => {
        clearStoredPosition(panelKey);
        setPosition(null);
        // Also reset DOM directly
        if (panelRef.current) {
            panelRef.current.style.position = '';
            panelRef.current.style.left = '';
            panelRef.current.style.top = '';
            panelRef.current.style.transform = '';
        }
    }, [panelKey]);

    const panelStyle: React.CSSProperties = position
        ? {
            position: 'fixed',
            left: position.x,
            top: position.y,
            transform: 'none',
            cursor: 'grab',
        }
        : { cursor: 'grab' };

    return { panelRef, panelStyle, onMouseDown, resetPosition };
};
