import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  Grid,
  GridItem,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect, ChangeEvent } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormTextInput from '../../components/forms/FormTextInput';
import FormTextarea from '../../components/forms/FormTextarea';
import { fetchMe, updateProfile } from '../../api/me';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { readFileAsDataURL } from '../../utils/file';

const schema = z.object({
  telefono: z.string().min(6, 'Ingresa un teléfono válido'),
  direccion: z.string().min(5, 'Ingresa una dirección válida'),
  urlFotoPerfil: z.string().url('Ingresa una URL válida').optional().or(z.literal('')),
  resumenPerfilProfesional: z.string().max(2000, 'Máximo 2000 caracteres').optional(),
});

type FormValues = z.infer<typeof schema>;

const personalSchema = z.object({
  primerNombre: z.string().min(2, 'Ingresa tu nombre'),
  segundoNombre: z.string().optional(),
  primerApellido: z.string().min(2, 'Ingresa tu primer apellido'),
  segundoApellido: z.string().optional(),
  rut: z.string().min(5, 'Ingresa tu RUT'),
  correoPersonal: z.string().email('Correo no válido').or(z.literal('')),
  domicilio: z.string().min(3, 'Ingresa tu comuna o ciudad'),
  calle: z.string().min(3, 'Ingresa tu calle'),
  numero: z.string().min(1, 'Ingresa el número'),
  depto: z.string().optional(),
  linkedin: z.string().url('Ingresa una URL válida').or(z.literal('')),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

const emptyPersonalData: PersonalFormValues = {
  primerNombre: '',
  segundoNombre: '',
  primerApellido: '',
  segundoApellido: '',
  rut: '',
  correoPersonal: '',
  domicilio: '',
  calle: '',
  numero: '',
  depto: '',
  linkedin: '',
};

const EmployeeProfilePage = () => {
  const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const queryClient = useQueryClient();
  const toast = useToast();
  const [personalData, setPersonalData] = useLocalStorage<PersonalFormValues>('employee-personal-data', emptyPersonalData);
  const [customPhoto, setCustomPhoto] = useLocalStorage<string | null>('employee-profile-photo', null);

  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: {
      telefono: data?.telefono ?? '',
      direccion: data?.direccion ?? '',
      urlFotoPerfil: data?.urlFotoPerfil ?? '',
      resumenPerfilProfesional: data?.resumenPerfilProfesional ?? '',
    },
  });

  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: personalFormState,
    reset: resetPersonal,
  } = useForm<PersonalFormValues>({ resolver: zodResolver(personalSchema), defaultValues: emptyPersonalData });

  useEffect(() => {
    resetPersonal({
      ...emptyPersonalData,
      ...personalData,
      primerNombre: personalData.primerNombre || data?.nombre || '',
      primerApellido: personalData.primerApellido || data?.apellido?.split(' ')[0] || '',
    });
  }, [data, personalData, resetPersonal]);

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

  const onSubmitPersonal = (values: PersonalFormValues) => {
    setPersonalData(values);
    toast({ title: 'Datos personales guardados', status: 'success' });
  };

  const handleCustomPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setCustomPhoto(dataUrl);
    toast({ title: 'Foto personal actualizada', status: 'success' });
    event.target.value = '';
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
                  <Avatar size="xl" name={`${data?.nombre ?? ''} ${data?.apellido ?? ''}`} src={customPhoto ?? data?.urlFotoPerfil} />
                  <Input type="file" accept="image/*" onChange={handleCustomPhoto} />
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
        <Card>
          <CardBody>
            <Stack as="form" spacing={4} onSubmit={handleSubmitPersonal(onSubmitPersonal)}>
              <Heading size="md">Datos personales ampliados</Heading>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormTextInput label="Primer nombre" {...registerPersonal('primerNombre')} error={personalFormState.errors.primerNombre} />
                <FormTextInput label="Segundo nombre" {...registerPersonal('segundoNombre')} error={personalFormState.errors.segundoNombre} />
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormTextInput label="Primer apellido" {...registerPersonal('primerApellido')} error={personalFormState.errors.primerApellido} />
                <FormTextInput label="Segundo apellido" {...registerPersonal('segundoApellido')} error={personalFormState.errors.segundoApellido} />
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormTextInput label="RUT" {...registerPersonal('rut')} error={personalFormState.errors.rut} />
                <FormTextInput label="Correo personal" type="email" {...registerPersonal('correoPersonal')} error={personalFormState.errors.correoPersonal} />
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormTextInput label="Domicilio (comuna/ciudad)" {...registerPersonal('domicilio')} error={personalFormState.errors.domicilio} />
                <FormTextInput label="Calle" {...registerPersonal('calle')} error={personalFormState.errors.calle} />
                <FormTextInput label="Número" {...registerPersonal('numero')} error={personalFormState.errors.numero} />
                <FormTextInput label="Depto" {...registerPersonal('depto')} error={personalFormState.errors.depto} />
              </Stack>
              <FormTextInput label="LinkedIn" placeholder="https://www.linkedin.com/in/..." {...registerPersonal('linkedin')} error={personalFormState.errors.linkedin} />
              <Button type="submit" alignSelf="flex-start">
                Guardar datos personales
              </Button>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </DashboardLayout>
  );
};

export default EmployeeProfilePage;
