import { MutableRefObject, useEffect, useMemo, useRef, useState } from "react";

type TargetRef = MutableRefObject<HTMLDivElement | null>;

const useInView = (
  options = {
    root: null,
    rootMargin: "0px",
    threshold: 1,
  },
  triggerOnce = false
): [TargetRef, boolean] => {
  const [inView, setInView] = useState(false);
  const targetRef: TargetRef = useRef<HTMLDivElement | null>(null);

  const optionsMemo = useMemo(() => options, [JSON.stringify(options)]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setInView(true);

          if (triggerOnce) {
            observer.unobserve(targetRef.current!);
          }
        } else {
          setInView(false);
        }
      });
    }, options);

    if (targetRef.current) {
      observer.observe(targetRef.current);
    }

    return () => {
      if (targetRef.current) {
        observer.unobserve(targetRef.current);
      }
    };
  }, [optionsMemo, triggerOnce]);

  return [targetRef, inView];
};

export { useInView };
