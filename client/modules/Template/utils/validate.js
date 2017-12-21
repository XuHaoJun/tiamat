function validate(ast, { estraverse } = { estraverse: null }) {
  if (!estraverse) {
    throw new Error("validate template require estraverse");
  }
  // const esprimaP = import(/* webpackChunkName: "esprima" */ "esprima");
  // const estraverseP = import(/* webpackChunkName: "estraverse-fb" */ "estraverse-fb");
  // const [esprima, estraverse] = await Promise.all([esprimaP, estraverseP]);
}

export default validate;
