import { expect, test } from '@playwright/test';
import { button, expectChapter, openLetter, openSurprise, skipToChapter } from './helpers';

const back = (page: import('@playwright/test').Page) => button(page, /back to the previous chapter/i);

test('Back works from every chapter 1–5 and preserves what was done', async ({ page }) => {
  await page.goto('/');
  await openSurprise(page);

  // 1 → back to 0 and forward again: discovered hearts survive.
  await button(page, /^Reveal heart message 2$/).click();
  await button(page, /^Reveal heart message 6$/).click();
  await back(page).click();
  await expectChapter(page, 0);
  await openSurprise(page);
  await expect(page.getByTestId('heart-counter')).toHaveText(/2\/3 discovered/);
  await expect(button(page, /^Reveal heart message 2 \(discovered\)$/)).toBeVisible();
  await button(page, /^Reveal heart message 8$/).click();
  await button(page, 'Continue to the cake').click();
  await expectChapter(page, 2);

  // 2: two candles out, back, forward.
  await button(page, 'Blow out candle 1').click();
  await button(page, 'Blow out candle 3').click();
  await back(page).click();
  await expectChapter(page, 1);
  await expect(page.getByTestId('heart-counter')).toHaveText(/3\/3 discovered/);
  await button(page, 'Continue to the cake').click();
  await expectChapter(page, 2);
  await expect(button(page, 'Candle 1 blown out')).toBeVisible();
  await expect(button(page, 'Candle 3 blown out')).toBeVisible();
  await expect(button(page, 'Blow out candle 2')).toBeVisible();
  await button(page, 'Blow out candle 2').click();
  await button(page, /cut the cake/i).click();
  await button(page, /^Continue$/).click();
  await expectChapter(page, 3);

  // 3: pop two, back, forward.
  await button(page, /^Pop balloon 2\b/).click();
  await button(page, /^Pop balloon 5\b/).click();
  await back(page).click();
  await expectChapter(page, 2);
  await expect(page.getByText('A sweet wish for the sweetest person!')).toBeVisible();
  await button(page, /^Continue$/).click();
  await expectChapter(page, 3);
  await expect(page.getByText('2 of 6 popped')).toBeVisible();
  await expect(button(page, /read message 2/i)).toBeVisible();
  await button(page, 'Skip activity').click();
  await expectChapter(page, 4);

  // 4: gallery position survives Back.
  await button(page, 'Next memory').click();
  await button(page, 'Next memory').click();
  await expect(page.getByTestId('memory-position')).toHaveText('3 of 3');
  await back(page).click();
  await expectChapter(page, 3);
  await button(page, /continue to our memories/i).click();
  await expectChapter(page, 4);
  await expect(page.getByTestId('memory-position')).toHaveText('3 of 3');
  await button(page, /continue to my letter/i).click();
  await expectChapter(page, 5);

  // 5: the opened letter (and its fairytale ending) stays open after Back.
  await openLetter(page);
  await back(page).click();
  await expectChapter(page, 4);
  await button(page, /continue to my letter/i).click();
  await expectChapter(page, 5);
  await expect(page.getByTestId('letter-text')).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: /happy birthday/i })).toBeVisible();
  await expect(button(page, /open your letter/i)).toHaveCount(0);
});

test('“Read letter again” returns focus to the opened letter', async ({ page }) => {
  await skipToChapter(page, 5);
  await openLetter(page);
  // The reveal focuses the letter; move focus away, then ask to read again.
  await button(page, /replay from beginning/i).focus();
  await expect(page.getByTestId('letter-text')).not.toBeFocused();
  await button(page, /read letter again/i).click();
  await expect(page.getByTestId('letter-text')).toBeFocused();
  await expect(page.getByTestId('letter-text')).toContainText('With love, Someone Who Cares');
});

test('every activity can be skipped without getting stuck, ending on the letter', async ({ page }) => {
  await skipToChapter(page, 5);
  await openLetter(page);
  await expect(button(page, /replay from beginning/i)).toBeVisible();
  const chapters = page.getByRole('list', { name: 'Chapters' });
  await expect(chapters.getByRole('listitem')).toHaveCount(6);
  for (let i = 1; i <= 5; i++) {
    await expect(page.getByText(`Chapter ${i}: completed`)).toBeAttached();
  }
  await expect(page.getByText('Chapter 6: current')).toBeAttached();
});

test('rapid double clicks never skip two chapters', async ({ page }) => {
  await page.goto('/');
  await openSurprise(page);
  await button(page, 'Skip activity').dblclick();
  await expectChapter(page, 2);
  await page.waitForTimeout(900);
  await expectChapter(page, 2);
});

test('reloading starts again from the welcome chapter', async ({ page }) => {
  await skipToChapter(page, 3);
  await page.reload();
  await expectChapter(page, 0);
});
