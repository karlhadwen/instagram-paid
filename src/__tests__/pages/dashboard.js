import React from 'react';
import { render, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import Dashboard from '../../pages/dashboard';
import UserContext from '../../context/user';
import FirebaseContext from '../../context/firebase';
import LoggedInUserContext from '../../context/logged-in-user';
import { getPhotos, getSuggestedProfiles } from '../../services/firebase';
import useUser from '../../hooks/use-user';
import userFixture from '../../fixtures/logged-in-user';
import photosFixture from '../../fixtures/timeline-photos';
import suggestedProfilesFixture from '../../fixtures/suggested-profiles';

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

describe('<Dashboard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the dashboard with a user profile and follows a user from the suggested profile', async () => {
    await act(async () => {
      getPhotos.mockImplementation(() => photosFixture);
      getSuggestedProfiles.mockImplementation(() => suggestedProfilesFixture);
      useUser.mockImplementation(() => ({ user: userFixture }));

      const {
        getByText,
        getByAltText,
        getByTitle,
        getAllByText,
        getAllByAltText,
        getByTestId
      } = render(
        <Router>
          <FirebaseContext.Provider
            value={{
              firebase: {
                firestore: jest.fn(() => ({
                  collection: jest.fn(() => ({
                    doc: jest.fn(() => ({
                      update: jest.fn(() => Promise.resolve('User added'))
                    }))
                  }))
                }))
              },
              FieldValue: {
                arrayUnion: jest.fn()
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
              <LoggedInUserContext.Provider value={{ user: userFixture }}>
                <Dashboard
                  user={{
                    uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
                    displayName: 'karl'
                  }}
                />
              </LoggedInUserContext.Provider>
            </UserContext.Provider>
          </FirebaseContext.Provider>
        </Router>
      );

      await waitFor(() => {
        expect(document.title).toEqual('Instagram');
        expect(getByTitle('Sign Out')).toBeTruthy();
        expect(getAllByText('raphael')).toBeTruthy();
        expect(getAllByAltText('Instagram')).toBeTruthy(); // instagram logo
        expect(getByAltText('karl profile')).toBeTruthy();
        expect(getAllByText('Saint George and the Dragon')).toBeTruthy(); // caption for the img

        fireEvent.click(getByText('Follow'));

        // submit photo with valid string length
        fireEvent.change(getByTestId('add-comment-nJMT1l8msuNZ8tH3zvVI'), {
          target: { value: 'Great photo!' }
        });
        fireEvent.submit(getByTestId('add-comment-submit-nJMT1l8msuNZ8tH3zvVI'));

        // submit photo with invalid string length
        fireEvent.change(getByTestId('add-comment-nJMT1l8msuNZ8tH3zvVI'), {
          target: { value: '' }
        });
        fireEvent.submit(getByTestId('add-comment-submit-nJMT1l8msuNZ8tH3zvVI'));
      });
    });
  });

  it('renders the dashboard with a user object of undefined to trigger fallbacks', async () => {
    await act(async () => {
      getPhotos.mockImplementation(() => photosFixture);
      getSuggestedProfiles.mockImplementation(() => suggestedProfilesFixture);
      useUser.mockImplementation(() => ({ user: undefined }));

      const { getByText } = render(
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
              <LoggedInUserContext.Provider value={{ user: userFixture }}>
                <Dashboard
                  user={{
                    uid: 'NvPY9M9MzFTARQ6M816YAzDJxZ72',
                    displayName: 'karl'
                  }}
                />
              </LoggedInUserContext.Provider>
            </UserContext.Provider>
          </FirebaseContext.Provider>
        </Router>
      );

      expect(getByText('Login')).toBeTruthy();
      expect(getByText('Sign Up')).toBeTruthy();
    });
  });
});
