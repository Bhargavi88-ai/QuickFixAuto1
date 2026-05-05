import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  updateDoc, 
  serverTimestamp, 
  getDoc,
  query,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import { db } from '../lib/firebase';

import { handleFirestoreError, OperationType } from '../lib/firestore-errors';

/**
 * Save or update user profile information
 */
export const saveUserProfile = async (userId: string, details: any) => {
  const path = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      uid: userId,
      fullName: details.fullName,
      email: details.email,
      phone: details.phone,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
};

/**
 * Save car details as a record in the user's car collection
 */
export const saveCarDetails = async (userId: string, details: any) => {
  const path = `users/${userId}/cars`;
  try {
    const carsRef = collection(db, 'users', userId, 'cars');
    await addDoc(carsRef, {
      make: details.carMake,
      model: details.carModel,
      year: details.year,
      licensePlate: details.licensePlate || '',
      mileage: details.mileage || '',
      addedAt: serverTimestamp()
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.CREATE, path);
  }
};

/**
 * Attach captured details to the specific booking document
 */
export const attachToBooking = async (bookingId: string, details: any) => {
  const path = `bookings/${bookingId}`;
  try {
    const bookingRef = doc(db, 'bookings', bookingId);
    await updateDoc(bookingRef, {
      customerDetails: {
        fullName: details.fullName,
        email: details.email,
        phone: details.phone
      },
      carDetails: {
        make: details.carMake,
        model: details.carModel,
        year: details.year,
        licensePlate: details.licensePlate || '',
        mileage: details.mileage || ''
      },
      notes: details.specialNotes || ''
    });
  } catch (e) {
    handleFirestoreError(e, OperationType.UPDATE, path);
  }
};

/**
 * Prefill details for returning users
 */
export const prefillDetails = async (userId: string) => {
  const userPath = `users/${userId}`;
  const carsPath = `users/${userId}/cars`;
  try {
    // 1. Get user personal info
    const userDoc = await getDoc(doc(db, 'users', userId));
    const userData = userDoc.exists() ? userDoc.data() : null;

    // 2. Get last added car
    const carsRef = collection(db, 'users', userId, 'cars');
    const q = query(carsRef, orderBy('addedAt', 'desc'), limit(1));
    const carsSnap = await getDocs(q);
    const carData = !carsSnap.empty ? carsSnap.docs[0].data() : null;

    return {
      personal: userData,
      car: carData
    };
  } catch (e) {
    // For prefill, we might want to fail silently or log
    if (e instanceof Error && e.message.includes('permission-denied')) {
       handleFirestoreError(e, OperationType.LIST, carsPath);
    }
    return { personal: null, car: null };
  }
};
