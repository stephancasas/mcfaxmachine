import * as fs from 'fs';
import puppeteer from 'puppeteer';

import { v4 as uuid } from 'uuid';
import { mimeMessageToHtml } from '../../util/util';
import { pathToFileURL } from 'url';
import { exec } from 'child_process';

import Config from '../../config/config';
import logger from '../../util/logger';
import { ChildProcess } from 'node:child_process';

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
      displayHeaderFooter: false,
      scale: Config.pageScale ? Config.pageScale : 1
    });

    await browser.close();

    // use specified printer or send as default
    const printer = !!Config?.printer ? `-P "${Config.printer}" ` : '';

    const command = !!Config?.lprCommand
      ? `${Config.lprCommand} ${pdfPath}`
      : `/usr/bin/lpr ${printer}"${pdfPath}"`;

    logDispatch(exec(command));
  }
}

function logDispatch(dispatch: ChildProcess) {
  const { stderr } = dispatch;
  const errBuffer = [];

  stderr.on('data', (bytes) => {
    errBuffer.push(Buffer.from(bytes));
  });
  stderr.on('end', () => {
    const log = Buffer.concat(errBuffer).toString('utf-8');

    if (log.trim().length > 0) logger.error(log);
    else logger.info(`Dispatched ${this.id}.html.pdf for print.`);
  });
}
