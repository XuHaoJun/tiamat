import axios from "axios";
import imgurConfig from "../configs/oauth2/imgur";
import Image from "../models/image";

const ImgurPrefix = "https://api.imgur.com/3";

export function getImages(req, res) {}

export function addImage(req, res) {
  const { clientID } = imgurConfig;
  if (!clientID) {
    res.status(403).send(new Error("not enable image service."));
  } else if (!req.body.image) {
    res.status(403).send(new Error("not found image."));
  } else {
    const {
      type,
      image,
      title,
      name,
      description,
      sourceType,
      sourceId
    } = req.body.image;
    // TODO find good validate lib for replace like !image !type check.
    if (!image) {
      res.status(403).send("image data is required.");
    } else if (!type) {
      res.status(403).send("type is required.");
    } else {
      const provider = "imgur";
      if (provider === "imgur") {
        const method = "post";
        const headers = {
          authorization: `Client-ID ${clientID}`
        };
        const uploadUrl = `${ImgurPrefix}/image`;
        const form = {
          image,
          type,
          title,
          description
        };
        const data = form;
        axios({ method, headers, url: uploadUrl, data })
          .then(imgurResponse => {
            const imgurData = imgurResponse.data.data;
            const imageUrl = imgurData.link.replace(/^http:\/\//, "https://");
            const providerResponse = imgurData;
            const props = {
              title,
              name,
              description,
              url: imageUrl,
              provider,
              providerResponse,
              sourceType,
              source: sourceId
            };
            const _image = new Image(props);
            _image.save(err => {
              if (err) {
                res.status(403).send(err);
              } else {
                res.json({ image: _image });
              }
            });
          })
          .catch(err => {
            res.status(403).send(err);
          });
      } else {
        res.status(403).send("incorrect provider");
      }
    }
  }
}
