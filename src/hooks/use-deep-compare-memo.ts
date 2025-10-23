
"use client"

import { useMemo, useRef } from 'react';
import isEqual from 'lodash.isequal';

type DependencyList = readonly any[];

export const useDeepCompareMemo = <T>(
  factory: () => T,
  dependencies: DependencyList
): T => {
  const currentDependenciesRef = useRef<DependencyList>();

  if (!isEqual(currentDependenciesRef.current, dependencies)) {
    currentDependenciesRef.current = dependencies;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [currentDependenciesRef.current]);
};
