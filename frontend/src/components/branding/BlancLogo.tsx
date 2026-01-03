import { Image, ImageProps } from '@chakra-ui/react';
import logo from '../../assets/blanc-logo.svg';

const BlancLogo: React.FC<ImageProps> = (props) => (
  <Image src={logo} alt="Blanc Plastic and Recovery Center" draggable={false} {...props} />
);

export default BlancLogo;
