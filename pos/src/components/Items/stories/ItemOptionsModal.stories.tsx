import React from 'react';
import { Meta, StoryFn } from '@storybook/react';
import ItemOptionsModal, { ItemOptionsModalProps } from '../ItemOptionsModal';
import { Button } from '@mui/joy';


export default {
    title: 'Components/items/ItemOptionsModal',
    component: ItemOptionsModal,
} as Meta;
  
const Template: StoryFn<ItemOptionsModalProps> = (args) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Add to Cart</Button>
      <ItemOptionsModal {...args} isOpen={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
    item: 'Orange Chicken', 
    options: [
        {
          option: 'Spice Level',
          options: ['Mild', 'Medium', 'Hot', 'Xtra Hot'],
          isMultiple: false,
          value: [],
          onChange: (value: string[]) => console.log(value),
        },
        {
          option: 'Toppings',
          options: ['Cheese', 'Pepperoni', 'Sausage', 'Mushrooms'],
          isMultiple: true,
          value: [],
          onChange: (value: string[]) => console.log(value),
        },
    ],
};