import winston from 'winston';

interface LoggerOptions {
    serviceName: string;
    logLevel?: string;
}

class Logger {
    private static instance: Logger;
    private logger: winston.Logger;

    private constructor(options: LoggerOptions) {
        const { serviceName, logLevel = 'info' } = options;

        this.logger = winston.createLogger({
            level: logLevel,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }: any) => {
                    return `${timestamp} [${serviceName}] ${level.toUpperCase()}: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.printf(({ timestamp, level, message }: any) => {
                            return `${timestamp} [${serviceName}] ${level}: ${message}`;
                        })
                    ),
                }),
            ],
        });
    }

    public static getInstance(options?: LoggerOptions): Logger {
        if (!Logger.instance && options) {
            Logger.instance = new Logger(options);
        } else if (!Logger.instance) {
            throw new Error(
                'Logger instance not initialized. Please provide options to initialize.'
            );
        }
        return Logger.instance;
    }

    public log(level: 'info' | 'warn' | 'error', message: string): void {
        this.logger.log({ level, message });
    }

    public info(message: string, data?: any): void {
        this.log('info', message + " " + DataView);
    }

    public warn(message: string, data?: any): void {
        this.log('warn', message + " " +  data);
    }

    public error(message: string, data?: any): void {
        this.log('error', message + " " + data);
    }
}

export { Logger };
