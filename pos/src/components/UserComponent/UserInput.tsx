import { ModalDialog } from "@mui/joy";
import { Modal, DialogTitle, DialogContent, Stack, FormControl, FormLabel, Input, Button, FormHelperText, Checkbox } from "@mui/joy";
import React, { useState, useEffect } from "react";

export interface UserInputProps {
    isOpen: boolean;
    name: string;
    phone: string;
    onClick: (name: string, phone: string, text: boolean) => void;
    onClose: () => void;
}

export default function UserInput(props: UserInputProps) {
    const [name, setName] = useState(props.name || '');
    const [phone, setPhone] = useState(props.phone || '');
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [optInText, setOptInText] = useState(true);
    
    // Reset the form when props change (e.g., when userName and userPhone are cleared)
    useEffect(() => {
        setName(props.name || '');
        setPhone(props.phone || '');
        // Only reset the opt-in if the form is being completely reset
        if (!props.name && !props.phone) {
            setOptInText(true);
        }
    }, [props.name, props.phone, props.isOpen]);
    
    const validatePhoneNumber = (phone: string): boolean => {
        // Basic US phone number validation (accepts formats like: (123) 456-7890, 123-456-7890, 1234567890)
        const phoneRegex = /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;
        return phoneRegex.test(phone);
    };

    const formatPhoneNumber = (phone: string): string => {
        // Remove all non-digit characters
        const digitsOnly = phone.replace(/\D/g, '');
        
        // Remove country code if it exists
        const digits = digitsOnly.startsWith('1') && digitsOnly.length > 10 
            ? digitsOnly.substring(1) 
            : digitsOnly;
        
        // Format to +1(number)
        return digits;
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(e.target.value);
        if (phoneError && validatePhoneNumber(e.target.value)) {
            setPhoneError(null);
        }
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        // Ensure at least name or phone number is provided
        if (!name.trim() && !phone.trim()) {
            setPhoneError("Please provide either your name or phone number");
            return;
        }
        
        // Only validate phone number if one is provided
        if (phone.trim() && !validatePhoneNumber(phone)) {
            setPhoneError("Please enter a valid phone number");
            return;
        }
        
        // Format phone number before sending to backend
        const formattedPhone = phone.trim() ? formatPhoneNumber(phone) : '';
        
        console.log('UserInput submitting:', {
            name,
            formattedPhone,
            optInText
        });
        
        props.onClick(name, formattedPhone, optInText);
        props.onClose();
    };

    return (
    <Modal open={props.isOpen} onClose={() => props.onClose()}>
    <ModalDialog>
      <DialogTitle>Your information</DialogTitle>
      <DialogContent>Please give us your Name and Phone Number.</DialogContent>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input 
                placeholder="Your Name" 
                autoFocus 
                value={name}
                onChange={handleNameChange}
            />
          </FormControl>
          <FormControl error={!!phoneError}>
            <FormLabel>Phone Number</FormLabel>
            <Input 
              placeholder="(888)-888-8888" 
              value={phone}
              onChange={handlePhoneChange}
            />
            {phoneError && <FormHelperText>{phoneError}</FormHelperText>}
          </FormControl>
          <FormControl>
            <Checkbox 
              label="Opt-in to receive text messages about your order"
              checked={optInText}
              onChange={(e) => setOptInText(e.target.checked)}
            />
          </FormControl>
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </ModalDialog>
  </Modal>
  );
}