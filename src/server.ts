import Connection from './lib/connection/connection';
import Config from './config/config';
import logger from './util/logger';

logger.info('Starting McFaxMachine server...');
logger.info(`Polling frequency: ${Config.frequency / 1000} seconds`);
console.log('');

Connection();

setInterval(Connection, Config.frequency);
