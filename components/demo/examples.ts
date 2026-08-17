export const requestLifecycleChart = `sequenceDiagram
    %% tooltip Browser: The client. Renders the page and initiates every request in this flow.
    participant B as Browser
    box Server Tier
    %% tooltip Server Tier: Everything inside this boundary runs on infrastructure we control — no direct client access.
    %% tooltip Web Server: Stateless request handler. Never talks to the database directly outside a transaction.
    participant W as Web Server
    %% tooltip Database Server: Owns durable state. Only reachable from inside the server tier.
    participant D as Database Server
    end
    B->>W: HTTP GET Request
    W->>+D: SQL Command %% tooltip: Issued inside an open connection; the '+' activates the database's execution bar.
    Note over D: Query planner
    D-->>-W: Result Set %% tooltip: Dashed return arrow — the '-' closes the activation opened above.
    W-->>B: HTTP Response`

export const authChart = `sequenceDiagram
    actor U as User
    participant A as App
    participant Auth as Auth Service
    U->>A: Submit credentials
    A->>+Auth: Verify(email, password)
    Auth->>Auth: Hash + compare
    Auth-->>-A: Session token
    A-->>U: Redirect to dashboard`

export const pipelineChart = `sequenceDiagram
    participant C as Client
    participant Q as Queue
    participant Wk as Worker
    C->>Q: Enqueue job
    Note right of Q: Buffered
    Q->>+Wk: Dispatch
    Wk->>Wk: Process batch
    Wk-->>-Q: Ack`

export const examples = [
  { id: "request", label: "Request lifecycle", chart: requestLifecycleChart },
  { id: "auth", label: "Authentication", chart: authChart },
  { id: "pipeline", label: "Job pipeline", chart: pipelineChart },
] as const
