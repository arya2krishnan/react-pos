import { IconButton } from '@mui/joy';
import DeleteIcon from '@mui/icons-material/Delete';

interface OrderTrashButtonProps {
  onDelete: () => void;
}

export default function OrderTrashButton({ onDelete }: OrderTrashButtonProps) {
  return (
    <IconButton 
      variant="soft" 
      color="danger" 
      size="sm"
      onClick={onDelete}
      title="Delete order"
    >
      <DeleteIcon />
    </IconButton>
  );
} 