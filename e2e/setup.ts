import { expect, test as setup } from "@playwright/test";

import { resetData, STORAGE_STATE } from "./support";

// Before the specs: the demo data. The app opens without a password.
setup("open the app", async ({ page }) => {
  await resetData();
  await page.goto("/");
  await expect(page).toHaveURL("/");
  await page.context().storageState({ path: STORAGE_STATE });
});
