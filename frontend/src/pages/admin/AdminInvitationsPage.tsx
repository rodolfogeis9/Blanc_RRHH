import {
  Badge,
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  createInvitationRequest,
  fetchInvitations,
  fetchJobRoles,
  InvitationItem,
  resendInvitationRequest,
  revokeInvitationRequest,
} from '../../api/admin';
import { Role } from '../../context/AuthContext';

const schema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  role: z.enum(['ADMIN_DIRECCION', 'ADMIN_RRHH', 'EMPLEADO']),
  jobRoleId: z.string().min(1, 'Selecciona un cargo'),
});

type FormValues = z.infer<typeof schema>;

const statusColor: Record<InvitationItem['status'], string> = {
  PENDIENTE: 'blue',
  USADA: 'green',
  EXPIRADA: 'orange',
};

const AdminInvitationsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: jobRoles, isLoading: loadingRoles } = useQuery({
    queryKey: ['jobRoles'],
    queryFn: fetchJobRoles,
  });

  const { data: invitations, isLoading } = useQuery({
    queryKey: ['invitations'],
    queryFn: fetchInvitations,
  });

  const createMutation = useMutation({
    mutationFn: createInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({ title: 'Invitación enviada', status: 'success' });
    },
    onError: (error: any) => {
      toast({ title: 'No pudimos crear la invitación', description: error?.response?.data?.message, status: 'error' });
    },
  });

  const resendMutation = useMutation({
    mutationFn: resendInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({ title: 'Invitación reenviada', status: 'success' });
    },
    onError: (error: any) => {
      toast({ title: 'No pudimos reenviar', description: error?.response?.data?.message, status: 'error' });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: revokeInvitationRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
      toast({ title: 'Invitación revocada', status: 'info' });
    },
    onError: (error: any) => {
      toast({ title: 'No pudimos revocar', description: error?.response?.data?.message, status: 'error' });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { role: 'EMPLEADO' as Role } });

  const onSubmit = async (values: FormValues) => {
    await createMutation.mutateAsync(values);
    reset({ email: '', role: values.role, jobRoleId: values.jobRoleId });
  };

  return (
    <DashboardLayout>
      <Stack spacing={6}>
        <Card>
          <CardBody>
            <Heading size="md" mb={4}>Invitar nuevo usuario</Heading>
            <form onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={4} direction={{ base: 'column', md: 'row' }} align={{ base: 'stretch', md: 'flex-end' }}>
                <Box flex="1">
                  <Input placeholder="Correo electrónico" {...register('email')} isInvalid={Boolean(errors.email)} />
                  {errors.email && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.email.message}
                    </Text>
                  )}
                </Box>
                <Box minW={{ base: 'full', md: '220px' }}>
                  <Select {...register('role')} isInvalid={Boolean(errors.role)}>
                    <option value="ADMIN_DIRECCION">ADMIN_DIRECCION</option>
                    <option value="ADMIN_RRHH">ADMIN_RRHH</option>
                    <option value="EMPLEADO">EMPLEADO</option>
                  </Select>
                </Box>
                <Box minW={{ base: 'full', md: '240px' }}>
                  <Select placeholder={loadingRoles ? 'Cargando cargos...' : 'Seleccionar cargo'} {...register('jobRoleId')} isInvalid={Boolean(errors.jobRoleId)}>
                    {jobRoles?.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </Select>
                </Box>
                <Button type="submit" isLoading={isSubmitting || createMutation.isPending}>
                  Enviar invitación
                </Button>
              </Stack>
              {errors.jobRoleId && (
                <Text color="red.500" fontSize="sm" mt={1}>
                  {errors.jobRoleId.message}
                </Text>
              )}
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Invitaciones recientes</Heading>
            </Flex>
            {isLoading ? (
              <Text>Cargando invitaciones...</Text>
            ) : (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Correo</Th>
                    <Th>Rol</Th>
                    <Th>Cargo</Th>
                    <Th>Estado</Th>
                    <Th>Creada</Th>
                    <Th>Expira</Th>
                    <Th>Acciones</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {invitations?.map((invitation) => (
                    <Tr key={invitation.id}>
                      <Td>
                        <Text fontWeight="600">{invitation.email}</Text>
                      </Td>
                      <Td>{invitation.role}</Td>
                      <Td>{invitation.jobRoleName}</Td>
                      <Td>
                        <Badge colorScheme={statusColor[invitation.status]}>{invitation.status}</Badge>
                      </Td>
                      <Td>{new Date(invitation.createdAt).toLocaleDateString()}</Td>
                      <Td>{new Date(invitation.expiresAt).toLocaleDateString()}</Td>
                      <Td>
                        <Stack direction={{ base: 'column', md: 'row' }} spacing={2}>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => resendMutation.mutate(invitation.id)}
                            isDisabled={resendMutation.isPending}
                          >
                            Reenviar
                          </Button>
                          <Button
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => revokeMutation.mutate(invitation.id)}
                            isDisabled={revokeMutation.isPending || invitation.status !== 'PENDIENTE'}
                          >
                            Revocar
                          </Button>
                        </Stack>
                      </Td>
                    </Tr>
                  ))}
                  {invitations?.length === 0 && (
                    <Tr>
                      <Td colSpan={7} textAlign="center">
                        No hay invitaciones registradas.
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </Stack>
    </DashboardLayout>
  );
};

export default AdminInvitationsPage;
