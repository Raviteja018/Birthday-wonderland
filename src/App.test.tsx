import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { birthdayConfig, type BirthdayConfig } from './config/birthdayConfig';
import { setReducedMotion } from './test/setup';

type Setup = { config?: Partial<BirthdayConfig>; transitionMs?: number; reduced?: boolean };

function setup({ config, transitionMs = 0, reduced = true }: Setup = {}) {
  setReducedMotion(reduced);
  const user = userEvent.setup();
  render(<App config={config} transitionMs={transitionMs} />);
  return user;
}

const button = (name: string | RegExp) => screen.getByRole('button', { name });
const sceneHeading = (name: string | RegExp) => screen.findByRole('heading', { level: 2, name });

async function openGift(user: ReturnType<typeof userEvent.setup>) {
  await user.click(button(/open my surprise/i));
  await sceneHeading('A tree full of little reasons');
}

const SKIP_ROUTE: Array<[string, string]> = [
  ['Skip activity', 'Make a birthday wish!'],
  ['Skip activity', 'Pop the happiness!'],
  ['Skip activity', 'A walk down memory lane'],
  ['Skip memories', 'A letter from my heart'],
];

/** Skip ahead to a chapter index: 1 heart tree, 2 cake, 3 balloons, 4 memories, 5 letter. */
async function goToChapter(user: ReturnType<typeof userEvent.setup>, chapter: number) {
  await openGift(user);
  for (const [skip, next] of SKIP_ROUTE.slice(0, chapter - 1)) {
    await user.click(button(skip));
    await sceneHeading(next);
  }
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Welcome', () => {
  it('renders the default config without any personal assets', () => {
    setup();
    expect(screen.getByRole('heading', { level: 2, name: /hey, birthday star!/i })).toBeInTheDocument();
    expect(screen.getByText('Chapter 1 of 6')).toBeInTheDocument();
    expect(screen.getByText(/ready for your surprise/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument();
    expect(document.title).toMatch(/Chapter 1 of 6/);
  });

  it('opens the gift with the full animation, firing only once for rapid clicks', async () => {
    const user = setup({ reduced: false });
    const cta = button(/open my surprise/i);
    await user.click(cta);
    await user.click(button('Open the gift'));
    expect(cta).toBeDisabled();
    expect(await screen.findByRole('heading', { level: 2, name: 'A tree full of little reasons' }, { timeout: 4000 })).toBeInTheDocument();
    expect(screen.getByText('Chapter 2 of 6')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('moves focus to the new chapter heading and updates the title', async () => {
    const user = setup();
    await openGift(user);
    expect(screen.getByRole('heading', { level: 2, name: 'A tree full of little reasons' })).toHaveFocus();
    expect(document.title).toMatch(/A tree full of little reasons · Chapter 2 of 6/);
  });
});

describe('Heart tree', () => {
  it('counts unique hearts only and unlocks Continue at 3', async () => {
    const user = setup();
    await openGift(user);
    const counter = screen.getByTestId('heart-counter');
    expect(counter).toHaveTextContent('0/3 discovered');

    await user.click(button(/^reveal heart message 1$/i));
    expect(screen.getByText(birthdayConfig.heartMessages[0])).toBeInTheDocument();
    await user.click(button(/^reveal heart message 1 \(discovered\)$/i));
    expect(counter).toHaveTextContent('1/3 discovered');
    expect(screen.queryByRole('button', { name: /continue to the cake/i })).not.toBeInTheDocument();

    await user.click(button(/^reveal heart message 5$/i));
    expect(counter).toHaveTextContent('2/3 discovered');
    await user.click(button(/^reveal heart message 9$/i));
    expect(counter).toHaveTextContent('3/3 discovered');
    expect(screen.getByText(birthdayConfig.heartMessages[8])).toBeInTheDocument();
    expect(button(/continue to the cake/i)).toBeEnabled();
    expect(screen.queryByRole('button', { name: /skip activity/i })).not.toBeInTheDocument();
  });

  it('closes the message card with Escape', async () => {
    const user = setup();
    await openGift(user);
    await user.click(button(/^reveal heart message 2$/i));
    expect(screen.getByText(birthdayConfig.heartMessages[1])).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText(birthdayConfig.heartMessages[1])).not.toBeInTheDocument());
  });
});

describe('Cake', () => {
  it('needs every candle blown out before the cake can be cut, then reveals the wish', async () => {
    const user = setup();
    await goToChapter(user, 2);
    expect(screen.queryByRole('button', { name: /cut the cake/i })).not.toBeInTheDocument();

    await user.click(button('Blow out candle 1'));
    expect(button('Candle 1 blown out')).toBeInTheDocument();
    await user.click(button('Candle 1 blown out'));
    await user.click(button('Blow out candle 2'));
    expect(screen.queryByRole('button', { name: /cut the cake/i })).not.toBeInTheDocument();
    await user.click(button('Blow out candle 3'));

    await user.click(await screen.findByRole('button', { name: /cut the cake/i }));
    expect(await screen.findByText('A sweet wish for the sweetest person!')).toBeInTheDocument();
    expect(button(/^continue$/i)).toBeEnabled();
  });

  it('keeps candle and cake state after going back and forward', async () => {
    const user = setup();
    await goToChapter(user, 2);
    for (const n of [1, 2, 3]) await user.click(button(`Blow out candle ${n}`));
    await user.click(await screen.findByRole('button', { name: /cut the cake/i }));
    await user.click(button(/back to the previous chapter/i));
    await sceneHeading('A tree full of little reasons');
    // The skipped tree is complete, so it offers Continue instead of Skip.
    await user.click(button('Continue to the cake'));
    await sceneHeading('Make a birthday wish!');
    expect(screen.getByText('A sweet wish for the sweetest person!')).toBeInTheDocument();
    expect(button('Candle 3 blown out')).toBeInTheDocument();
  });
});

describe('Balloons', () => {
  it('deduplicates pops, unlocks at 6, keeps messages readable and resets locally', async () => {
    const user = setup();
    await goToChapter(user, 3);
    expect(screen.getByText('0 of 6 popped')).toBeInTheDocument();

    await user.click(button(/^pop balloon 1/i));
    expect(screen.getByText('1 of 6 popped')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('button', { name: /^pop balloon 1/i })).not.toBeInTheDocument());
    expect(screen.getByText(birthdayConfig.balloonMessages[0])).toBeInTheDocument();

    for (const n of [2, 3, 4, 5]) await user.click(button(new RegExp(`^pop balloon ${n}`, 'i')));
    expect(screen.queryByRole('button', { name: /continue to our memories/i })).not.toBeInTheDocument();
    await user.click(button(/^pop balloon 6/i));
    expect(screen.getByText('6 of 6 popped')).toBeInTheDocument();
    expect(button(/continue to our memories/i)).toBeEnabled();

    await user.click(button('💌 Read message 2'));
    expect(screen.getByText(birthdayConfig.balloonMessages[1])).toBeInTheDocument();

    await user.click(button(/replay balloons/i));
    expect(screen.getByText('0 of 6 popped')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^pop balloon/i })).toHaveLength(6);
    // Overall progress is kept.
    expect(button(/continue to our memories/i)).toBeEnabled();
  });
});

describe('Memory lane', () => {
  it('stays in bounds with buttons, arrow keys and swipes, and keeps the index on Back', async () => {
    const user = setup();
    await goToChapter(user, 4);
    const position = screen.getByTestId('memory-position');
    expect(position).toHaveTextContent('1 of 3');
    expect(button(/continue to my letter/i)).toBeEnabled();
    expect(button('Previous memory')).toBeDisabled();

    await user.click(button('Next memory'));
    expect(position).toHaveTextContent('2 of 3');

    const gallery = screen.getByTestId('memory-gallery');
    gallery.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowRight}');
    expect(position).toHaveTextContent('3 of 3');
    expect(button('Next memory')).toBeDisabled();
    await user.keyboard('{ArrowLeft}');
    expect(position).toHaveTextContent('2 of 3');

    const card = screen.getByRole('figure');
    const swipe = (fromX: number, toX: number, toY = 200) => {
      fireEvent.pointerDown(card, { pointerType: 'touch', pointerId: 1, clientX: fromX, clientY: 200 });
      fireEvent.pointerUp(card, { pointerType: 'touch', pointerId: 1, clientX: toX, clientY: toY });
    };
    act(() => swipe(300, 120));
    expect(position).toHaveTextContent('3 of 3');
    act(() => swipe(100, 130));
    expect(position).toHaveTextContent('3 of 3');
    act(() => swipe(200, 290, 520)); // mostly vertical: page scroll, not a swipe
    expect(position).toHaveTextContent('3 of 3');
    act(() => swipe(100, 260));
    expect(position).toHaveTextContent('2 of 3');

    await user.click(button(/back to the previous chapter/i));
    await sceneHeading('Pop the happiness!');
    await user.click(button(/continue to our memories/i));
    await sceneHeading('A walk down memory lane');
    expect(screen.getByTestId('memory-position')).toHaveTextContent('2 of 3');
  });

  it('shows a friendly fallback when a photo fails to load', async () => {
    const user = setup();
    await goToChapter(user, 4);
    const img = screen.getByRole('img', { name: birthdayConfig.memories[0].alt });
    fireEvent.error(img);
    const fallback = await screen.findByRole('img', { name: birthdayConfig.memories[0].alt });
    expect(fallback.tagName).toBe('DIV');
    expect(screen.getByText('Photo unavailable')).toBeInTheDocument();
  });

  it('renders three decorative sample cards when no memories are configured', async () => {
    const user = setup({ config: { ...birthdayConfig, memories: [] } });
    await goToChapter(user, 4);
    expect(screen.getByTestId('memory-position')).toHaveTextContent('1 of 3');
    expect(screen.getByText('Sample memory')).toBeInTheDocument();
  });
});

describe('Letter finale', () => {
  it('opens the envelope and reveals every paragraph with names filled in', async () => {
    const user = setup({ config: { ...birthdayConfig, recipientName: 'Maya', senderName: 'Sam' } });
    await goToChapter(user, 5);
    expect(screen.queryByRole('button', { name: /replay from beginning/i })).not.toBeInTheDocument();
    await user.click(button(/open your letter/i));
    const letter = await screen.findByTestId('letter-text');
    expect(within(letter).getByText('Dear Maya,')).toBeInTheDocument();
    expect(within(letter).getByText('With love, Sam 💖')).toBeInTheDocument();
    expect(letter.querySelectorAll('p')).toHaveLength(birthdayConfig.letterParagraphs.length);
    expect(screen.getByRole('heading', { level: 3, name: /happy birthday, maya!/i })).toBeInTheDocument();
  });

  it('shows the fairytale ending on the same scene: closing line, read-again focus, replay', async () => {
    const user = setup();
    await openGift(user);
    await user.click(button(/^reveal heart message 1$/i));
    await user.click(button('Sound'));
    expect(button('Sound')).toHaveAttribute('aria-pressed', 'true');
    for (const [skip, next] of SKIP_ROUTE) {
      await user.click(button(skip));
      await sceneHeading(next);
    }
    expect(screen.getByText('Chapter 6 of 6')).toBeInTheDocument();

    await user.click(button('Skip opening animation'));
    const letter = await screen.findByTestId('letter-text');
    expect(letter).toHaveFocus();
    expect(screen.getByRole('heading', { level: 3, name: /happy birthday, birthday star!/i })).toBeInTheDocument();
    expect(screen.getByText(birthdayConfig.letterClosingLine)).toBeInTheDocument();
    // The story ends here: no Continue, no next chapter.
    expect(screen.queryByRole('button', { name: /continue/i })).not.toBeInTheDocument();

    await user.click(button(/read letter again/i));
    expect(letter).toHaveFocus();

    await user.click(button(/replay from beginning/i));
    await sceneHeading(/hey, birthday star/i);
    expect(screen.getByText('Chapter 1 of 6')).toBeInTheDocument();
    expect(button('Sound')).toHaveAttribute('aria-pressed', 'true');
    await openGift(user);
    expect(screen.getByTestId('heart-counter')).toHaveTextContent('0/3 discovered');
    expect(screen.getByRole('button', { name: 'Skip activity' })).toBeInTheDocument();
  });

  it('keeps the opened letter visible when navigating back and returning', async () => {
    const user = setup();
    await goToChapter(user, 5);
    await user.click(button('Skip opening animation'));
    await screen.findByTestId('letter-text');
    await user.click(button(/back to the previous chapter/i));
    await sceneHeading('A walk down memory lane');
    await user.click(button(/continue to my letter/i));
    await sceneHeading('A letter from my heart');
    expect(screen.getByTestId('letter-text')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /open your letter/i })).not.toBeInTheDocument();
  });

  it('copies the letter, with a selection fallback when the clipboard is unavailable', async () => {
    const user = setup();
    await goToChapter(user, 5);
    await user.click(button('Skip opening animation'));
    const writeText = vi.fn().mockRejectedValue(new Error('denied'));
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    await user.click(await screen.findByRole('button', { name: 'Copy letter' }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Dear Birthday Star,'));
    expect(await screen.findByText(/letter is selected/i)).toBeInTheDocument();

    writeText.mockResolvedValue(undefined);
    await user.click(button('Copy letter'));
    expect(await screen.findByText('Letter copied! 💕')).toBeInTheDocument();
  });
});

describe('Navigation guards', () => {
  it('a rapid double click on Skip only advances one chapter', async () => {
    const user = setup({ transitionMs: 400 });
    await openGift(user);
    await waitFor(() => expect(button('Skip activity')).toBeEnabled());
    const skip = button('Skip activity');
    fireEvent.click(skip);
    fireEvent.click(skip);
    await sceneHeading('Make a birthday wish!');
    expect(screen.getByText('Chapter 3 of 6')).toBeInTheDocument();
    await waitFor(() => expect(button('Skip activity')).toBeEnabled());
    expect(screen.getByText('Chapter 3 of 6')).toBeInTheDocument();
  });
});

describe('Audio', () => {
  it('is off by default and survives playback being blocked', async () => {
    const play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }));
    const user = setup({ config: { ...birthdayConfig, musicSrc: '/audio/song.mp3' } });
    expect(button('Sound')).toHaveAttribute('aria-pressed', 'false');
    expect(play).not.toHaveBeenCalled();

    await user.click(button('Sound'));
    expect(play).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/browser paused the music/i)).toBeInTheDocument();
    // The experience keeps working.
    await openGift(user);
    expect(screen.getByText('Chapter 2 of 6')).toBeInTheDocument();
  });

  it('reports a song that cannot load without crashing', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockRejectedValue(Object.assign(new Error('nope'), { name: 'NotSupportedError' }));
    const user = setup({ config: { ...birthdayConfig, musicSrc: '/audio/missing.mp3' } });
    await user.click(button('Sound'));
    expect(await screen.findByText(/song couldn't play/i)).toBeInTheDocument();
    expect(screen.getByText(/only gentle sound effects/i)).toBeInTheDocument();
  });

  it('explains that only sound effects are available when no song is configured', () => {
    setup();
    expect(button('Sound')).toHaveAccessibleDescription(/no song has been added/i);
  });
});

describe('Magic settings', () => {
  it('lets the visitor reduce animations and pick magic intensity, persisting the choice', async () => {
    const user = setup({ reduced: false });
    await user.click(button('Magic'));

    const reduceSwitch = screen.getByRole('switch', { name: /reduce animations/i });
    expect(reduceSwitch).toHaveAttribute('aria-checked', 'false');
    await user.click(reduceSwitch);
    expect(screen.getByRole('switch', { name: /reduce animations/i })).toHaveAttribute('aria-checked', 'true');

    await user.click(button('Gentle'));
    expect(button('Gentle')).toHaveAttribute('aria-pressed', 'true');
    expect(button('Full')).toHaveAttribute('aria-pressed', 'false');

    expect(JSON.parse(window.localStorage.getItem('birthday-wonderland:settings')!)).toEqual({
      reduceAnimations: true,
      magicIntensity: 'gentle',
    });

    // Escape closes the panel and the flow still works with reduced animations.
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('switch', { name: /reduce animations/i })).not.toBeInTheDocument());
    await openGift(user);
    expect(screen.getByText('Chapter 2 of 6')).toBeInTheDocument();
  });

  it('restores persisted settings on a fresh visit', () => {
    window.localStorage.setItem('birthday-wonderland:settings', JSON.stringify({ reduceAnimations: false, magicIntensity: 'gentle' }));
    const user = setup({ reduced: false });
    return user.click(button('Magic')).then(() => {
      expect(button('Gentle')).toHaveAttribute('aria-pressed', 'true');
    });
  });
});
