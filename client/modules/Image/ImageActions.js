import callApi from "../../util/apiCaller";
import { addError } from "../Error/ErrorActions";

export function addImage(image, reqConfig) {
  // eslint-disable-line import/prefer-default-export
  return dispatch => {
    return callApi("images", "post", { image }, reqConfig)
      .then(res => {
        return res.image;
      })
      .catch(err => {
        return Promise.resolve(
          dispatch(addError(err.response.data))
        ).then(() => {
          return Promise.reject(err);
        });
      });
  };
}
