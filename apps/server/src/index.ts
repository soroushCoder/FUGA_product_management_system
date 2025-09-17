import { buildApp } from './app.js';
import { CONFIG } from './env.js';
const app = buildApp();
app.listen(CONFIG.PORT, () => {
  console.log(`API on http://localhost:${CONFIG.PORT}`);
});
