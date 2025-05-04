import { Meta, StoryFn } from '@storybook/react';
import CheckoutItemCard, { CheckoutItemCardProps } from '../CheckoutItems/CheckoutItemCard';

export default {
    title: 'Components/reciept/CheckoutItemCard',
    component: CheckoutItemCard,
} as Meta;
  

const Template: StoryFn<CheckoutItemCardProps> = (args) => <CheckoutItemCard {...args} />;

export const Default = Template.bind({});
Default.args = {
    url: 'https://www.onceuponachef.com/images/2024/01/orange-chicken-760x968.jpg',
    title: 'Orange Chicken',
    options: ['Mild', 'Cheese'],
    quantity: 1,
    onRemove: () => alert('Remove Orange Chicken'),
};
