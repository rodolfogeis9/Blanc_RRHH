// src/components/forms/FormTextInput.tsx
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  InputProps,
} from '@chakra-ui/react';
import { FieldError } from 'react-hook-form';
import { forwardRef } from 'react';

interface Props extends InputProps {
  label: string;
  error?: FieldError;
}

const FormTextInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, ...rest }, ref) => (
    <FormControl isInvalid={Boolean(error)}>
      <FormLabel fontWeight="600">{label}</FormLabel>
      <Input
        ref={ref}
        bg="white"
        borderColor="brand.secondary"
        _focus={{
          borderColor: 'brand.primary',
          boxShadow: '0 0 0 1px #0D3B66',
        }}
        {...rest}
      />
      {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
    </FormControl>
  )
);

export default FormTextInput;
