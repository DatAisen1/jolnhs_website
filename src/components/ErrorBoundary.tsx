import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches uncaught render errors anywhere below it and shows a friendly
 * fallback instead of an entirely blank page (P2.3). Must be a class
 * component — `componentDidCatch`/`getDerivedStateFromError` are the
 * only way to catch render errors in React; there's no hook equivalent.
 *
 * Mounted around the whole `<App />` in main.tsx, so both the public
 * site and every /admin/* route are covered — a superset of the "at
 * minimum the /admin/* subtree" ask.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Logged so a real crash is at least visible to a dev in the
    // console/error-reporting pipeline, instead of vanishing along
    // with the blanked page.
    console.error("Uncaught render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-6 text-center">
        <AlertTriangle size={32} className="text-status-error-text" aria-hidden="true" />
        <div>
          <h1 className="font-heading text-subtitle text-text-primary">Something went wrong</h1>
          <p className="mt-1 text-small text-text-secondary">
            This page ran into a problem. Reloading usually fixes it.
          </p>
        </div>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}