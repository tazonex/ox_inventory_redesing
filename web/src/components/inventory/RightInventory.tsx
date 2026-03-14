import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectRightInventory } from '../../store/inventory';

interface Props {
  actionButton?: React.ReactNode;
}

const RightInventory: React.FC<Props> = ({ actionButton }) => {
  const rightInventory = useAppSelector(selectRightInventory);

  return <InventoryGrid inventory={rightInventory} actionButton={actionButton} />;
};

export default RightInventory;
