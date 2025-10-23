'use client';
    
import { useState, useEffect, useMemo } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
  doc,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '../provider';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * This hook is stable and memoizes the document reference internally.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {string | null | undefined} path - The path to the document. The hook will not run if the path is null or undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  path: string | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const firestore = useFirestore();
  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const memoizedDocRef = useMemo(() => {
    if (!firestore || !path) {
      return null;
    }
    // Simple validation to ensure it's a doc path, not a collection path.
    if (path.split('/').filter(p => p).length % 2 !== 0) {
      console.warn(`[useDoc] Invalid document path provided: "${path}". Document paths must have an even number of segments.`);
      return null;
    }
    return doc(firestore, path);
  }, [firestore, path]);


  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      return;
    }
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (!isMounted) return;
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          // Document does not exist
          setData(null);
        }
        setError(null); // Clear any previous error on successful snapshot
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        if (!isMounted) return;
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        // trigger global error propagation
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    }
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
