import {
  Badge,
  Button,
  Card,
  CardBody,
  HStack,
  Heading,
  Select,
  Spinner,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DocumentItem, fetchMyDocuments } from '../../api/documents';

const EmployeeDocumentsPage = () => {
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const { data, isLoading } = useQuery({
    queryKey: ['documents', tipoDocumento],
    queryFn: () => fetchMyDocuments({ tipoDocumento: tipoDocumento || undefined }),
  });

  return (
    <DashboardLayout>
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={4} flexWrap="wrap" gap={4}>
            <Heading size="md">Mis documentos</Heading>
            <Select
              maxW="240px"
              placeholder="Todos los tipos"
              value={tipoDocumento}
              onChange={(event) => setTipoDocumento(event.target.value)}
            >
              <option value="CONTRATO">Contratos</option>
              <option value="ANEXO">Anexos</option>
              <option value="LIQUIDACION">Liquidaciones</option>
              <option value="ESTUDIO">Estudios</option>
              <option value="OTRO">Otros</option>
            </Select>
          </HStack>
          {isLoading ? (
            <Spinner />
          ) : (
            <Table variant="simple" size="md">
              <Thead>
                <Tr>
                  <Th>Tipo</Th>
                  <Th>Nombre</Th>
                  <Th>Período</Th>
                  <Th>Fecha</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.map((doc: DocumentItem) => (
                  <Tr key={doc.id}>
                    <Td>
                      <Badge colorScheme="blue">{doc.tipoDocumento}</Badge>
                    </Td>
                    <Td>{doc.nombreArchivoOriginal}</Td>
                    <Td>{doc.periodo ?? '-'}</Td>
                    <Td>{new Date(doc.fechaSubida).toLocaleDateString()}</Td>
                    <Td>
                      <Button as="a" href={doc.urlArchivo} target="_blank" rel="noreferrer" size="sm" variant="outline">
                        Descargar
                      </Button>
                    </Td>
                  </Tr>
                ))}
                {data?.length === 0 && (
                  <Tr>
                    <Td colSpan={5} textAlign="center">
                      Aún no tienes documentos disponibles.
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

export default EmployeeDocumentsPage;
