import { Meta, StoryFn } from '@storybook/react';
import ItemCard, { ItemCardProps } from '../ItemCard';

export default {
    title: 'Components/items/ItemCard',
    component: ItemCard,
} as Meta;
  

const Template: StoryFn<ItemCardProps> = (args) => <ItemCard {...args} />;

export const Default = Template.bind({});
Default.args = {
    url: 'https://www.onceuponachef.com/images/2024/01/orange-chicken-760x968.jpg',
    title: 'Orange Chicken',
    description: 'Crispy chicken coated in a sweet and tangy orange sauce.',
    onClick: () => alert('Orange Chicken'),
};