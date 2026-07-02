/**
 * SYSTIC-CI — Setup auth Playwright (génère le storageState)
 * Lance AVANT tous les tests authentifiés.
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.join(__dirname, '.auth/user.json');

setup('authentification admin', async ({ page }) => {
  await page.goto('/login');

  // Attendre le formulaire de connexion
  await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();

  // Remplir les champs
  await page.getByLabel(/email/i).fill('akarosine08@gmail.com');
  await page.getByLabel(/mot de passe/i).fill('Test@Systic2024!');

  // Soumettre
  await page.getByRole('button', { name: /se connecter/i }).click();

  // Attendre la redirection vers le dashboard
  await page.waitForURL('**/dashboard', { timeout: 15_000 });
  await expect(page.getByText('Tableau de bord')).toBeVisible();

  // Sauvegarder l'état d'authentification
  await page.context().storageState({ path: AUTH_FILE });
});
