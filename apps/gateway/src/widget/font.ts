import { readWidgetFontBase64 } from './fontMacro' with { type: 'macro' };

export const WIDGET_FONT_PATH = '/widget/font.woff2';
export const WIDGET_FONT = Buffer.from(readWidgetFontBase64(), 'base64');
