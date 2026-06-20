import assert from "node:assert/strict";

import { LANGS, TRANSLATIONS } from "./i18n.ts";

const langCodes = LANGS.map((lang) => lang.code).sort();
const translationCodes = Object.keys(TRANSLATIONS).sort();

assert.deepEqual(translationCodes, langCodes);
assert.equal(TRANSLATIONS.ru.installTitle, "Установка");
assert.equal(TRANSLATIONS.en.installTitle, "Setup");
assert.equal(TRANSLATIONS.es.copyToast, "Enlace copiado");
assert.equal(
  TRANSLATIONS.de.hiddifyConnectBody,
  "Wählen Sie in der App einen Server und tippen Sie auf die Haupttaste zum Verbinden.",
);
