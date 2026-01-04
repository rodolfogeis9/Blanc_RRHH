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
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormTextarea from '../../components/forms/FormTextarea';
import { createOvertime, fetchMyOvertime } from '../../api/overtime';

const schema = z.object({
  fecha: z.string().min(1, 'Selecciona una fecha'),
  horas: z.coerce.number().min(0.5, 'Ingresa al menos 0.5 horas'),
  motivo: z.string().min(2, 'Describe la actividad'),
});

type FormValues = z.infer<typeof schema>;

const EmployeeExtraHoursPage = () => {
  const [monthFilter, setMonthFilter] = useState('todos');
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['overtime'], queryFn: fetchMyOvertime });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: '', horas: 1, motivo: '' },
  });

  const mutation = useMutation({
    mutationFn: createOvertime,
    onSuccess: () => {
      toast({ title: 'Registro guardado', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['overtime'] });
      reset({ fecha: '', horas: 1, motivo: '' });
    },
    onError: (error: any) => toast({ title: 'Error al registrar', description: error?.response?.data?.message, status: 'error' }),
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  const months = useMemo(() => {
    if (!data) return [];
    const dataSet = new Set(data.map((record) => record.fecha.slice(0, 7)));
    return Array.from(dataSet);
  }, [data]);

  const filtered = (data ?? []).filter((record) => (monthFilter === 'todos' ? true : record.fecha.startsWith(monthFilter)));

  const totalHoras = filtered.reduce((acc, record) => acc + record.horas, 0);

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Horas extras</Heading>
        <Text color="gray.600">
          Registra tus horas extras para que RRHH pueda revisarlas y aprobarlas.
        </Text>
        <Card>
          <CardBody>
            <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormControl isInvalid={Boolean(errors.fecha)}>
                  <FormLabel>Fecha</FormLabel>
                  <Input type="date" bg="white" {...register('fecha')} />
                  {errors.fecha && <FormErrorMessage>{errors.fecha.message}</FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={Boolean(errors.horas)}>
                  <FormLabel>Horas</FormLabel>
                  <Input type="number" min={0.5} step={0.5} bg="white" {...register('horas')} />
                  {errors.horas && <FormErrorMessage>{errors.horas.message}</FormErrorMessage>}
                </FormControl>
              </Stack>
              <FormTextarea label="Motivo" placeholder="Describe la actividad" {...register('motivo')} error={errors.motivo} />
              <Button type="submit" alignSelf="flex-start" isLoading={mutation.isPending}>
                Registrar horas
              </Button>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={4} align="center">
              <Select maxW="220px" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
                <option value="todos">Todos los meses</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {new Date(`${month}-01`).toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}
                  </option>
                ))}
              </Select>
              <Badge colorScheme="purple" fontSize="md">
                Total horas: {totalHoras}
              </Badge>
            </Stack>
            {isLoading ? (
              <Spinner />
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Fecha</Th>
                    <Th>Horas</Th>
                    <Th>Motivo</Th>
                    <Th>Estado</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtered.map((record) => (
                    <Tr key={record.id}>
                      <Td>{new Date(record.fecha).toLocaleDateString()}</Td>
                      <Td>{record.horas}</Td>
                      <Td>{record.motivo || '—'}</Td>
                      <Td>
                        <Badge colorScheme={record.estado === 'APROBADA' ? 'green' : record.estado === 'RECHAZADA' ? 'red' : 'yellow'}>
                          {record.estado}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                  {filtered.length === 0 && (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        No hay horas cargadas para el período seleccionado.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </Stack>
    </DashboardLayout>
  );
};

export default EmployeeExtraHoursPage;
