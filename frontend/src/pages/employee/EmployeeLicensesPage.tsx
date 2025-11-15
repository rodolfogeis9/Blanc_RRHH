import { Badge, Card, CardBody, Heading, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchMyLicenses } from '../../api/licenses';

const EmployeeLicensesPage = () => {
  const { data } = useQuery({ queryKey: ['licencias'], queryFn: fetchMyLicenses });

  return (
    <DashboardLayout>
      <Card>
        <CardBody>
          <Heading size="md" mb={4}>
            Mis licencias médicas
          </Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Tipo</Th>
                <Th>Fechas</Th>
                <Th>Observaciones</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.map((licencia) => (
                <Tr key={licencia.id}>
                  <Td>
                    <Badge colorScheme="blue">{licencia.tipo}</Badge>
                  </Td>
                  <Td>
                    {new Date(licencia.fechaInicio).toLocaleDateString()} - {new Date(licencia.fechaFin).toLocaleDateString()}
                  </Td>
                  <Td>{licencia.observaciones ?? '-'}</Td>
                  <Td>
                    <Badge as="a" href={licencia.urlArchivoLicencia} target="_blank" rel="noreferrer" colorScheme="green">
                      Ver archivo
                    </Badge>
                  </Td>
                </Tr>
              ))}
              {data?.length === 0 && (
                <Tr>
                  <Td colSpan={4} textAlign="center">
                    Aún no se registran licencias.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default EmployeeLicensesPage;
