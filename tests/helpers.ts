import { expect, type Locator, type Page } from '@playwright/test';

export const CHAPTER_HEADINGS = [
  /hey, birthday star/i,
  'A tree full of little reasons',
  'Make a birthday wish!',
  'Pop the happiness!',
  'A walk down memory lane',
  'A letter from my heart',
] as const;

export const heading = (page: Page, chapter: number) =>
  page.getByRole('heading', { level: 2, name: CHAPTER_HEADINGS[chapter] });

export const button = (page: Page, name: string | RegExp) => page.getByRole('button', { name });

export async function expectChapter(page: Page, chapter: number) {
  await expect(heading(page, chapter)).toBeVisible();
  await expect(page.getByText(`Chapter ${chapter + 1} of 6`)).toBeVisible();
}

/** Records uncaught errors, console errors and failed requests (remote fonts are optional and ignored). */
export function trackProblems(page: Page) {
  const problems: string[] = [];
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console: ${msg.text()}`);
  });
  page.on('requestfailed', (req) => {
    if (!/fonts\.(googleapis|gstatic)\.com/.test(req.url())) problems.push(`requestfailed: ${req.url()}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400 && !/fonts\.(googleapis|gstatic)\.com/.test(res.url())) problems.push(`http ${res.status()}: ${res.url()}`);
  });
  return problems;
}

export async function openSurprise(page: Page) {
  await button(page, /open my surprise/i).click();
  await expectChapter(page, 1);
}

/** Skips activities to reach a chapter (2–5; 5 is the letter, still sealed). */
export async function skipToChapter(page: Page, chapter: number) {
  await page.goto('/');
  await openSurprise(page);
  for (let scene = 1; scene < chapter; scene++) {
    await button(page, scene === 4 ? 'Skip memories' : 'Skip activity').click();
    await expectChapter(page, scene + 1);
  }
}

/** Opens the sealed letter instantly and waits for the fairytale ending. */
export async function openLetter(page: Page) {
  await button(page, 'Skip opening animation').click();
  await expect(page.getByTestId('letter-text')).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: /happy birthday/i })).toBeVisible();
}

export async function horizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

/** Scrolls a control into view and asserts it is fully on screen and not covered by anything. */
export async function expectReachable(page: Page, control: Locator) {
  await control.scrollIntoViewIfNeeded();
  const box = await control.boundingBox();
  expect(box, 'control has a layout box').not.toBeNull();
  const viewport = page.viewportSize()!;
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport.width + 0.5);
  expect(box!.height).toBeGreaterThanOrEqual(44 - 0.5);
  const onTop = await control.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return !!hit && (hit === el || el.contains(hit));
  });
  expect(onTop, 'control is not covered or clipped').toBe(true);
}

/** Presses Tab until `target` has focus (keyboard-only navigation), then presses `key`. */
export async function tabToAndPress(page: Page, target: Locator, key = 'Enter', maxTabs = 40) {
  for (let i = 0; i < maxTabs; i++) {
    if (await target.evaluate((el) => el === document.activeElement).catch(() => false)) {
      await page.keyboard.press(key);
      return;
    }
    await page.keyboard.press('Tab');
  }
  throw new Error(`Could not reach ${target} with the keyboard`);
}
