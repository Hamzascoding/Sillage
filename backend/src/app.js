import express from "express";
import cors from "cors";
import routes from "./routes/index.js";

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));
  app.use("/api", routes);

  app.use((req, res) =>
    res.status(404).json({ message: "Route introuvable." }),
  );

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Erreur interne du serveur." });
  });
  return app;
}
