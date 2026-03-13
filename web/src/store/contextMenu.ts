import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SlotWithItem } from '../typings';

interface ContextMenuState {
  coords: {
    x: number;
    y: number;
  } | null;
  item: SlotWithItem | null;
  splitAmount: number | null;
  inventoryType: string | null;
}

const initialState: ContextMenuState = {
  coords: null,
  item: null,
  splitAmount: null,
  inventoryType: null,
};

export const contextMenuSlice = createSlice({
  name: 'contextMenu',
  initialState,
  reducers: {
    openContextMenu(state, action: PayloadAction<{ item: SlotWithItem; coords: { x: number; y: number }; inventoryType?: string }>) {
      state.coords = action.payload.coords;
      state.item = action.payload.item;
      state.splitAmount = 1;
      state.inventoryType = action.payload.inventoryType || 'player';
    },
    closeContextMenu(state) {
      state.coords = null;
    },
    setSplitAmount(state, action: PayloadAction<number>) {
      state.splitAmount = action.payload;
    },
    clearSplit(state) {
      state.coords = null;
      state.item = null;
      state.splitAmount = null;
    },
  },
});

export const { openContextMenu, closeContextMenu, setSplitAmount, clearSplit } = contextMenuSlice.actions;

export default contextMenuSlice.reducer;
