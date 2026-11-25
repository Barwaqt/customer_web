'use client';

import { Notfound } from './components/notfound';

export default function WebNotFound() {
  return (
    <Notfound
      homeHref="/"
      trackHref="/profile"
      helpHref="mailto:support@barwaqt.com"
      searchPlaceholder="Search items, groceries or categories..."
    />
  );
}
