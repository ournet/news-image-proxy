import { wkHtmlToImage, setCommant } from './wkhtmltoimage';
import { Quote } from '@ournet/api-client';
import formatImage from './formatters/v1';
import { Readable } from 'stream';

if (process.platform === 'win32') {
    setCommant('C:\\Program Files\\wkhtmltopdf\\bin\\wkhtmltoimage.exe');
} else {
    setCommant('/usr/local/bin/wkhtmltoimage');
}

export function generateImage(quote: Quote, format: ImageFormat): Readable {
    const html = formatImage(quote);

    return wkHtmlToImage(html, { format, width: 640, quality: format === 'png' ? 10 : 95 });
}

export type ImageFormat = 'png' | 'jpg';
