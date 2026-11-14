export const PORT = Number(process.env.PORT) || 3000;
export const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-a-changer-en-production";
export const JWT_EXPIRES_IN = "2h";
