import {
  Badge,
  Button,
  Card,
  CardBody,
  Heading,
  Spinner,
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
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormTextInput from '../../components/forms/FormTextInput';
import FormTextarea from '../../components/forms/FormTextarea';
import { createJob, deleteJob, fetchMyJobs, updateJob } from '../../api/jobs';

const schema = z.object({
  empresa: z.string().min(2, 'Ingresa la empresa'),
  cargo: z.string().min(2, 'Ingresa el cargo'),
  fechaInicio: z.string().min(1, 'Ingresa una fecha'),
  fechaFin: z.string().optional(),
  descripcion: z.string().min(5, 'Describe tus funciones'),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  empresa: '',
  cargo: '',
  fechaInicio: '',
  fechaFin: '',
  descripcion: '',
};

const EmployeeWorkHistoryPage = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['jobs'], queryFn: fetchMyJobs });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toast({ title: 'Antecedente agregado', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      reset(defaultValues);
    },
    onError: (error: any) => toast({ title: 'Error al guardar', description: error?.response?.data?.message, status: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FormValues> }) => updateJob(id, payload),
    onSuccess: () => {
      toast({ title: 'Antecedente actualizado', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      reset(defaultValues);
      setEditingId(null);
    },
    onError: (error: any) => toast({ title: 'Error al actualizar', description: error?.response?.data?.message, status: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast({ title: 'Antecedente eliminado', status: 'info' });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (error: any) => toast({ title: 'Error al eliminar', description: error?.response?.data?.message, status: 'error' }),
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      fechaFin: values.fechaFin || undefined,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (record: any) => {
    setEditingId(record.id);
    reset({
      empresa: record.empresa,
      cargo: record.cargo,
      fechaInicio: record.fechaInicio.slice(0, 10),
      fechaFin: record.fechaFin?.slice(0, 10) ?? '',
      descripcion: record.descripcion ?? '',
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
    if (editingId === id) {
      reset(defaultValues);
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
                <FormTextInput label="Cargo" {...register('cargo')} error={errors.cargo} />
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormTextInput label="Fecha inicio" type="date" {...register('fechaInicio')} error={errors.fechaInicio} />
                <FormTextInput label="Fecha fin" type="date" {...register('fechaFin')} error={errors.fechaFin} />
              </Stack>
              <FormTextarea
                label="Funciones y logros"
                placeholder="Describe las principales responsabilidades"
                {...register('descripcion')}
                error={errors.descripcion}
              />
              <Stack direction="row" spacing={3}>
                <Button type="submit" minW="180px" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Actualizar antecedente' : 'Agregar antecedente'}
                </Button>
                {editingId && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      reset(defaultValues);
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
            {isLoading ? (
              <Spinner />
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Empresa</Th>
                    <Th>Cargo</Th>
                    <Th>Período</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.map((record) => (
                    <Tr key={record.id}>
                      <Td>{record.empresa}</Td>
                      <Td>
                        <Badge colorScheme="blue">{record.cargo}</Badge>
                      </Td>
                      <Td>
                        {new Date(record.fechaInicio).toLocaleDateString()} -{' '}
                        {record.fechaFin ? new Date(record.fechaFin).toLocaleDateString() : 'Actual'}
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
                  {data?.length === 0 && (
                    <Tr>
                      <Td colSpan={4} textAlign="center">
                        Aún no registras antecedentes.
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

export default EmployeeWorkHistoryPage;
