'use client';
import { cn } from '@/lib/utils';
import { AnimatePresence, Transition, motion } from 'motion/react';
import { Children, cloneElement, ReactElement, useId, useState, type ReactNode } from 'react';

/*
  Motion Primitives' AnimatedBackground: a highlight that slides between items (tabs, segmented controls).
  Adapted: the active item can be controlled from outside (`value`), so a tab bar and its panel share one state;
  without `value` it keeps its own state starting at `defaultValue`. No setState inside an effect.
*/

type ItemProps = {
  'data-id': string;
  'data-checked'?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export type AnimatedBackgroundProps = {
  children: ReactElement<ItemProps>[] | ReactElement<ItemProps>;
  defaultValue?: string;
  /** Controlled active id. */
  value?: string | null;
  onValueChange?: (newActiveId: string | null) => void;
  className?: string;
  transition?: Transition;
  enableHover?: boolean;
};

export function AnimatedBackground({ children, defaultValue, value, onValueChange, className, transition, enableHover = false }: AnimatedBackgroundProps) {
  const [ownId, setOwnId] = useState<string | null>(defaultValue ?? null);
  const activeId = value !== undefined ? value : ownId;
  const uniqueId = useId();

  const setActive = (id: string | null) => {
    if (value === undefined) setOwnId(id);
    onValueChange?.(id);
  };

  return Children.map(children, (child: ReactElement<ItemProps>, index) => {
    const id = child.props['data-id'];
    const interactionProps = enableHover
      ? { onMouseEnter: () => setActive(id), onMouseLeave: () => setActive(null) }
      : { onClick: () => setActive(id) };

    return cloneElement(
      child,
      {
        key: index,
        className: cn('relative inline-flex', child.props.className),
        'data-checked': activeId === id ? 'true' : 'false',
        ...interactionProps,
      } as Partial<ItemProps> & { key: number },
      <>
        <AnimatePresence initial={false}>
          {activeId === id && (
            <motion.div
              layoutId={`background-${uniqueId}`}
              className={cn('absolute inset-0', className)}
              transition={transition}
              initial={{ opacity: defaultValue ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>
        <div className='z-10'>{child.props.children}</div>
      </>
    );
  });
}
