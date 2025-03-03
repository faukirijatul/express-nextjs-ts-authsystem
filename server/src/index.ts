import express, { Application, Request, Response } from "express";
import "dotenv/config";
import authRoutes from "./routes/auth.route";
import { errorHandler } from "./utils/error-handler";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    message: "Hello World",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.all("*", (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route: ${req.originalUrl} not found`,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
