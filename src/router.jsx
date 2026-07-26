import React, {
  Children,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const NAVIGATION_EVENT = 'netquest:navigate';

const LocationContext = createContext(null);
const RouteContext = createContext({ basePath: '', params: {} });

function currentLocation() {
  return {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    state: window.history.state,
  };
}

function normalizePath(path) {
  if (!path || path === '/') return '/';
  return `/${path.split('/').filter(Boolean).join('/')}`;
}

function resolvePattern(path, basePath) {
  if (!basePath) return normalizePath(path);
  if (!path || path === '/') return normalizePath(basePath);
  return normalizePath(`${basePath}/${path.replace(/^\/+/, '')}`);
}

function matchPath(pattern, pathname) {
  const patternParts = normalizePath(pattern).split('/').filter(Boolean);
  const pathParts = normalizePath(pathname).split('/').filter(Boolean);
  const wildcardIndex = patternParts.indexOf('*');
  const requiredParts = wildcardIndex === -1 ? patternParts : patternParts.slice(0, wildcardIndex);

  if (wildcardIndex === -1 && requiredParts.length !== pathParts.length) return null;
  if (requiredParts.length > pathParts.length) return null;

  const params = {};
  for (let index = 0; index < requiredParts.length; index += 1) {
    const expected = requiredParts[index];
    const actual = pathParts[index];

    if (expected.startsWith(':')) {
      params[expected.slice(1)] = decodeURIComponent(actual);
    } else if (expected !== actual) {
      return null;
    }
  }

  return {
    params,
    matchedPath: requiredParts.length ? `/${pathParts.slice(0, requiredParts.length).join('/')}` : '/',
    hasWildcard: wildcardIndex !== -1,
  };
}

export function BrowserRouter({ children }) {
  const [location, setLocation] = useState(currentLocation);

  useEffect(() => {
    const handleNavigation = () => setLocation(currentLocation());
    window.addEventListener('popstate', handleNavigation);
    window.addEventListener(NAVIGATION_EVENT, handleNavigation);

    return () => {
      window.removeEventListener('popstate', handleNavigation);
      window.removeEventListener(NAVIGATION_EVENT, handleNavigation);
    };
  }, []);

  const navigate = useCallback((to, options = {}) => {
    if (typeof to === 'number') {
      window.history.go(to);
      return;
    }

    const method = options.replace ? 'replaceState' : 'pushState';
    window.history[method](options.state ?? null, '', to);
    window.dispatchEvent(new Event(NAVIGATION_EVENT));
  }, []);

  const value = useMemo(() => ({ location, navigate }), [location, navigate]);

  return (
    <LocationContext.Provider value={value}>
      <RouteContext.Provider value={{ basePath: '', params: {} }}>
        {children}
      </RouteContext.Provider>
    </LocationContext.Provider>
  );
}

export function Route() {
  return null;
}

export function Routes({ children }) {
  const { location } = useContext(LocationContext);
  const parentRoute = useContext(RouteContext);

  for (const child of Children.toArray(children)) {
    if (!React.isValidElement(child) || child.type !== Route) continue;

    const pattern = resolvePattern(child.props.path, parentRoute.basePath);
    const match = matchPath(pattern, location.pathname);
    if (!match) continue;

    const routeValue = {
      basePath: match.hasWildcard ? match.matchedPath : parentRoute.basePath,
      params: { ...parentRoute.params, ...match.params },
    };

    return (
      <RouteContext.Provider value={routeValue}>
        {child.props.element}
      </RouteContext.Provider>
    );
  }

  return null;
}

export function Link({ to, onClick, target, children, ...props }) {
  const navigate = useNavigate();

  const handleClick = (event) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      target === '_blank' ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }

    event.preventDefault();
    navigate(to);
  };

  return (
    <a href={to} target={target} onClick={handleClick} {...props}>
      {children}
    </a>
  );
}

export function Navigate({ to, replace = false, state }) {
  const navigate = useNavigate();

  useEffect(() => {
    navigate(to, { replace, state });
  }, [navigate, replace, state, to]);

  return null;
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used inside BrowserRouter');
  return context.location;
}

export function useNavigate() {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useNavigate must be used inside BrowserRouter');
  return context.navigate;
}

export function useParams() {
  return useContext(RouteContext).params;
}
