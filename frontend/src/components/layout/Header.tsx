import { Box, Flex, Heading, Spacer, Text, Button } from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { auth, logout } = useAuth();

  return (
    <Flex
      as="header"
      bg="white"
      borderBottom="1px solid"
      borderColor="brand.secondary"
      px={6}
      py={3}
      align="center"
      gap={4}
    >
      <Flex align="center" gap={3}>
        <Box boxSize="48px" bg="brand.secondary" borderRadius="full" display="flex" alignItems="center" justifyContent="center">
          {/* Reemplaza por el logo oficial colocando el archivo PNG en src/assets/logo.png */}
          <Text fontWeight="bold" color="brand.primary">
            BL
          </Text>
        </Box>
        <Box>
          <Heading size="md" color="brand.primary">
            Blanc RRHH
          </Heading>
          <Text fontSize="sm" color="gray.600">
            Plastic and Recovery Center
          </Text>
        </Box>
      </Flex>
      <Spacer />
      {auth.role && (
        <Flex align="center" gap={3}>
          <Text fontWeight="600">
            {auth.nombre} {auth.apellido}
          </Text>
          <Button variant="outline" size="sm" onClick={logout}>
            Cerrar sesión
          </Button>
        </Flex>
      )}
    </Flex>
  );
};

export default Header;
