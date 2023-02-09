require("dotenv").config();

import * as express from "express";
import { logger } from "./logger";
import { getImageSizeNames } from "@ournet/images-domain";
import imageHandler from "./news/image-handler";
import { NextFunction, Response, Request } from "express";
import quoteImageHandler from "./quotes/image-handler";
const cors = require("cors");
const PORT = process.env.PORT;

async function start() {
  const server = express();

  server.disable("x-powered-by");

  server.use(cors());

  server.get(
    `/:folder(news|events)/:prefix([a-z0-9]{3})/:size(${getImageSizeNames().join(
      "|"
    )})/:id.:format(jpg|png|webp)`,
    imageHandler
  );
  server.get(`/quote/:id.:format(jpg|png)`, quoteImageHandler);

  server.use((_req, res) => res.sendStatus(404).end());

  server.use(
    (err: Error, _req: Request, res: Response, _next: NextFunction) => {
      logger.error(err.message, err);
      res.status(500).send(err.message);
    }
  );

  await server.listen(PORT);
}

// process.on("unhandledRejection", function(error: Error) {
//   logger.error("unhandledRejection: " + error.message, error);
// });

process.on("uncaughtException", function (error: Error) {
  logger.error("uncaughtException: " + error.message, error);
});

start()
  .then(() => logger.warn(`Listening at ${PORT}`))
  .catch((e) => {
    logger.error(e);
  });
