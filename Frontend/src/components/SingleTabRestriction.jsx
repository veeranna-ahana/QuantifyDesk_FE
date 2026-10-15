import { ExternalLink, Lock, ShieldCheck } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const MYAHANA_PORTAL_URL =
  import.meta.env.VITE_MYAHANA_PORTAL_URL || "https://myahana.ahanait.com/";

export function SingleTabRestriction() {
  const openPortal = () => {
    window.open(MYAHANA_PORTAL_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-page p-6 text-center">
      <Card
        role="alert"
        className="w-full max-w-2xl p-6 sm:p-10"
      >
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-chip bg-action-primary-soft text-action-primary sm:h-24 sm:w-24">
          <Lock
            aria-hidden="true"
            className="h-10 w-10"
            strokeWidth={1.8}
          />
        </div>

        <h1 className="text-2xl font-bold leading-tight text-ink-primary sm:text-3xl">
          System Locked
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ink-secondary sm:text-base sm:leading-7">
          The <strong className="font-semibold text-ink-primary">QuantifyDesk</strong>{" "}
          is a restricted internal tool. Please authenticate to manage system
          permissions and security roles.
        </p>

        <div className="mt-7 flex gap-4 rounded-chip border border-line-card bg-surface-table-head p-4 text-left sm:mt-8 sm:p-5">
          <ShieldCheck
            aria-hidden="true"
            className="mt-0.5 h-6 w-6 shrink-0 text-action-primary"
            strokeWidth={1.8}
          />
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-ink-primary">
              SSO REQUIRED
            </h2>
            <p className="mt-1.5 text-sm leading-5 text-ink-secondary">
              Login through the MyAhana Portal to sync your employee
              credentials.
            </p>
          </div>
        </div>

        <Button
          onClick={openPortal}
          variant="primary"
          size="lg"
          fullWidth
          rightIcon={<ExternalLink aria-hidden="true" className="h-4 w-4" />}
          className="mt-7 sm:mt-8"
        >
          Access MyAhana Portal
        </Button>
      </Card>
    </main>
  );
}
