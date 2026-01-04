import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Grid,
  GridItem,
  Heading,
  Input,
  Progress,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  VStack,
  useToast,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import { useRef, ChangeEvent } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchMe } from '../../api/me';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { downloadBlob, readFileAsDataURL } from '../../utils/file';
import { formatTenure, getBirthdayCountdown } from '../../utils/date';
import { downloadDocumentBlob } from '../../api/documents';

const EmployeeDashboard = () => {
  const { data } = useQuery({ queryKey: ['me'], queryFn: fetchMe });
  const toast = useToast();
  const [customPhoto, setCustomPhoto] = useLocalStorage<string | null>('employee-profile-photo', null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photo = customPhoto ?? data?.urlFotoPerfil;
  const tenure = formatTenure(data?.fechaIngreso);
  const birthdayCountdown = getBirthdayCountdown(data?.fechaNacimiento);
  const vacacionesTomadas = data?.diasVacacionesTomados ?? 0;
  const totalVacaciones = data?.totalVacaciones ?? 0;
  const progresoVacaciones = totalVacaciones > 0 ? Math.min(100, (vacacionesTomadas / totalVacaciones) * 100) : 0;
  const pendingVacations = data?.pendingVacationRequests ?? 0;
  const pendingOvertime = data?.pendingOvertimeRequests ?? 0;
  const latestOvertime = data?.latestOvertime;
  const lastRemuneration = data?.lastRemuneration;

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataURL(file);
    setCustomPhoto(dataUrl);
    toast({ title: 'Foto actualizada', description: 'Solo tú puedes verla hasta que RRHH la valide.', status: 'success' });
    event.target.value = '';
  };

  const handleDownloadLastRemuneration = async () => {
    if (!lastRemuneration) return;
    try {
      const blob = await downloadDocumentBlob(lastRemuneration.documentoId);
      downloadBlob(blob, lastRemuneration.documento.nombreArchivoOriginal);
    } catch (error: any) {
      toast({ title: 'No pudimos descargar la liquidación', description: error?.response?.data?.message, status: 'error' });
    }
  };

  return (
    <DashboardLayout>
      <VStack align="stretch" spacing={6}>
        <Card>
          <CardBody>
            <Flex direction={{ base: 'column', md: 'row' }} align="center" gap={6}>
              <Box position="relative">
                <Avatar size="2xl" src={photo ?? undefined} name={`${data?.nombre ?? ''} ${data?.apellido ?? ''}`} />
                <Input type="file" accept="image/*" ref={fileInputRef} display="none" onChange={handlePhotoChange} />
                <Button
                  size="sm"
                  variant="outline"
                  mt={3}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Actualizar foto
                </Button>
              </Box>
              <Box flex="1">
                <Heading size="lg">Hola, {data?.nombre ?? 'cargando'} 👋</Heading>
                <Text color="gray.600" mb={2}>
                  Esta es tu casa digital en Blanc. Personaliza tu perfil y mantén tu información al día.
                </Text>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3}>
                  <Stat>
                    <StatLabel>Cargo</StatLabel>
                    <StatNumber fontSize="lg">{data?.cargo ?? 'Sin definir'}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Área</StatLabel>
                    <StatNumber fontSize="lg">{data?.area ?? '—'}</StatNumber>
                  </Stat>
                </SimpleGrid>
                <Badge colorScheme="green" mt={3} px={3} py={1} borderRadius="md">
                  Estado laboral: {data?.estadoLaboral ?? '---'}
                </Badge>
              </Box>
            </Flex>
          </CardBody>
        </Card>

        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }} gap={4}>
          <GridItem>
            <Card>
              <CardBody>
                <Stat>
                  <StatLabel>Saldo vacaciones</StatLabel>
                  <StatNumber>{data?.saldoVacaciones ?? 0} días</StatNumber>
                </Stat>
                <Text fontSize="sm" color="gray.500">
                  Total acumulado: {data?.totalVacaciones ?? 0} días
                </Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Heading size="sm" mb={2}>
                  Detalle vacaciones
                </Heading>
                <Text fontWeight="600">{vacacionesTomadas} días tomados</Text>
                <Progress value={progresoVacaciones} mt={2} colorScheme="teal" borderRadius="full" />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {Math.round(progresoVacaciones)}% de tu saldo anual
                </Text>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Heading size="sm" mb={2}>
                  Antigüedad
                </Heading>
                {tenure ? (
                  <Text fontWeight="600">{tenure.label}</Text>
                ) : (
                  <Text color="gray.500">Registra tu fecha de ingreso para calcularla.</Text>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={4}>
          <GridItem>
            <Card>
              <CardBody>
                <Heading size="md" mb={4}>
                  Resumen operativo
                </Heading>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  <Stat>
                    <StatLabel>Solicitudes vacaciones pendientes</StatLabel>
                    <StatNumber>{pendingVacations}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Horas extra pendientes</StatLabel>
                    <StatNumber>{pendingOvertime}</StatNumber>
                  </Stat>
                  <Stat>
                    <StatLabel>Última liquidación</StatLabel>
                    <StatNumber fontSize="lg">{lastRemuneration?.periodo ?? '—'}</StatNumber>
                    {lastRemuneration && (
                      <Button size="sm" mt={2} variant="outline" onClick={handleDownloadLastRemuneration}>
                        Descargar
                      </Button>
                    )}
                  </Stat>
                  <Stat>
                    <StatLabel>Última hora extra</StatLabel>
                    <StatNumber fontSize="lg">
                      {latestOvertime ? `${latestOvertime.horas}h` : '—'}
                    </StatNumber>
                    {latestOvertime && (
                      <Text fontSize="sm" color="gray.500">
                        {new Date(latestOvertime.fecha).toLocaleDateString()} · {latestOvertime.estado}
                      </Text>
                    )}
                  </Stat>
                </SimpleGrid>
              </CardBody>
            </Card>
          </GridItem>
          <GridItem>
            <Card>
              <CardBody>
                <Heading size="sm" mb={2}>
                  Mi cumpleaños
                </Heading>
                {birthdayCountdown ? (
                  <>
                    <Text fontWeight="600">
                      {birthdayCountdown.days} días · {birthdayCountdown.hours} hrs · {birthdayCountdown.minutes} min
                    </Text>
                    <Text color="gray.500" fontSize="sm">
                      Próximo {birthdayCountdown.formattedDate} — cumplirás {birthdayCountdown.ageTurning} años
                    </Text>
                  </>
                ) : (
                  <Text color="gray.500">Agrega tu fecha de nacimiento en Mis datos para ver la cuenta regresiva.</Text>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>
      </VStack>
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
