import React, { useState, useEffect, useMemo } from 'react';
import useNuiEvent from '../../hooks/useNuiEvent';
import InventoryHotbar from './InventoryHotbar';
import { useAppDispatch, useAppSelector } from '../../store';
import { refreshSlots, setAdditionalMetadata, setupInventory, selectRightInventory, clearRightInventory } from '../../store/inventory';
import { useExitListener } from '../../hooks/useExitListener';
import type { Inventory as InventoryProps } from '../../typings';
import RightInventory from './RightInventory';
import LeftInventory from './LeftInventory';
import Tooltip from '../utils/Tooltip';
import { closeTooltip } from '../../store/tooltip';
import InventoryContext from './InventoryContext';
import { closeContextMenu } from '../../store/contextMenu';
import Fade from '../utils/transitions/Fade';
import UsefulControls from './UsefulControls';
import { usePanelDrag } from '../../hooks/usePanelDrag';
import { fetchNui } from '../../utils/fetchNui';

const Inventory: React.FC = () => {
  const [inventoryVisible, setInventoryVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);
  const dispatch = useAppDispatch();
  const rightInventory = useAppSelector(selectRightInventory);

  // Independent dragging for each panel
  const primary = usePanelDrag('primary');
  const secondary = usePanelDrag('secondary');

  // Count items in secondary
  const secondaryItemCount = useMemo(
    () => rightInventory.items.filter((item) => item.name).length,
    [rightInventory.items]
  );

  // Secondary inventory is visible when it has valid data
  // For drop panels, also hide when items reach 0 (without clearing state)
  const hasSecondary = !!(rightInventory.id && rightInventory.slots > 0) &&
    !(rightInventory.type === 'drop' && secondaryItemCount === 0);

  useNuiEvent<boolean>('setInventoryVisible', setInventoryVisible);
  useNuiEvent<false>('closeInventory', () => {
    setInventoryVisible(false);
    setInfoVisible(false);
    dispatch(closeContextMenu());
    dispatch(closeTooltip());
  });
  useExitListener(setInventoryVisible);

  useNuiEvent<{
    leftInventory?: InventoryProps;
    rightInventory?: InventoryProps;
  }>('setupInventory', (data) => {
    dispatch(setupInventory(data));
    !inventoryVisible && setInventoryVisible(true);
  });

  useNuiEvent('refreshSlots', (data) => dispatch(refreshSlots(data)));

  useNuiEvent('displayMetadata', (data: Array<{ metadata: string; value: string }>) => {
    dispatch(setAdditionalMetadata(data));
  });

  const resetAllPositions = () => {
    primary.resetPosition();
    secondary.resetPosition();
  };

  return (
    <>
      <UsefulControls infoVisible={infoVisible} setInfoVisible={setInfoVisible} resetPanelPosition={resetAllPositions} />
      <Fade in={inventoryVisible}>
        <div className="inventory-wrapper">
          {/* Primary Panel - independently draggable */}
          <div
            ref={primary.panelRef}
            className="inventory-panel animate-slideInLeft"
            style={primary.panelStyle}
            onMouseDown={primary.onMouseDown}
          >
            <LeftInventory />
          </div>

          {/* Secondary Panel - independently draggable */}
          {hasSecondary && (
            <div
              ref={secondary.panelRef}
              className="inventory-panel inventory-panel--secondary"
              style={secondary.panelStyle}
              onMouseDown={secondary.onMouseDown}
            >
              {/* Close X button in header */}
              <div className="inventory-panel-header">
                <span className="inventory-panel-header-label">{rightInventory.label || 'Inventory'}</span>
                <button className="inventory-panel-close" onClick={() => fetchNui('exit')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18" /><path d="M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <RightInventory />
            </div>
          )}

          <Tooltip />
          <InventoryContext />
          <button className="useful-controls-button" onClick={() => setInfoVisible(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="2em" viewBox="0 0 524 524">
              <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
            </svg>
          </button>
        </div>
      </Fade>
      <InventoryHotbar />
    </>
  );
};

export default Inventory;
