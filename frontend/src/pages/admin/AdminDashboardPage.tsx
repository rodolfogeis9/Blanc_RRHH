import {
  Badge,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from '@chakra-ui/react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const AdminDashboardPage = () => (
  <DashboardLayout>
    <VStack align="stretch" spacing={6}>
      <Card>
        <CardBody>
          <Heading size="md" mb={2}>Panel administrativo</Heading>
          <Text color="gray.600">
            Bienvenido al centro de control de RRHH. Desde aquí podrás revisar pendientes, supervisar estados y acceder
            rápidamente a los módulos clave.
          </Text>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Solicitudes pendientes</StatLabel>
              <StatNumber>—</StatNumber>
            </Stat>
            <Text fontSize="sm" color="gray.500">
              Próximamente verás aquí las solicitudes recientes de licencias y vacaciones.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Documentos cargados hoy</StatLabel>
              <StatNumber>—</StatNumber>
            </Stat>
            <Text fontSize="sm" color="gray.500">Controla el flujo de contratos y anexos desde el módulo de empleados.</Text>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Alertas del equipo</StatLabel>
              <StatNumber>—</StatNumber>
            </Stat>
            <Text fontSize="sm" color="gray.500">Mantén al día los cambios de estado y los ajustes de saldo.</Text>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardBody>
          <Flex align="center" justify="space-between" wrap="wrap" gap={4}>
            <Heading size="sm">Acciones rápidas</Heading>
            <Badge colorScheme="blue">RRHH</Badge>
          </Flex>
          <Divider my={3} />
          <Text color="gray.600">
            Usa el menú lateral para gestionar colaboradores, revisar solicitudes y consultar la auditoría. El acceso se
            mantiene protegido por rol en cada navegación.
          </Text>
        </CardBody>
      </Card>
    </VStack>
  </DashboardLayout>
);

export default AdminDashboardPage;
