/**
 * SYSTIC-CI — Tests E2E : CRM Pipeline (authentifié)
 */
import { test, expect } from '@playwright/test';

test.describe('CRM — Pipeline commercial', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/crm');
    await page.waitForLoadState('networkidle');
  });

  test('affiche le titre CRM', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /crm|pipeline|commercial/i }),
    ).toBeVisible();
  });

  test('affiche les colonnes du pipeline Kanban', async ({ page }) => {
    // Les colonnes standard du pipeline SYSTIC
    const colonnes = ['Prospection', 'Qualification', 'Proposition', 'Négociation', 'Gagné', 'Perdu'];
    for (const col of colonnes) {
      await expect(page.getByText(col, { exact: false })).toBeVisible();
    }
  });

  test('le bouton "Nouveau lead" est accessible', async ({ page }) => {
    const btn = page.getByRole('button', { name: /nouveau|lead|prospect/i }).first();
    await expect(btn).toBeVisible();
  });

  test('les stats CRM sont affichées', async ({ page }) => {
    // Métriques : total leads, taux conversion, CA pipeline
    await expect(page.getByText(/leads|prospects|pipeline/i).first()).toBeVisible();
  });
});
