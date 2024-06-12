import { makeStyles, makeResetStyles, mergeClasses } from '@griffel/react';
import { tokens } from '@fluentui/react-theme';
import type { SlotClassNames } from '@fluentui/react-utilities';
import type { ToastTitleSlots, ToastTitleState } from './ToastTitle.types';

export const toastTitleClassNames: SlotClassNames<ToastTitleSlots> = {
  root: 'fui-ToastTitle',
  media: 'fui-ToastTitle__media',
  action: 'fui-ToastTitle__action',
};

const useRootBaseClassName = makeResetStyles({
  display: 'flex',
  gridColumnEnd: 3,
  color: `var(--2803, var(--2804, ${tokens.colorNeutralForeground1}))`,
  wordBreak: 'break-word',
});

const useMediaBaseClassName = makeResetStyles({
  display: 'flex',
  paddingTop: '2px',
  gridColumnEnd: 2,
  paddingRight: '8px',
  fontSize: '16px',
  color: `var(--2805, var(--2806, ${tokens.colorNeutralForeground1}))`,
});

const useActionBaseClassName = makeResetStyles({
  display: 'flex',
  alignItems: 'start',
  paddingLeft: '12px',
  gridColumnEnd: -1,
  color: `var(--2807, var(--2808, ${tokens.colorBrandForeground1}))`,
});

const useInvertedStyles = makeStyles({
  root: {
    color: `var(--2809, var(--2810, ${tokens.colorNeutralForegroundInverted2}))`,
  },

  action: {
    color: `var(--2811, var(--2812, ${tokens.colorBrandForegroundInverted}))`,
  },

  media: {
    color: `var(--2813, var(--2814, ${tokens.colorNeutralForegroundInverted}))`,
  },
});

const useIntentIconStyles = makeStyles({
  success: {
    color: `var(--2815, var(--2816, ${tokens.colorStatusSuccessForeground1}))`,
  },
  error: {
    color: `var(--2817, var(--2818, ${tokens.colorStatusDangerForeground1}))`,
  },
  warning: {
    color: `var(--2819, var(--2820, ${tokens.colorStatusWarningForeground1}))`,
  },
  info: {
    color: `var(--2821, var(--2822, ${tokens.colorNeutralForeground2}))`,
  },
});

const useIntentIconStylesInverted = makeStyles({
  success: {
    color: `var(--2823, var(--2824, ${tokens.colorStatusSuccessForegroundInverted}))`,
  },
  error: {
    color: `var(--2825, var(--2826, ${tokens.colorStatusDangerForegroundInverted}))`,
  },
  warning: {
    color: `var(--2827, var(--2828, ${tokens.colorStatusWarningForegroundInverted}))`,
  },
  info: {
    color: `var(--2829, var(--2830, ${tokens.colorNeutralForegroundInverted2}))`,
  },
});

/**
 * Apply styling to the ToastTitle slots based on the state
 */
export const useToastTitleStyles_unstable = (state: ToastTitleState): ToastTitleState => {
  'use no memo';

  const rootBaseClassName = useRootBaseClassName();
  const actionBaseClassName = useActionBaseClassName();
  const mediaBaseClassName = useMediaBaseClassName();
  const intentIconStyles = useIntentIconStyles();
  const intentIconStylesInverted = useIntentIconStylesInverted();
  const { intent } = state;
  const invertedStyles = useInvertedStyles();
  state.root.className = mergeClasses(
    toastTitleClassNames.root,
    rootBaseClassName,
    state.backgroundAppearance === 'inverted' && invertedStyles.root,
    state.root.className,
  );

  if (state.media) {
    state.media.className = mergeClasses(
      toastTitleClassNames.media,
      mediaBaseClassName,
      state.backgroundAppearance === 'inverted' && invertedStyles.media,
      state.media.className,
      intent && intentIconStyles[intent],
      intent && state.backgroundAppearance === 'inverted' && intentIconStylesInverted[intent],
    );
  }

  if (state.action) {
    state.action.className = mergeClasses(
      toastTitleClassNames.action,
      actionBaseClassName,
      state.backgroundAppearance === 'inverted' && invertedStyles.action,
      state.action.className,
    );
  }

  return state;
};
