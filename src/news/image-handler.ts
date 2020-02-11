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

  return sendImage(stream.pipe(instance), res, format);
};

function sendImage(stream: Duplex, res: Response, format: ImageFormat) {
  res.setHeader("Content-Type", ImageFormatHelper.getMimeByFormat(format));
  res.setHeader("Cache-Control", "public, max-age=5184000"); // 60 days
  let length = 0;
  stream.on("data", chunk => {
    length += chunk.length;
    res.setHeader("content-length", length);
  });

  res.removeHeader("accept-ranges");
  res.removeHeader("etag");
  res.removeHeader("server");

  stream.pipe(res);
}
