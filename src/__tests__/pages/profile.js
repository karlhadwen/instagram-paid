import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Profile from '../../pages/profile';
import UserContext from '../../context/user';
import FirebaseContext from '../../context/firebase';
import * as ROUTES from '../../constants/routes';
import { getUserByUsername, getUserPhotosByUsername } from '../../services/firebase';
import useUser from '../../hooks/use-user';
import userFixture from '../../fixtures/user';
import photosFixture from '../../fixtures/photos';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ username: 'karl' }),
  useHistory: () => ({
    push: mockHistoryPush
  })
}));

jest.mock('../../services/firebase');
jest.mock('../../hooks/use-user');

describe('<Profile />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the profile page with a user profile', async () => {
    await act(async () => {
      getUserByUsername.mockImplementation(() => [userFixture]);
      getUserPhotosByUsername.mockImplementation(() => photosFixture);
      useUser.mockReturnValue(userFixture);

      const { getByText } = render(
        <Router>
          <FirebaseContext.Provider value={{}}>
            <UserContext.Provider
              value={{
                uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
                displayName: 'karl'
              }}
            >
              <Profile />
            </UserContext.Provider>
          </FirebaseContext.Provider>
        </Router>
      );

      await waitFor(() => {
        expect(mockHistoryPush).not.toHaveBeenCalledWith(ROUTES.NOT_FOUND);
        expect(getUserByUsername).toHaveBeenCalled();
        expect(getUserByUsername).toHaveBeenCalledWith('karl');
        expect(getByText('Login')).toBeTruthy();
        expect(getByText('Sign Up')).toBeTruthy();
        expect(getByText('karl')).toBeTruthy();
        expect(getByText('Karl Hadwen')).toBeTruthy();
      });

      screen.getByText((content, node) => {
        const hasText = (node) => node.textContent === '5 photos';
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child));
        return nodeHasText && childrenDontHaveText;
      });

      screen.getByText((content, node) => {
        const hasText = (node) => node.textContent === '3 followers';
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child));
        return nodeHasText && childrenDontHaveText;
      });

      screen.getByText((content, node) => {
        const hasText = (node) => node.textContent === '1 following';
        const nodeHasText = hasText(node);
        const childrenDontHaveText = Array.from(node.children).every((child) => !hasText(child));
        return nodeHasText && childrenDontHaveText;
      });
    });
  });

  it('renders the profile page but there is no user so redirect happens', async () => {
    await act(async () => {
      getUserByUsername.mockImplementation(() => []);
      getUserPhotosByUsername.mockImplementation(() => photosFixture);
      useUser.mockReturnValue();

      render(
        <Router>
          <FirebaseContext.Provider value={{}}>
            <UserContext.Provider
              value={{
                uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
                displayName: 'karl'
              }}
            >
              <Profile />
            </UserContext.Provider>
          </FirebaseContext.Provider>
        </Router>
      );

      await waitFor(() => {
        expect(mockHistoryPush).toHaveBeenCalledWith(ROUTES.NOT_FOUND);
      });
    });
  });
});
