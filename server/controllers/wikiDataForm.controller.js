import WikiDataForm from "../models/wikiDataForm";

export function getWikiDataForms(req, res) {
  const { rootWikiId } = req.query;
  if (!rootWikiId) {
    res.status(403).send(new Error("rootWikiId is required"));
    return;
  }
  WikiDataForm.find({ rootWiki: rootWikiId })
    .exec()
    .then(wikiDataForms => {
      res.json({ wikiDataForms });
    })
    .catch(err => {
      res.status(403).send(err);
    });
}

export function addWikiDataForm(req, res) {
  const form = req.body;
  const wikiDataForm = new WikiDataForm(form);
  wikiDataForm
    .save()
    .then(saved => {
      res.json({ wikiDataForm: saved });
    })
    .catch(err => {
      res.status(403).send(err);
    });
}
