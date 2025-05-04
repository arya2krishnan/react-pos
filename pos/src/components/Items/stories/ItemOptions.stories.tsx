import { Meta, StoryFn } from '@storybook/react';
import ItemOptions, { ItemOptionsProps } from '../ItemOptions';

export default {
    title: 'Components/items/ItemOptions',
    component: ItemOptions,
} as Meta;
  

const Template: StoryFn<ItemOptionsProps> = (args) => <ItemOptions {...args} />;

export const Default = Template.bind({});
Default.args = {
    option: 'Spice Level',
    options: ['Mild', 'Medium', 'Hot', 'Xtra Hot'],
    isMultiple: false,
};

export const Multiple = Template.bind({});
Multiple.args = {
    option: 'Toppings',
    options: ['Cheese', 'Pepperoni', 'Sausage', 'Mushrooms'],
    isMultiple: true,
};