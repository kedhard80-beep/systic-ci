/**
 * SYSTIC-CI — Tests E2E : Page de connexion (non-authentifié)
 */
import { test, expect } from '@playwright/test';

test.describe('Page de connexion', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('affiche le formulaire de connexion', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
  });

  test('affiche une erreur pour des identifiants invalides', async ({ page }) => {
    await page.getByLabel(/email/i).fill('inconnu@test.ci');
    await page.getByLabel(/mot de passe/i).fill('mauvais-mdp');
    await page.getByRole('button', { name: /se connecter/i }).click();

    // Message d'erreur visible
    await expect(
      page.getByText(/identifiants|incorrect|invalide|erreur/i),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('affiche les erreurs de validation si les champs sont vides', async ({ page }) => {
    await page.getByRole('button', { name: /se connecter/i }).click();

    // Au moins une erreur de champ requis
    const errors = page.getByText(/requis|obligatoire|invalid/i);
    await expect(errors.first()).toBeVisible({ timeout: 5_000 });
  });

  test('lien vers la page d\'inscription est présent', async ({ page }) => {
    await expect(page.getByRole('link', { name: /créer|inscription|s'inscrire/i })).toBeVisible();
  });

  test('lien mot de passe oublié est présent', async ({ page }) => {
    await expect(page.getByRole('link', { name: /oublié|forgot/i })).toBeVisible();
  });
});
