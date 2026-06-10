import type { Question } from '$lib/types';

/**
 * Mock questions data extracted from Questions.html
 */
export const questions: Question[] = [
  {
    id: 79833316,
    title: "Cannot read properties",
    url: "/questions/79833316/cannot-read-properties",
    excerpt: "Ocorreu um erro. Cannot read properties of null (reading 'endpoints') Hello, I'm having this error that appears in the section of my WordPress Widget. I've tried everything I could. I deactivated ...",
    votes: 0,
    answers: 0,
    views: 7,
    tags: [
      { name: "wordpress", url: "/questions/tagged/wordpress" }
    ],
    author: {
      id: 6268989,
      name: "Márcio de Barros",
      avatar: "https://picsum.photos/seed/6268989/64",
      profileUrl: "/users/6268989/marcio-de-barros",
      reputation: 1
    },
    askedAt: "2025-11-29T14:40:27Z",
    askedAtRelative: "4 mins ago"
  },
  {
    id: 79833264,
    title: "Build Error in ReactPress - error TS6053: File 'src/*.ts' not found",
    url: "/questions/79833264/build-error-in-reactpress",
    excerpt: "ReactPress:https://github.com/fecommunity/reactpress Description: I'm encountering an error when trying to run pnpm run dev in my ReactPress project (version 1.6.0). The build process fails during the ...",
    votes: 0,
    answers: 0,
    views: 12,
    tags: [
      { name: "reactjs", url: "/questions/tagged/reactjs" },
      { name: "next.js", url: "/questions/tagged/next.js" },
      { name: "nestjs", url: "/questions/tagged/nestjs" }
    ],
    author: {
      id: 28262342,
      name: "react",
      avatar: "https://picsum.photos/seed/28262342/64",
      profileUrl: "/users/28262342/react",
      reputation: 1
    },
    askedAt: "2025-11-29T13:00:30Z",
    askedAtRelative: "1 hour ago"
  },
  {
    id: 79833313,
    title: "How to implement custom authentication in Next.js 14 App Router",
    url: "/questions/79833313/how-to-implement-custom-authentication",
    excerpt: "I'm building a Next.js 14 application with App Router and need to implement custom authentication. I've looked at NextAuth.js but need more control over the authentication flow...",
    votes: 3,
    answers: 1,
    views: 45,
    tags: [
      { name: "next.js", url: "/questions/tagged/next.js" },
      { name: "authentication", url: "/questions/tagged/authentication" },
      { name: "typescript", url: "/questions/tagged/typescript" }
    ],
    author: {
      id: 12345678,
      name: "DevUser123",
      avatar: "https://picsum.photos/seed/12345678/64",
      profileUrl: "/users/12345678/devuser123",
      reputation: 256,
      bronze: 5
    },
    askedAt: "2025-11-29T14:30:00Z",
    askedAtRelative: "14 mins ago"
  },
  {
    id: 79833309,
    title: "Python pandas DataFrame merge performance issues with large datasets",
    url: "/questions/79833309/python-pandas-dataframe-merge-performance",
    excerpt: "I'm working with two large DataFrames (10M+ rows each) and experiencing severe performance issues when trying to merge them. The merge operation takes over 30 minutes...",
    votes: 5,
    answers: 2,
    views: 89,
    tags: [
      { name: "python", url: "/questions/tagged/python" },
      { name: "pandas", url: "/questions/tagged/pandas" },
      { name: "performance", url: "/questions/tagged/performance" }
    ],
    author: {
      id: 87654321,
      name: "DataScientist42",
      avatar: "https://picsum.photos/seed/87654321/64",
      profileUrl: "/users/87654321/datascientist42",
      reputation: 1543,
      silver: 2,
      bronze: 12
    },
    askedAt: "2025-11-29T14:25:00Z",
    askedAtRelative: "19 mins ago",
    acceptedAnswer: true
  },
  {
    id: 79833307,
    title: "Docker container fails to start with 'exec format error'",
    url: "/questions/79833307/docker-container-fails-exec-format-error",
    excerpt: "I'm trying to run a Docker container on my M1 Mac but getting 'exec format error'. The image was built on an x86 Linux machine. How can I resolve this architecture mismatch?",
    votes: 2,
    answers: 1,
    views: 34,
    tags: [
      { name: "docker", url: "/questions/tagged/docker" },
      { name: "arm64", url: "/questions/tagged/arm64" },
      { name: "macos", url: "/questions/tagged/macos" }
    ],
    author: {
      id: 11223344,
      name: "ContainerDev",
      avatar: "https://picsum.photos/seed/11223344/64",
      profileUrl: "/users/11223344/containerdev",
      reputation: 892
    },
    askedAt: "2025-11-29T14:20:00Z",
    askedAtRelative: "24 mins ago"
  },
  {
    id: 79833306,
    title: "React useEffect cleanup function not working as expected",
    url: "/questions/79833306/react-useeffect-cleanup-not-working",
    excerpt: "My useEffect cleanup function doesn't seem to be running when the component unmounts. I'm trying to cancel an ongoing API request but the request continues even after navigation...",
    votes: 1,
    answers: 0,
    views: 23,
    tags: [
      { name: "reactjs", url: "/questions/tagged/reactjs" },
      { name: "react-hooks", url: "/questions/tagged/react-hooks" },
      { name: "useeffect", url: "/questions/tagged/useeffect" }
    ],
    author: {
      id: 55667788,
      name: "ReactLearner",
      avatar: "https://picsum.photos/seed/55667788/64",
      profileUrl: "/users/55667788/reactlearner",
      reputation: 45
    },
    askedAt: "2025-11-29T14:15:00Z",
    askedAtRelative: "29 mins ago"
  },
  {
    id: 79832692,
    title: "SQL query optimization for complex JOIN with multiple conditions",
    url: "/questions/79832692/sql-query-optimization-complex-join",
    excerpt: "I have a SQL query with multiple JOINs that's running very slowly (15+ seconds). The tables involved have proper indexes but the query planner seems to be choosing a suboptimal plan...",
    votes: 8,
    answers: 3,
    views: 156,
    tags: [
      { name: "sql", url: "/questions/tagged/sql" },
      { name: "postgresql", url: "/questions/tagged/postgresql" },
      { name: "query-optimization", url: "/questions/tagged/query-optimization" }
    ],
    author: {
      id: 99887766,
      name: "SQLExpert",
      avatar: "https://picsum.photos/seed/99887766/64",
      profileUrl: "/users/99887766/sqlexpert",
      reputation: 4521,
      gold: 1,
      silver: 8,
      bronze: 23
    },
    askedAt: "2025-11-29T12:00:00Z",
    askedAtRelative: "2 hours ago",
    acceptedAnswer: true
  },
  {
    id: 79833303,
    title: "TypeScript generic constraint with conditional types",
    url: "/questions/79833303/typescript-generic-constraint-conditional",
    excerpt: "I'm trying to create a generic function that accepts different parameter types based on a conditional type. The TypeScript compiler is giving me errors about incompatible types...",
    votes: 4,
    answers: 1,
    views: 67,
    tags: [
      { name: "typescript", url: "/questions/tagged/typescript" },
      { name: "generics", url: "/questions/tagged/generics" },
      { name: "conditional-types", url: "/questions/tagged/conditional-types" }
    ],
    author: {
      id: 44556677,
      name: "TypeScriptFan",
      avatar: "https://picsum.photos/seed/44556677/64",
      profileUrl: "/users/44556677/typescriptfan",
      reputation: 2134,
      silver: 5,
      bronze: 15
    },
    askedAt: "2025-11-29T14:10:00Z",
    askedAtRelative: "34 mins ago"
  },
  {
    id: 79833301,
    title: "Kubernetes pod stuck in CrashLoopBackOff state",
    url: "/questions/79833301/kubernetes-pod-crashloopbackoff",
    excerpt: "My Kubernetes pod keeps crashing and restarting. The logs show an error about missing environment variables, but I've already defined them in my ConfigMap. What could be causing this?",
    votes: 2,
    answers: 2,
    views: 41,
    tags: [
      { name: "kubernetes", url: "/questions/tagged/kubernetes" },
      { name: "docker", url: "/questions/tagged/docker" },
      { name: "devops", url: "/questions/tagged/devops" }
    ],
    author: {
      id: 33445566,
      name: "K8sAdmin",
      avatar: "https://picsum.photos/seed/33445566/64",
      profileUrl: "/users/33445566/k8sadmin",
      reputation: 789
    },
    askedAt: "2025-11-29T14:05:00Z",
    askedAtRelative: "39 mins ago"
  },
  {
    id: 79833312,
    title: "CSS Grid layout not working correctly in Safari",
    url: "/questions/79833312/css-grid-layout-safari-issue",
    excerpt: "My CSS Grid layout works perfectly in Chrome and Firefox but breaks in Safari. Some grid items are overlapping and the gap property seems to be ignored. How can I fix this cross-browser issue?",
    votes: 1,
    answers: 0,
    views: 18,
    tags: [
      { name: "css", url: "/questions/tagged/css" },
      { name: "css-grid", url: "/questions/tagged/css-grid" },
      { name: "safari", url: "/questions/tagged/safari" }
    ],
    author: {
      id: 22334455,
      name: "CSSWizard",
      avatar: "https://picsum.photos/seed/22334455/64",
      profileUrl: "/users/22334455/csswizard",
      reputation: 334
    },
    askedAt: "2025-11-29T14:35:00Z",
    askedAtRelative: "9 mins ago"
  },
  {
    id: 79833300,
    title: "Git merge conflict resolution best practices",
    url: "/questions/79833300/git-merge-conflict-best-practices",
    excerpt: "Our team frequently encounters merge conflicts when working on the same files. What are the best practices for preventing and resolving merge conflicts efficiently in a large team?",
    votes: 12,
    answers: 4,
    views: 234,
    tags: [
      { name: "git", url: "/questions/tagged/git" },
      { name: "version-control", url: "/questions/tagged/version-control" },
      { name: "merge-conflict", url: "/questions/tagged/merge-conflict" }
    ],
    author: {
      id: 11112222,
      name: "GitMaster",
      avatar: "https://picsum.photos/seed/11112222/64",
      profileUrl: "/users/11112222/gitmaster",
      reputation: 5678,
      gold: 2,
      silver: 15,
      bronze: 42
    },
    askedAt: "2025-11-29T14:00:00Z",
    askedAtRelative: "44 mins ago",
    acceptedAnswer: true
  },
  {
    id: 79833202,
    title: "Github repository troubleshoot [closed]",
    url: "/questions/79833202/github-repository-troubleshoot",
    excerpt: "I have made an HTML page live, but it is not showing in the given link. Rather, it displays the repository name. What do you think I have done wrong & how should I solve it?",
    votes: -6,
    answers: 0,
    views: 22,
    tags: [
      { name: "github", url: "/questions/tagged/github" }
    ],
    author: {
      id: 31764671,
      name: "Avishpa Mukherjee",
      avatar: "https://picsum.photos/seed/31764671/64",
      profileUrl: "/users/31764671/avishpa-mukherjee",
      reputation: 1
    },
    askedAt: "2025-11-29T11:32:35Z",
    askedAtRelative: "3 hours ago",
    state: 'closed' as const
  }
];

/**
 * Total count of questions (for pagination)
 */
export const totalQuestions = 24789523;

/**
 * Questions per page
 */
export const questionsPerPage = 50;

/**
 * Calculate total pages
 */
export const totalPages = Math.ceil(totalQuestions / questionsPerPage);

