import callApi from "../../util/apiCaller";

function loadSchema(uri) {
  return callApi(`schemas/${uri}`, "get", null, { timeout: 50000 }).then(
    res => {
      return res;
    }
  );
}

export { loadSchema as default, loadSchema };
