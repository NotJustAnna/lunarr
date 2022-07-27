import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const applyMagicTrick = true; // this should be moved to a config file.

export default function AssociateView() {
  const flatToken = useFlatToken();
  if (flatToken === magic) return <Magic/>;

  return <div>
    <h1>Associate</h1>
    <p>
      This is the associate view.
    </p>
  </div>;
}

function useFlatToken(): string | null | typeof magic {
  const { search } = useLocation();
  const flatToken = new URLSearchParams(search).get('flat');
  if (!applyMagicTrick) return flatToken;
  if (flatToken) {
    sessionStorage.setItem('flatToken', flatToken);
    return magic;
  }
  return sessionStorage.getItem('flatToken');
}

const magic = Symbol('magic');

function Magic() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useEffect(() => navigate(pathname, { replace: true }), [pathname]);
  return <div/>; // this can be replaced by a spinner.
}
