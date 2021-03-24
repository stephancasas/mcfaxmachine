/// <reference types="imap" />

import Imap from 'imap';
import { messageEmitsBody } from './message';
import logger from '../../../util/logger';

export function queryError(): Function {
  return (error) => {
    logger.info('Nothing to print.');
  };
}

export function queryEnd(connection: Imap): Function {
  return () => {
    connection.end();
  };
}

export function queryHasMessage(connection: Imap): Function {
  return (message, index) => {
    message.on('body', messageEmitsBody(connection));
  };
}
