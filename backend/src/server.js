import { createApp } from "./app.js";
import { PORT } from "./config.js";
import { load } from "./db.js";

load();
createApp().listen(PORT, () => {
  console.log(`API Sillage disponible sur http://localhost:${PORT}/api`);
});
