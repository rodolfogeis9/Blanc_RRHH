import {
  Badge,
  Button,
  Card,
  CardBody,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Text,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormTextInput from '../../components/forms/FormTextInput';
import FormTextarea from '../../components/forms/FormTextarea';
import { createEducation, deleteEducation, fetchMyEducation, updateEducation } from '../../api/education';
import { fetchMyDocuments } from '../../api/documents';

const schema = z.object({
  tipo: z.enum(['ESTUDIO', 'CERTIFICACION', 'CURSO']),
  institucion: z.string().min(2, 'Ingresa la institución'),
  nombre: z.string().min(2, 'Ingresa el nombre del programa'),
  fechaInicio: z.string().optional(),
  fechaFin: z.string().optional(),
  estado: z.enum(['EN_CURSO', 'COMPLETADO']),
  descripcion: z.string().optional(),
  documentoId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const defaultValues: FormValues = {
  tipo: 'ESTUDIO',
  institucion: '',
  nombre: '',
  fechaInicio: '',
  fechaFin: '',
  estado: 'EN_CURSO',
  descripcion: '',
  documentoId: '',
};

const EmployeeEducationPage = () => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({ queryKey: ['education'], queryFn: fetchMyEducation });
  const { data: certificados } = useQuery({
    queryKey: ['documents', 'CERTIFICADO'],
    queryFn: () => fetchMyDocuments({ tipoDocumento: 'CERTIFICADO' }),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const createMutation = useMutation({
    mutationFn: createEducation,
    onSuccess: () => {
      toast({ title: 'Estudio agregado', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['education'] });
      reset(defaultValues);
    },
    onError: (error: any) => toast({ title: 'Error al guardar', description: error?.response?.data?.message, status: 'error' }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<FormValues> }) => updateEducation(id, payload),
    onSuccess: () => {
      toast({ title: 'Registro actualizado', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['education'] });
      reset(defaultValues);
      setEditingId(null);
    },
    onError: (error: any) => toast({ title: 'Error al actualizar', description: error?.response?.data?.message, status: 'error' }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEducation,
    onSuccess: () => {
      toast({ title: 'Registro eliminado', status: 'info' });
      queryClient.invalidateQueries({ queryKey: ['education'] });
    },
    onError: (error: any) => toast({ title: 'Error al eliminar', description: error?.response?.data?.message, status: 'error' }),
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      documentoId: values.documentoId ? values.documentoId : undefined,
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
      tipo: record.tipo,
      institucion: record.institucion,
      nombre: record.nombre,
      fechaInicio: record.fechaInicio?.slice(0, 10) ?? '',
      fechaFin: record.fechaFin?.slice(0, 10) ?? '',
      estado: record.estado,
      descripcion: record.descripcion ?? '',
      documentoId: record.documentoId ?? '',
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
        <Heading size="lg">Mis estudios y formación</Heading>
        <Text color="gray.600">Administra tus carreras, certificaciones y cursos completados directamente desde este espacio.</Text>
        <Card>
          <CardBody>
            <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormControl isInvalid={Boolean(errors.tipo)}>
                  <FormLabel>Tipo de estudio</FormLabel>
                  <Select {...register('tipo')} bg="white">
                    <option value="ESTUDIO">Estudio formal</option>
                    <option value="CERTIFICACION">Certificación</option>
                    <option value="CURSO">Curso</option>
                  </Select>
                  {errors.tipo && <FormErrorMessage>{errors.tipo.message}</FormErrorMessage>}
                </FormControl>
                <FormControl isInvalid={Boolean(errors.estado)}>
                  <FormLabel>Estado</FormLabel>
                  <Select {...register('estado')} bg="white">
                    <option value="EN_CURSO">En curso</option>
                    <option value="COMPLETADO">Completado</option>
                  </Select>
                  {errors.estado && <FormErrorMessage>{errors.estado.message}</FormErrorMessage>}
                </FormControl>
              </Stack>
              <FormTextInput label="Institución" {...register('institucion')} error={errors.institucion} />
              <FormTextInput label="Programa / título" {...register('nombre')} error={errors.nombre} />
              <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                <FormTextInput label="Fecha inicio" type="date" {...register('fechaInicio')} error={errors.fechaInicio} />
                <FormTextInput label="Fecha fin" type="date" {...register('fechaFin')} error={errors.fechaFin} />
              </Stack>
              <FormTextarea
                label="Descripción / logros"
                placeholder="Incluye principales aprendizajes o distinciones"
                {...register('descripcion')}
                error={errors.descripcion}
              />
              <FormControl>
                <FormLabel>Certificado adjunto (opcional)</FormLabel>
                <Select {...register('documentoId')} bg="white" placeholder="Selecciona un certificado">
                  {certificados?.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.nombreArchivoOriginal}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <Stack direction="row" spacing={3}>
                <Button type="submit" minW="180px" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'Actualizar' : 'Agregar estudio'}
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
              Historial cargado
            </Heading>
            {isLoading ? (
              <Spinner />
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Tipo</Th>
                    <Th>Programa</Th>
                    <Th>Institución</Th>
                    <Th>Estado</Th>
                    <Th>Período</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data?.map((record) => (
                    <Tr key={record.id}>
                      <Td>
                        <Badge colorScheme="purple">{record.tipo}</Badge>
                      </Td>
                      <Td>{record.nombre}</Td>
                      <Td>{record.institucion}</Td>
                      <Td>{record.estado}</Td>
                      <Td>
                        {record.fechaInicio ? new Date(record.fechaInicio).toLocaleDateString() : '—'} -{' '}
                        {record.fechaFin ? new Date(record.fechaFin).toLocaleDateString() : '—'}
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
                      <Td colSpan={6} textAlign="center">
                        Aún no registras estudios.
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

export default EmployeeEducationPage;
