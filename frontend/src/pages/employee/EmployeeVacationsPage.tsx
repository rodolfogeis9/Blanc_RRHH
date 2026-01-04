import {
  Badge,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Textarea,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchMe } from '../../api/me';
import { createVacationRequestApi, fetchMyVacationRequests } from '../../api/vacations';

const schema = z.object({
  tipoSolicitud: z.enum(['VACACIONES', 'PERMISO_DESCONTADO_DE_VACACIONES']),
  fechaInicio: z.string(),
  fechaFin: z.string(),
  comentarioEmpleado: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const EmployeeVacationsPage = () => {
  const { data: perfil } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const { data: solicitudes } = useQuery({ queryKey: ['vacaciones'], queryFn: fetchMyVacationRequests });
  const queryClient = useQueryClient();
  const toast = useToast();
  const { register, handleSubmit, reset } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: createVacationRequestApi,
    onSuccess: () => {
      toast({ title: 'Solicitud enviada', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['vacaciones'] });
      reset();
    },
    onError: (error: any) => {
      toast({ title: 'No pudimos crear la solicitud', description: error?.response?.data?.message, status: 'error' });
    },
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Mis vacaciones</Heading>
        <Grid templateColumns={{ base: '1fr', lg: '2fr 3fr' }} gap={6} alignItems="flex-start">
          <GridItem>
            <Card>
              <CardBody>
                <Stack spacing={4}>
                  <Heading size="md">Saldo actual</Heading>
                  <Stack direction="row" spacing={4}>
                    <Badge colorScheme="green" fontSize="md">
                      Saldo: {perfil?.saldoVacaciones ?? 0} días
                    </Badge>
                    <Badge colorScheme="purple" fontSize="md">
                      Acumulados: {perfil?.totalVacaciones ?? 0}
                    </Badge>
                    <Badge colorScheme="orange" fontSize="md">
                      Tomados: {perfil?.diasVacacionesTomados ?? 0}
                    </Badge>
                  </Stack>
                  <Heading size="sm">Nueva solicitud</Heading>
                  <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
                    <FormControl>
                      <FormLabel>Tipo de solicitud</FormLabel>
                      <Select {...register('tipoSolicitud')} bg="white">
                        <option value="VACACIONES">Vacaciones</option>
                        <option value="PERMISO_DESCONTADO_DE_VACACIONES">Permiso descontado de vacaciones</option>
                      </Select>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Fecha inicio</FormLabel>
                      <Input type="date" {...register('fechaInicio')} bg="white" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Fecha fin</FormLabel>
                      <Input type="date" {...register('fechaFin')} bg="white" />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Comentario</FormLabel>
                      <Textarea {...register('comentarioEmpleado')} bg="white" placeholder="Información adicional" />
                    </FormControl>
                    <Button type="submit" isLoading={mutation.isPending} alignSelf="flex-start">
                      Enviar solicitud
                    </Button>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Historial de solicitudes
                </Heading>
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th>Tipo</Th>
                      <Th>Fechas</Th>
                      <Th>Días</Th>
                      <Th>Estado</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {solicitudes?.map((solicitud) => (
                      <Tr key={solicitud.id}>
                        <Td>{solicitud.tipoSolicitud}</Td>
                        <Td>
                          {new Date(solicitud.fechaInicio).toLocaleDateString()} -{' '}
                          {new Date(solicitud.fechaFin).toLocaleDateString()}
                        </Td>
                        <Td>{solicitud.cantidadDias}</Td>
                        <Td>
                          <Badge colorScheme={solicitud.estado === 'APROBADA' ? 'green' : solicitud.estado === 'RECHAZADA' ? 'red' : 'yellow'}>
                            {solicitud.estado}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                    {solicitudes?.length === 0 && (
                      <Tr>
                        <Td colSpan={4} textAlign="center">
                          Aún no registras solicitudes.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </Stack>
    </DashboardLayout>
  );
};

export default EmployeeVacationsPage;
