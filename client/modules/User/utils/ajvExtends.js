import { fetchValidateUser } from "../UserActions";

function checkEmailExists(schema, data) {
  const email = data.toLowerCase();
  let shouldExists = schema;
  if (typeof shouldExists !== "boolean") {
    shouldExists = true;
  }
  return fetchValidateUser({ emailExists: email })
    .then(() => {
      if (shouldExists) {
        return true;
      } else {
        return false;
      }
    })
    .catch(() => {
      if (shouldExists) {
        return false;
      } else {
        return true;
      }
    });
}

function ajvExtends(ajv) {
  ajv.addKeyword("emailExists", {
    async: true,
    type: "string",
    validate: checkEmailExists
  });
  return ajv;
}

export default ajvExtends;
