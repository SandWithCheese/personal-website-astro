export const PROJECTS = [
  {
    id: 1,
    title: "SecureGate",
    date: "2024",
    description:
      "Network traffic analyzer with real-time threat detection. Inspects packet flows and surfaces anomalies through a lightweight rule engine.",
    tags: ["Go", "Redis", "gRPC"],
    links: { github: "https://github.com" },
  },
  {
    id: 2,
    title: "FlowEngine",
    date: "2024",
    description:
      "Distributed task orchestrator for CI/CD pipelines. Schedules dependent jobs across workers with retry semantics and live status streaming.",
    tags: ["Next.js", "PostgreSQL", "Docker"],
    links: { github: "https://github.com", demo: "https://example.com" },
  },
  {
    id: 3,
    title: "VaultAPI",
    date: "2023",
    description:
      "Zero-trust secret management microservice. Encrypts at rest with envelope encryption and exposes a minimal, audited HTTP surface.",
    tags: ["Rust", "AWS KMS", "Terraform"],
    links: { github: "https://github.com" },
  },
  {
    id: 4,
    title: "PixelForge",
    date: "2023",
    description:
      "GPU-accelerated image processing pipeline. Parallelized filters and batch transforms with a tiny CLI front-end.",
    tags: ["C++", "CUDA", "CMake"],
    links: { github: "https://github.com" },
  },
  {
    id: 5,
    title: "Inkwell",
    date: "2023",
    description:
      "Markdown-first notebook with bidirectional links and instant search across thousands of notes.",
    tags: ["TypeScript", "SQLite", "Tauri"],
    links: { github: "https://github.com", demo: "https://example.com" },
  },
  {
    id: 6,
    title: "Beacon",
    date: "2022",
    description:
      "Self-hosted uptime monitor with SLA reports, multi-region probes, and alerting via webhooks.",
    tags: ["Python", "FastAPI", "Postgres"],
    links: { github: "https://github.com" },
  },
];

const TOP_IDS = [1, 2, 3];

export const TOP_3_PROJECTS = TOP_IDS.map((id) =>
  PROJECTS.find((project) => project.id === id),
).filter(Boolean);
