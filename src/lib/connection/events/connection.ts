/// <reference types="imap" />

import Imap from 'imap';
import Config from '../../../config/config';
import logger from '../../../util/logger';

import { inboxOpened } from './inbox';

export function connectionReady(connection: Imap): Function {
  return () => {
    logger.info('Established connection to IMAP server.');
    connection.openBox(Config.mailboxes.inbox, inboxOpened(connection));
  };
}

export function connectionEnds(): Function {
  return () => {
    logger.info('IMAP connection closed.');
  };
}

export function connectionError(connection: Imap): Function {
  return (error: Error) => {
    console.log('--- IMAP CONNECTION ERROR ---');
    logger.error(error.message);
    connection.end();
    logger.info("McFaxMachine will terminate.");
    process.exit(1);
  };
}
