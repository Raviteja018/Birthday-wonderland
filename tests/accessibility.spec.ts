import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { button, expectChapter, openSurprise } from './helpers';

async function expectNoSeriousViolations(page: Page, label: string) {
  // Let entrance animations settle so colours are measured at full opacity.
  await page.waitForTimeout(700);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  const serious = results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => `${v.id}: ${v.help} → ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
  expect(serious, `axe violations in ${label}`).toEqual([]);
}

test('no serious or critical axe violations in any chapter state', async ({ page }) => {
  await page.goto('/');
  await expectChapter(page, 0);
  await expectNoSeriousViolations(page, 'welcome');

  await openSurprise(page);
  await expectNoSeriousViolations(page, 'heart tree');
  for (const n of [1, 2, 3]) await button(page, new RegExp(`^Reveal heart message ${n}$`)).click();
  await expectNoSeriousViolations(page, 'heart tree (revealed)');
  await button(page, 'Continue to the cake').click();

  await expectChapter(page, 2);
  await expectNoSeriousViolations(page, 'cake');
  for (const n of [1, 2, 3]) await button(page, `Blow out candle ${n}`).click();
  await button(page, /cut the cake/i).click();
  await expectNoSeriousViolations(page, 'cake (cut)');
  await button(page, /^Continue$/).click();

  await expectChapter(page, 3);
  await expectNoSeriousViolations(page, 'balloons');
  for (const n of [1, 2, 3, 4, 5, 6]) await button(page, new RegExp(`^Pop balloon ${n}\\b`)).click();
  await expectNoSeriousViolations(page, 'balloons (popped)');
  await button(page, /continue to our memories/i).click();

  await expectChapter(page, 4);
  await expectNoSeriousViolations(page, 'memories');
  await button(page, /continue to my letter/i).click();

  await expectChapter(page, 5);
  await expectNoSeriousViolations(page, 'letter (sealed)');
  await button(page, /open your letter/i).click();
  await expect(page.getByTestId('letter-text')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('heading', { level: 3, name: /happy birthday/i })).toBeVisible();
  await page.waitForTimeout(1200); // fairytale flourish
  await expectNoSeriousViolations(page, 'letter finale (opened)');

  // Settings panel open.
  await button(page, 'Magic').click();
  await expect(page.getByRole('switch', { name: /reduce animations/i })).toBeVisible();
  await expectNoSeriousViolations(page, 'magic settings panel');
});

test('focus moves to each new chapter heading and the page title follows', async ({ page }) => {
  await page.goto('/');
  await openSurprise(page);
  await expect(page.getByRole('heading', { level: 2, name: 'A tree full of little reasons' })).toBeFocused();
  await expect(page).toHaveTitle(/Chapter 2 of 6/);
  await button(page, 'Skip activity').click();
  await expect(page.getByRole('heading', { level: 2, name: 'Make a birthday wish!' })).toBeFocused();
  await expect(page).toHaveTitle(/Make a birthday wish! · Chapter 3 of 6/);
});

test('progress stars expose current and completed chapters to screen readers', async ({ page }) => {
  await page.goto('/');
  await openSurprise(page);
  await button(page, 'Skip activity').click();
  await expectChapter(page, 2);
  const chapters = page.getByRole('list', { name: 'Chapters' });
  await expect(chapters.getByRole('listitem')).toHaveCount(6);
  await expect(chapters).toContainText('Chapter 1: completed');
  await expect(chapters).toContainText('Chapter 2: completed');
  await expect(chapters).toContainText('Chapter 3: current');
  await expect(chapters).toContainText('Chapter 4: not visited yet');
  await expect(chapters.locator('[aria-current="step"]')).toHaveCount(1);
});

test('decorations are hidden from assistive tech and never block clicks', async ({ page }) => {
  await page.goto('/');
  const decorative = await page.evaluate(() =>
    [...document.querySelectorAll('.pointer-events-none')].every(
      (el) => el.closest('[aria-hidden="true"]') !== null && getComputedStyle(el).pointerEvents === 'none',
    ),
  );
  expect(decorative).toBe(true);
});

test('the in-app Reduce animations toggle stills ambient loops', async ({ page }) => {
  await page.goto('/');
  await button(page, 'Magic').click();
  await page.getByRole('switch', { name: /reduce animations/i }).click();
  await page.keyboard.press('Escape');
  const attr = await page.evaluate(() => document.documentElement.hasAttribute('data-reduce-anim'));
  expect(attr).toBe(true);
  // The journey still works end to end with the toggle on.
  await openSurprise(page);
  await expectChapter(page, 1);
});

test('Escape closes an open heart message', async ({ page }) => {
  await page.goto('/');
  await openSurprise(page);
  await button(page, /^Reveal heart message 1$/).click();
  await expect(page.getByText('You make ordinary days feel magical.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText('You make ordinary days feel magical.')).toHaveCount(0);
});
