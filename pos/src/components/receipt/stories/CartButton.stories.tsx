import { Meta, StoryFn } from '@storybook/react';
import CartButton, { CartButtonProps } from '../CartButton';
import React from 'react';
import { CheckoutItemCardProps } from '../CheckoutItems/CheckoutItemCard';

export default {
    title: 'Components/CartButton',
    component: CartButton,
} as Meta;
  

const Template: StoryFn<CartButtonProps> = (args) => {
    const [items, setItems] = React.useState<CheckoutItemCardProps[]>(args.items);

    const onRemove = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    }

    const onDestroy = () => {
        setItems([]);
    }

    return <CartButton {...args} items={items} onRemove={onRemove} onDestroy={onDestroy}/>;
};

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