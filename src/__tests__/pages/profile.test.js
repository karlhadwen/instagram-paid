import React from 'react';
import { render, waitFor, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Profile from '../../pages/profile';
import UserContext from '../../context/user';
import FirebaseContext from '../../context/firebase';
import * as ROUTES from '../../constants/routes';
import {
  isUserFollowingProfile,
  getUserByUsername,
  getUserPhotosByUsername
} from '../../services/firebase';
import useUser from '../../hooks/use-user';
import userFixture from '../../fixtures/logged-in-user';
import profileThatIsFollowedByLoggedInUserFixture from '../../fixtures/profile-followed-by-logged-in-user';
import profileThatIsNotFollowedByLoggedInUserFixture from '../../fixtures/profile-not-followed-by-logged-in-user';
import photosFixture from '../../fixtures/profile-photos';

const mockHistoryPush = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ username: 'orwell' }),
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
      useUser.mockImplementation(() => ({ user: userFixture }));

      const { getByText, getByTitle } = render(
        <Router>
          <FirebaseContext.Provider
            value={{
              firebase: {
                auth: jest.fn(() => ({
                  signOut: jest.fn(() => ({
                    updateProfile: jest.fn(() => Promise.resolve({}))
                  }))
                }))
              }
            }}
          >
            <UserContext.Provider
              value={{
                user: {
                  uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
                  displayName: 'karl'
                }
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
        expect(getUserByUsername).toHaveBeenCalledWith('orwell');
        expect(getByTitle('Sign Out')).toBeTruthy();
        expect(getByText('karl')).toBeTruthy();
        expect(getByText('Karl Hadwen')).toBeTruthy();

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

        // now sign the user out
        fireEvent.click(getByTitle('Sign Out'));
        fireEvent.keyDown(getByTitle('Sign Out'), {
          key: 'Enter'
        });
      });
    });
  });

  it('renders the profile page with a user profile with 1 follower', async () => {
    await act(async () => {
      userFixture.followers = ['2']; // put followers to 1
      getUserByUsername.mockImplementation(() => [userFixture]);
      getUserPhotosByUsername.mockImplementation(() => photosFixture);
      useUser.mockImplementation(() => ({ user: userFixture, followers: ['2'] }));

      const { getByText, getByTitle } = render(
        <Router>
          <FirebaseContext.Provider
            value={{
              firebase: {
                auth: jest.fn(() => ({
                  signOut: jest.fn(() => ({
                    updateProfile: jest.fn(() => Promise.resolve({}))
                  }))
                }))
              }
            }}
          >
            <UserContext.Provider
              value={{
                user: {
                  uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
                  displayName: 'karl'
                }
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
        expect(getUserByUsername).toHaveBeenCalledWith('orwell');
        expect(getByTitle('Sign Out')).toBeTruthy();
        expect(getByText('karl')).toBeTruthy();
        expect(getByText('Karl Hadwen')).toBeTruthy();
      });
    });
  });

  it('renders the profile page with a user profile and logged in and follows a user', async () => {
    await act(async () => {
      isUserFollowingProfile.mockImplementation(() => true);
      useUser.mockImplementation(() => ({ user: userFixture }));
      profileThatIsNotFollowedByLoggedInUserFixture.followers = []; // reset followers
      getUserByUsername.mockImplementation(() => [profileThatIsNotFollowedByLoggedInUserFixture]);
      getUserPhotosByUsername.mockImplementation(() => photosFixture);

      const { getByText, getByTitle } = render(
        <Router>
          <FirebaseContext.Provider
            value={{
              firebase: {
                auth: jest.fn(() => ({
                  signOut: jest.fn(() => ({
                    updateProfile: jest.fn(() => Promise.resolve({}))
                  }))
                }))
              }
            }}
          >
            <UserContext.Provider
              value={{
                user: {
                  uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
                  displayName: 'karl'
                }
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
        expect(getUserByUsername).toHaveBeenCalledWith('orwell');
        expect(getByTitle('Sign Out')).toBeTruthy();
        expect(getByText('orwell')).toBeTruthy();
        expect(getByText('George Orwell')).toBeTruthy();
        fireEvent.keyDown(getByText('Follow'), {
          key: 'Enter'
        });
      });
    });
  });

  it('renders the profile page with a user profile and logged in and unfollows a user', async () => {
    await act(async () => {
      isUserFollowingProfile.mockImplementation(() => true);
      useUser.mockImplementation(() => ({ user: userFixture }));
      getUserByUsername.mockImplementation(() => [profileThatIsFollowedByLoggedInUserFixture]);
      getUserPhotosByUsername.mockImplementation(() => false); // falsy photos

      const { getByText, getByTitle } = render(
        <Router>
          <FirebaseContext.Provider
            value={{
              firebase: {
                auth: jest.fn(() => ({
                  signOut: jest.fn(() => ({
                    updateProfile: jest.fn(() => Promise.resolve({}))
                  }))
                }))
              }
            }}
          >
            <UserContext.Provider
              value={{
                user: {
                  uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
                  displayName: 'karl'
                }
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
        expect(getUserByUsername).toHaveBeenCalledWith('orwell');
        expect(getByTitle('Sign Out')).toBeTruthy();
        expect(getByText('orwell')).toBeTruthy();
        expect(getByText('George Orwell')).toBeTruthy();
        fireEvent.click(getByText('Unfollow'));
      });
    });
  });

  it('renders the profile page but there is no user so redirect happens', async () => {
    await act(async () => {
      getUserByUsername.mockImplementation(() => []);
      getUserPhotosByUsername.mockImplementation(() => photosFixture);
      useUser.mockReturnValue(null);

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
