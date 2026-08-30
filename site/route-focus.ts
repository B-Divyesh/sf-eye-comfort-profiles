/**
 * Full-document navigation normally leaves focus on <body>. For a same-site
 * move (including a history restore), put keyboard and screen-reader users at
 * the page's actual heading and announce the new document title.
 */
function cameFromThisSite(): boolean {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navigation?.type === 'back_forward') return true;
  if (!document.referrer) return false;

  try {
    return new URL(document.referrer).origin === location.origin;
  } catch {
    return false;
  }
}

function focusRouteHeading(): void {
  const heading = document.querySelector<HTMLHeadingElement>('main h1');
  const announcer = document.querySelector<HTMLElement>('#route-announcer');
  if (!heading) return;
  heading.tabIndex = -1;
  requestAnimationFrame(() => {
    heading.focus({ preventScroll: true });
    if (announcer) announcer.textContent = document.title;
  });
}

addEventListener('pageshow', (event) => {
  if (event.persisted || cameFromThisSite()) focusRouteHeading();
});
