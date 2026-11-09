import { expect, test, type Page } from '@playwright/test';
import { button, expectChapter, expectReachable, horizontalOverflow, openSurprise } from './helpers';

const WIDTHS = [320, 375, 390, 768, 1024, 1440, 1920];

/** Visits every chapter (doing each activity so revealed content is on screen too) and runs `check` on each. */
async function visitAllChapters(page: Page, check: (chapter: number) => Promise<void>) {
  await page.goto('/');
  await expectChapter(page, 0);
  await check(0);
  await openSurprise(page);
  await check(1);
  for (const n of [1, 5, 6]) await button(page, new RegExp(`^Reveal heart message ${n}$`)).click();
  await check(1);
  await button(page, 'Continue to the cake').click();
  await expectChapter(page, 2);
  await check(2);
  for (const n of [1, 2, 3]) await button(page, `Blow out candle ${n}`).click();
  await button(page, /cut the cake/i).click();
  await expect(page.getByText('A sweet wish for the sweetest person!')).toBeVisible();
  await check(2);
  await button(page, /^Continue$/).click();
  await expectChapter(page, 3);
  await check(3);
  for (const n of [1, 2, 3, 4, 5, 6]) await button(page, new RegExp(`^Pop balloon ${n}\\b`)).click();
  await check(3);
  await button(page, /continue to our memories/i).click();
  await expectChapter(page, 4);
  await check(4);
  await button(page, /continue to my letter/i).click();
  await expectChapter(page, 5);
  await check(5);
  await button(page, /open your letter/i).click();
  await expect(page.getByTestId('letter-text')).toBeVisible({ timeout: 10_000 });
  await expect(page.getByRole('heading', { level: 3, name: /happy birthday/i })).toBeVisible();
  await page.waitForTimeout(900); // let the finale flourish settle
  await check(5);
}

for (const width of WIDTHS) {
  test(`no horizontal overflow at ${width}px`, async ({ page }, testInfo) => {
    // Phone widths run with touch emulation, the rest as desktop — each width once.
    test.skip((width < 768) !== (testInfo.project.name === 'mobile'), 'covered by the other project');
    await page.setViewportSize({ width, height: width < 768 ? 760 : 900 });
    await visitAllChapters(page, async (chapter) => {
      expect(await horizontalOverflow(page), `overflow in chapter ${chapter + 1} at ${width}px`).toBeLessThanOrEqual(0);
    });
  });
}

/** The main control of each chapter, as it appears when the check runs. */
async function primaryControl(page: Page) {
  const candidates = [
    /open my surprise/i,
    /continue to the cake/i,
    /cut the cake/i,
    /^continue$/i,
    /continue to our memories/i,
    /continue to my letter/i,
    /open your letter/i,
    /replay from beginning/i,
    /^skip activity$/i,
  ];
  for (const name of candidates) {
    const control = button(page, name);
    if ((await control.count()) > 0) return control.first();
  }
  throw new Error('No primary control found');
}

const TIGHT_VIEWPORTS = [
  { name: 'mobile landscape', width: 844, height: 390 },
  { name: '200% zoom (1280×720 at 2×)', width: 640, height: 360 },
  { name: 'small phone landscape', width: 640, height: 320 },
];

for (const vp of TIGHT_VIEWPORTS) {
  test(`primary controls stay reachable and unclipped: ${vp.name}`, async ({ page }, testInfo) => {
    // One project is enough for these; run them with touch emulation.
    test.skip(testInfo.project.name !== 'mobile', 'covered by the mobile project');
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await visitAllChapters(page, async (chapter) => {
      expect(await horizontalOverflow(page), `overflow in chapter ${chapter + 1}`).toBeLessThanOrEqual(0);
      await expectReachable(page, await primaryControl(page));
      if (chapter > 0) await expectReachable(page, button(page, /back to the previous chapter/i));
      await expectReachable(page, button(page, 'Sound'));
    });
  });
}

test('a very long letter stays readable with the finale actions reachable', async ({ page }) => {
  // The bundled config is used in e2e, so stretch the rendered letter in the page itself.
  await page.setViewportSize({ width: 360, height: 640 });
  await page.goto('/');
  await openSurprise(page);
  for (let i = 0; i < 3; i++) await button(page, 'Skip activity').click();
  await button(page, 'Skip memories').click();
  await button(page, 'Skip opening animation').click();
  const letter = page.getByTestId('letter-text');
  await expect(letter).toBeVisible();
  await letter.evaluate((el) => {
    const p = el.querySelectorAll('p')[1];
    for (let i = 0; i < 40; i++) el.insertBefore(p.cloneNode(true), p);
  });
  const scrolls = await letter.evaluate((el) => el.scrollHeight > el.clientHeight);
  expect(scrolls).toBe(true);
  expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  await expectReachable(page, button(page, /replay from beginning/i));
  await expectReachable(page, button(page, /read letter again/i));
});
