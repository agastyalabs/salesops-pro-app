// ...other imports...
import { doc, onSnapshot } from 'firebase/firestore';
// ...other code...

const appIdString = "1:555072601372:web:af3a40f8d9232012018ed9";

// ...inside your App() component...
useEffect(() => {
  if (currentUserId) {
    const userDocRef = doc(db, 'artifacts', appIdString, 'users', currentUserId);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      setCurrentUserProfile(docSnap.exists() ? docSnap.data() : null);
    });
    return () => unsubscribe();
  }
}, [currentUserId]);
