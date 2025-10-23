
"use client"

import { useEffect, useRef } from 'react';
import isEqual from 'lodash.isequal';

type DependencyList = readonly any[];

const useDeepCompareEffect = (
  callback: () => void | (() => void),
  dependencies: DependencyList
) => {
  const currentDependenciesRef = useRef<DependencyList>();

  if (!isEqual(currentDependenciesRef.current, dependencies)) {
    currentDependenciesRef.current = dependencies;
  }

  useEffect(callback, [currentDependenciesRef.current]);
};

export default useDeepCompareEffect;
