import { Request, Response, NextFunction } from "express";
import {
  ImageSizeName,
  ImageFormatHelper,
  getImageMasterSizeName,
  getImageSizeByName,
  ImageFormat
} from "@ournet/images-domain";
import * as sharp from "sharp";
import * as got from "got";
import { Duplex } from "stream";

const masterSizeName = getImageMasterSizeName();

export default (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const format = req.params.format as ImageFormat;
  const size = req.params.size as ImageSizeName;

  const originalFormat = ImageFormatHelper.getFormatById(id);

  const url = `http://s3.eu-central-1.amazonaws.com/news.ournetcdn.net/${req.params.folder}/${req.params.prefix}/${masterSizeName}/${id}.${originalFormat}`;

  const stream = got
    .stream(url, { timeout: 3000 })
    .on("error", (error: any) => next(error));

  if (format === originalFormat && size === masterSizeName) {
    return sendImage(stream, res, format);
  }
  let instance = sharp();
  if (format !== originalFormat) {
    instance = instance.toFormat(format);
  }
  if (size !== masterSizeName) {
    const newSize = getImageSizeByName(size);
    if (size === "square") {
      instance = instance.resize(newSize, newSize);
    } else {
      instance = instance.resize(newSize);
    }
  }

  return sendImage(stream.pipe(instance), res, format, true);
};

function sendImage(
  stream: Duplex,
  res: Response,
  format: ImageFormat,
  isChanged: boolean = false
) {
  res.setHeader("Content-Type", ImageFormatHelper.getMimeByFormat(format));
  res.setHeader("Cache-Control", "public, max-age=2592000"); // 30 days

  if (isChanged) {
    stream.on("data", chunk => {
      res.setHeader("content-length", chunk.length);
    });
  }

  stream.pipe(res, { end: true });
}
