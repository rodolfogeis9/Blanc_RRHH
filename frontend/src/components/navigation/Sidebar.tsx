import { Box, VStack, Link as ChakraLink, Text } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { auth } = useAuth();
  const links = [
    { to: '/portal', label: 'Dashboard', roles: ['EMPLEADO'] },
    { to: '/admin/dashboard', label: 'Dashboard', roles: ['ADMIN_DIRECCION', 'ADMIN_RRHH'] },
    { to: '/portal/mis-datos', label: 'Mis datos', roles: ['EMPLEADO'] },
    { to: '/portal/educacion', label: 'Mis estudios', roles: ['EMPLEADO'] },
    { to: '/portal/antecedentes-laborales', label: 'Mis antecedentes laborales', roles: ['EMPLEADO'] },
    { to: '/portal/documentos', label: 'Mis documentos', roles: ['EMPLEADO'] },
    { to: '/portal/vacaciones', label: 'Mis vacaciones', roles: ['EMPLEADO'] },
    { to: '/portal/licencias', label: 'Mis licencias médicas', roles: ['EMPLEADO'] },
    { to: '/portal/remuneraciones', label: 'Remuneraciones', roles: ['EMPLEADO'] },
    { to: '/portal/horas-extras', label: 'Horas extras', roles: ['EMPLEADO'] },
    { to: '/admin/empleados', label: 'Empleados', roles: ['ADMIN_RRHH', 'ADMIN_DIRECCION'] },
    { to: '/admin/solicitudes', label: 'Solicitudes', roles: ['ADMIN_RRHH', 'ADMIN_DIRECCION'] },
    { to: '/admin/auditoria', label: 'Auditoría', roles: ['ADMIN_DIRECCION'] },
  ];

  return (
    <Box as="nav" bg="white" borderRight="1px solid" borderColor="brand.secondary" minW={{ base: 'full', md: '260px' }} p={6}>
      <VStack align="stretch" spacing={3}>
        {links
          .filter((link) => (auth.role ? link.roles.includes(auth.role) : false))
          .map((link) => (
            <ChakraLink
              key={link.to}
              as={NavLink}
              to={link.to}
              fontWeight="600"
              _activeLink={{ color: 'brand.primary' }}
              _hover={{ textDecor: 'none', color: 'brand.primary' }}
            >
              {link.label}
            </ChakraLink>
          ))}
        {auth.role === 'EMPLEADO' && (
          <Text fontSize="sm" color="gray.500" pt={4}>
            ¿Necesitas otro módulo? Contacta a RRHH.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default Sidebar;
