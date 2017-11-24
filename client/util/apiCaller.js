import axios from "axios";
import { port } from "../../server/configs/server";
import Debug from "debug";

const debug = Debug("app:apiCaller");

export const API_URL =
  typeof window === "undefined" || process.env.NODE_ENV === "test"
    ? process.env.BASE_URL || `http://localhost:${process.env.PORT || port}/api`
    : "/api";

// in server-side call this skip error for no crush when not handle rejection.
const handleError =
  typeof window === "undefined" && typeof document === "undefined"
    ? error => {
        debug("error", error);
        return error;
      }
    : undefined;

export default function callApi(
  endpoint,
  method = "get",
  data = null,
  config = {}
) {
  const reqConfig = Object.assign(
    {
      url: `${API_URL}/${endpoint}`,
      headers: {
        "content-type": "application/json"
      },
      method,
      data
    },
    config || {}
  );
  debug("start fetch", reqConfig.url);
  return axios(reqConfig)
    .then(response => {
      const json = response.data;
      debug("end fetch", reqConfig.url);
      return json;
    })
    .then(response => response, handleError);
}
