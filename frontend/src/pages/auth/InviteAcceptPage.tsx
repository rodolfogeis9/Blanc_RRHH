import {
  Box,
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  useToast,
  Alert,
  AlertIcon,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { acceptInvitationRequest, validateInvitationRequest } from '../../api/auth';
import FormTextInput from '../../components/forms/FormTextInput';

const schema = z
  .object({
    nombre: z.string().min(1, 'Ingresa tu nombre'),
    apellido: z.string().min(1, 'Ingresa tu apellido'),
    rut: z.string().min(3, 'Ingresa tu RUT'),
    fechaNacimiento: z.string().min(1, 'Ingresa tu fecha de nacimiento'),
    telefono: z.string().min(6, 'Ingresa tu teléfono'),
    direccion: z.string().min(3, 'Ingresa tu dirección'),
    fechaIngreso: z.string().min(1, 'Ingresa tu fecha de ingreso'),
    area: z.string().min(1, 'Ingresa tu área'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contraseñas no coinciden',
  });

type FormValues = z.infer<typeof schema>;

const InviteAcceptPage = () => {
  const [params] = useSearchParams();
  const token = params.get('token');
  const toast = useToast();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery({
    queryKey: ['invitation', token],
    queryFn: () => validateInvitationRequest(token ?? ''),
    enabled: Boolean(token),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      if (!token) throw new Error('Invitación inválida');
      await acceptInvitationRequest({
        token,
        password: values.password,
        nombre: values.nombre,
        apellido: values.apellido,
        rut: values.rut,
        fechaNacimiento: values.fechaNacimiento,
        telefono: values.telefono,
        direccion: values.direccion,
        fechaIngreso: values.fechaIngreso,
        area: values.area,
      });
      toast({ title: 'Registro completado', description: 'Ya puedes iniciar sesión', status: 'success' });
      navigate('/login');
    } catch (err: any) {
      toast({ title: 'No pudimos completar el registro', description: err?.response?.data?.message ?? err?.message, status: 'error' });
    }
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="brand.background" px={4} py={10}>
      <Box maxW="540px" w="full">
        <Card>
          <CardBody>
            <Stack spacing={6}>
              <Box>
                <Heading size="lg" color="brand.primary">Completar registro</Heading>
                <Text color="gray.600">Finaliza tu alta para acceder al portal.</Text>
              </Box>

              {!token && (
                <Alert status="error">
                  <AlertIcon />
                  Falta el token de invitación.
                </Alert>
              )}

              {token && isLoading && <Text>Cargando invitación...</Text>}

              {token && error && (
                <Alert status="error">
                  <AlertIcon />
                  No pudimos validar la invitación. Solicita un nuevo enlace.
                </Alert>
              )}

              {data && (
                <Box bg="gray.50" borderRadius="md" p={4}>
                  <Text fontWeight="600">Invitación para: {data.email}</Text>
                  <Text color="gray.600">Rol: {data.role}</Text>
                  <Text color="gray.600">Cargo: {data.jobRoleName}</Text>
                </Box>
              )}

              {data && (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={4}>
                    <FormTextInput label="Nombre" {...register('nombre')} error={errors.nombre} />
                    <FormTextInput label="Apellido" {...register('apellido')} error={errors.apellido} />
                    <FormTextInput label="RUT" {...register('rut')} error={errors.rut} />
                    <FormTextInput label="Fecha de nacimiento" type="date" {...register('fechaNacimiento')} error={errors.fechaNacimiento} />
                    <FormTextInput label="Teléfono" {...register('telefono')} error={errors.telefono} />
                    <FormTextInput label="Dirección" {...register('direccion')} error={errors.direccion} />
                    <FormTextInput label="Fecha de ingreso" type="date" {...register('fechaIngreso')} error={errors.fechaIngreso} />
                    <FormTextInput label="Área" {...register('area')} error={errors.area} />
                    <FormTextInput label="Contraseña" type="password" {...register('password')} error={errors.password} />
                    <FormTextInput label="Confirmar contraseña" type="password" {...register('confirmPassword')} error={errors.confirmPassword} />
                    <Button type="submit" isLoading={isSubmitting} isDisabled={!data}>
                      Completar registro
                    </Button>
                  </Stack>
                </form>
              )}
            </Stack>
          </CardBody>
        </Card>
      </Box>
    </Flex>
  );
};

export default InviteAcceptPage;
