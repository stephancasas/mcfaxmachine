import { ApplicationConfig } from '../lib/types';

export default <ApplicationConfig>{
  //REQUIRED: standard IMAP connection parameters
  connection: {
    user: 'johnny.appleseed@example.com',
    password: 'mycoolpassword123',
    host: 'smtp.example.com',
    port: 993,
    tls: true
  },

  // REQUIRED: mailbox settings
  mailboxes: {
    // the mailbox from which messages will be printed
    inbox: 'INBOX',

    // the mailbox where messages will be sent after printing
    trash: 'INBOX.Trash'
  },

  // REQUIRED: in milliseconds, the interval at which to poll the IMAP server
  frequency: 300000, // advise no less than 300000 (five minutes)

  // REQUIRED: the path where rendered PDFs will be stored before printing
  workDir: '/tmp' // no trailing path separator char

  // OPTIONAL: the canonical name of the printer to use (uses default printer if undefined)
  // NOTE: if running daemonized in macOS, you must specify this value
  // printer: 'BubbleJet_3100',

  // OPTIONAL: specify the `lpr` command used to queue the print
  // NOTE: see details below
  // lprCommand: '/usr/bin/lpr -P "BubbleJet 3100" -o media=letter'

  // OPTIONAL: specify the scale (zoom level) at which to print messages
  // must be between 0.1 and 2
  // pageScale: 1
};
