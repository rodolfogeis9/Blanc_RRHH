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
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormTextInput from '../../components/forms/FormTextInput';
import FormTextarea from '../../components/forms/FormTextarea';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const schema = z.object({
  tipo: z.string().min(1, 'Selecciona un tipo'),
  institucion: z.string().min(2, 'Ingresa la institución'),
  nombrePrograma: z.string().min(2, 'Ingresa el nombre del programa'),
  fechaInicio: z.string().min(1, 'Ingresa una fecha'),
  fechaFin: z.string().min(1, 'Ingresa una fecha'),
  descripcion: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type EducationRecord = FormValues & { id: string };

const defaultValues: FormValues = {
  tipo: 'CARRERA',
  institucion: '',
  nombrePrograma: '',
  fechaInicio: '',
  fechaFin: '',
  descripcion: '',
};

const createId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : Date.now().toString());

const EmployeeEducationPage = () => {
  const [records, setRecords] = useLocalStorage<EducationRecord[]>('employee-education-records', []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const onSubmit = (values: FormValues) => {
    if (editingId) {
      setRecords(records.map((record) => (record.id === editingId ? { ...record, ...values } : record)));
      toast({ title: 'Registro actualizado', status: 'success' });
    } else {
      setRecords([...records, { ...values, id: createId() }]);
      toast({ title: 'Estudio agregado', status: 'success' });
    }
    reset(defaultValues);
    setEditingId(null);
  };

  const handleEdit = (record: EducationRecord) => {
    setEditingId(record.id);
    reset({ ...record });
  };

  const handleDelete = (id: string) => {
    setRecords(records.filter((record) => record.id !== id));
    if (editingId === id) {
      reset(defaultValues);
      setEditingId(null);
    }
  };

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Mis estudios y formación</Heading>
        <Text color="gray.600">Administra tus carreras, diplomados y cursos completados directamente desde este espacio.</Text>
        <Card>
          <CardBody>
            <Stack as="form" spacing={4} onSubmit={handleSubmit(onSubmit)}>
              <FormControl isInvalid={Boolean(errors.tipo)}>
                <FormLabel>Tipo de estudio</FormLabel>
                <Select {...register('tipo')} bg="white">
                  <option value="CARRERA">Carrera profesional</option>
                  <option value="DIPLOMADO">Diplomado</option>
                  <option value="POSTGRADO">Postgrado</option>
                  <option value="CURSO">Curso / Certificación</option>
                </Select>
                {errors.tipo && <FormErrorMessage>{errors.tipo.message}</FormErrorMessage>}
              </FormControl>
              <FormTextInput label="Institución" {...register('institucion')} error={errors.institucion} />
              <FormTextInput label="Programa" {...register('nombrePrograma')} error={errors.nombrePrograma} />
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
              <Stack direction="row" spacing={3}>
                <Button type="submit" minW="180px">
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
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Tipo</Th>
                  <Th>Programa</Th>
                  <Th>Institución</Th>
                  <Th>Período</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {records.map((record) => (
                  <Tr key={record.id}>
                    <Td>
                      <Badge colorScheme="purple">{record.tipo}</Badge>
                    </Td>
                    <Td>{record.nombrePrograma}</Td>
                    <Td>{record.institucion}</Td>
                    <Td>
                      {new Date(record.fechaInicio).toLocaleDateString()} - {new Date(record.fechaFin).toLocaleDateString()}
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
                      Aún no registras estudios.
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

export default EmployeeEducationPage;
