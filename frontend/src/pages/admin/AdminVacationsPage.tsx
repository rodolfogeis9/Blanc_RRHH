import {
  Badge,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Textarea,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  VacationAdminRequest,
  approveVacationRequest,
  fetchVacationRequestsAdmin,
  rejectVacationRequest,
} from '../../api/admin';

const AdminVacationsPage = () => {
  const [estado, setEstado] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [comentario, setComentario] = useState('');
  const [selected, setSelected] = useState<VacationAdminRequest | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-vacaciones', estado, empleadoId],
    queryFn: () => fetchVacationRequestsAdmin({ estado: estado || undefined, empleadoId: empleadoId || undefined }),
  });

  const approveMutation = useMutation({
    mutationFn: () => approveVacationRequest(selected!.id, comentario || undefined),
    onSuccess: () => {
      toast({ title: 'Solicitud aprobada', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-vacaciones'] });
      setSelected(null);
      setComentario('');
    },
    onError: (error: any) => toast({ title: 'Error al aprobar', description: error?.response?.data?.message, status: 'error' }),
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectVacationRequest(selected!.id, comentario || undefined),
    onSuccess: () => {
      toast({ title: 'Solicitud rechazada', status: 'info' });
      queryClient.invalidateQueries({ queryKey: ['admin-vacaciones'] });
      setSelected(null);
      setComentario('');
    },
    onError: (error: any) => toast({ title: 'Error al rechazar', description: error?.response?.data?.message, status: 'error' }),
  });

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Solicitudes de vacaciones</Heading>
        <Card>
          <CardBody>
            <Flex gap={3} flexWrap="wrap" mb={4}>
              <Select placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} bg="white" maxW="200px">
                <option value="PENDIENTE">Pendiente</option>
                <option value="APROBADA">Aprobada</option>
                <option value="RECHAZADA">Rechazada</option>
              </Select>
              <Input
                placeholder="Filtrar por ID de empleado"
                value={empleadoId}
                onChange={(e) => setEmpleadoId(e.target.value)}
                bg="white"
                maxW="260px"
              />
            </Flex>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Colaborador</Th>
                  <Th>Fechas</Th>
                  <Th>Días</Th>
                  <Th>Estado</Th>
                  <Th>Acciones</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      {item.empleado.nombre} {item.empleado.apellido}
                      <br />
                      <Badge colorScheme="purple">{item.empleado.area}</Badge>
                    </Td>
                    <Td>
                      {new Date(item.fechaInicio).toLocaleDateString()} - {new Date(item.fechaFin).toLocaleDateString()}
                    </Td>
                    <Td>{item.cantidadDias}</Td>
                    <Td>
                      <Badge colorScheme={item.estado === 'APROBADA' ? 'green' : item.estado === 'RECHAZADA' ? 'red' : 'yellow'}>
                        {item.estado}
                      </Badge>
                    </Td>
                    <Td>
                      {item.estado === 'PENDIENTE' ? (
                        <Stack direction="row" spacing={3}>
                          <Button size="sm" onClick={() => setSelected(item)} colorScheme="green">
                            Aprobar / rechazar
                          </Button>
                        </Stack>
                      ) : (
                        <Badge colorScheme="gray">Gestionada</Badge>
                      )}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>
        {selected && (
          <Card>
            <CardBody>
              <Heading size="md" mb={4}>
                Gestionar solicitud de {selected.empleado.nombre} {selected.empleado.apellido}
              </Heading>
              <Stack spacing={4}>
                <Textarea
                  placeholder="Comentario opcional"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  bg="white"
                />
                <Flex gap={3}>
                  <Button colorScheme="green" onClick={() => approveMutation.mutate()} isLoading={approveMutation.isPending}>
                    Aprobar
                  </Button>
                  <Button colorScheme="red" variant="outline" onClick={() => rejectMutation.mutate()} isLoading={rejectMutation.isPending}>
                    Rechazar
                  </Button>
                  <Button variant="ghost" onClick={() => setSelected(null)}>
                    Cancelar
                  </Button>
                </Flex>
              </Stack>
            </CardBody>
          </Card>
        )}
      </Stack>
    </DashboardLayout>
  );
};

export default AdminVacationsPage;
