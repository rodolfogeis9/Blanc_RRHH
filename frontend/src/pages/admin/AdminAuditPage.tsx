import { Badge, Card, CardBody, Flex, Input, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchAuditEvents } from '../../api/admin';

const AdminAuditPage = () => {
  const [usuarioId, setUsuarioId] = useState('');
  const [tipoEvento, setTipoEvento] = useState('');

  const { data } = useQuery({
    queryKey: ['audit', usuarioId, tipoEvento],
    queryFn: () => fetchAuditEvents({ usuarioId: usuarioId || undefined, tipoEvento: tipoEvento || undefined }),
  });

  return (
    <DashboardLayout>
      <Card>
        <CardBody>
          <Flex gap={3} mb={4} flexWrap="wrap">
            <Input placeholder="ID usuario" value={usuarioId} onChange={(e) => setUsuarioId(e.target.value)} bg="white" maxW="200px" />
            <Input placeholder="Tipo evento" value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)} bg="white" maxW="260px" />
          </Flex>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Fecha</Th>
                <Th>Usuario</Th>
                <Th>Evento</Th>
                <Th>Detalle</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data?.eventos.map((evento) => (
                <Tr key={evento.id}>
                  <Td>{new Date(evento.fechaEvento).toLocaleString()}</Td>
                  <Td>
                    {evento.usuario.nombre} {evento.usuario.apellido}
                    <br />
                    <Badge colorScheme="blue">{evento.usuario.rol}</Badge>
                  </Td>
                  <Td>{evento.tipoEvento}</Td>
                  <Td>{evento.detalle}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
};

export default AdminAuditPage;
