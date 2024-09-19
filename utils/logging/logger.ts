import { createLogger, format, transports } from "winston";
import path from "path";

// Utility function to generate a timestamped filename
export const generateLogFilename = (logFolder: string, logType: string) => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return path.join(
    process.cwd(),
    "logs",
    logFolder,
    `${logType}-${timestamp}.log` // Ensure it's a .log extension
  );
};

// Create a logger with a dynamic filename
export const createCustomLogger = (logFolder: string, logType: string) => {
  const logFilename = generateLogFilename(logFolder, logType);
  return createLogger({
    level: "info",
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.printf(
        ({ timestamp, level, message }) =>
          `[${timestamp}] ${level.toUpperCase()}: ${message}`
      )
    ),
    transports: [
      new transports.File({ filename: logFilename, level: "info" }),
      new transports.Console({ level: "info" }),
    ],
  });
};
