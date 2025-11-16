import { useState } from "react";

export const useScreenShake = () => {
  const [isShaking, setIsShaking] = useState(false);

  const shake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return { isShaking, shake };
};
