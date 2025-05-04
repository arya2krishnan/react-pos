import {
  AppBar,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import CartButton from "../receipt/CartButton";
import { CheckoutItemCardProps } from "../receipt/CheckoutItems/CheckoutItemCard";

const StyledLogo = styled("img")({
  height: "40px",
  marginRight: "16px"
});

export interface HeaderProps {
    shopName: string;
    shopUrl: string;
    items: CheckoutItemCardProps[];
    onClick: () => void;
    onRemove: (index: number) => void;
    onDestroy: () => void;
}

const Header = (props: HeaderProps) => {

  const menuItems = (
    <>
    <CartButton  
    shopName={props.shopName} 
    shopUrl={props.shopUrl}
    items={props.items} 
    onClick={props.onClick}
    onDestroy={props.onDestroy}
    onRemove={props.onRemove}/>
    </>
  );

  return (
      <AppBar position="static" color="primary" elevation={4}>
        <Toolbar>
          <StyledLogo
            src={props.shopUrl}
            alt="Logo"
          />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {props.shopName}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>{menuItems}</Box>
        </Toolbar>
      </AppBar>
  );
};

export default Header;