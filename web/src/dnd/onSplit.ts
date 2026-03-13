import { store } from '../store';
import { Items } from '../store/items';
import { SlotWithItem } from '../typings';
import { isSlotWithItem, findAvailableSlot } from '../helpers';
import { validateMove } from '../thunks/validateItems';
import { moveSlots } from '../store/inventory';

export const onSplit = (item: SlotWithItem, amount: number) => {
    const { inventory: state } = store.getState();
    const sourceSlot = state.leftInventory.items[item.slot - 1] as SlotWithItem;

    if (!sourceSlot?.name || sourceSlot.count <= 1 || amount >= sourceSlot.count) return;

    const sourceData = Items[sourceSlot.name];
    if (!sourceData) return;

    // Find an empty slot in player inventory
    const emptySlot = state.leftInventory.items.find((s) => !s.name);
    if (!emptySlot) return;

    const data = {
        fromSlot: sourceSlot,
        toSlot: emptySlot,
        fromType: 'player' as const,
        toType: 'player' as const,
        count: amount,
    };

    // Server-side validation
    store.dispatch(
        validateMove({
            fromSlot: sourceSlot.slot,
            toSlot: emptySlot.slot,
            fromType: 'player',
            toType: 'player',
            count: amount,
        })
    );

    // Client-side UI update
    store.dispatch(moveSlots(data));
};
