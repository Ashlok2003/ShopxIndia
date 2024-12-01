import cron from 'node-cron';
import { NotificationService } from '../services/notification.service';
import { Logger } from './logger';

const service = new NotificationService();
const logger: Logger = Logger.getInstance({ serviceName: "CronService", logLevel: "debug" });

cron.schedule('* * * * *', async () => {
    try {
        console.log('Running task every minute...');

        await service.deleteOldNotifications(3);

        console.log('Old notifications deleted successfully.');
    } catch (error: any) {
        logger.error(`Error while performing the read messages cleanup ! ${error.errors}`);
    }
});