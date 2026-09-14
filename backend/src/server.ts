import dotenv from "dotenv";
import app from "./App";
import { initDatabase } from "./modules/database/database";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function bootstrap(): Promise<void> {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`Servidor de Control de Gastos escuchando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

bootstrap();
