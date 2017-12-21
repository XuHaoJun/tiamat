import Ajv from "ajv";
import schema from "./schema.json";

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(schema);

export default validate;
