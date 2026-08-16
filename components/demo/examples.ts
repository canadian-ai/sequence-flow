export const girlChart = `sequenceDiagram
    participant B as Browser
    box Server Tier
    participant W as Web Server
    participant D as Database Server
    end
    B->>W: HTTP GET Request
    W->>+D: SQL Command
    Note over D: Query planner
    D-->>-W: Result Set
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
  { id: "girl", label: "Request lifecycle", chart: girlChart },
  { id: "auth", label: "Authentication", chart: authChart },
  { id: "pipeline", label: "Job pipeline", chart: pipelineChart },
] as const
