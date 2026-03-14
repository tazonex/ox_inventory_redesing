import InventoryGrid from './InventoryGrid';
import { useAppSelector } from '../../store';
import { selectLeftInventory } from '../../store/inventory';

interface Props {
  actionButton?: React.ReactNode;
}

const LeftInventory: React.FC<Props> = ({ actionButton }) => {
  const leftInventory = useAppSelector(selectLeftInventory);

  return <InventoryGrid inventory={leftInventory} actionButton={actionButton} />;
};

export default LeftInventory;
