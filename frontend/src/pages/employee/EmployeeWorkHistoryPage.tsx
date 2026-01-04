import {
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormTextInput from '../../components/forms/FormTextInput';
import FormTextarea from '../../components/forms/FormTextarea';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const schema = z.object({
  empresa: z.string().min(2, 'Ingresa la empresa'),
  cargo: z.string().min(2, 'Ingresa el cargo'),
  fechaInicio: z.string().min(1, 'Ingresa una fecha'),
  fechaFin: z.string().min(1, 'Ingresa una fecha'),
  funciones: z.string().min(5, 'Describe tus funciones'),
  area: z.string().min(2, 'Ingresa el área'),
});

type FormValues = z.infer<typeof schema>;

type WorkRecord = FormValues & { id: string };

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString());

const EmployeeWorkHistoryPage = () => {
  const [records, setRecords] = useLocalStorage<WorkRecord[]>('employee-work-records', []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { empresa: '', cargo: '', fechaInicio: '', fechaFin: '', funciones: '', area: '' } });

  const onSubmit = (values: FormValues) => {
    if (editingId) {
      setRecords(records.map((record) => (record.id === editingId ? { ...record, ...values } : record)));
      toast({ title: 'Antecedente actualizado', status: 'success' });
    } else {
      setRecords([...records, { ...values, id: createId() }]);
      toast({ title: 'Antecedente agregado', status: 'success' });
    }
    reset({ empresa: '', cargo: '', fechaInicio: '', fechaFin: '', funciones: '', area: '' });
    setEditingId(null);
  };

  const handleEdit = (record: WorkRecord) => {
    setEditingId(record.id);
    reset(record);
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter((record) => record.id !== id));
    if (editingId === id) {
      reset({ empresa: '', cargo: '', fechaInicio: '', fechaFin: '', funciones: '', area: '' });
      setEditingId(null);
    }
  };

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Mis antecedentes laborales</Heading>
        <Card>
          <CardBody>
            <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormTextInput label="Empresa" {...register('empresa')} error={errors.empresa} />
                <FormTextInput label="Área" {...register('area')} error={errors.area} />
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormTextInput label="Cargo" {...register('cargo')} error={errors.cargo} />
                <FormTextInput label="Fecha inicio" type="date" {...register('fechaInicio')} error={errors.fechaInicio} />
                <FormTextInput label="Fecha fin" type="date" {...register('fechaFin')} error={errors.fechaFin} />
              </Stack>
              <FormTextarea
                label="Funciones y logros"
                placeholder="Describe las principales responsabilidades, logros y tecnologías empleadas"
                {...register('funciones')}
                error={errors.funciones}
              />
              <Stack direction="row" spacing={3}>
                <Button type="submit" minW="180px">
                  {editingId ? 'Actualizar antecedente' : 'Agregar antecedente'}
                </Button>
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      reset({ empresa: '', cargo: '', fechaInicio: '', fechaFin: '', funciones: '', area: '' });
                      setEditingId(null);
                    }}
                  >
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>
              Experiencia cargada
            </Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Empresa</Th>
                  <Th>Cargo</Th>
                  <Th>Período</Th>
                  <Th>Área</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {records.map((record) => (
                  <Tr key={record.id}>
                    <Td>{record.empresa}</Td>
                    <Td>{record.cargo}</Td>
                    <Td>
                      {new Date(record.fechaInicio).toLocaleDateString()} - {new Date(record.fechaFin).toLocaleDateString()}
                    </Td>
                    <Td>
                      <Badge colorScheme="blue">{record.area}</Badge>
                    </Td>
                    <Td>
                      <Stack direction="row" spacing={3}>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(record)}>
                          Editar
                        </Button>
                        <Button size="sm" variant="ghost" colorScheme="red" onClick={() => handleDelete(record.id)}>
                          Eliminar
                        </Button>
                      </Stack>
                    </Td>
                  </Tr>
                ))}
                {records.length === 0 && (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      Aún no registras antecedentes.
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

export default EmployeeWorkHistoryPage;
