import { useContext } from 'react';
import PropTypes from 'prop-types';
import User from './user';
import Suggestions from './suggestions';
import LoggedInUserContext from '../../context/logged-in-user';

export default function Sidebar() {
  const {
    user: { docId = '', userId = '', following = [], username = '', fullName = '' } = {}
  } = useContext(LoggedInUserContext);

  return (
    <div className="hidden md:block p-4">
      <User username={username} fullName={fullName} />
      <Suggestions userId={userId} following={following} loggedInUserDocId={docId} />
    </div>
  );
}

Sidebar.propTypes = {
  user: PropTypes.shape({
    userId: PropTypes.string,
    username: PropTypes.string,
    fullName: PropTypes.string,
    following: PropTypes.array,
    docId: PropTypes.string
  })
};
