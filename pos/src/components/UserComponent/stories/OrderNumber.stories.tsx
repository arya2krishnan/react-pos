import { Meta, StoryFn } from '@storybook/react';
import OrderNumber, { OrderNumberProps } from '../OrderNumber';
import { Button } from '@mui/joy';
import React from 'react';

export default {
  title: 'Components/user/OrderNumber',
  component: OrderNumber,
} as Meta;

const Template: StoryFn<OrderNumberProps> = (args) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Click me!</Button>
      <OrderNumber {...args} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {
    name: 'John Doe',
    orderNumber: 2717,
};