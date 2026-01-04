import { Box, Button, Flex, Heading, Stack, Text, useToast, Link } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link as RouterLink } from 'react-router-dom';
import { forgotPasswordRequest } from '../../api/auth';
import FormTextInput from '../../components/forms/FormTextInput';

const schema = z.object({ email: z.string().email('Ingresa un correo válido') });

type FormValues = z.infer<typeof schema>;

const ForgotPasswordPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const toast = useToast();

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPasswordRequest(values.email);
      toast({
        title: 'Revisa tu correo',
        description: 'Si existe una cuenta recibirás las instrucciones para continuar.',
        status: 'success',
      });
    } catch (error: any) {
      toast({ title: 'No pudimos enviar el correo', description: error?.response?.data?.message, status: 'error' });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.background" px={4}>
      <Box maxW="420px" w="full" bg="white" borderRadius="lg" boxShadow="md" p={8}>
        <Stack spacing={6}>
          <Box>
            <Heading size="lg" color="brand.primary">
              Recuperar contraseña
            </Heading>
            <Text color="gray.600">Ingresa tu correo y te enviaremos un código de verificación.</Text>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormTextInput label="Correo electrónico" type="email" {...register('email')} error={errors.email} />
              <Button type="submit" isLoading={isSubmitting}>
                Enviar instrucciones
              </Button>
            </Stack>
          </form>
          <Link as={RouterLink} to="/login" color="brand.primary">
            Volver al inicio de sesión
          </Link>
        </Stack>
      </Box>
    </Flex>
  );
};

export default ForgotPasswordPage;
