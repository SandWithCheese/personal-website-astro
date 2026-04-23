export const EXPERIENCES = [
  {
    id: 20,
    role: "Cryptography Assistant",
    company: "Institut Teknologi Bandung",
    period: "Feb 2026 — Present",
    description: "Teaching and guiding students in applied cryptography.",
  },
  {
    id: 19,
    role: "Automata & Formal Languages Assistant",
    company: "Institut Teknologi Bandung",
    period: "Feb 2026 — Present",
    description:
      "Supporting instruction in automata theory and formal languages.",
  },
  {
    id: 18,
    role: "Vice Head of Advocacy Department",
    company: "HMIF ITB",
    period: "Jun 2025 — Present",
    description: "Leading advocacy efforts and representing student interests.",
  },
  {
    id: 17,
    role: "Staff of Competition and Community",
    company: "HMIF ITB",
    period: "Jul 2024 — Jun 2025",
    description:
      "Designing CTF challenges and contributing to community programs.",
  },
  {
    id: 16,
    role: "Frontend Web Developer",
    company: "HMIF ITB",
    period: "Mar 2024 — Aug 2024",
    description:
      "Building the HMIF Super App with a focus on usability and performance.",
  },
  {
    id: 15,
    role: "Internship Staff of Competition and Community",
    company: "HMIF ITB",
    period: "Oct 2023 — Jul 2024",
    description:
      "Creating cryptography and reverse engineering CTF challenges.",
  },
  {
    id: 14,
    role: "Backend Lead",
    company: "ARKAVIDIA",
    period: "Oct 2025 — Jan 2026",
    description: "Leading backend development and delivering scalable APIs.",
  },
  {
    id: 13,
    role: "Quality Assurance Engineer",
    company: "PT Noxt Teknologi Indonesia",
    period: "Aug 2025 — Dec 2025",
    description: "Ensuring product quality through testing and validation.",
  },
  {
    id: 12,
    role: "Quality Assurance Engineer (Part-time)",
    company: "PT Noxt Teknologi Indonesia",
    period: "Apr 2025 — Jul 2025",
    description: "Supporting QA processes to maintain product reliability.",
  },
  {
    id: 11,
    role: "Website Director",
    company: "OSKM ITB 2025",
    period: "Jun 2025 — Sep 2025",
    description:
      "Leading full-stack development of a large-scale event website.",
  },
  {
    id: 10,
    role: "Discrete Mathematics Assistant",
    company: "Institut Teknologi Bandung",
    period: "Jan 2025 — Jun 2025",
    description:
      "Assisting instruction and assessment in discrete mathematics.",
  },
  {
    id: 9,
    role: "Linear Algebra Assistant",
    company: "Institut Teknologi Bandung",
    period: "Sep 2024 — Dec 2024",
    description: "Supporting coursework and evaluation in linear algebra.",
  },
  {
    id: 8,
    role: "Vice Website Director",
    company: "OSKM ITB 2024",
    period: "Jun 2024 — Sep 2024",
    description: "Co-leading development of a large-scale event website.",
  },
  {
    id: 7,
    role: "Practicum Assistant (Introduction to Computation)",
    company: "Comlabs USDI ITB",
    period: "Sep 2023 — Jun 2024",
    description: "Mentoring students in Python-based computation labs.",
  },
  {
    id: 6,
    role: "Frontend Web Developer",
    company: "ITB Fair 2024",
    period: "Feb 2024 — Mar 2024",
    description: "Developing frontend components for the event website.",
  },
  {
    id: 5,
    role: "Frontend Web Developer",
    company: "TEDxITB",
    period: "Oct 2023 — Mar 2024",
    description: "Building web interfaces for TEDxITB 7.0.",
  },
  {
    id: 4,
    role: "Member",
    company: "Google Developer Student Club ITB",
    period: "Nov 2022 — Jul 2023",
    description: "Exploring data analysis and machine learning technologies.",
  },
  {
    id: 3,
    role: "IT Division Staff",
    company: "Parade Wisuda ITB",
    period: "Sep 2022 — Nov 2022",
    description: "Developing web content for an institutional event.",
  },
  {
    id: 2,
    role: "Science Olympiad Mentor",
    company: "SMP Negeri 255 Jakarta",
    period: "May 2022 — Jun 2022",
    description: "Mentoring students for science olympiad competitions.",
  },
  {
    id: 1,
    role: "Head of Audio Division",
    company: "Teksound",
    period: "Sep 2020 — Oct 2021",
    description: "Leading audio production for podcasts and radio shows.",
  },
];

const TOP_IDS = [14, 13, 11];

export const TOP_3_EXPERIENCES = TOP_IDS.map((id) =>
  EXPERIENCES.find((exp) => exp.id === id),
).filter(Boolean);
