import Message from '../../message/message';

export function streamHasData(buffer: Array<Buffer>) {
  return (bytes) => {
    buffer.push(Buffer.from(bytes));
  };
}

export function streamEnds(buffer: Array<Buffer>) {
  return () => {
    const content = Buffer.concat(buffer).toString('utf-8');
    
    const message = new Message(content);
    message.printAsPdf();
  };
}
