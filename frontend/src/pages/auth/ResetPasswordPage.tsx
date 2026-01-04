import { Box, Button, Flex, Heading, Stack, Text, useToast, Link } from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSearchParams, Link as RouterLink } from 'react-router-dom';
import { resetPasswordRequest } from '../../api/auth';
import FormTextInput from '../../components/forms/FormTextInput';

const schema = z
  .object({
    email: z.string().email('Ingresa un correo válido'),
    code: z.string().min(4, 'Ingresa el código enviado al correo'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

type FormValues = z.infer<typeof schema>;

const ResetPasswordPage = () => {
  const [params] = useSearchParams();
  const defaultEmail = params.get('email') ?? '';
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: defaultEmail } });
  const toast = useToast();

  const onSubmit = async (values: FormValues) => {
    try {
      await resetPasswordRequest(values.email, values.code, values.password);
      toast({ title: 'Contraseña actualizada', description: 'Ya puedes iniciar sesión', status: 'success' });
    } catch (error: any) {
      toast({ title: 'Error al actualizar', description: error?.response?.data?.message ?? error?.message, status: 'error' });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.background" px={4}>
      <Box maxW="420px" w="full" bg="white" borderRadius="lg" boxShadow="md" p={8}>
        <Stack spacing={6}>
          <Box>
            <Heading size="lg" color="brand.primary">
              Define tu nueva contraseña
            </Heading>
            <Text color="gray.600">Ingresa el código recibido y define tu nueva contraseña.</Text>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormTextInput label="Correo electrónico" type="email" {...register('email')} error={errors.email} />
              <FormTextInput label="Código de verificación" {...register('code')} error={errors.code} />
              <FormTextInput label="Nueva contraseña" type="password" {...register('password')} error={errors.password} />
              <FormTextInput
                label="Confirmar contraseña"
                type="password"
                {...register('confirmPassword')}
                error={errors.confirmPassword}
              />
              <Button type="submit" isLoading={isSubmitting}>
                Guardar contraseña
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

export default ResetPasswordPage;
