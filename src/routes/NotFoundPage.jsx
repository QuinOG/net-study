import React from 'react';
import { ButtonLink, Surface } from '../components/foundations/Primitives';

export default function NotFoundPage() {
  return <main className="nq-route-state" data-route-focus tabIndex="-1" aria-labelledby="not-found-title"><Surface className="nq-route-state__panel" padding="lg">
    <div><h1 id="not-found-title">Page not found</h1><p>That NetQuest route does not exist. You can return to your learning dashboard.</p></div>
    <div className="nq-route-state__actions"><ButtonLink to="/">Return home</ButtonLink></div>
  </Surface></main>;
}
