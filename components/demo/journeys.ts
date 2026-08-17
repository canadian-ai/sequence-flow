import type { JourneySlide } from "@/components/ui/sequence-diagram"

/**
 * A narrative journey walking through the evolution of a simple web
 * architecture, one system at a time. Each slide is a standalone Mermaid
 * chart — the JourneyPlayer swaps between them like a slideshow.
 */
export const architectureJourney: JourneySlide[] = [
  {
    id: "client-server",
    title: "Step 1 — Client and server",
    caption:
      "We start with the simplest possible shape: a browser talks directly to a web server over HTTP.",
    messageCaptions: [
      "The browser sends an HTTP GET request for /products directly to the web server.",
      "The web server renders the page and sends back a 200 OK with the HTML.",
    ],
    chart: `
    sequenceDiagram
    participant B as Browser
    participant W as Web Server
    B->>W: HTTP GET /products
    W-->>B: 200 OK (HTML)
    `,
  },
  {
    id: "add-database",
    title: "Step 2 — Adding a database",
    caption:
      "The server can't hold everything in memory, so it delegates persistence to a dedicated database and queries it per request.",
    messageCaptions: [
      "The browser requests /products, same as before.",
      "This time the web server can't answer alone, so it queries the database for the product rows.",
      "The database returns the matching rows to the web server.",
      "The web server assembles the HTML from those rows and responds 200 OK.",
    ],
    chart: `
    sequenceDiagram
    participant B as Browser
    participant W as Web Server
    participant D as Database
    B->>W: HTTP GET /products
    W->>D: SELECT * FROM products
    D-->>W: Rows
    W-->>B: 200 OK (HTML)
    `,
  },
  {
    id: "add-cache",
    title: "Step 3 — Introducing a cache",
    caption:
      "Repeated queries for the same data are wasteful. A cache sits in front of the database and short-circuits the round trip on a hit.",
    messageCaptions: [
      "The browser's request comes in as usual.",
      "The web server checks the cache first instead of going straight to the database.",
      "On this request, the cache doesn't have it yet — a miss.",
      "So the web server falls back to the database for the real query.",
      "The database returns the rows.",
      "The web server writes the result back into the cache for next time.",
      "Finally it responds to the browser with the HTML.",
    ],
    chart: `
    sequenceDiagram
    participant B as Browser
    participant W as Web Server
    participant C as Cache
    participant D as Database
    B->>W: HTTP GET /products
    W->>C: GET products
    C-->>W: Cache miss
    W->>D: SELECT * FROM products
    D-->>W: Rows
    W->>C: SET products
    W-->>B: 200 OK (HTML)
    `,
  },
  {
    id: "full-picture",
    title: "Step 4 — The full picture",
    caption:
      "Group the backend into a single tier and the whole request path reads as one coherent flow: browser in, cache-aware server tier, database of record.",
    messageCaptions: [
      "The browser makes its request for /products.",
      "The server tier checks the cache — and this time, it's warm.",
      "The cache hit means the database is never touched. The server responds immediately with 200 OK.",
    ],
    chart: `
    sequenceDiagram
    participant B as Browser
    box Server Tier
    participant W as Web Server
    participant C as Cache
    participant D as Database
    end
    B->>W: HTTP GET /products
    W->>C: GET products
    C-->>W: Cache hit
    W-->>B: 200 OK (HTML)
    `,
  },
]
