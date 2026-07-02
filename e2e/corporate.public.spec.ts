/**
 * SYSTIC-CI — Tests E2E : Site corporate (non-authentifié)
 */
import { test, expect } from '@playwright/test';

test.describe('Site Corporate', () => {
  test('page d\'accueil se charge et affiche le hero', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveTitle(/SYSTIC/i);
    // Hero section avec le nom de l'entreprise
    await expect(page.getByText(/SYSTIC/i).first()).toBeVisible();
  });

  test('navigation principale est accessible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Liens de navigation principaux
    const navLinks = ['Entreprise', 'Nos métiers', 'Académie', 'Contact'];
    for (const link of navLinks) {
      await expect(page.getByRole('link', { name: link, exact: false })).toBeVisible();
    }
  });

  test('page contact affiche le formulaire', async ({ page }) => {
    await page.goto('/contact');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /contact/i })).toBeVisible();
  });

  test('page devis affiche le formulaire de demande', async ({ page }) => {
    await page.goto('/devis');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /devis|demande/i })).toBeVisible();
  });

  test('page académie affiche les formations', async ({ page }) => {
    await page.goto('/academie');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /acad[eé]mie|formation/i })).toBeVisible();
  });

  test('page blog se charge', async ({ page }) => {
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /blog|actualit/i })).toBeVisible();
  });

  test('page carrières affiche les offres', async ({ page }) => {
    await page.goto('/carrieres');
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /carri[eè]res|emploi|rejoindre/i })).toBeVisible();
  });

  test('redirection login si accès dashboard non-authentifié', async ({ page }) => {
    // Vider le storage pour simuler un utilisateur non connecté
    await page.context().clearCookies();
    await page.evaluate(() => localStorage.clear());

    await page.goto('/dashboard');
    await page.waitForURL(/\/login/, { timeout: 10_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
