import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  deleteUser as deleteFirebaseUser,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { auth, db, googleProvider } from "./firebase";
import { UserProfile, ChatMessage, PronunciationEvaluation, TargetLanguage, ProficiencyLevel, LearningGoal } from "../types";

export interface UserStats {
  sessionsCompleted: number;
  wordsLearnedCount: number;
  speakingScoreAvg: number;
  streakDays: number;
  lastActiveDate: string;
}

// 1. Google Sign-In
export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const fbUser = result.user;
  
  // Check if profile exists in Firestore
  const userDocRef = doc(db, "users", fbUser.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }

  // Create initial profile
  const newProfile: UserProfile = {
    id: fbUser.uid,
    name: fbUser.displayName || "Learner",
    email: fbUser.email || "",
    targetLanguage: "Spanish",
    proficiencyLevel: "Beginner (A1-A2)",
    learningGoal: "Daily Conversation & Socializing",
    dailyGoalMinutes: 15,
    nativeLanguage: "English",
    isOnboarded: false, // will prompt them to pick language if new
    avatarIcon: fbUser.photoURL || undefined,
    createdAt: new Date().toISOString(),
  };

  await setDoc(userDocRef, {
    ...newProfile,
    updatedAt: serverTimestamp(),
  });

  return newProfile;
}

// 2. Email / Password Sign In
export async function signInWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  const fbUser = cred.user;

  const userDocRef = doc(db, "users", fbUser.uid);
  const docSnap = await getDoc(userDocRef);

  if (docSnap.exists()) {
    return docSnap.data() as UserProfile;
  }

  const newProfile: UserProfile = {
    id: fbUser.uid,
    name: fbUser.displayName || email.split("@")[0],
    email: fbUser.email || email,
    targetLanguage: "Spanish",
    proficiencyLevel: "Beginner (A1-A2)",
    learningGoal: "Daily Conversation & Socializing",
    dailyGoalMinutes: 15,
    nativeLanguage: "English",
    isOnboarded: true,
    createdAt: new Date().toISOString(),
  };

  await setDoc(userDocRef, {
    ...newProfile,
    updatedAt: serverTimestamp(),
  });

  return newProfile;
}

// 3. Email / Password Sign Up
export async function signUpWithEmail(
  name: string,
  email: string,
  pass: string,
  intake?: Partial<UserProfile>
): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const fbUser = cred.user;

  if (name) {
    await updateProfile(fbUser, { displayName: name });
  }

  const profile: UserProfile = {
    id: fbUser.uid,
    name: name || "Learner",
    email: fbUser.email || email,
    targetLanguage: intake?.targetLanguage || "Spanish",
    proficiencyLevel: intake?.proficiencyLevel || "Beginner (A1-A2)",
    learningGoal: intake?.learningGoal || "Daily Conversation & Socializing",
    dailyGoalMinutes: intake?.dailyGoalMinutes || 15,
    nativeLanguage: intake?.nativeLanguage || "English",
    isOnboarded: Boolean(intake?.isOnboarded),
    createdAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", fbUser.uid), {
    ...profile,
    updatedAt: serverTimestamp(),
  });

  return profile;
}

// 4. Save/Update User Profile in Firestore
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (!profile.id) return;
  const userDocRef = doc(db, "users", profile.id);
  await setDoc(
    userDocRef,
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

// 5. Fetch User Profile
export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const userDocRef = doc(db, "users", userId);
    const docSnap = await getDoc(userDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
  } catch (err) {
    console.error("Failed to fetch user profile:", err);
  }
  return null;
}

// 6. Log Conversation Messages to Firestore
export async function saveConversationMessage(
  userId: string,
  message: ChatMessage,
  targetLanguage: TargetLanguage
): Promise<void> {
  if (!userId) return;
  try {
    const messagesCol = collection(db, "users", userId, "conversations");
    await addDoc(messagesCol, {
      role: message.role,
      text: message.text,
      translation: message.translation || null,
      gesture: message.gesture || null,
      targetLanguage,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not persist conversation message to firestore:", err);
  }
}

// 7. Log Pronunciation Evaluation
export async function savePronunciationAttempt(
  userId: string,
  data: {
    targetLanguage: TargetLanguage;
    sentence: string;
    transcribed: string;
    evaluation: PronunciationEvaluation;
  }
): Promise<void> {
  if (!userId) return;
  try {
    const attemptsCol = collection(db, "users", userId, "pronunciationAttempts");
    await addDoc(attemptsCol, {
      ...data,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Could not persist pronunciation attempt to firestore:", err);
  }
}

// 8. Sign Out
export async function signOutUser(): Promise<void> {
  await signOut(auth);
}

// 9. Delete User Profile, Firestore subcollections, and Auth account
export async function deleteCurrentUserData(userId?: string): Promise<void> {
  const currentFbUser = auth.currentUser;
  const uid = userId || currentFbUser?.uid;

  if (uid) {
    try {
      // 1. Delete conversation messages
      const convSnap = await getDocs(collection(db, "users", uid, "conversations"));
      for (const d of convSnap.docs) {
        await deleteDoc(d.ref);
      }

      // 2. Delete pronunciation attempts
      const pronSnap = await getDocs(collection(db, "users", uid, "pronunciationAttempts"));
      for (const d of pronSnap.docs) {
        await deleteDoc(d.ref);
      }

      // 3. Delete user document
      await deleteDoc(doc(db, "users", uid));
    } catch (err) {
      console.warn("Error deleting Firestore documents:", err);
    }
  }

  // Clear local storage state
  localStorage.removeItem("maestro_user_profile");
  localStorage.removeItem("maestro_chat_history");

  // 4. Delete Firebase Auth user if active
  if (currentFbUser) {
    try {
      await deleteFirebaseUser(currentFbUser);
    } catch (authErr) {
      console.warn("Could not delete Firebase Auth user directly (may require re-auth):", authErr);
      await signOut(auth);
    }
  }
}

