import { List, ListItem } from "@mui/joy";
import CheckoutItemCard, { CheckoutItemCardProps } from "./CheckoutItemCard";


export interface CheckoutItemListProps {
    items: CheckoutItemCardProps[];
    onRemove: (index: number) => void;
}

export default function CheckoutItemList(props: CheckoutItemListProps) {
    
    return (
        <List>
            {props.items.map((item, index) => (
                <ListItem key={index}>
                    <CheckoutItemCard {...item} onRemove={() => props.onRemove(index)} />
                </ListItem>
            ))}
        </List>
    )
}
