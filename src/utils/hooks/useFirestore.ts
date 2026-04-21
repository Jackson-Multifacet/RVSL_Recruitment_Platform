import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  doc,
  Query,
  QueryConstraint,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { FirestoreError, QueryResult, PaginationOptions } from '../../types';

/**
 * useFirestoreQuery - Hook to fetch Firestore data with proper error handling
 * Eliminates duplicate query code across components
 * 
 * @param collectionName - Name of Firestore collection
 * @param constraints - Array of query constraints (where, orderBy, limit, etc.)
 * @param options - Pagination options
 * @returns { data, isLoading, error, hasMore, lastDoc, refetch }
 */
export const useFirestoreQuery = <T extends any>(
  collectionName: string,
  constraints: QueryConstraint[] = [],
  options: PaginationOptions = { pageSize: 20 }
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);

  const fetch = useCallback(async (isLoadMore = false) => {
    try {
      setIsLoading(true);
      const queryConstraints: QueryConstraint[] = [...constraints];

      // Add limit
      queryConstraints.push(limit(options.pageSize));

      // Add pagination cursor if loading more
      if (isLoadMore && options.startAfter) {
        queryConstraints.push(startAfter(options.startAfter));
      }

      const q = query(collection(db, collectionName), ...queryConstraints);
      const snapshot = await getDocs(q);

      const newData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      if (isLoadMore) {
        setData((prev) => [...prev, ...newData]);
      } else {
        setData(newData);
      }

      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
      setHasMore(snapshot.docs.length === options.pageSize);
      setError(null);
    } catch (err) {
      const firestoreError = err as any;
      setError({
        code: firestoreError.code || 'QUERY_ERROR',
        message: firestoreError.message || 'Failed to fetch data',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, [collectionName, constraints, options]);

  useEffect(() => {
    fetch(false);
  }, [collectionName]);

  const loadMore = useCallback(async () => {
    if (hasMore && lastDoc) {
      await fetch(true);
    }
  }, [hasMore, lastDoc, fetch]);

  const refetch = useCallback(() => {
    fetch(false);
  }, [fetch]);

  return {
    data,
    isLoading,
    error,
    hasMore,
    lastDoc,
    loadMore,
    refetch,
  };
};

/**
 * useFirestoreLive - Hook for real-time Firestore subscriptions
 * Properly manages unsubscribe cleanup
 * 
 * @param collectionName - Name of Firestore collection
 * @param constraints - Array of query constraints
 * @returns { data, isLoading, error }
 */
export const useFirestoreLive = <T extends any>(
  collectionName: string,
  constraints: QueryConstraint[] = []
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    try {
      const q = query(collection(db, collectionName), ...constraints);

      const unsubscribe: Unsubscribe = onSnapshot(q, (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];

        setData(docs);
        setError(null);
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      const firestoreError = err as any;
      setError({
        code: firestoreError.code || 'SUBSCRIPTION_ERROR',
        message: firestoreError.message || 'Failed to subscribe to data',
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
    }
  }, [collectionName, JSON.stringify(constraints)]);

  return { data, isLoading, error };
};

/**
 * useFirestoreDoc - Hook to fetch a single document
 * 
 * @param collectionName - Name of Firestore collection
 * @param docId - Document ID
 * @returns { data, isLoading, error }
 */
export const useFirestoreDoc = <T extends any>(
  collectionName: string,
  docId: string | null
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!!docId);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setIsLoading(true);
        const docRef = doc(db, collectionName, docId);
        const snapshot = await getDoc(docRef);

        if (snapshot.exists()) {
          setData({
            id: snapshot.id,
            ...snapshot.data(),
          } as T);
        } else {
          setData(null);
        }
        setError(null);
      } catch (err) {
        const firestoreError = err as any;
        setError({
          code: firestoreError.code || 'DOC_ERROR',
          message: firestoreError.message || 'Failed to fetch document',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [collectionName, docId]);

  return { data, isLoading, error };
};

/**
 * useBatchFirestoreQuery - Hook to fetch multiple documents
 * FIXES N+1 QUERY PROBLEM by batching requests
 * 
 * @param collectionName - Name of Firestore collection
 * @param docIds - Array of document IDs
 * @returns { data, isLoading, error }
 */
export const useBatchFirestoreQuery = <T extends any>(
  collectionName: string,
  docIds: string[]
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(docIds.length > 0);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (docIds.length === 0) {
      setData([]);
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      try {
        setIsLoading(true);
        // Batch fetch all documents in parallel instead of sequential
        const docs = await Promise.all(
          docIds.map((id) => getDoc(doc(db, collectionName, id)))
        );

        const result = docs
          .filter((snap) => snap.exists())
          .map((snap) => ({
            id: snap.id,
            ...snap.data(),
          })) as T[];

        setData(result);
        setError(null);
      } catch (err) {
        const firestoreError = err as any;
        setError({
          code: firestoreError.code || 'BATCH_ERROR',
          message: firestoreError.message || 'Failed to fetch documents',
          timestamp: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [collectionName, JSON.stringify(docIds)]);

  return { data, isLoading, error };
};

/**
 * useFirestoreLiveDoc - Hook for real-time single document subscription
 * 
 * @param collectionName - Name of Firestore collection
 * @param docId - Document ID
 * @returns { data, isLoading, error }
 */
export const useFirestoreLiveDoc = <T extends any>(
  collectionName: string,
  docId: string | null
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(!!docId);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!docId) {
      setData(null);
      setIsLoading(false);
      return;
    }

    try {
      const docRef = doc(db, collectionName, docId);

      const unsubscribe = onSnapshot(docRef, (snapshot) => {
        if (snapshot.exists()) {
          setData({
            id: snapshot.id,
            ...snapshot.data(),
          } as T);
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } catch (err) {
      const firestoreError = err as any;
      setError({
        code: firestoreError.code || 'LIVE_DOC_ERROR',
        message: firestoreError.message || 'Failed to subscribe to document',
        timestamp: new Date().toISOString(),
      });
      setIsLoading(false);
    }
  }, [collectionName, docId]);

  return { data, isLoading, error };
};
