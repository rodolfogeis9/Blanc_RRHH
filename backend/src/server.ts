import { createApp } from './app';
import { env } from './config/env';

const app = createApp();

app.listen(env.port, () => {
  console.log(`API Blanc RRHH escuchando en el puerto ${env.port}`);
});
