import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { act } from 'react-dom/test-utils';
import SignUp from '../../pages/sign-up';
import FirebaseContext from '../../context/firebase';
import { doesUsernameExist } from '../../services/firebase';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom')
}));

jest.mock('../../services/firebase');

describe('<SignUp />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the sign up page with a form submission and signs a user up', async () => {
    const firebase = {
      firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
          add: jest.fn(() => Promise.resolve('User added'))
        }))
      })),
      auth: jest.fn(() => ({
        createUserWithEmailAndPassword: jest.fn(() => ({
          user: { updateProfile: jest.fn(() => Promise.resolve('I am signed up!')) }
        }))
      }))
    };

    const { getByTestId, getByPlaceholderText, queryByTestId } = render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <SignUp />
        </FirebaseContext.Provider>
      </Router>
    );

    await act(async () => {
      await doesUsernameExist.mockImplementation(() => true); // as true but inverse in the code

      await fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'karl' } });
      await fireEvent.change(getByPlaceholderText('Full name'), {
        target: { value: 'Karl Hadwen' }
      });
      await fireEvent.change(getByPlaceholderText('Email address'), {
        target: { value: 'karl@gmail.com' }
      });
      await fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'password' } });
      fireEvent.submit(getByTestId('sign-up'));

      expect(document.title).toEqual('Sign Up - Instagram');
      expect(getByPlaceholderText('Username').value).toBe('karl');
      expect(getByPlaceholderText('Full name').value).toBe('Karl Hadwen');
      expect(getByPlaceholderText('Email address').value).toBe('karl@gmail.com');
      expect(getByPlaceholderText('Password').value).toBe('password');
      expect(queryByTestId('error')).toBeFalsy();
    });
  });

  it('renders the sign up page but an error is present (username exists)', async () => {
    const firebase = {
      auth: jest.fn(() => ({}))
    };

    const { getByTestId, getByPlaceholderText, queryByTestId } = render(
      <Router>
        <FirebaseContext.Provider value={{ firebase }}>
          <SignUp />
        </FirebaseContext.Provider>
      </Router>
    );

    await act(async () => {
      await doesUsernameExist.mockImplementation(() => [false]);

      await fireEvent.change(getByPlaceholderText('Username'), { target: { value: 'karl' } });
      await fireEvent.change(getByPlaceholderText('Full name'), {
        target: { value: 'Karl Hadwen' }
      });
      await fireEvent.change(getByPlaceholderText('Email address'), {
        target: { value: 'karl@gmail.com' }
      });
      await fireEvent.change(getByPlaceholderText('Password'), { target: { value: 'password' } });
      fireEvent.submit(getByTestId('sign-up'));

      expect(document.title).toEqual('Sign Up - Instagram');

      await waitFor(() => {
        expect(getByPlaceholderText('Username').value).toBe('');
        expect(getByPlaceholderText('Full name').value).toBe('');
        expect(getByPlaceholderText('Email address').value).toBe('');
        expect(getByPlaceholderText('Password').value).toBe('');
        expect(queryByTestId('error')).toBeTruthy();
      });
    });
  });
});
