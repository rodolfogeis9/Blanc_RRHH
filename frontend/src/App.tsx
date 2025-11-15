import { Box, Flex } from '@chakra-ui/react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';

const App = () => {
  return (
    <Flex direction="column" minH="100vh" bg="brand.background" color="brand.text">
      <Box flex="1">
        <RouterProvider router={router} />
      </Box>
    </Flex>
  );
};

export default App;
