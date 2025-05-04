import { ModalDialog } from "@mui/joy";
import { Modal, DialogTitle, DialogContent, Stack, FormControl, FormLabel, Input, Button, FormHelperText, Checkbox } from "@mui/joy";
import React, { useState } from "react";

export interface UserInputProps {
    isOpen: boolean;
    name: string;
    phone: string;
    onClick: (name: string, phone: string, text: boolean) => void;
    onClose: () => void;
}

export default function UserInput(props: UserInputProps) {
    const [phoneError, setPhoneError] = useState<string | null>(null);
    const [optInText, setOptInText] = useState(false);
    
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
        return `+1${digits}`;
    };

    return (
    <Modal open={props.isOpen} onClose={() => props.onClose()}>
    <ModalDialog>
      <DialogTitle>Your information</DialogTitle>
      <DialogContent>Please give us your Name and Phone Number.</DialogContent>
      <form
        onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const form = event.currentTarget;
          const name = (form.elements[0] as HTMLInputElement).value;
          const phone = (form.elements[1] as HTMLInputElement).value;
          
          if (!validatePhoneNumber(phone)) {
            setPhoneError("Please enter a valid phone number");
            return;
          }
          
          // Format phone number before sending to backend
          const formattedPhone = formatPhoneNumber(phone);
          
          props.onClick(name, formattedPhone, optInText);
          props.onClose();
        }}
      >
        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input placeholder="Your Name" autoFocus required defaultValue={props.name} />
          </FormControl>
          <FormControl error={!!phoneError}>
            <FormLabel>Phone Number</FormLabel>
            <Input 
              placeholder="(888)-888-8888" 
              required 
              defaultValue={props.phone}
              onChange={(e) => {
                if (phoneError && validatePhoneNumber(e.target.value)) {
                  setPhoneError(null);
                }
              }}
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