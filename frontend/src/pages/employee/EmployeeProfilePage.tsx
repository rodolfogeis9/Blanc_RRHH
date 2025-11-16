import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Heading,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormTextInput from '../../components/forms/FormTextInput';
import FormTextarea from '../../components/forms/FormTextarea';
import { fetchMe, updateProfile } from '../../api/me';

const schema = z.object({
  telefono: z.string().min(6, 'Ingresa un teléfono válido'),
  direccion: z.string().min(5, 'Ingresa una dirección válida'),
  urlFotoPerfil: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
  resumenPerfilProfesional: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
});

type FormValues = z.infer<typeof schema>;

const EmployeeProfilePage = () => {
  const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const queryClient = useQueryClient();
  const toast = useToast();
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      telefono: data?.telefono ?? '',
      direccion: data?.direccion ?? '',
      urlFotoPerfil: data?.urlFotoPerfil ?? '',
      resumenPerfilProfesional: data?.resumenPerfilProfesional ?? '',
    },
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast({ title: 'Datos actualizados', status: 'success' });
    },
    onError: (error: any) => {
      toast({ title: 'No pudimos actualizar', description: error?.response?.data?.message, status: 'error' });
    },
  });

  const onSubmit = (values: FormValues) => {
    mutation.mutate({ ...values, urlFotoPerfil: values.urlFotoPerfil || undefined });
  };

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Mis datos</Heading>
        <Grid templateColumns={{ base: '1fr', md: '2fr 3fr' }} gap={6} alignItems="flex-start">
          <GridItem>
            <Card>
              <CardBody>
                <Stack spacing={4} align="center">
                  <Avatar size="xl" name={`${data?.nombre ?? ''} ${data?.apellido ?? ''}`} src={data?.urlFotoPerfil} />
                  <Box textAlign="center">
                    <Heading size="md">{data?.nombre} {data?.apellido}</Heading>
                    <Text color="gray.600">{data?.cargo} · {data?.area}</Text>
                    <Text color="gray.500">Estado: {data?.estadoLaboral}</Text>
                  </Box>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
                  <FormTextInput label="Teléfono" {...register('telefono')} error={formState.errors.telefono} />
                  <FormTextInput label="Dirección" {...register('direccion')} error={formState.errors.direccion} />
                  <FormTextInput label="URL foto de perfil" {...register('urlFotoPerfil')} error={formState.errors.urlFotoPerfil} />
                  <FormTextarea
                    label="Resumen profesional"
                    minH="120px"
                    {...register('resumenPerfilProfesional')}
                    error={formState.errors.resumenPerfilProfesional}
                  />
                  <Button type="submit" isLoading={mutation.isPending} alignSelf="flex-start">
                    Guardar cambios
                  </Button>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Stack>
    </DashboardLayout>
  );
};

export default EmployeeProfilePage;
