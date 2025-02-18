import { ENV } from '@Config/env';
import winston from 'winston';
import 'winston-daily-rotate-file';

const logDirectory = 'logs';

// Custom Formatter for Readability
const customFormat = winston.format.printf(({ timestamp, level, message, module, ...meta }) => {
    return [
        `[${timestamp}] [${level.toUpperCase()}] [${module || 'Application'}] - ${message}`,
        meta && Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '',
        '------------------------------------------------------------\n'
    ].join('\n');
});

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),  // Color-coded logs in console
                winston.format.simple()
            )
        }),
        new winston.transports.DailyRotateFile({
            level: 'info',
            dirname: logDirectory,
            filename: '%DATE%-app.log',
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxFiles: ENV.MAX_LOG_FILES
        }),
        new winston.transports.DailyRotateFile({
            level: 'error',
            dirname: logDirectory,
            filename: '%DATE%-error.log',
            datePattern: 'YYYY-MM-DD',
            maxFiles: ENV.MAX_LOG_FILES,
            zippedArchive: true,
        }),
    ]
});

export default logger;
