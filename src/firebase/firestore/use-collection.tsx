'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  collection,
  query,
  QueryConstraint,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useFirestore } from '@/firebase/provider';
import { useDeepCompareMemo } from '@/hooks/use-deep-compare-memo';

/** Utility type to add an 'id' field to a given type T. */
export type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useCollection hook.
 * @template T Type of the document data.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * This hook is stable and memoizes the query internally.
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {string | null | undefined} path - The path to the collection. The hook will not run if the path is null or undefined.
 * @param {...QueryConstraint} queryConstraints - Optional query constraints (e.g., from where(), orderBy(), limit()).
 * @returns {UseCollectionResult<T>} Object with data, isLoading, error.
 */
export function useCollection<T = any>(
  path: string | null | undefined,
  ...queryConstraints: (QueryConstraint | undefined)[]
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const firestore = useFirestore();
  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const stableConstraints = useDeepCompareMemo(() => queryConstraints.filter(c => c !== undefined), [queryConstraints]);

  // Memoize the query object itself.
  const memoizedQuery = useMemo(() => {
    if (!firestore || !path) {
      return null;
    }
    const collectionRef = collection(firestore, path);
    return query(collectionRef, ...(stableConstraints as QueryConstraint[]));
  }, [firestore, path, stableConstraints]);

  useEffect(() => {
    if (!memoizedQuery) {
      setIsLoading(false);
      setData(null);
      return;
    }
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        if (!isMounted) return;
        const results: ResultItemType[] = snapshot.docs.map(doc => ({
          ...(doc.data() as T),
          id: doc.id
        }));
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error: FirestoreError) => {
        if (!isMounted) return;
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: path!, // path is guaranteed to be defined if memoizedQuery is not null
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [memoizedQuery, path]); // Re-run effect if the memoized query changes.

  return { data, isLoading, error };
}
