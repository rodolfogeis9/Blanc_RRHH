import { Box, Heading, Text, Icon, VStack } from '@chakra-ui/react';
import { WarningIcon } from '@chakra-ui/icons';
import DashboardLayout from '../components/layout/DashboardLayout';

interface Props {
    title: string;
}

const PlaceholderPage: React.FC<Props> = ({ title }) => {
    return (
        <DashboardLayout>
            <VStack spacing={6} py={10} textAlign="center">
                <Icon as={WarningIcon} w={20} h={20} color="orange.400" />
                <Heading size="xl">{title}</Heading>
                <Text fontSize="lg" color="gray.600">
                    Esta sección está en desarrollo y estará disponible próximamente.
                </Text>
            </VStack>
        </DashboardLayout>
    );
};

export default PlaceholderPage;
