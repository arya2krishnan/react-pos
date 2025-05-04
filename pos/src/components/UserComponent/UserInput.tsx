import { ModalDialog } from "@mui/joy";
import { Modal, DialogTitle, DialogContent, Stack, FormControl, FormLabel, Input, Button } from "@mui/joy";
import React from "react";

export interface UserInputProps {
    isOpen: boolean;
    name: string;
    phone: string;
    onClick: (name: string, phone: string) => void;
    onClose: () => void;
}

export default function UserInput(props: UserInputProps) {
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
          props.onClick(name, phone);
          props.onClose();
        }}
      >
        <Stack spacing={2}>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input placeholder="Your Name" autoFocus required />
          </FormControl>
          <FormControl>
            <FormLabel>Phone Number</FormLabel>
            <Input placeholder="(888)-888-8888" required />
          </FormControl>
          <Button type="submit">Submit</Button>
        </Stack>
      </form>
    </ModalDialog>
  </Modal>
  );
}