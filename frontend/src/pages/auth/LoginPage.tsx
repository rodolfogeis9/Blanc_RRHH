import {
  Box,
  Button,
  Flex,
  Heading,
  Link,
  Stack,
  Text,
  useToast,
  VStack,
  HStack,
  Icon,
  SimpleGrid,
  usePrefersReducedMotion,
} from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { CheckCircleIcon, LockIcon, TimeIcon } from '@chakra-ui/icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { loginRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import FormTextInput from '../../components/forms/FormTextInput';
import BlancLogo from '../../components/branding/BlancLogo';

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
  const prefersReducedMotion = usePrefersReducedMotion();
  const floating = keyframes`
    0% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
    100% { transform: translateY(0); }
  `;
  const pulse = keyframes`
    0% { box-shadow: 0 0 0 0 rgba(13, 59, 102, 0.25); }
    70% { box-shadow: 0 0 0 40px rgba(13, 59, 102, 0); }
    100% { box-shadow: 0 0 0 0 rgba(13, 59, 102, 0); }
  `;

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
    <Flex minH="100vh" bgGradient="linear(120deg, #e4ecff 0%, #f5f7ff 40%, #fff 100%)" px={{ base: 4, lg: 16 }} py={{ base: 6, lg: 12 }}>
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center" w="full">
        <Box
          bg="white"
          borderRadius="2xl"
          boxShadow="xl"
          p={{ base: 6, md: 10 }}
          border="1px solid"
          borderColor="brand.secondary"
        >
          <Stack spacing={6}>
            <Stack spacing={2}>
              <BlancLogo maxW="220px" />
              <Heading size="lg" color="brand.primary">
                Portal de Personas Blanc
              </Heading>
              <Text color="gray.600">Gestiona tu información laboral en un solo lugar.</Text>
            </Stack>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4}>
                <FormTextInput label="Correo electrónico" type="email" {...register('email')} error={errors.email} />
                <FormTextInput label="Contraseña" type="password" {...register('password')} error={errors.password} />
                <Button type="submit" isLoading={isSubmitting} size="lg">
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
        <VStack
          spacing={6}
          align="stretch"
          bgGradient="linear(180deg, rgba(13,59,102,0.85), rgba(13,59,102,0.7))"
          color="white"
          borderRadius="2xl"
          p={{ base: 8, md: 12 }}
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            inset="0"
            bgImage="radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25), transparent 45%)"
          />
          <Stack spacing={4} position="relative">
            <Heading size="lg">Cultura centrada en las personas</Heading>
            <Text opacity={0.9}>
              Accede a beneficios, licencias, vacaciones y novedades internas desde una interfaz creada especialmente para el
              equipo de Blanc.
            </Text>
          </Stack>
          <VStack align="stretch" spacing={4} position="relative">
            {[
              { icon: LockIcon, label: 'Seguridad de datos' },
              { icon: CheckCircleIcon, label: 'Trayectoria visible' },
              { icon: TimeIcon, label: 'Procesos ágiles' },
            ].map((item) => (
              <HStack
                key={item.label}
                spacing={4}
                bg="rgba(255,255,255,0.1)"
                borderRadius="lg"
                p={4}
                border="1px solid rgba(255,255,255,0.2)"
              >
                <Icon as={item.icon} boxSize={6} />
                <Text fontWeight="600">{item.label}</Text>
              </HStack>
            ))}
          </VStack>
          <Box
            mt={6}
            p={6}
            borderRadius="xl"
            bg="white"
            color="brand.primary"
            textAlign="center"
            fontWeight="600"
            animation={prefersReducedMotion ? undefined : `${floating} 6s ease-in-out infinite`}
          >
            "Blanc cuida de nosotros para que podamos cuidar de nuestros pacientes" — Equipo Clínico
          </Box>
          <Box
            position="absolute"
            bottom={6}
            right={6}
            borderRadius="full"
            width="80px"
            height="80px"
            bg="white"
            opacity={0.9}
            animation={prefersReducedMotion ? undefined : `${pulse} 8s infinite`}
          />
        </VStack>
      </SimpleGrid>
    </Flex>
  );
};

export default LoginPage;
