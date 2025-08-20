import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Typography from '@mui/joy/Typography';
import ItemOptions, { ItemOptionsProps } from './ItemOptions';
import { ButtonGroup, IconButton, Stack, Box } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export interface ItemOptionsModalProps {
    item: string;
    options: ItemOptionsProps[];
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (selectedValues: Record<string, string[]>, quantity: number) => void;
    imageUrl?: string;
};

export default function ItemOptionsModal(props: ItemOptionsModalProps) {
  const [selectedValues, setSelectedValues] = React.useState<{ [key: string]: string[] }>({});
  const [total, setTotal] = React.useState(1);

  // Initialize default selected values when modal opens
  React.useEffect(() => {
    if (props.isOpen && props.options.length > 0) {
      const initialValues: Record<string, string[]> = {};
      
      // Set default selections (first option for each category)
      props.options.forEach(option => {
        if (option.options.length > 0) {
          if (option.isMultiple) {
            initialValues[option.option] = [];
          } else {
            initialValues[option.option] = [option.options[0]];
          }
        }
      });
      
      setSelectedValues(initialValues);
    }
  }, [props.isOpen, props.options]);

  const handleOptionChange = (option: string, value: string[]) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      [option]: value,
    }));
  };

  const onSubmit = () => {
    if (total <= 0) {
      alert("Please select at least 1 item");
      return;
    }
    
    if (props.onSubmit) {
      props.onSubmit(selectedValues, total);
    }
  };

  return (
    <Modal open={props.isOpen} onClose={() => {
        props.onClose();
        setSelectedValues({});
        setTotal(1);
    }}>
      <ModalDialog
        aria-labelledby="nested-modal-title"
        aria-describedby="nested-modal-description"
        sx={(theme) => ({
          width: { xs: '95vw', sm: '600px', md: '700px' },
          maxWidth: { lg: '800px', xl: '900px' }, // Maximum size limits
          maxHeight: '90vh',
          overflow: 'hidden', // Changed to hidden to prevent double scrollbars
          display: 'flex',
          flexDirection: 'column',
          [theme.breakpoints.only('xs')]: {
            top: 'unset',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            transform: 'none',
            width: '100%',
            maxHeight: '95vh',
            overflow: 'hidden',
            padding: '16px',
          },
          // Better landscape mode handling
          '@media (orientation: landscape) and (max-height: 600px)': {
            top: '50%',
            bottom: 'auto',
            left: '50%',
            right: 'auto',
            transform: 'translate(-50%, -50%)',
            maxHeight: '90vh',
            width: '600px',
            maxWidth: '700px',
            borderRadius: '12px',
            overflow: 'hidden',
            padding: '20px',
          },
        })}
      >
        {/* Image display at the top - consistent sizing */}
        {props.imageUrl && (
          <Box sx={{ 
            display: 'none', // Hidden by default
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 3, // More margin for larger modal
            height: '200px',
            width: '200px', // Square container for consistent aspect ratio
            margin: '0 auto', // Center the container
            overflow: 'hidden',
            borderRadius: '12px',
            // Show image only when both width AND height are sufficient
            '@media (min-width: 900px) and (min-height: 600px)': {
              display: 'flex'
            }
          }}>
            <img 
              src={props.imageUrl} 
              alt={props.item}
              style={{ 
                width: '100%', 
                height: '100%',
                objectFit: 'contain', // Show entire image without cropping
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            />
          </Box>
        )}
        
        <Box sx={{ 
          flexShrink: 0,
          bgcolor: 'background.surface',
          pb: { xs: 1, md: 2 },
          mb: { xs: 2, md: 3 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}>
          <Typography 
            level="h2" 
            sx={{ 
              mb: 1,
              fontSize: { xs: '1.1rem', md: '1.25rem' }
            }}
          >
            Customizations for {props.item}
          </Typography>
          <Typography 
            level="body-sm" 
            textColor="text.tertiary"
            sx={{
              fontSize: { xs: '0.8rem', md: '0.9rem' }
            }}
          >
            Choose your options for {props.item}
          </Typography>
        </Box>
        
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',
          mt: 2,
          px: 2,
          minHeight: 0, // Important for flex child
        }}>
          <Stack
            direction="column"
            spacing={3}
            sx={{
              width: '100%',
              pb: 2, // Add some bottom padding
              alignItems: 'center',
            }}
          >
          {props.options.map((option) => (
            <ItemOptions
              key={option.option}
              {...option}
              value={selectedValues[option.option] || []}
              onChange={(value) => handleOptionChange(option.option, value)}
            />
          ))}
        </Stack>
          </Box>
        <Stack 
            direction="row" 
            spacing={2}           
            sx={{
            justifyContent: "center",
            alignItems: "center",
            mt: { xs: 2, md: 3 },
            flexShrink: 0,
          }}>
        <Typography 
          level="h3"
          sx={{
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          Quantity
        </Typography>
        <ButtonGroup aria-label="outlined primary button group">
            <IconButton onClick={() => {
                if (total > 1) {
                    setTotal(total - 1);
                }
            }}>
                <RemoveIcon />
            </IconButton>
            <Button disabled={true} color='primary'>{total}</Button>
            <IconButton onClick={() => {
                setTotal(total + 1);
            }}>
                <AddIcon />
            </IconButton>
        </ButtonGroup>
        </Stack>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            color="neutral"
            onClick={() => {
                props.onClose();
                setSelectedValues({});
                setTotal(1);
            }}
          >
            Cancel
          </Button>
          <Button variant="solid" color="neutral" onClick={() => {
            onSubmit();
            props.onClose();
            setSelectedValues({});
            setTotal(1);
            }}>
            Continue
          </Button>
        </Stack>
      </ModalDialog>
    </Modal>
  );
}