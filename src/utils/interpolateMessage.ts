export type InterpolationValues = {
  recipientName: string;
  senderName: string;
};

const PLACEHOLDER = /\{(recipientName|senderName)\}/g;

/**
 * Replaces `{recipientName}` / `{senderName}` with plain text. The result is
 * rendered as a React text node, so names can never inject markup.
 */
export function interpolateMessage(text: string, values: InterpolationValues): string {
  return text.replace(PLACEHOLDER, (_, key: keyof InterpolationValues) => values[key]);
}
