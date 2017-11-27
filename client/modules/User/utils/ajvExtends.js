import { fetchValidateUser } from "../UserActions";

function checkEmailExists(schema, data) {
  let email = data;
  let shouldExists = schema;
  if (typeof schema === "boolean") {
    shouldExists = schema;
  } else if (typeof schema === "string") {
    shouldExists = true;
    email = schema;
  } else {
    // should handle by metaSchema never see this line.
  }
  return fetchValidateUser({ emailExists: email.toLowerCase() })
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
    validate: checkEmailExists,
    metaSchema: {
      type: ["boolean", "string"]
    }
  });
  return ajv;
}

export default ajvExtends;
