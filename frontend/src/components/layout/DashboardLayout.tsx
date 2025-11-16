import { Box, Flex } from '@chakra-ui/react';
import Header from './Header';
import Sidebar from '../navigation/Sidebar';

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Flex direction="column" minH="100vh">
    <Header />
    <Flex flex="1" direction={{ base: 'column', md: 'row' }}>
      <Sidebar />
      <Box flex="1" bg="brand.background" p={{ base: 4, md: 8 }}>
        {children}
      </Box>
    </Flex>
  </Flex>
);

export default DashboardLayout;
