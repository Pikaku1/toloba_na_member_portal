import React from "react";

type State = {
  hasError: boolean;
  errorMessage: string;
};

export default class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  public state: State = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      errorMessage:
        error instanceof Error ? error.message : "Unexpected application error.",
    };
  }

  componentDidCatch(error: unknown) {
    console.error("Application error boundary caught:", error);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div>
          <h2 style={{ marginBottom: "8px" }}>Could not load this page</h2>
          <p style={{ margin: 0, color: "var(--text-secondary)" }}>
            {this.state.errorMessage}
          </p>
        </div>
      </div>
    );
  }
}
