import { Meta, StoryFn } from '@storybook/react';
import CheckoutItemList, { CheckoutItemListProps } from '../CheckoutItems/CheckoutItemList';

export default {
    title: 'Components/reciept/CheckoutItemList',
    component: CheckoutItemList,
} as Meta;
  

const Template: StoryFn<CheckoutItemListProps> = (args) => <CheckoutItemList {...args} />;


export const Default = Template.bind({});
Default.args = {
    items: [
        {
            url: 'https://www.onceuponachef.com/images/2024/01/orange-chicken-760x968.jpg',
            title: 'Orange Chicken',
            options: ['Mild', 'Cheese'],
            quantity: 1,
            onRemove: () => alert('Remove Orange Chicken'),
        },
        {
            url: 'https://www.onceuponachef.com/images/2024/01/orange-chicken-760x968.jpg',
            title: 'Orange Chicken',
            options: ['Xtra Hot', 'Pepperoni'],
            quantity: 3,
            onRemove: () => alert('Remove Orange Chicken'),
        },
    ]
};