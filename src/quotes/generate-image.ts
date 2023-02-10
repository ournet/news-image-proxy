import { wkHtmlToImage } from "./wkhtmltoimage";
import { Quote } from "@ournet/api-client";
import formatImage from "./formatters/v1";
import { Readable } from "stream";

export function generateImage(quote: Quote, format: ImageFormat): Readable {
  const html = formatImage(quote);

  return wkHtmlToImage(html, {
    format,
    width: 640,
    quality: format === "png" ? 10 : 95
  });
}

export type ImageFormat = "png" | "jpg";
