import { Request, Response, NextFunction } from "express";
import * as http from "http";
import {
  ImageSizeName,
  ImageFormatHelper,
  getImageMasterSizeName,
  getImageSizeByName,
  ImageFormat
} from "@ournet/images-domain";
import * as sharp from "sharp";
import { Duplex } from "stream";

const CACHE_CONTROL_VALUE = "public, max-age=5184000";
const masterSizeName = getImageMasterSizeName();

const sendImage = (stream: Duplex, res: Response, format: ImageFormat) => {
  res.setHeader("content-type", ImageFormatHelper.getMimeByFormat(format));
  res.setHeader("cache-control", CACHE_CONTROL_VALUE); // 60 days
  let length = 0;
  stream.on("data", chunk => {
    length += chunk.length;
    res.setHeader("content-length", length);
  });

  stream.pipe(res);
};

const headersToDelete = [
  "x-amz-id-2",
  "accept-ranges",
  "etag",
  "server",
  "x-amz-request-id",
  "connection",
  "last-modified"
];

const handleResponse = (
  originalFormat: ImageFormat,
  format: ImageFormat,
  size: ImageSizeName,
  res: Response
) => (response: http.IncomingMessage) => {
  headersToDelete.forEach(header => {
    delete response.headers[header];
  });

  if (format === originalFormat && size === masterSizeName) {
    response.headers["cache-control"] = CACHE_CONTROL_VALUE;
    res.writeHead(response.statusCode || 200, response.headers);
    response.pipe(res);
    return;
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

  sendImage(response.pipe(instance), res, format);
};

export default (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id as string;
  const format = req.params.format as ImageFormat;
  const size = req.params.size as ImageSizeName;

  const originalFormat = ImageFormatHelper.getFormatById(id);

  const url = `http://s3.eu-central-1.amazonaws.com/news.ournetcdn.net/${req.params.folder}/${req.params.prefix}/${masterSizeName}/${id}.${originalFormat}`;

  const options = { timeout: 3000, method: "GET" };

  http
    .get(url, options, handleResponse(originalFormat, format, size, res))
    .on("error", (error: any) => next(error));
};
