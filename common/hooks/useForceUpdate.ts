import { useCallback, useState } from "react";

export const useForceUpdate = () => {
  const [, setState] = useState<{}>();

  return useCallback(() => {
    setState({});
  }, []);
};
