import { useMemo, useRef } from 'react';
import isEqual from 'lodash.isequal';

export const useDeepCompareMemo = <T>(
  factory: () => T,
  dependencies: any[]
): T => {
  const currentDependenciesRef = useRef<any[]>();

  if (!isEqual(currentDependenciesRef.current, dependencies)) {
    currentDependenciesRef.current = dependencies;
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, [currentDependenciesRef.current]);
};
