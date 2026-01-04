import { FormControl, FormErrorMessage, FormLabel, Textarea, TextareaProps } from '@chakra-ui/react';
import { FieldError } from 'react-hook-form';

interface Props extends TextareaProps {
  label: string;
  error?: FieldError;
}

const FormTextarea: React.FC<Props> = ({ label, error, ...rest }) => (
  <FormControl isInvalid={Boolean(error)}>
    <FormLabel fontWeight="600">{label}</FormLabel>
    <Textarea bg="white" borderColor="brand.secondary" _focus={{ borderColor: 'brand.primary', boxShadow: '0 0 0 1px #0D3B66' }} {...rest} />
    {error && <FormErrorMessage>{error.message}</FormErrorMessage>}
  </FormControl>
);

export default FormTextarea;
