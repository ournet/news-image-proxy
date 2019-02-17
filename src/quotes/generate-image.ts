import { wkHtmlToImage, setCommant } from './wkhtmltoimage';
import { Quote } from '@ournet/api-client';
import formatImage from './formatters/v1';
import { Readable } from 'stream';

if (process.platform === 'win32') {
    setCommant('F:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltoimage.exe');
}

export function generateImage(quote: Quote, format: ImageFormat): Readable {
    const html = formatImage(quote);

    return wkHtmlToImage(html, { format, width: 640 });
}

export type ImageFormat = 'png' | 'jpg';
