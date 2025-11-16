import { Box, Card, CardBody, Grid, GridItem, Heading, Stat, StatLabel, StatNumber, Text, VStack } from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchMe } from '../../api/me';

const EmployeeDashboard = () => {
  const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMe });

  return (
    <DashboardLayout>
      <VStack align="stretch" spacing={6}>
        <Box>
          <Heading size="lg">Hola, {data?.nombre ?? 'cargando'} 👋</Heading>
          <Text color="gray.600">Aquí tienes una vista rápida de tu información.</Text>
        </Box>
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
          <GridItem>
            <Card bg="brand.secondary">
              <CardBody>
                <Stat>
                  <StatLabel>Estado laboral</StatLabel>
                  <StatNumber>{data?.estadoLaboral ?? '---'}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Saldo vacaciones</StatLabel>
                  <StatNumber>{data?.saldoVacaciones ?? 0} días</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Días tomados</StatLabel>
                  <StatNumber>{data?.diasVacacionesTomados ?? 0}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
        <Card>
          <CardBody>
            <Heading size="md" mb={2}>
              Últimas novedades
            </Heading>
            <Text color="gray.600">
              Próximamente verás aquí tus solicitudes recientes y alertas. Mientras tanto puedes revisar cada módulo desde el menú
              lateral.
            </Text>
          </CardBody>
        </Card>
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
