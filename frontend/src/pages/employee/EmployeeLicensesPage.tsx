import {
  Badge,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchMyLicenses } from '../../api/licenses';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { readFileAsDataURL } from '../../utils/file';

const schema = z.object({
  tipo: z.string().min(2, 'Indica el tipo de licencia'),
  fechaInicio: z.string().min(1, 'Selecciona la fecha de inicio'),
  fechaFin: z.string().min(1, 'Selecciona la fecha de término'),
  cantidadDias: z.coerce.number().min(1, 'Debes indicar al menos 1 día'),
  comentario: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type LocalLicense = FormValues & {
  id: string;
  archivo?: {
    nombre: string;
    dataUrl: string;
  };
};

type CombinedLicenseRow = LocalLicense & { archivoRemoto?: string };

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString());

const EmployeeLicensesPage = () => {
  const { data } = useQuery({ queryKey: ['licencias'], queryFn: fetchMyLicenses });
  const [localLicenses, setLocalLicenses] = useLocalStorage<LocalLicense[]>('employee-custom-licenses', []);
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tipo: 'Licencia médica', fechaInicio: '', fechaFin: '', cantidadDias: 1, comentario: '' },
  });

  const onSubmit = async (values: FormValues) => {
    let archivo;
    if (archivoSeleccionado) {
      const dataUrl = await readFileAsDataURL(archivoSeleccionado);
      archivo = { nombre: archivoSeleccionado.name, dataUrl };
    }
    setLocalLicenses([...localLicenses, { ...values, id: createId(), archivo }]);
    toast({ title: 'Licencia registrada', description: 'Será visible para RRHH desde este módulo.', status: 'success' });
    reset({ tipo: 'Licencia médica', fechaInicio: '', fechaFin: '', cantidadDias: 1, comentario: '' });
    setArchivoSeleccionado(null);
  };

  const dayDiff = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diff = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  const combinedLicenses: CombinedLicenseRow[] = [
    ...(data?.map((remote) => ({
      id: remote.id,
      tipo: remote.tipo,
      fechaInicio: remote.fechaInicio,
      fechaFin: remote.fechaFin,
      comentario: remote.observaciones ?? undefined,
      cantidadDias: dayDiff(remote.fechaInicio, remote.fechaFin),
      archivoRemoto: remote.urlArchivoLicencia,
      archivo: undefined,
    })) ?? []),
    ...localLicenses,
  ];

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Mis licencias médicas</Heading>
        <Text color="gray.600">Sube tus licencias directamente y haz seguimiento de los documentos enviados a RRHH.</Text>
        <Card>
          <CardBody>
            <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
              <FormControl isInvalid={Boolean(errors.tipo)}>
                <FormLabel>Tipo de licencia</FormLabel>
                <Input placeholder="Ej: Licencia médica maternal" bg="white" {...register('tipo')} />
                {errors.tipo && <FormErrorMessage>{errors.tipo.message}</FormErrorMessage>}
              </FormControl>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormControl isInvalid={Boolean(errors.fechaInicio)}>
                  <FormLabel>Fecha inicio</FormLabel>
                  <Input type="date" bg="white" {...register('fechaInicio')} />
                  {errors.fechaInicio && <FormErrorMessage>{errors.fechaInicio.message}</FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={Boolean(errors.fechaFin)}>
                  <FormLabel>Fecha fin</FormLabel>
                  <Input type="date" bg="white" {...register('fechaFin')} />
                  {errors.fechaFin && <FormErrorMessage>{errors.fechaFin.message}</FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={Boolean(errors.cantidadDias)}>
                  <FormLabel>Días</FormLabel>
                  <Input type="number" min={1} bg="white" {...register('cantidadDias')} />
                  {errors.cantidadDias && <FormErrorMessage>{errors.cantidadDias.message}</FormErrorMessage>}
                </FormControl>
              </Stack>
              <FormControl>
                <FormLabel>Comentario</FormLabel>
                <Textarea bg="white" placeholder="Observaciones adicionales" {...register('comentario')} />
              </FormControl>
              <FormControl>
                <FormLabel>Archivo adjunto</FormLabel>
                <Input
                  type="file"
                  accept="application/pdf,image/*"
                  bg="white"
                  onChange={(event) => setArchivoSeleccionado(event.target.files?.[0] ?? null)}
                />
              </FormControl>
              <Button type="submit" isLoading={isSubmitting} alignSelf="flex-start">
                Registrar licencia
              </Button>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Licencias registradas
            </Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Tipo</Th>
                  <Th>Fechas</Th>
                  <Th>Días</Th>
                  <Th>Comentario</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {combinedLicenses.map((licencia) => (
                  <Tr key={licencia.id}>
                    <Td>
                      <Badge colorScheme="blue">{licencia.tipo}</Badge>
                    </Td>
                    <Td>
                      {new Date(licencia.fechaInicio).toLocaleDateString()} - {new Date(licencia.fechaFin).toLocaleDateString()}
                    </Td>
                    <Td>{licencia.cantidadDias}</Td>
                    <Td>{licencia.comentario ?? '—'}</Td>
                    <Td>
                      {'archivoRemoto' in licencia && licencia.archivoRemoto ? (
                        <Button as="a" href={licencia.archivoRemoto} target="_blank" rel="noreferrer" size="sm" variant="outline">
                          Ver archivo
                        </Button>
                      ) : licencia.archivo ? (
                        <Button as="a" href={licencia.archivo.dataUrl} download={licencia.archivo.nombre} size="sm" variant="outline">
                          Descargar
                        </Button>
                      ) : (
                        <Text fontSize="sm" color="gray.500">
                          Sin archivo
                        </Text>
                      )}
                    </Td>
                  </Tr>
                ))}
                {combinedLicenses.length === 0 && (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      Aún no se registran licencias.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
      </Stack>
    </DashboardLayout>
  );
};

export default EmployeeLicensesPage;
