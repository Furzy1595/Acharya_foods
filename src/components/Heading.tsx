import type { ReactNode } from 'react';

interface Props {
  as?: 'h1' | 'h2';
  /** The same heading in Nepali, shown beside the English. */
  np?: string;
  children: ReactNode;
}

/** A heading in two languages: English for everyone, Nepali for home. */
export function Heading({ as: Tag = 'h2', np, children }: Props) {
  return (
    <Tag className="heading">
      <span>{children}</span>
      {np && (
        <span className="heading__np" lang="ne">
          {np}
        </span>
      )}
    </Tag>
  );
}
