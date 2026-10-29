import { expect, test } from "@playwright/test";

// The app opens on this computer. There is no sign-in screen.
test.use({ storageState: { cookies: [], origins: [] } });

test("opens an application page without asking for a password", async ({ page }) => {
  await page.goto("/applications");
  await expect(page).toHaveURL("/applications");
  await expect(page.getByRole("heading", { level: 1, name: "Applications" })).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveCount(0);
});

test("sends /login on to the app", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveURL("/");
  await expect(page.getByLabel("Password")).toHaveCount(0);
});
