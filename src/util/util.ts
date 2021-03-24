import * as mimemessage from 'mimemessage';
import * as utf8 from 'utf8';
import * as quotedPrintable from 'quoted-printable';
import escapeHtml from 'escape-html';
import { MimeMessageBody } from '../lib/types';

/**
 * Convert carriage return chars into <br> tags.
 * @param str The string to cast into line-broken HTML.
 * @param is_xhtml Can use self-closing tags?
 * @returns string
 */
export function nl2br(str: string, is_xhtml: Boolean): string {
  if (typeof str === 'undefined' || str === null) {
    return '';
  }
  var breakTag =
    is_xhtml || typeof is_xhtml === 'undefined' ? '<br />' : '<br>';
  return (str + '').replace(
    /([^>\r\n]?)(\r\n|\n\r|\r|\n)/g,
    '$1' + breakTag + '$2'
  );
}

/**
 * Convert plaintext into a text-only HTML document.
 * @param str The plaintext string to convert into basic HTML.
 * @returns string
 */
export function plaintextToHtml(str: string): string {
  return `<html><body>${nl2br(escapeHtml(str), true)}</body></html>`;
}

/**
 * Convert an encoded MIME message body to UTF-8 chars.
 * @param mimeBody The `body` property of a parsed MimeMessage.
 * @returns string
 */
export function bodyToUtf8(mimeBody: MimeMessageBody): string {
  const encoding = mimeBody['_headers']?.['Content-Transfer-Encoding']?.value;
  const decode = encoding?.toLowerCase()?.includes('quoted-printable') || false;

  const content = mimeBody['_body'];

  if (!decode) return content;

  return utf8.decode(quotedPrintable.decode(content));
}

/**
 * Convert a plaintext string into type MimeMessageBody
 * @param str The string to convert.
 * @returns MimeMessageBody
 */
export function plaintextToMimeBody(str: string): MimeMessageBody {
  return {
    _headers: {
      'Content-Type': {
        fulltype: 'text/plain'
      }
    },
    _body: `${str}`
  };
}

/**
 * Convert a MIME message to HTML or yield the text/html of a multipart message.
 * @param message The raw message content as <string>.
 * @returns string
 */
export function mimeMessageToHtml(message: string): string {
  // returns Array<Entity> of mimemessage
  let bodies: string | Array<MimeMessageBody> = mimemessage.parse(message).body;

  if (typeof bodies === 'string') bodies = [plaintextToMimeBody(bodies)];

  // attempt to get html body from multipart message
  const html = bodies.find((body) =>
    body['_headers']['Content-Type']['fulltype'].includes('html')
  );

  // attempt to get plaintext body from multipart message
  const plaintext = bodies.find((body) =>
    body['_headers']['Content-Type']['fulltype'].includes('plain')
  );

  if (!html && !plaintext) return ''; // no printable content -- leave

  return !!html ? bodyToUtf8(html) : plaintextToHtml(bodyToUtf8(plaintext));
}
