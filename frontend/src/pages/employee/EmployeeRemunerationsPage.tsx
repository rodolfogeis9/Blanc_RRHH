import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Heading,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from '@chakra-ui/react';
import { useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

interface Payslip {
  id: string;
  mes: string;
  anio: number;
  estado: 'DISPONIBLE' | 'PROCESO';
  montoLiquido: number;
}

const defaultPayslips: Payslip[] = [
  { id: '1', mes: 'Enero', anio: 2024, estado: 'DISPONIBLE', montoLiquido: 980000 },
  { id: '2', mes: 'Febrero', anio: 2024, estado: 'DISPONIBLE', montoLiquido: 990500 },
  { id: '3', mes: 'Marzo', anio: 2024, estado: 'DISPONIBLE', montoLiquido: 1015000 },
  { id: '4', mes: 'Abril', anio: 2024, estado: 'PROCESO', montoLiquido: 0 },
  { id: '5', mes: 'Noviembre', anio: 2023, estado: 'DISPONIBLE', montoLiquido: 940000 },
];

const EmployeeRemunerationsPage = () => {
  const [anioSeleccionado, setAnioSeleccionado] = useState<number | 'todos'>('todos');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<'todos' | Payslip['estado']>('todos');

  const aniosDisponibles = useMemo(() => Array.from(new Set(defaultPayslips.map((p) => p.anio))), []);

  const filtradas = defaultPayslips.filter((payslip) => {
    if (anioSeleccionado !== 'todos' && payslip.anio !== anioSeleccionado) return false;
    if (estadoSeleccionado !== 'todos' && payslip.estado !== estadoSeleccionado) return false;
    return true;
  });

  const handleDownload = (payslip: Payslip) => {
    const contenido = `Liquidación ${payslip.mes} ${payslip.anio} - Monto líquido: $${payslip.montoLiquido.toLocaleString('es-CL')}`;
    const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Liquidacion_${payslip.mes}_${payslip.anio}.txt`;
    link.click();
    URL.revokeObjectURL(url);
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
                onChange={(event) => setAnioSeleccionado(event.target.value === 'todos' ? 'todos' : Number(event.target.value))}
              >
                <option value="todos">Todos los años</option>
                {aniosDisponibles.map((anio) => (
                  <option key={anio} value={anio}>
                    {anio}
                  </option>
                ))}
              </Select>
              <Select maxW="220px" value={estadoSeleccionado} onChange={(event) => setEstadoSeleccionado(event.target.value as any)}>
                <option value="todos">Todos los estados</option>
                <option value="DISPONIBLE">Disponible</option>
                <option value="PROCESO">En proceso</option>
              </Select>
            </Stack>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Mes</Th>
                  <Th>Año</Th>
                  <Th>Estado</Th>
                  <Th>Monto líquido</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {filtradas.map((payslip) => (
                  <Tr key={payslip.id}>
                    <Td>{payslip.mes}</Td>
                    <Td>{payslip.anio}</Td>
                    <Td>
                      <Badge colorScheme={payslip.estado === 'DISPONIBLE' ? 'green' : 'yellow'}>{payslip.estado}</Badge>
                    </Td>
                    <Td>
                      {payslip.montoLiquido > 0 ? `$${payslip.montoLiquido.toLocaleString('es-CL')}` : 'Pendiente'}
                    </Td>
                    <Td>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(payslip)}
                        isDisabled={payslip.estado !== 'DISPONIBLE'}
                      >
                        Descargar
                      </Button>
                    </Td>
                  </Tr>
                ))}
                {filtradas.length === 0 && (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      No hay documentos para los filtros seleccionados.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
            <Box mt={4} fontSize="sm" color="gray.500">
              Los comprobantes en estado "En proceso" estarán disponibles al cierre contable del mes.
            </Box>
          </CardBody>
        </Card>
      </Stack>
    </DashboardLayout>
  );
};

export default EmployeeRemunerationsPage;
