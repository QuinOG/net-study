import React from 'react';
import { Button, ButtonLink, Surface } from '../components/foundations/Primitives';

export default class RouteErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error && !this.props.routeError) return this.props.children ?? null;
    return <section className="nq-route-state" role="alert" data-route-focus tabIndex="-1"><Surface className="nq-route-state__panel" padding="lg">
      <div><h1>We could not load this page</h1><p>Something went wrong while opening this route. Try again or return home.</p></div>
      <div className="nq-route-state__actions"><Button onClick={() => this.setState({ error: null })}>Try again</Button><ButtonLink to="/" variant="secondary">Return home</ButtonLink></div>
    </Surface></section>;
  }
}
