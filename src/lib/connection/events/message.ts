/// <reference types="imap" />

import Imap from 'imap';
import Config from '../../../config/config';
import { streamHasData, streamEnds } from './stream';

export function messageEmitsBody(connection: Imap): Function {
  return (stream, metadata) => {
    const buffer = [];

    stream.on('data', streamHasData(buffer));
    stream.on('end', streamEnds(buffer));

    // discard message after handling
    connection.move('1:*', Config.mailboxes.trash, () => {});
  };
}
