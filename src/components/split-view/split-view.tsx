import "./split-view.css";

import classNames from "classnames";
import { clamp, debounce } from "lodash";
import {
  MouseEvent,
  ReactNode,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import useResizeObserver from "use-resize-observer";

import { SASH_HOVER_SIZE, SASH_SIZE } from "../../constants";

export type SplitViewProps = {
  main: ReactNode;
  study: ReactNode;
  showStudy: boolean;
  initialProportion: number;
  onResize?: (proportion: number) => void;
};

const minimumSize = 50;

export const SplitView = ({
  main,
  study,
  showStudy = false,
  initialProportion = 2 / 3,
  onResize,
}: SplitViewProps) => {
  const splitViewRef = useRef<HTMLDivElement>(null!);
  const sashRef = useRef<HTMLDivElement>(null!);
  const mainRef = useRef<HTMLDivElement>(null!);
  const studyRef = useRef<HTMLDivElement>(null!);

  const size = useRef(0);
  const fullHeight = useRef(0);

  const hoverDelayer = useMemo(
    () => debounce((el) => el.classList.add("hover"), 300),
    []
  );

  useLayoutEffect(() => {
    document.documentElement.style.setProperty("--sash-size", SASH_SIZE + "px");
    document.documentElement.style.setProperty(
      "--sash-hover-size",
      SASH_HOVER_SIZE + "px"
    );

    return () => {
      document.documentElement.style.removeProperty("--sash-size");
      document.documentElement.style.removeProperty("--sash-hover-size");
    };
  }, []);

  const layout = useCallback(() => {
    if (showStudy) {
      sashRef.current.style.top = `${size.current - SASH_SIZE / 2}px`;
      mainRef.current.style.top = `${0}px`;
      mainRef.current.style.height = `${size.current}px`;
      studyRef.current.style.top = `${size.current}px`;
      studyRef.current.style.height = `${fullHeight.current - size.current}px`;
    } else {
      mainRef.current.style.top = `${0}px`;
      mainRef.current.style.height = `${fullHeight.current}px`;
      studyRef.current.style.top = `${fullHeight.current}px`;
      studyRef.current.style.height = `${0}px`;
    }
  }, [showStudy]);

  useResizeObserver<HTMLDivElement>({
    onResize: ({ height }) => {
      if (height) {
        const proportion = size.current / fullHeight.current;

        fullHeight.current = height;
        size.current = proportion * height;

        layout();
        onResize?.(proportion);
      }
    },
    ref: splitViewRef,
  });

  useLayoutEffect(() => {
    fullHeight.current = splitViewRef.current.getBoundingClientRect().height;
    size.current = initialProportion * fullHeight.current;
    layout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    layout();
  }, [layout]);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault();

    const start =
      event.pageY - splitViewRef.current.getBoundingClientRect().top;

    mainRef.current.style.pointerEvents = "none";
    studyRef.current.style.pointerEvents = "none";
    sashRef.current.classList.add("active");

    const handleMouseMove = (event: any) => {
      event.preventDefault();

      const current =
        event.pageY - splitViewRef.current.getBoundingClientRect().top;

      let delta = current - start;

      const minDelta = Math.min(-start + minimumSize, 0);
      const maxDelta = Math.max(fullHeight.current - start - minimumSize, 0);

      delta = clamp(delta, minDelta, maxDelta);

      size.current = start + delta;

      layout();
      onResize?.(size.current / fullHeight.current);
    };

    const handleMouseUp = (event: any) => {
      event.preventDefault();

      sashRef.current.classList.remove("active");

      mainRef.current.style.pointerEvents = "auto";
      studyRef.current.style.pointerEvents = "auto";

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseEnter = () => {
    if (sashRef.current.classList.contains("active")) {
      hoverDelayer.cancel();
      sashRef.current.classList.add("hover");
    } else {
      hoverDelayer(sashRef.current);
    }
  };

  const handleMouseLeave = () => {
    hoverDelayer.cancel();
    sashRef.current.classList.remove("hover");
  };

  return (
    <div
      ref={splitViewRef}
      className="pennant-split-view vertical separator-border"
    >
      <div className="sash-container">
        {showStudy && (
          <div
            ref={sashRef}
            className="pennant-sash horizontal"
            onMouseDown={handleMouseDown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
        )}
      </div>
      <div className="split-view-container">
        <div ref={mainRef} className="split-view-view visible">
          {main}
        </div>
        <div
          ref={studyRef}
          className={classNames("split-view-view", { visible: showStudy })}
        >
          {study}
        </div>
      </div>
    </div>
  );
};
