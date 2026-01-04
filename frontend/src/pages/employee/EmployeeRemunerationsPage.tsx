import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
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
  Text,
  useToast,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { downloadDocumentBlob } from '../../api/documents';
import { fetchMyRemunerations } from '../../api/remunerations';
import { downloadBlob } from '../../utils/file';

const EmployeeRemunerationsPage = () => {
  const [anioSeleccionado, setAnioSeleccionado] = useState<string>('todos');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('todos');
  const toast = useToast();
  const { data, isLoading } = useQuery({ queryKey: ['remuneraciones'], queryFn: fetchMyRemunerations });

  const aniosDisponibles = useMemo(() => {
    if (!data) return [];
    return Array.from(new Set(data.map((item) => item.periodo.slice(0, 4))));
  }, [data]);

  const filtradas = (data ?? []).filter((item) => {
    if (anioSeleccionado !== 'todos' && !item.periodo.startsWith(anioSeleccionado)) return false;
    if (estadoSeleccionado !== 'todos' && item.estado !== estadoSeleccionado) return false;
    return true;
  });

  const handleDownload = async (docId: string, filename: string) => {
    try {
      const blob = await downloadDocumentBlob(docId);
      downloadBlob(blob, filename);
    } catch (error: any) {
      toast({ title: 'Error al descargar', description: error?.response?.data?.message, status: 'error' });
    }
  };

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Heading size="lg">Remuneraciones</Heading>
        <Text color="gray.600">Descarga tus liquidaciones de sueldo y revisa el estado del proceso mensual.</Text>
        <Card>
          <CardBody>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={4}>
              <Select
                maxW="220px"
                value={anioSeleccionado}
                onChange={(event) => setAnioSeleccionado(event.target.value)}
              >
                <option value="todos">Todos los años</option>
                {aniosDisponibles.map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </Select>
              <Select maxW="220px" value={estadoSeleccionado} onChange={(event) => setEstadoSeleccionado(event.target.value)}>
                <option value="todos">Todos los estados</option>
                <option value="PUBLICADA">Publicada</option>
                <option value="ANULADA">Anulada</option>
              </Select>
            </Stack>
            {isLoading ? (
              <Spinner />
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Período</Th>
                    <Th>Estado</Th>
                    <Th>Monto líquido</Th>
                    <Th>Monto bruto</Th>
                    <Th></Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filtradas.map((item) => (
                    <Tr key={item.id}>
                      <Td>{item.periodo}</Td>
                      <Td>
                        <Badge colorScheme={item.estado === 'PUBLICADA' ? 'green' : 'red'}>{item.estado}</Badge>
                      </Td>
                      <Td>{item.montoLiquido ? `$${item.montoLiquido.toLocaleString('es-CL')}` : '—'}</Td>
                      <Td>{item.montoBruto ? `$${item.montoBruto.toLocaleString('es-CL')}` : '—'}</Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(item.documentoId, item.documento.nombreArchivoOriginal)}
                          isDisabled={item.estado !== 'PUBLICADA'}
                        >
                          Descargar
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                  {filtradas.length === 0 && (
                    <Tr>
                      <Td colSpan={5} textAlign="center">
                        No hay liquidaciones para los filtros seleccionados.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            )}
            <Box mt={4} fontSize="sm" color="gray.500">
              Si una liquidación está anulada, consulta con RRHH para revisar el motivo.
            </Box>
          </CardBody>
        </Card>
      </Stack>
    </DashboardLayout>
  );
};

export default EmployeeRemunerationsPage;
