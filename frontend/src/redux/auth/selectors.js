import { createSelector } from 'reselect';

export const selectAuth = (state) => state.auth;
export const selectCurrentAdmin = createSelector([selectAuth], (auth) => auth.current);
export const isLoggedIn = createSelector([selectAuth], (auth) => auth.isLoggedIn);

// 'owner' is the legacy admin role — treat it as 'admin'
export const selectCurrentRole = createSelector([selectAuth], (auth) => {
  const role = auth.current?.role;
  if (role === 'owner' || role === 'admin') return 'admin';
  return role; // 'mechanic' or undefined
});

export const selectIsAdmin = createSelector(
  [selectCurrentRole],
  (role) => role === 'admin'
);
