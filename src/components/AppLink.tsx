import Link from 'next/link';
import { ComponentPropsWithoutRef, forwardRef } from 'react';

export type AppLinkProps = ComponentPropsWithoutRef<typeof Link>;

const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { className = '', ...props },
  ref
) {
  return <Link ref={ref} className={className} {...props} />;
});

export default AppLink;
