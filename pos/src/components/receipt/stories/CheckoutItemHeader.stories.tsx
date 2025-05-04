import { Meta, StoryFn } from '@storybook/react';
import CheckoutItemHeader, { CheckoutItemHeaderProps } from '../CheckoutItems/CheckoutItemHeader';

export default {
    title: 'Components/reciept/CheckoutItemHeader',
    component: CheckoutItemHeader,
} as Meta;
  

const Template: StoryFn<CheckoutItemHeaderProps> = (args) => <CheckoutItemHeader {...args} />;

export const Default = Template.bind({});
Default.args = {
    shopName: 'Big Wok',
};
