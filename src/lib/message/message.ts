import * as fs from 'fs';
import puppeteer from 'puppeteer';

import { v4 as uuid } from 'uuid';
import { mimeMessageToHtml } from '../../util/util';
import { pathToFileURL } from 'url';
import { exec } from 'child_process';

import Config from '../../config/config';
import logger from '../../util/logger';

export default class Message {
  content: string;
  id: string;

  htmlPath: string;

  constructor(content: string) {
    this.content = content;
    this.id = uuid();

    this.init();
  }

  init() {
    const html = mimeMessageToHtml(this.content);

    // do not write empty bodies to file
    if (html === '') {
      this.htmlPath = '';
      return;
    }

    this.htmlPath = `${Config.workDir}/${this.id}.html`;
    fs.writeFileSync(this.htmlPath, html);
  }

  async printAsPdf() {
    const url = pathToFileURL(this.htmlPath).href;
    const pdfPath = `${fs.realpathSync(this.htmlPath)}.pdf`;

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    await page.pdf({
      path: pdfPath,
      format: 'letter',
      printBackground: false,
      displayHeaderFooter: false
    });

    await browser.close();

    // use specified printer or send as default
    const printer = !!Config?.printer ? `-P "${Config.printer}" ` : '';

    const command = !!Config?.lprCommand
      ? `${Config.lprCommand} ${pdfPath}`
      : `/usr/bin/lpr ${printer}"${pdfPath}"`;

    const dispatch = exec(command);

    if (dispatch.stderr) {
      const buffer = [];

      dispatch.stderr.on('data', (bytes) => {
        buffer.push(Buffer.from(bytes));
      });
      dispatch.stderr.on('end', () => {
        const log = Buffer.concat(buffer).toString('utf-8');
        logger.error(log);
      });
    } else {
      logger.info(`Dispatched ${this.id}.html.pdf for print.`);
    }
  }
}
