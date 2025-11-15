import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { loginRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import FormTextInput from '../../components/forms/FormTextInput';

const schema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type FormValues = z.infer<typeof schema>;

const LoginPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const toast = useToast();
  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (values: FormValues) => {
    try {
      const data = await loginRequest(values.email, values.password);
      login({
        token: data.token,
        role: data.usuario.rol,
        userId: data.usuario.id,
        nombre: data.usuario.nombre,
        apellido: data.usuario.apellido,
      });
      if (data.usuario.rol === 'EMPLEADO') {
        navigate('/portal');
      } else {
        navigate('/admin/empleados');
      }
      toast({ title: 'Bienvenido nuevamente', status: 'success', duration: 3000 });
    } catch (error: any) {
      toast({
        title: 'No pudimos iniciar sesión',
        description: error?.response?.data?.message ?? 'Revisa tus credenciales',
        status: 'error',
      });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.background" px={4}>
      <Box maxW="420px" w="full" bg="white" borderRadius="lg" boxShadow="md" p={8}>
        <Stack spacing={6}>
          <Box>
            <Heading size="lg" color="brand.primary">
              Bienvenido a Blanc RRHH
            </Heading>
            <Text color="gray.600">Gestiona tu información laboral en un solo lugar.</Text>
          </Box>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={4}>
              <FormTextInput label="Correo electrónico" type="email" {...register('email')} error={errors.email} />
              <FormTextInput label="Contraseña" type="password" {...register('password')} error={errors.password} />
              <Button type="submit" isLoading={isSubmitting}>
                Iniciar sesión
              </Button>
            </Stack>
          </form>
          <Flex justify="space-between" fontSize="sm">
            <Link as={RouterLink} to="/forgot-password" color="brand.primary">
              Olvidé mi contraseña
            </Link>
          </Flex>
        </Stack>
      </Box>
    </Flex>
  );
};

export default LoginPage;
