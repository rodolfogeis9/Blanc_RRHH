import {
  Badge,
  Card,
  CardBody,
  Flex,
  Heading,
  Input,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { EmployeeListItem, fetchEmployees } from '../../api/admin';

const AdminEmployeesPage = () => {
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('');
  const [area, setArea] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-employees', nombre, estado, area],
    queryFn: () => fetchEmployees({ nombre: nombre || undefined, estadoLaboral: estado || undefined, area: area || undefined }),
  });

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
                  </Tr>
                ))}
                {data?.length === 0 && (
                  <Tr>
                    <Td colSpan={6} textAlign="center">
                      No encontramos colaboradores con esos filtros.
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default AdminEmployeesPage;
