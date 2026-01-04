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
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { DocumentItem, downloadDocumentBlob, fetchMyDocuments } from '../../api/documents';
import { downloadBlob, openBlobInNewTab } from '../../utils/file';

const EmployeeDocumentsPage = () => {
  const [tipoDocumento, setTipoDocumento] = useState<string>('');
  const toast = useToast();
  const { data, isLoading } = useQuery({
    queryKey: ['documents', tipoDocumento],
    queryFn: () => fetchMyDocuments({ tipoDocumento: tipoDocumento || undefined }),
  });

  const handleDownload = async (doc: DocumentItem) => {
    try {
      const blob = await downloadDocumentBlob(doc.id);
      downloadBlob(blob, doc.nombreArchivoOriginal);
    } catch (error: any) {
      toast({ title: 'Error al descargar', description: error?.response?.data?.message, status: 'error' });
    }
  };

  const handlePreview = async (doc: DocumentItem) => {
    try {
      const blob = await downloadDocumentBlob(doc.id);
      openBlobInNewTab(blob);
    } catch (error: any) {
      toast({ title: 'Error al previsualizar', description: error?.response?.data?.message, status: 'error' });
    }
  };

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
              <option value="LEGAL">Legal</option>
              <option value="CAPACITACION">Capacitación</option>
              <option value="MANUAL">Manuales</option>
              <option value="CONSENTIMIENTO">Consentimientos</option>
              <option value="CERTIFICADO">Certificados</option>
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
                      <HStack>
                        <Button size="sm" variant="outline" onClick={() => handleDownload(doc)}>
                          Descargar
                        </Button>
                        {(doc.mimeType.includes('pdf') || doc.mimeType.startsWith('image/')) && (
                          <Button size="sm" variant="ghost" onClick={() => handlePreview(doc)}>
                            Ver
                          </Button>
                        )}
                      </HStack>
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
