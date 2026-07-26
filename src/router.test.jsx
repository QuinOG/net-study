import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useLocation,
  useParams,
} from './router';

function RouteDetails() {
  const { moduleId, lessonId } = useParams();
  return <span>{`${moduleId}:${lessonId}`}</span>;
}

function CurrentPath() {
  return <span>{useLocation().pathname}</span>;
}

describe('browser router', () => {
  test('matches nested routes and exposes dynamic parameters', () => {
    window.history.replaceState({}, '', '/dashboard/learning/module/networking/lesson/intro');

    render(
      <BrowserRouter>
        <Routes>
          <Route
            path="/dashboard/*"
            element={(
              <Routes>
                <Route
                  path="/learning/module/:moduleId/lesson/:lessonId"
                  element={<RouteDetails />}
                />
              </Routes>
            )}
          />
        </Routes>
      </BrowserRouter>,
    );

    expect(screen.getByText('networking:intro')).toBeInTheDocument();
  });

  test('navigates links without reloading the page', () => {
    window.history.replaceState({}, '', '/');

    render(
      <BrowserRouter>
        <Link to="/dashboard">Dashboard</Link>
        <CurrentPath />
      </BrowserRouter>,
    );

    fireEvent.click(screen.getByRole('link', { name: 'Dashboard' }));

    expect(screen.getByText('/dashboard')).toBeInTheDocument();
  });
});
