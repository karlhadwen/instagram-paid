import { useState, useEffect } from 'react';
import { getPhotos } from '../services/firebase';

export default function usePhotos(user) {
  const [photos, setPhotos] = useState(null);

  useEffect(() => {
    async function getTimelinePhotos() {
      // example: [2, 1, 5] <- 2 being raphel
      let followedUserPhotos = [];

      // does the user actually follow people?
      if (user?.following?.length > 0) {
        followedUserPhotos = await getPhotos(user.userId, user.following);
        // re-arrange array to be newest photos first by dateCreated
        followedUserPhotos.sort((a, b) => b.dateCreated - a.dateCreated);
        setPhotos(followedUserPhotos);
      }
    }

    getTimelinePhotos();
  }, [user?.userId]);

  return { photos };
}
