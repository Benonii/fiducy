import { WIDGET_FONT_PATH } from './font';
import { buildWidgetStyles } from './stylesMacro' with { type: 'macro' };

const compiledStyles = await buildWidgetStyles();

export const WIDGET_STYLES = compiledStyles.replace('__WIDGET_FONT_PATH__', WIDGET_FONT_PATH);
