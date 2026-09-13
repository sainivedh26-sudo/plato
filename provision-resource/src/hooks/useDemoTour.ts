import { useCallback, useEffect, useRef, useState } from "react";
import { driver, type DriveStep, type Popover } from "driver.js";
import "driver.js/dist/driver.css";

export type TourStage =
  | "welcome"
  | "scenario"
  | "ticket"
  | "assign"
  | "session-intro"
  | "session-suggestion"
  | "session-approval"
  | "session-diagnosis"
  | "session-diagnosis-switch"
  | "session-diagnosis-tabs"
  | "session-live-return"
  | "session-report"
  | "complete"
  | null;

interface TourState {
  stage: TourStage;
  active: boolean;
  completedStages: TourStage[];
}

interface CalloutState {
  show: boolean;
  selector: string;
  title: string;
  description: string;
  side: Popover["side"];
}

const TOUR_STORAGE_KEY = "plato-demo-tour-seen";

export function useDemoTour() {
  const [tourState, setTourState] = useState<TourState>({
    stage: null,
    active: false,
    completedStages: [],
  });
  const [callout, setCallout] = useState<CalloutState | null>(null);
  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const hasStartedRef = useRef(false);

  const hasSeenTour = useCallback(() => {
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) === "true";
    } catch {
      return false;
    }
  }, []);

  const markTourSeen = useCallback(() => {
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, "true");
    } catch {
      // ignore
    }
  }, []);

  const startTour = useCallback(
    (stage: TourStage, steps?: DriveStep[]) => {
      if (!stage) return;
      if (hasSeenTour() && stage !== "welcome") return;

      // Destroy previous driver instance
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }

      setTourState((prev) => ({
        ...prev,
        stage,
        active: true,
      }));

      if (steps && steps.length > 0) {
        // Small delay to ensure DOM elements are rendered
        setTimeout(() => {
          const driverObj = driver({
            showProgress: true,
            allowClose: true,
            disableActiveInteraction: false,
            overlayClickBehavior: "close",
            stagePadding: 4,
            stageRadius: 8,
            popoverClass: "plato-driver-popover",
            onDestroyed: () => {
              setTourState((prev) => ({
                ...prev,
                stage: null,
                active: false,
                completedStages: [...prev.completedStages, stage],
              }));
              driverRef.current = null;
            },
          });
          driverRef.current = driverObj;
          driverObj.setSteps(steps);
          driverObj.drive();
        }, 300);
      }
    },
    [hasSeenTour]
  );

  /**
   * Single-step callout that does NOT block clicks on the target element.
   * Uses a custom React portal instead of driver.js highlight() because
   * driver.js v1.8.0 intercepts all pointer events on highlighted elements
   * via capture-phase listeners and prevents them from reaching React.
   */
  const highlightElement = useCallback(
    (selector: string, title: string, description: string, side?: Popover["side"]) => {
      if (hasSeenTour()) return;

      // Destroy any active driver tour so only one guide shows at a time
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }

      setTimeout(() => {
        const el = document.querySelector(selector);
        if (!el) return;

        setTourState((prev) => ({ ...prev, active: true }));
        setCallout({
          show: true,
          selector,
          title,
          description,
          side: side || "bottom",
        });
      }, 300);
    },
    [hasSeenTour]
  );

  const dismissCallout = useCallback(() => {
    setCallout((prev) => (prev ? { ...prev, show: false } : null));
    setTourState((prev) => ({ ...prev, active: false }));
    // Delay clearing state so fade-out animation can run
    setTimeout(() => setCallout(null), 250);
  }, []);

  const resetTour = useCallback(() => {
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    } catch {
      // ignore
    }
    setTourState({
      stage: null,
      active: false,
      completedStages: [],
    });
    hasStartedRef.current = false;
    setCallout(null);
    if (driverRef.current) {
      driverRef.current.destroy();
      driverRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return {
    tourState,
    callout,
    dismissCallout,
    startTour,
    highlightElement,
    resetTour,
    markTourSeen,
    hasSeenTour,
  };
}
