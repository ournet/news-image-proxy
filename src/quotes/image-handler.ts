import { Request, Response, NextFunction } from "express";
import { ImageFormat, generateImage } from "./generate-image";
import { ournetAPI } from "../data";
import { Quote, QuoteStringFields } from "@ournet/api-client";
import { Stream } from "stream";
import { notFound } from "boom";

export default async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const format = req.params.format as ImageFormat;

  const query = ournetAPI.query<{ quote: Quote }>();

  query.quotesQuoteById("quote", { fields: QuoteStringFields }, { id });

  try {
    const data = await ournetAPI.execure(query);
    if (!data.quote) {
      return next(notFound(`Not fount quote id=${id}`));
    }
    return sendImage(generateImage(data.quote, format), res, format);
  } catch (e) {
    next(e);
  }
};

function sendImage(stream: Stream, res: Response, format: ImageFormat) {
  res.setHeader("content-type", getContentType(format));
  res.setHeader("cache-control", "public, max-age=5184000"); // 60 days

  stream.on("data", chunk => {
    res.setHeader("content-length", chunk.length);
  });

  stream.pipe(res, { end: true });
}

function getContentType(format: ImageFormat) {
  switch (format) {
    case "png":
      return "image/png";
    case "jpg":
      return "image/jpeg";
  }
  throw new Error(`Invalid image format! ${format}`);
}
