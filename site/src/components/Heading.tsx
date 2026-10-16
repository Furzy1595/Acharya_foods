import type { ReactNode } from 'react';

interface Props {
  as?: 'h1' | 'h2';
  /** The same heading in Nepali, shown large above the English. */
  np?: string;
  children: ReactNode;
}

/** A heading in two languages: Nepali large and green, English under it. */
export function Heading({ as: Tag = 'h2', np, children }: Props) {
  return (
    <Tag className="heading">
      {np && (
        <span className="heading__np" lang="ne">
          {np}
        </span>
      )}
      <span className="heading__en">{children}</span>
    </Tag>
  );
}
