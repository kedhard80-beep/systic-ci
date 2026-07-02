/**
 * SYSTIC-CI — Tests E2E : Dashboard Admin (authentifié)
 */
import { test, expect } from '@playwright/test';

test.describe('Dashboard Admin', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('affiche le titre et la date du jour', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();
  });

  test('affiche la sidebar de navigation', async ({ page }) => {
    // Logo
    await expect(page.getByText('SYSTIC-CI')).toBeVisible();

    // Sections de navigation
    await expect(page.getByRole('link', { name: /tableau de bord/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /crm/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /clients/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /devis/i })).toBeVisible();
  });

  test('affiche le graphique chiffre d\'affaires', async ({ page }) => {
    await expect(page.getByText(/chiffre d'affaires/i)).toBeVisible();
    // Présence des labels mois
    await expect(page.getByText('Déc')).toBeVisible();
  });

  test('affiche la liste Top Clients', async ({ page }) => {
    await expect(page.getByText(/top clients/i)).toBeVisible();
    await expect(page.getByText('Groupe Pétrolier')).toBeVisible();
  });

  test('affiche l\'activité récente', async ({ page }) => {
    await expect(page.getByText(/activité récente/i)).toBeVisible();
  });

  test('navigation vers CRM fonctionne', async ({ page }) => {
    await page.getByRole('link', { name: /crm/i }).first().click();
    await page.waitForURL('**/crm', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/crm/);
  });

  test('bouton déconnexion visible dans la sidebar', async ({ page }) => {
    await expect(page.getByRole('button', { name: /déconnexion/i })).toBeVisible();
  });

  test('déconnexion redirige vers login', async ({ page }) => {
    await page.getByRole('button', { name: /déconnexion/i }).click();
    await page.waitForURL('**/login', { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
