import { config } from "./src/config/env_config.js";

import app from "./src/app.js";
import connectDB from "./src/config/db.js";

const PORT = config.port || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(error);
  }
};

startServer();