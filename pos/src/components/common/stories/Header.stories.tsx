import { Meta, StoryFn } from '@storybook/react';
import Header, { HeaderProps } from '../Header';
import React from 'react';
import { CheckoutItemCardProps } from '../../receipt/CheckoutItems/CheckoutItemCard';

export default {
    title: 'Components/Header',
    component: Header,
} as Meta;
  

const Template: StoryFn<HeaderProps> = (args) => {
    const [items, setItems] = React.useState<CheckoutItemCardProps[]>(args.items);

    const onRemove = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    }

    const onDestroy = () => {
        setItems([]);
    }

    return <Header {...args} items={items} onRemove={onRemove} onDestroy={onDestroy}/>;
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