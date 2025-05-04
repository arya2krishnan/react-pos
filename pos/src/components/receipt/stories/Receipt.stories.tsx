import { Meta, StoryFn } from '@storybook/react';
import Receipt, { ReceiptProps } from '../Receipt';

export default {
    title: 'Components/Receipt',
    component: Receipt,
} as Meta;
  

const Template: StoryFn<ReceiptProps> = (args) => <Receipt {...args} />;

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
        {
            url: 'https://www.onceuponachef.com/images/2024/01/orange-chicken-760x968.jpg',
            title: 'Orange Chicken',
            options: ['Xtra Hot', 'Pepperoni'],
            quantity: 3,
            onRemove: () => alert('Remove Orange Chicken'),
        },
        {
            url: 'https://www.onceuponachef.com/images/2024/01/orange-chicken-760x968.jpg',
            title: 'Orange Chicken',
            options: ['Xtra Hot', 'Pepperoni'],
            quantity: 3,
            onRemove: () => alert('Remove Orange Chicken'),
        },
    ],
    shopName: 'Super Wok', 
    shopUrl: 'https://imagedelivery.net/9lr8zq_Jvl7h6OFWqEi9IA/70100d66-9a69-429c-642a-d26583576200/public', 
    onClick: () => alert('Checkout'),
};