import * as React from 'react';
import Button from '@mui/joy/Button';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import Typography from '@mui/joy/Typography';
import ItemOptions, { ItemOptionsProps } from './ItemOptions';
import { ButtonGroup, IconButton, Stack } from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

export interface ItemOptionsModalProps {
    item: string;
    options: ItemOptionsProps[];
    isOpen: boolean;
    onClose: () => void;
};

export default function ItemOptionsModal(props: ItemOptionsModalProps) {
  const [selectedValues, setSelectedValues] = React.useState<{ [key: string]: string[] }>({});

  const handleOptionChange = (option: string, value: string[]) => {
    setSelectedValues((prevValues) => ({
      ...prevValues,
      [option]: value,
    }));
  };

  const onSubmit = () => {
    Object.entries(selectedValues).forEach(([option, value]) => {
      alert(`Selected ${option}: ${value.join(', ')}`);
    });
    alert(`Total Quantity: ${total}`);
  };

  const [total, setTotal] = React.useState(1);

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
          [theme.breakpoints.only('xs')]: {
            top: 'unset',
            bottom: 0,
            left: 0,
            right: 0,
            borderRadius: 0,
            transform: 'none',
            maxWidth: 'unset',
          },
        })}
      >
        <Typography id="nested-modal-title" level="h2">
          Customizations for {props.item}
        </Typography>
        <Typography id="nested-modal-description" textColor="text.tertiary">
          Chose your options for {props.item}
        </Typography>
        <Stack
          direction="column"
          spacing={2}
          sx={{
            justifyContent: "center",
            alignItems: "center",
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
        <Stack 
            direction="row" 
            spacing={2}           
            sx={{
            justifyContent: "center",
            alignItems: "center",
          }}>
        <Typography id="nested-modal-title" level="h2">
          Quantity
        </Typography>
        <ButtonGroup aria-label="outlined primary button group">
            <IconButton onClick={() => {
                if (total > 0) {
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
            justifyContent: "right",
            alignItems: "right",
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