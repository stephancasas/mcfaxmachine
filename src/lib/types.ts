/*--- Application Configuration ---*/
export interface ApplicationConfig {
  connection: ConnectionSettings;
  mailboxes: Mailboxes;
  frequency: number;
  workDir: string;
  printer?: string;
  lprCommand?: string;
  pageScale?: number;
}

interface ConnectionSettings {
  user: string;
  password: string;
  host: string;
  port: number;
  tls: boolean;
}

interface Mailboxes {
  inbox: string;
  trash: string;
}

/*--- Mime Messages ---*/
export interface MimeMessage {
  body: MimeMessageBody | string;
}

export interface MimeMessageBody {
  _headers?: {
    'Content-Transfer-Encoding'?: {
      value?: string;
    };
    'Content-Type'?: {
      fulltype?: string;
    };
  };

  _body: string;
}
