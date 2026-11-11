import { mountShell } from "./shell.js";

await mountShell(document.body.dataset.page || "");
