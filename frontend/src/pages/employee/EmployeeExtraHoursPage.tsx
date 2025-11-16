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
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormTextarea from '../../components/forms/FormTextarea';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const schema = z.object({
  fecha: z.string().min(1, 'Selecciona una fecha'),
  horas: z.coerce.number().min(1, 'Ingresa al menos 1 hora'),
  actividad: z.string().min(2, 'Describe la actividad'),
  autorizadoPor: z.string().min(2, 'Ingresa quién autorizó'),
  descripcion: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type ExtraHourRecord = FormValues & { id: string };

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString());

const EmployeeExtraHoursPage = () => {
  const [records, setRecords] = useLocalStorage<ExtraHourRecord[]>('employee-extra-hours', []);
  const [monthFilter, setMonthFilter] = useState('todos');
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { fecha: '', horas: 1, actividad: '', autorizadoPor: '', descripcion: '' },
  });

  const onSubmit = (values: FormValues) => {
    setRecords([...records, { ...values, id: createId() }]);
    toast({ title: 'Registro guardado', description: 'Este módulo replica cómo RRHH carga tus horas.', status: 'success' });
    reset({ fecha: '', horas: 1, actividad: '', autorizadoPor: '', descripcion: '' });
  };

  const months = useMemo(() => {
    const data = new Set(records.map((record) => record.fecha.slice(0, 7)));
    return Array.from(data);
  }, [records]);

  const filtered = records.filter((record) => (monthFilter === 'todos' ? true : record.fecha.startsWith(monthFilter)));

  const totalHoras = filtered.reduce((acc, record) => acc + record.horas, 0);

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Horas extras</Heading>
        <Text color="gray.600">
          Visualiza las horas extras registradas cada mes. Puedes ingresar datos manualmente mientras RRHH habilita la conexión con
          el sistema oficial.
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
                  <Input type="number" min={1} bg="white" {...register('horas')} />
                  {errors.horas && <FormErrorMessage>{errors.horas.message}</FormErrorMessage>}
                </FormControl>
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormControl isInvalid={Boolean(errors.actividad)}>
                  <FormLabel>Actividad</FormLabel>
                  <Input placeholder="Kine, cámara, HIFU, etc." bg="white" {...register('actividad')} />
                  {errors.actividad && <FormErrorMessage>{errors.actividad.message}</FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={Boolean(errors.autorizadoPor)}>
                  <FormLabel>Autorizado por</FormLabel>
                  <Input placeholder="Nombre supervisor" bg="white" {...register('autorizadoPor')} />
                  {errors.autorizadoPor && <FormErrorMessage>{errors.autorizadoPor.message}</FormErrorMessage>}
                </FormControl>
              </Stack>
              <FormTextarea label="Detalle" placeholder="Descripción adicional" {...register('descripcion')} error={errors.descripcion} />
              <Button type="submit" alignSelf="flex-start">
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
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Fecha</Th>
                  <Th>Horas</Th>
                  <Th>Actividad</Th>
                  <Th>Autorizado por</Th>
                  <Th>Detalle</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtered.map((record) => (
                  <Tr key={record.id}>
                    <Td>{new Date(record.fecha).toLocaleDateString()}</Td>
                    <Td>{record.horas}</Td>
                    <Td>
                      <Badge colorScheme="green">{record.actividad}</Badge>
                    </Td>
                    <Td>{record.autorizadoPor}</Td>
                    <Td>{record.descripcion || '—'}</Td>
                  </Tr>
                ))}
                {filtered.length === 0 && (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No hay horas cargadas para el período seleccionado.
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

export default EmployeeExtraHoursPage;
