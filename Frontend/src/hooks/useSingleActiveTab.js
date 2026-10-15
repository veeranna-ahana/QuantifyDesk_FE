import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_LOCK_PREFIX = "work-quantify:active-tab:";
const TAB_ID_KEY = "work-quantify:tab-id";
const HEARTBEAT_MS = 15_000;
const LEASE_MS = HEARTBEAT_MS * 3;

function getTabId() {
  let tabId = sessionStorage.getItem(TAB_ID_KEY);
  if (!tabId) {
    tabId = globalThis.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    sessionStorage.setItem(TAB_ID_KEY, tabId);
  }
  return tabId;
}

function readLease(lockKey) {
  try {
    return JSON.parse(localStorage.getItem(lockKey) || "null");
  } catch {
    localStorage.removeItem(lockKey);
    return null;
  }
}

function isLeaseActive(lockKey, tabId) {
  const lease = readLease(lockKey);
  return lease?.tabId === tabId && lease.expiresAt > Date.now();
}

export function useSingleActiveTab(accountId) {
  const lockName = `work-quantify:${accountId || "anonymous"}`;
  const lockKey = `${STORAGE_LOCK_PREFIX}${encodeURIComponent(accountId || "anonymous")}`;
  const [status, setStatus] = useState("checking");
  const [retryCount, setRetryCount] = useState(0);
  const statusRef = useRef(status);

  const retry = useCallback(() => setRetryCount((count) => count + 1), []);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    let cancelled = false;
    let requestPending = false;
    let releaseBrowserLock;
    let heartbeat;
    let tabId;
    let active = false;

    const clearHeartbeat = () => {
      if (heartbeat) {
        window.clearInterval(heartbeat);
        heartbeat = undefined;
      }
    };

    const releaseLease = () => {
      clearHeartbeat();
      if (tabId && isLeaseActive(lockKey, tabId)) {
        localStorage.removeItem(lockKey);
      }
    };

    const updateLease = () => {
      localStorage.setItem(
        lockKey,
        JSON.stringify({ tabId, expiresAt: Date.now() + LEASE_MS }),
      );
    };

    const claimStorageLease = () => {
      const current = readLease(lockKey);
      if (
        current &&
        current.tabId !== tabId &&
        current.expiresAt > Date.now()
      ) {
        return false;
      }

      updateLease();
      return isLeaseActive(lockKey, tabId);
    };

    const attemptAcquire = () => {
      if (cancelled || active || requestPending) return;
      requestPending = true;

      if (navigator.locks?.request) {
        navigator.locks
          .request(lockName, { mode: "exclusive", ifAvailable: true }, async (lock) => {
            requestPending = false;
            if (cancelled) return;
            if (!lock) {
              setStatus("blocked");
              return;
            }

            active = true;
            setStatus("active");
            await new Promise((resolve) => {
              releaseBrowserLock = resolve;
            });
          })
          .catch((error) => {
            requestPending = false;
            if (!cancelled) {
              console.error("Unable to acquire the application tab lock:", error);
              setStatus("error");
            }
          });
        return;
      }

      try {
        tabId = getTabId();
        active = claimStorageLease();
        requestPending = false;
        if (!active) {
          setStatus("blocked");
          return;
        }

        setStatus("active");
        heartbeat = window.setInterval(() => {
          try {
            if (!claimStorageLease()) {
              active = false;
              clearHeartbeat();
              setStatus("blocked");
            }
          } catch (error) {
            console.error("Unable to renew the application tab lock:", error);
            active = false;
            clearHeartbeat();
            setStatus("error");
          }
        }, HEARTBEAT_MS);
      } catch (error) {
        requestPending = false;
        console.error("Unable to access the application tab lock:", error);
        setStatus("error");
      }
    };

    const onFocus = () => {
      if (statusRef.current !== "active") attemptAcquire();
    };

    const onVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        statusRef.current !== "active"
      ) {
        attemptAcquire();
      }
    };

    const onStorage = (event) => {
      if (event.key !== lockKey) return;
      if (active && !isLeaseActive(lockKey, tabId)) {
        active = false;
        clearHeartbeat();
        setStatus("blocked");
      } else if (!active) {
        attemptAcquire();
      }
    };

    const start = window.setTimeout(attemptAcquire, 0);
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    window.addEventListener("pagehide", releaseLease);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("pagehide", releaseLease);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearHeartbeat();
      releaseLease();
      releaseBrowserLock?.();
    };
  }, [lockKey, lockName, retryCount]);

  return { status, retry };
}
