import { expect, test, type Page } from '@playwright/test';
import { button, expectChapter, heading, openSurprise, tabToAndPress, trackProblems } from './helpers';

async function playEverything(page: Page) {
  await page.goto('/');
  await expectChapter(page, 0);
  await openSurprise(page);

  // Heart tree: 3 unique hearts unlock Continue.
  for (const n of [1, 4, 7]) await button(page, new RegExp(`^Reveal heart message ${n}$`)).click();
  await expect(page.getByTestId('heart-counter')).toHaveText(/3\/3 discovered/);
  await button(page, 'Continue to the cake').click();
  await expectChapter(page, 2);

  // Cake: three candles, then cut.
  await expect(button(page, /cut the cake/i)).toHaveCount(0);
  for (const n of [1, 2, 3]) await button(page, `Blow out candle ${n}`).click();
  await button(page, /cut the cake/i).click();
  await expect(page.getByText('A sweet wish for the sweetest person!')).toBeVisible();
  await button(page, /^Continue$/).click();
  await expectChapter(page, 3);

  // Balloons: all six.
  for (const n of [1, 2, 3, 4, 5, 6]) await button(page, new RegExp(`^Pop balloon ${n}\\b`)).click();
  await expect(page.getByText('6 of 6 popped')).toBeVisible();
  await button(page, /continue to our memories/i).click();
  await expectChapter(page, 4);

  // Memory lane: browse.
  await expect(page.getByTestId('memory-position')).toHaveText('1 of 3');
  await button(page, 'Next memory').click();
  await expect(page.getByTestId('memory-position')).toHaveText('2 of 3');
  await button(page, /continue to my letter/i).click();
  await expectChapter(page, 5);

  // Letter — the fairytale finale.
  await button(page, /open your letter/i).click();
  await expect(page.getByTestId('letter-text')).toContainText('Dear Birthday Star,', { timeout: 10_000 });
  await expect(page.getByRole('heading', { level: 3, name: /happy birthday, birthday star!/i })).toBeVisible();
  await expect(button(page, /read letter again/i)).toBeVisible();

  // Replay from the letter finale.
  await button(page, /replay from beginning/i).click();
  await expectChapter(page, 0);
}

test('happy path: every chapter in order, ending on the letter, then replay', async ({ page }) => {
  const problems = trackProblems(page);
  await playEverything(page);
  // Replay really reset the activities.
  await openSurprise(page);
  await expect(page.getByTestId('heart-counter')).toHaveText(/0\/3 discovered/);
  expect(problems).toEqual([]);
});

test('reduced-motion visitors can complete every chapter', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const problems = trackProblems(page);
  await playEverything(page);
  expect(problems).toEqual([]);
});

test('the ?motion=reduce test override stills the experience and it still completes', async ({ page }) => {
  await page.goto('/?motion=reduce');
  await openSurprise(page);
  for (let i = 0; i < 3; i++) await button(page, 'Skip activity').click();
  await button(page, 'Skip memories').click();
  await expectChapter(page, 5);
  await button(page, 'Skip opening animation').click();
  await expect(page.getByRole('heading', { level: 3, name: /happy birthday/i })).toBeVisible();
});

test('keyboard-only completion of all six chapters', async ({ page }) => {
  await page.goto('/');
  const press = (name: string | RegExp, key = 'Enter') => tabToAndPress(page, button(page, name), key);

  await press(/open my surprise/i);
  await expectChapter(page, 1);
  for (const n of [2, 3, 5]) await press(new RegExp(`^Reveal heart message ${n}$`), n === 3 ? 'Space' : 'Enter');
  await press('Continue to the cake');
  await expectChapter(page, 2);

  for (const n of [1, 2, 3]) await press(`Blow out candle ${n}`);
  await press(/cut the cake/i);
  await expect(page.getByText('A sweet wish for the sweetest person!')).toBeVisible();
  // Continue receives focus once it appears.
  await expect(button(page, /^Continue$/)).toBeFocused();
  await page.keyboard.press('Enter');
  await expectChapter(page, 3);

  for (const n of [1, 2, 3, 4, 5, 6]) await press(new RegExp(`^Pop balloon ${n}\\b`), n % 2 ? 'Enter' : 'Space');
  await expect(page.getByText('6 of 6 popped')).toBeVisible();
  await press(/continue to our memories/i);
  await expectChapter(page, 4);

  await tabToAndPress(page, page.getByTestId('memory-gallery'), 'ArrowRight');
  await expect(page.getByTestId('memory-position')).toHaveText('2 of 3');
  await page.keyboard.press('ArrowRight');
  await expect(page.getByTestId('memory-position')).toHaveText('3 of 3');
  await press(/continue to my letter/i);
  await expectChapter(page, 5);

  await press(/open your letter/i);
  await expect(page.getByTestId('letter-text')).toBeVisible({ timeout: 10_000 });
  // The letter itself receives focus so screen readers land on the words.
  await expect(page.getByTestId('letter-text')).toBeFocused();
  await expect(page.getByRole('heading', { level: 3, name: /happy birthday/i })).toBeVisible();

  await press(/replay from beginning/i);
  await expect(heading(page, 0)).toBeVisible();
});

test('a broken memory photo shows a friendly fallback instead of a broken image', async ({ page }) => {
  await page.route('**/images/memories/sample-1.svg', (route) => route.abort());
  await page.goto('/');
  await openSurprise(page);
  for (let i = 0; i < 3; i++) await button(page, 'Skip activity').click();
  await expectChapter(page, 4);
  await expect(page.getByText('Photo unavailable')).toBeVisible();
  await expect(page.getByRole('img', { name: /hot air balloons/i })).toBeVisible();
  // No <img> element left in a broken state.
  const brokenImages = await page.locator('figure img').evaluateAll((imgs) =>
    (imgs as HTMLImageElement[]).filter((img) => img.complete && img.naturalWidth === 0).length,
  );
  expect(brokenImages).toBe(0);
  // The next photo still works.
  await button(page, 'Next memory').click();
  await expect(page.locator('figure img')).toHaveJSProperty('complete', true);
  await expect(page.getByText('Photo unavailable')).toHaveCount(0);
});

test('music stays off by default and nothing autoplays', async ({ page }) => {
  await page.goto('/');
  await expect(button(page, 'Sound')).toHaveAttribute('aria-pressed', 'false');
  const playing = await page.evaluate(() => [...document.querySelectorAll('audio, video')].some((m) => !(m as HTMLMediaElement).paused));
  expect(playing).toBe(false);
});
