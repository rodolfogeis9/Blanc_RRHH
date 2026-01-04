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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
import {
  approveOvertime,
  fetchOvertimeRequests,
  rejectOvertime,
  OvertimeItem,
} from '../../api/overtime';

const AdminVacationsPage = () => {
  const [estado, setEstado] = useState('');
  const [empleadoId, setEmpleadoId] = useState('');
  const [estadoOvertime, setEstadoOvertime] = useState('');
  const [empleadoOvertimeId, setEmpleadoOvertimeId] = useState('');
  const [comentario, setComentario] = useState('');
  const [selected, setSelected] = useState<VacationAdminRequest | null>(null);
  const [selectedOvertime, setSelectedOvertime] = useState<OvertimeItem | null>(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-vacaciones', estado, empleadoId],
    queryFn: () => fetchVacationRequestsAdmin({ estado: estado || undefined, empleadoId: empleadoId || undefined }),
  });

  const { data: overtimeData } = useQuery({
    queryKey: ['admin-overtime', estadoOvertime, empleadoOvertimeId],
    queryFn: () => fetchOvertimeRequests({ estado: estadoOvertime || undefined, empleadoId: empleadoOvertimeId || undefined }),
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

  const approveOvertimeMutation = useMutation({
    mutationFn: () => approveOvertime(selectedOvertime!.id),
    onSuccess: () => {
      toast({ title: 'Horas extra aprobadas', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-overtime'] });
      setSelectedOvertime(null);
      setComentario('');
    },
    onError: (error: any) => toast({ title: 'Error al aprobar', description: error?.response?.data?.message, status: 'error' }),
  });

  const rejectOvertimeMutation = useMutation({
    mutationFn: () => rejectOvertime(selectedOvertime!.id, comentario || undefined),
    onSuccess: () => {
      toast({ title: 'Horas extra rechazadas', status: 'info' });
      queryClient.invalidateQueries({ queryKey: ['admin-overtime'] });
      setSelectedOvertime(null);
      setComentario('');
    },
    onError: (error: any) => toast({ title: 'Error al rechazar', description: error?.response?.data?.message, status: 'error' }),
  });

  const exportCsv = (rows: string[][], filename: string) => {
    const csvContent = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportVacations = () => {
    const rows = [
      ['Empleado', 'Tipo', 'Estado', 'Fecha inicio', 'Fecha fin', 'Días'],
      ...(data ?? []).map((item) => [
        `${item.empleado.nombre} ${item.empleado.apellido}`,
        item.tipoSolicitud,
        item.estado,
        item.fechaInicio,
        item.fechaFin,
        String(item.cantidadDias),
      ]),
    ];
    exportCsv(rows, 'solicitudes_vacaciones.csv');
  };

  const handleExportOvertime = () => {
    const rows = [
      ['Empleado', 'Fecha', 'Horas', 'Estado', 'Motivo'],
      ...(overtimeData ?? []).map((item) => [
        item.usuario ? `${item.usuario.nombre} ${item.usuario.apellido}` : '—',
        item.fecha,
        String(item.horas),
        item.estado,
        item.motivo ?? '',
      ]),
    ];
    exportCsv(rows, 'solicitudes_horas_extras.csv');
  };

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Solicitudes operativas</Heading>
        <Tabs variant="enclosed" colorScheme="purple">
          <TabList>
            <Tab>Vacaciones</Tab>
            <Tab>Horas extra</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>
              <Card>
                <CardBody>
                  <Flex gap={3} flexWrap="wrap" mb={4} align="center">
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
                    <Button variant="outline" size="sm" onClick={handleExportVacations}>
                      Exportar CSV
                    </Button>
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
                      {data?.length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center">
                            No hay solicitudes para los filtros seleccionados.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
              {selected && (
                <Card mt={4}>
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
            </TabPanel>
            <TabPanel px={0}>
              <Card>
                <CardBody>
                  <Flex gap={3} flexWrap="wrap" mb={4} align="center">
                    <Select
                      placeholder="Estado"
                      value={estadoOvertime}
                      onChange={(e) => setEstadoOvertime(e.target.value)}
                      bg="white"
                      maxW="200px"
                    >
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="APROBADA">Aprobada</option>
                      <option value="RECHAZADA">Rechazada</option>
                    </Select>
                    <Input
                      placeholder="Filtrar por ID de empleado"
                      value={empleadoOvertimeId}
                      onChange={(e) => setEmpleadoOvertimeId(e.target.value)}
                      bg="white"
                      maxW="260px"
                    />
                    <Button variant="outline" size="sm" onClick={handleExportOvertime}>
                      Exportar CSV
                    </Button>
                  </Flex>
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Colaborador</Th>
                        <Th>Fecha</Th>
                        <Th>Horas</Th>
                        <Th>Estado</Th>
                        <Th>Acciones</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {overtimeData?.map((item) => (
                        <Tr key={item.id}>
                          <Td>
                            {item.usuario?.nombre} {item.usuario?.apellido}
                            <br />
                            <Badge colorScheme="purple">{item.usuario?.area}</Badge>
                          </Td>
                          <Td>{new Date(item.fecha).toLocaleDateString()}</Td>
                          <Td>{item.horas}</Td>
                          <Td>
                            <Badge colorScheme={item.estado === 'APROBADA' ? 'green' : item.estado === 'RECHAZADA' ? 'red' : 'yellow'}>
                              {item.estado}
                            </Badge>
                          </Td>
                          <Td>
                            {item.estado === 'PENDIENTE' ? (
                              <Button size="sm" onClick={() => setSelectedOvertime(item)} colorScheme="green">
                                Aprobar / rechazar
                              </Button>
                            ) : (
                              <Badge colorScheme="gray">Gestionada</Badge>
                            )}
                          </Td>
                        </Tr>
                      ))}
                      {overtimeData?.length === 0 && (
                        <Tr>
                          <Td colSpan={5} textAlign="center">
                            No hay solicitudes de horas extra para los filtros seleccionados.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </CardBody>
              </Card>
              {selectedOvertime && (
                <Card mt={4}>
                  <CardBody>
                    <Heading size="md" mb={4}>
                      Gestionar horas extra de {selectedOvertime.usuario?.nombre} {selectedOvertime.usuario?.apellido}
                    </Heading>
                    <Stack spacing={4}>
                      <Textarea
                        placeholder="Comentario opcional"
                        value={comentario}
                        onChange={(e) => setComentario(e.target.value)}
                        bg="white"
                      />
                      <Flex gap={3}>
                        <Button colorScheme="green" onClick={() => approveOvertimeMutation.mutate()} isLoading={approveOvertimeMutation.isPending}>
                          Aprobar
                        </Button>
                        <Button colorScheme="red" variant="outline" onClick={() => rejectOvertimeMutation.mutate()} isLoading={rejectOvertimeMutation.isPending}>
                          Rechazar
                        </Button>
                        <Button variant="ghost" onClick={() => setSelectedOvertime(null)}>
                          Cancelar
                        </Button>
                      </Flex>
                    </Stack>
                  </CardBody>
                </Card>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    </DashboardLayout>
  );
};

export default AdminVacationsPage;
