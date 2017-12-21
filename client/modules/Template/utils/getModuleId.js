function getModuleId(template) {
  if (!template) {
    throw new Error("getModuleId require template param.");
  }
  // TODO
  // get by targetKind "rootWiki" or ??
  const { name, rootWiki, targetKind, user } = template;
  if (name) {
    if (rootWiki) {
      const id = `/rootWikis/${rootWiki}/${name}`;
      return id;
    }
  }
  return null;
}

export default getModuleId;
