import { Meta, StoryFn } from '@storybook/react';
import UserInput, { UserInputProps } from '../UserInput';
import { Button } from '@mui/joy';
import React, { useCallback } from 'react';
import OrderNumber from '../OrderNumber';

export default {
  title: 'Components/user/UserInput',
  component: UserInput,
} as Meta;

const Template: StoryFn<UserInputProps> = (args) => {
  const [open, setOpen] = React.useState(false);
  const [orderOpen, setOrderOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [textOptIn, setTextOptIn] = React.useState(false);

  const handleClick = useCallback((name: string, phone: string, optIn: boolean) => {
    setName(name);
    setPhone(phone);
    setTextOptIn(optIn);
    setOrderOpen(true);
  }, []);

  return (
    <>
      <Button onClick={() => setOpen(true)}>Click me!</Button>
      <UserInput 
        {...args} 
        isOpen={open} 
        onClick={handleClick}
        onClose={() => setOpen(false)}
        name={name}
        phone={phone} />
      <OrderNumber 
        orderNumber={4} 
        open={orderOpen} 
        onClose={() => setOrderOpen(false)}
        name={`Name: ${name} Phone: ${phone} Text Opt-In: ${textOptIn ? 'Yes' : 'No'}`}
        />
    </>
  );
};

export const Default = Template.bind({});
Default.args = {};