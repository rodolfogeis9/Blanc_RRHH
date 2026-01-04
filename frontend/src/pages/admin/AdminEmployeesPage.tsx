import {
  Badge,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Input,
  Select,
  Spinner,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  EmployeeListItem,
  fetchEmployees,
  updateEmployeeFechaIngreso,
  updateEmployeeVacationSaldoInicial,
} from '../../api/admin';
import { deleteDocument, fetchEmployeeDocuments, uploadEmployeeDocument } from '../../api/documents';
import { publishRemuneration } from '../../api/remunerations';
import { useAuth } from '../../context/AuthContext';

const AdminEmployeesPage = () => {
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('');
  const [area, setArea] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeListItem | null>(null);
  const [fechaIngreso, setFechaIngreso] = useState('');
  const [saldoInicial, setSaldoInicial] = useState('');
  const [documentTipo, setDocumentTipo] = useState('CONTRATO');
  const [documentVisibilidad, setDocumentVisibilidad] = useState('ADMIN_Y_EMPLEADO');
  const [documentPeriodo, setDocumentPeriodo] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [remuPeriodo, setRemuPeriodo] = useState('');
  const [remuMontoLiquido, setRemuMontoLiquido] = useState('');
  const [remuMontoBruto, setRemuMontoBruto] = useState('');
  const [remuFile, setRemuFile] = useState<File | null>(null);
  const { auth } = useAuth();
  const isDireccion = auth.role === 'ADMIN_DIRECCION';
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees', nombre, estado, area],
    queryFn: () => fetchEmployees({ nombre: nombre || undefined, estadoLaboral: estado || undefined, area: area || undefined }),
  });

  const { data: employeeDocs, isLoading: docsLoading } = useQuery({
    queryKey: ['employee-docs', selectedEmployee?.id],
    queryFn: () => fetchEmployeeDocuments(selectedEmployee!.id),
    enabled: Boolean(selectedEmployee),
  });

  const updateFechaIngresoMutation = useMutation({
    mutationFn: (value: string) => updateEmployeeFechaIngreso(selectedEmployee!.id, value),
    onSuccess: () => {
      toast({ title: 'Fecha de ingreso actualizada', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
    },
    onError: (error: any) => toast({ title: 'Error al actualizar', description: error?.response?.data?.message, status: 'error' }),
  });

  const updateSaldoInicialMutation = useMutation({
    mutationFn: (value: number) => updateEmployeeVacationSaldoInicial(selectedEmployee!.id, value),
    onSuccess: () => {
      toast({ title: 'Saldo inicial actualizado', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['admin-employees'] });
    },
    onError: (error: any) => toast({ title: 'Error al actualizar', description: error?.response?.data?.message, status: 'error' }),
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: () =>
      uploadEmployeeDocument(selectedEmployee!.id, {
        tipoDocumento: documentTipo,
        periodo: documentPeriodo || undefined,
        visibilidad: documentVisibilidad,
        archivo: documentFile!,
      }),
    onSuccess: () => {
      toast({ title: 'Documento subido', status: 'success' });
      queryClient.invalidateQueries({ queryKey: ['employee-docs', selectedEmployee?.id] });
      setDocumentFile(null);
      setDocumentPeriodo('');
    },
    onError: (error: any) => toast({ title: 'Error al subir', description: error?.response?.data?.message, status: 'error' }),
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: () => {
      toast({ title: 'Documento eliminado', status: 'info' });
      queryClient.invalidateQueries({ queryKey: ['employee-docs', selectedEmployee?.id] });
    },
    onError: (error: any) => toast({ title: 'Error al eliminar', description: error?.response?.data?.message, status: 'error' }),
  });

  const publishRemunerationMutation = useMutation({
    mutationFn: () =>
      publishRemuneration(selectedEmployee!.id, {
        periodo: remuPeriodo,
        montoLiquido: remuMontoLiquido ? Number(remuMontoLiquido) : undefined,
        montoBruto: remuMontoBruto ? Number(remuMontoBruto) : undefined,
        archivo: remuFile ?? undefined,
      }),
    onSuccess: () => {
      toast({ title: 'Liquidación publicada', status: 'success' });
      setRemuPeriodo('');
      setRemuMontoLiquido('');
      setRemuMontoBruto('');
      setRemuFile(null);
    },
    onError: (error: any) => toast({ title: 'Error al publicar', description: error?.response?.data?.message, status: 'error' }),
  });

  const openEmployee = (employee: EmployeeListItem) => {
    setSelectedEmployee(employee);
    setFechaIngreso(employee.fechaIngreso.slice(0, 10));
    setSaldoInicial(employee.saldoVacacionesInicial?.toString() ?? '');
    onOpen();
  };

  const closeModal = () => {
    setSelectedEmployee(null);
    onClose();
  };

  return (
    <DashboardLayout>
      <Card>
        <CardBody>
          <Flex direction={{ base: 'column', md: 'row' }} gap={4} justify="space-between" mb={4}>
            <Heading size="md">Colaboradores Blanc</Heading>
            <Flex gap={3} flexWrap="wrap">
              <Input placeholder="Buscar por nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} bg="white" />
              <Select placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} bg="white">
                <option value="ACTIVO">Activo</option>
                <option value="SUSPENDIDO">Suspendido</option>
                <option value="FINIQUITADO">Finiquitado</option>
              </Select>
              <Input placeholder="Área" value={area} onChange={(e) => setArea(e.target.value)} bg="white" />
            </Flex>
          </Flex>
          {isLoading ? (
            <Spinner />
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Nombre</Th>
                  <Th>Área</Th>
                  <Th>Cargo</Th>
                  <Th>Estado</Th>
                  <Th>Ingreso</Th>
                  <Th>Vacaciones</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.map((employee: EmployeeListItem) => (
                  <Tr key={employee.id}>
                    <Td>
                      <Text fontWeight="600">
                        {employee.nombre} {employee.apellido}
                      </Text>
                    </Td>
                    <Td>{employee.area}</Td>
                    <Td>{employee.cargo}</Td>
                    <Td>
                      <Badge colorScheme={employee.estadoLaboral === 'ACTIVO' ? 'green' : employee.estadoLaboral === 'SUSPENDIDO' ? 'orange' : 'red'}>
                        {employee.estadoLaboral}
                      </Badge>
                    </Td>
                    <Td>{new Date(employee.fechaIngreso).toLocaleDateString()}</Td>
                    <Td>{employee.saldoVacaciones} días</Td>
                    <Td>
                      <Button size="sm" variant="outline" onClick={() => openEmployee(employee)}>
                        Gestionar
                      </Button>
                    </Td>
                  </Tr>
                ))}
                {data?.length === 0 && (
                  <Tr>
                    <Td colSpan={7} textAlign="center">
                      No encontramos colaboradores con esos filtros.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isOpen} onClose={closeModal} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Gestionar colaborador</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEmployee && (
              <Tabs variant="enclosed">
                <TabList>
                  <Tab>Datos laborales</Tab>
                  <Tab>Documentos</Tab>
                  <Tab>Remuneraciones</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Fecha de ingreso</FormLabel>
                        <Input type="date" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} bg="white" />
                      </FormControl>
                      <Button
                        size="sm"
                        onClick={() => updateFechaIngresoMutation.mutate(fechaIngreso)}
                        isDisabled={!isDireccion}
                        isLoading={updateFechaIngresoMutation.isPending}
                      >
                        Guardar fecha ingreso
                      </Button>
                      {!isDireccion && <Text fontSize="sm">Solo administración puede editar la fecha de ingreso.</Text>}
                      <FormControl>
                        <FormLabel>Saldo inicial vacaciones</FormLabel>
                        <Input
                          type="number"
                          value={saldoInicial}
                          onChange={(e) => setSaldoInicial(e.target.value)}
                          bg="white"
                        />
                      </FormControl>
                      <Button
                        size="sm"
                        onClick={() => updateSaldoInicialMutation.mutate(Number(saldoInicial))}
                        isDisabled={!isDireccion}
                        isLoading={updateSaldoInicialMutation.isPending}
                      >
                        Guardar saldo inicial
                      </Button>
                      {!isDireccion && <Text fontSize="sm">Solo administración puede ajustar el saldo inicial.</Text>}
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <Stack spacing={4}>
                      <Heading size="sm">Subir documento</Heading>
                      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                        <Select value={documentTipo} onChange={(e) => setDocumentTipo(e.target.value)} bg="white">
                          <option value="CONTRATO">Contrato</option>
                          <option value="ANEXO">Anexo</option>
                          <option value="LIQUIDACION">Liquidación</option>
                          <option value="ESTUDIO">Estudio</option>
                          <option value="LEGAL">Legal</option>
                          <option value="CAPACITACION">Capacitación</option>
                          <option value="MANUAL">Manual</option>
                          <option value="CONSENTIMIENTO">Consentimiento</option>
                          <option value="CERTIFICADO">Certificado</option>
                          <option value="OTRO">Otro</option>
                        </Select>
                        <Select value={documentVisibilidad} onChange={(e) => setDocumentVisibilidad(e.target.value)} bg="white">
                          <option value="ADMIN_Y_EMPLEADO">Admin y empleado</option>
                          <option value="SOLO_ADMIN">Solo admin</option>
                        </Select>
                        <Input placeholder="Periodo (YYYY-MM)" value={documentPeriodo} onChange={(e) => setDocumentPeriodo(e.target.value)} bg="white" />
                      </Stack>
                      <Input type="file" accept="application/pdf,image/*" onChange={(e) => setDocumentFile(e.target.files?.[0] ?? null)} />
                      <Button
                        size="sm"
                        onClick={() => uploadDocumentMutation.mutate()}
                        isDisabled={!documentFile}
                        isLoading={uploadDocumentMutation.isPending}
                      >
                        Subir documento
                      </Button>
                      <Heading size="sm">Documentos cargados</Heading>
                      {docsLoading ? (
                        <Spinner />
                      ) : (
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>Tipo</Th>
                              <Th>Nombre</Th>
                              <Th>Periodo</Th>
                              <Th></Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {employeeDocs?.map((doc) => (
                              <Tr key={doc.id}>
                                <Td>{doc.tipoDocumento}</Td>
                                <Td>{doc.nombreArchivoOriginal}</Td>
                                <Td>{doc.periodo ?? '-'}</Td>
                                <Td>
                                  <Button size="xs" colorScheme="red" variant="ghost" onClick={() => deleteDocumentMutation.mutate(doc.id)}>
                                    Eliminar
                                  </Button>
                                </Td>
                              </Tr>
                            ))}
                            {employeeDocs?.length === 0 && (
                              <Tr>
                                <Td colSpan={4} textAlign="center">
                                  Sin documentos cargados.
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      )}
                    </Stack>
                  </TabPanel>
                  <TabPanel>
                    <Stack spacing={4}>
                      <Heading size="sm">Publicar liquidación</Heading>
                      <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                        <Input placeholder="Periodo (YYYY-MM)" value={remuPeriodo} onChange={(e) => setRemuPeriodo(e.target.value)} bg="white" />
                        <Input
                          placeholder="Monto líquido"
                          value={remuMontoLiquido}
                          onChange={(e) => setRemuMontoLiquido(e.target.value)}
                          bg="white"
                        />
                        <Input
                          placeholder="Monto bruto"
                          value={remuMontoBruto}
                          onChange={(e) => setRemuMontoBruto(e.target.value)}
                          bg="white"
                        />
                      </Stack>
                      <Input type="file" accept="application/pdf" onChange={(e) => setRemuFile(e.target.files?.[0] ?? null)} />
                      <Button
                        size="sm"
                        onClick={() => publishRemunerationMutation.mutate()}
                        isDisabled={!remuPeriodo || !remuFile}
                        isLoading={publishRemunerationMutation.isPending}
                      >
                        Publicar liquidación
                      </Button>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeModal}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </DashboardLayout>
  );
};

export default AdminEmployeesPage;
