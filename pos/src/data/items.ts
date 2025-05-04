export interface ItemData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  options: {
    name: string;
    values: string[];
    isMultiple: boolean;
  }[];
  price: number;
}

export const itemsData: ItemData[] = [
  {
    id: '1',
    title: 'Burger',
    description: 'Classic beef burger',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        name: 'Size',
        values: ['Small', 'Medium', 'Large'],
        isMultiple: false,
      },
      {
        name: 'Toppings',
        values: ['Cheese', 'Lettuce', 'Tomato', 'Onion', 'Pickles'],
        isMultiple: true,
      },
    ],
    price: 2.00,
  },
  {
    id: '2',
    title: 'Pizza',
    description: 'Delicious pepperoni pizza',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        name: 'Size',
        values: ['Small', 'Medium', 'Large'],
        isMultiple: false,
      },
      {
        name: 'Crust',
        values: ['Thin', 'Regular', 'Thick'],
        isMultiple: false,
      },
    ],
    price: 2.00,
  },
  {
    id: '3',
    title: 'Salad',
    description: 'Fresh garden salad',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        name: 'Size',
        values: ['Small', 'Regular', 'Large'],
        isMultiple: false,
      },
      {
        name: 'Dressing',
        values: ['Ranch', 'Italian', 'Caesar', 'Vinaigrette'],
        isMultiple: false,
      },
    ],
    price: 2.00,
  },
  {
    id: '4',
    title: 'Fries',
    description: 'Crispy golden fries',
    imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        name: 'Size',
        values: ['Small', 'Medium', 'Large'],
        isMultiple: false,
      },
      {
        name: 'Seasoning',
        values: ['Salt', 'Pepper', 'Garlic', 'Cajun'],
        isMultiple: true,
      },
    ],
    price: 2.00,
  },
  {
    id: '5',
    title: 'Milkshake',
    description: 'Creamy vanilla milkshake',
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        name: 'Size',
        values: ['Small', 'Medium', 'Large'],
        isMultiple: false,
      },
      {
        name: 'Flavor',
        values: ['Vanilla', 'Chocolate', 'Strawberry', 'Banana'],
        isMultiple: false,
      },
      {
        name: 'Toppings',
        values: ['Whipped Cream', 'Sprinkles', 'Cherry', 'Caramel'],
        isMultiple: true,
      },
    ],
    price: 2.00,
  },
  {
    id: '6',
    title: 'Sandwich',
    description: 'Turkey club sandwich',
    imageUrl: 'https://images.unsplash.com/photo-1553909489-cd47e0907980?q=80&w=1000&auto=format&fit=crop',
    options: [
      {
        name: 'Bread',
        values: ['White', 'Wheat', 'Sourdough', 'Rye'],
        isMultiple: false,
      },
      {
        name: 'Extras',
        values: ['Cheese', 'Lettuce', 'Tomato', 'Mayo', 'Mustard'],
        isMultiple: true,
      },
    ],
    price: 2.00,
  },
]; 