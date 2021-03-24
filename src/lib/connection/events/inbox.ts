/// <reference types="imap" />

import Imap from 'imap';
import { queryError, queryEnd, queryHasMessage } from './query';

export function inboxOpened(connection: Imap): (err, mbox) => void {
  return (error, mailbox) => {
    const query = connection.seq.fetch('1:*', { bodies: '' });

    query.once('error', queryError());
    query.once('end', queryEnd(connection));
    query.on('message', queryHasMessage(connection));
  };
}
