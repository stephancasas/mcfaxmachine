/// <reference types="imap" />

import Config from '../../config/config';

import Imap from 'imap';
import {
  connectionReady,
  connectionEnds,
  connectionError
} from './events/connection';

export default () => {
  const connection = new Imap(Config.connection);

  connection.once('ready', connectionReady(connection));
  connection.once('end', connectionEnds());
  connection.once('error', connectionError(connection));

  connection.connect();
};
