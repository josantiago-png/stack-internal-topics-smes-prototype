export type AdminTopic = {
  area: string;
  id: string;
  itemCount: number;
  name: string;
  smes: string[];
  source: string;
};

export type AdminSmeProfile = {
  name: string;
  photo: string;
  role: string;
};

type TopicFamily = {
  area: string;
  name: string;
  smes: string[];
  source: string;
};

const headshotBase = '/community-embed/Home%20-%20Stack%20Overflow%20Demo%20Site_files';

export const adminSmeProfiles: Record<string, AdminSmeProfile> = {
  'Alex Tran': {
    name: 'Alex Tran',
    photo: `${headshotBase}/e465b905-6b79-4804-ab7f-afe3f13d5559.png`,
    role: 'Product Operations Specialist',
  },
  'Avery Stone': {
    name: 'Avery Stone',
    photo: `${headshotBase}/86ea6b87-f4de-4ad3-b2bb-bfc5f16bb1a4.png`,
    role: 'Customer Support Lead',
  },
  'Ben Carter': {
    name: 'Ben Carter',
    photo: `${headshotBase}/mqCoA.jpg`,
    role: 'Finance Operations Lead',
  },
  'Chris Nguyen': {
    name: 'Chris Nguyen',
    photo: `${headshotBase}/mqCoA.jpg`,
    role: 'Support Engineer',
  },
  'Clara Gomez': {
    name: 'Clara Gomez',
    photo: `${headshotBase}/5cb5a105-d690-473f-8690-9310fc6a97e1.png`,
    role: 'Knowledge Systems Owner',
  },
  'Dev Patel': {
    name: 'Dev Patel',
    photo: `${headshotBase}/mqCoA.jpg`,
    role: 'Platform Engineer',
  },
  'Elliot Park': {
    name: 'Elliot Park',
    photo: `${headshotBase}/mqCoA.jpg`,
    role: 'Workplace Authentication Admin',
  },
  'Gina Moore': {
    name: 'Gina Moore',
    photo: `${headshotBase}/e465b905-6b79-4804-ab7f-afe3f13d5559.png`,
    role: 'Community Knowledge Lead',
  },
  'Harper Lee': {
    name: 'Harper Lee',
    photo: `${headshotBase}/86ea6b87-f4de-4ad3-b2bb-bfc5f16bb1a4.png`,
    role: 'Compliance Program Manager',
  },
  'Iris Morgan': {
    name: 'Iris Morgan',
    photo: `${headshotBase}/5cb5a105-d690-473f-8690-9310fc6a97e1.png`,
    role: 'Collaboration Platform Admin',
  },
  'Jon Bell': {
    name: 'Jon Bell',
    photo: `${headshotBase}/mqCoA.jpg`,
    role: 'IAM Operations Specialist',
  },
  'Jordan Blake': {
    name: 'Jordan Blake',
    photo: `${headshotBase}/86ea6b87-f4de-4ad3-b2bb-bfc5f16bb1a4.png`,
    role: 'Technical Program Manager',
  },
  'Lena Ortiz': {
    name: 'Lena Ortiz',
    photo: `${headshotBase}/5cb5a105-d690-473f-8690-9310fc6a97e1.png`,
    role: 'Responsible AI Program Lead',
  },
  'Marcus White': {
    name: 'Marcus White',
    photo: `${headshotBase}/mqCoA.jpg`,
    role: 'Support Operations Manager',
  },
  'Maya Chen': {
    name: 'Maya Chen',
    photo: `${headshotBase}/5cb5a105-d690-473f-8690-9310fc6a97e1.png`,
    role: 'Identity Systems Lead',
  },
  'Nadia Flores': {
    name: 'Nadia Flores',
    photo: `${headshotBase}/e465b905-6b79-4804-ab7f-afe3f13d5559.png`,
    role: 'People Systems Manager',
  },
  'Noah Kim': {
    name: 'Noah Kim',
    photo: `${headshotBase}/mqCoA.jpg`,
    role: 'Site Reliability Engineer',
  },
  'Owen Brooks': {
    name: 'Owen Brooks',
    photo: `${headshotBase}/86ea6b87-f4de-4ad3-b2bb-bfc5f16bb1a4.png`,
    role: 'Data Source Engineer',
  },
  'Priya Shah': {
    name: 'Priya Shah',
    photo: `${headshotBase}/5cb5a105-d690-473f-8690-9310fc6a97e1.png`,
    role: 'Access Governance Lead',
  },
  'Riley Adams': {
    name: 'Riley Adams',
    photo: `${headshotBase}/e465b905-6b79-4804-ab7f-afe3f13d5559.png`,
    role: 'Enterprise Success Manager',
  },
  'Sam Rivera': {
    name: 'Sam Rivera',
    photo: `${headshotBase}/86ea6b87-f4de-4ad3-b2bb-bfc5f16bb1a4.png`,
    role: 'Security Operations Lead',
  },
  'Sofia Ahmed': {
    name: 'Sofia Ahmed',
    photo: `${headshotBase}/5cb5a105-d690-473f-8690-9310fc6a97e1.png`,
    role: 'Enablement Lead',
  },
  'Tessa Grant': {
    name: 'Tessa Grant',
    photo: `${headshotBase}/5cb5a105-d690-473f-8690-9310fc6a97e1.png`,
    role: 'Solutions Consultant',
  },
  'Theo Martin': {
    name: 'Theo Martin',
    photo: `${headshotBase}/mqCoA.jpg`,
    role: 'AI Safety Reviewer',
  },
};

const topicFamilies: TopicFamily[] = [
  { area: 'Identity', name: 'Okta SAML sign-in', source: 'Google Docs', smes: ['Maya Chen', 'Elliot Park'] },
  { area: 'Identity', name: 'SCIM user provisioning', source: 'Google Docs', smes: ['Nadia Flores', 'Priya Shah'] },
  { area: 'Identity', name: 'Access request workflow', source: 'Slack', smes: ['Jon Bell', 'Priya Shah'] },
  { area: 'Identity', name: 'Role assignment policy', source: 'Stack Internal Community', smes: ['Harper Lee', 'Jon Bell'] },
  { area: 'Identity', name: 'Contractor offboarding', source: 'Google Docs', smes: ['Maya Chen', 'Sam Rivera'] },
  { area: 'Data sources', name: 'Google Drive folder selection', source: 'Google Docs', smes: ['Clara Gomez', 'Owen Brooks'] },
  { area: 'Data sources', name: 'Slack channel ingestion', source: 'Slack', smes: ['Iris Morgan', 'Dev Patel'] },
  { area: 'Data sources', name: 'Community content indexing', source: 'Stack Internal Community', smes: ['Gina Moore', 'Clara Gomez'] },
  { area: 'Data sources', name: 'Connector health checks', source: 'Slack', smes: ['Owen Brooks', 'Dev Patel'] },
  { area: 'Data sources', name: 'Source citation quality', source: 'Google Docs', smes: ['Gina Moore', 'Maya Chen'] },
  { area: 'AI governance', name: 'Answer trust scoring', source: 'Stack Internal Community', smes: ['Lena Ortiz', 'Theo Martin'] },
  { area: 'AI governance', name: 'Prompt safety review', source: 'Google Docs', smes: ['Theo Martin', 'Priya Shah'] },
  { area: 'AI governance', name: 'PII redaction policy', source: 'Google Docs', smes: ['Sam Rivera', 'Lena Ortiz'] },
  { area: 'AI governance', name: 'Citation enforcement', source: 'Stack Internal Community', smes: ['Gina Moore', 'Theo Martin'] },
  { area: 'AI governance', name: 'Workspace audit controls', source: 'Google Docs', smes: ['Harper Lee', 'Sam Rivera'] },
  { area: 'Support', name: 'Tier 2 escalation', source: 'Slack', smes: ['Marcus White', 'Avery Stone'] },
  { area: 'Support', name: 'Customer incident intake', source: 'Slack', smes: ['Avery Stone', 'Dev Patel'] },
  { area: 'Support', name: 'Knowledge article review', source: 'Stack Internal Community', smes: ['Marcus White', 'Gina Moore'] },
  { area: 'Support', name: 'Bug triage handoff', source: 'Slack', smes: ['Dev Patel', 'Owen Brooks'] },
  { area: 'Support', name: 'Release support readiness', source: 'Google Docs', smes: ['Avery Stone', 'Clara Gomez'] },
  { area: 'Engineering', name: 'API key rotation', source: 'Google Docs', smes: ['Noah Kim', 'Dev Patel'] },
  { area: 'Engineering', name: 'Service ownership', source: 'Stack Internal Community', smes: ['Noah Kim', 'Owen Brooks'] },
  { area: 'Engineering', name: 'Deployment rollback', source: 'Slack', smes: ['Dev Patel', 'Noah Kim'] },
  { area: 'Engineering', name: 'Environment variables', source: 'Google Docs', smes: ['Owen Brooks', 'Noah Kim'] },
  { area: 'Engineering', name: 'Observability alerts', source: 'Slack', smes: ['Dev Patel', 'Marcus White'] },
  { area: 'Sales', name: 'Enterprise pilot setup', source: 'Google Docs', smes: ['Riley Adams', 'Tessa Grant'] },
  { area: 'Sales', name: 'Security questionnaire answers', source: 'Stack Internal Community', smes: ['Tessa Grant', 'Sam Rivera'] },
  { area: 'Sales', name: 'Procurement approvals', source: 'Slack', smes: ['Riley Adams', 'Harper Lee'] },
  { area: 'Sales', name: 'Customer workspace launch', source: 'Google Docs', smes: ['Tessa Grant', 'Clara Gomez'] },
  { area: 'Sales', name: 'Renewal risk signals', source: 'Slack', smes: ['Riley Adams', 'Avery Stone'] },
  { area: 'People', name: 'New hire onboarding', source: 'Google Docs', smes: ['Nadia Flores', 'Iris Morgan'] },
  { area: 'People', name: 'Team access templates', source: 'Stack Internal Community', smes: ['Nadia Flores', 'Jon Bell'] },
  { area: 'People', name: 'Manager enablement', source: 'Google Docs', smes: ['Iris Morgan', 'Harper Lee'] },
  { area: 'People', name: 'Employee lifecycle events', source: 'Slack', smes: ['Nadia Flores', 'Maya Chen'] },
  { area: 'People', name: 'Training completion', source: 'Google Docs', smes: ['Iris Morgan', 'Theo Martin'] },
  { area: 'Finance', name: 'Cost allocation', source: 'Google Docs', smes: ['Ben Carter', 'Harper Lee'] },
  { area: 'Finance', name: 'Usage-based billing', source: 'Stack Internal Community', smes: ['Ben Carter', 'Riley Adams'] },
  { area: 'Finance', name: 'Vendor review cadence', source: 'Google Docs', smes: ['Ben Carter', 'Sam Rivera'] },
  { area: 'Finance', name: 'Budget approval paths', source: 'Slack', smes: ['Ben Carter', 'Tessa Grant'] },
  { area: 'Finance', name: 'Invoice exception handling', source: 'Slack', smes: ['Ben Carter', 'Marcus White'] },
  { area: 'Security', name: 'Admin permission review', source: 'Google Docs', smes: ['Sam Rivera', 'Harper Lee'] },
  { area: 'Security', name: 'Sensitive channel policy', source: 'Slack', smes: ['Sam Rivera', 'Iris Morgan'] },
  { area: 'Security', name: 'Data retention rules', source: 'Google Docs', smes: ['Sam Rivera', 'Theo Martin'] },
  { area: 'Security', name: 'Incident response contacts', source: 'Slack', smes: ['Sam Rivera', 'Avery Stone'] },
  { area: 'Security', name: 'Compliance evidence library', source: 'Stack Internal Community', smes: ['Sam Rivera', 'Gina Moore'] },
];

const topicVariants = [
  'setup',
  'troubleshooting',
  'rollout',
  'runbook',
  'FAQ',
  'metrics',
  'governance',
  'audit review',
  'escalation',
  'owner handoff',
];

const smeNames = Object.keys(adminSmeProfiles);
const smeCountPattern = [2, 4, 1, 3, 2, 5, 0, 3, 2, 4];

const getTopicSmes = (family: TopicFamily, familyIndex: number, variantIndex: number) => {
  const count = smeCountPattern[(familyIndex + variantIndex) % smeCountPattern.length];

  if (count === 0) {
    return [];
  }

  const smes = [...family.smes];
  const offset = (familyIndex * 5 + variantIndex * 3) % smeNames.length;

  for (let index = 0; smes.length < count && index < smeNames.length; index += 1) {
    const candidate = smeNames[(offset + index) % smeNames.length];

    if (!smes.includes(candidate)) {
      smes.push(candidate);
    }
  }

  return smes.slice(0, count);
};

export const adminTopics: AdminTopic[] = topicFamilies.flatMap((family, familyIndex) =>
  topicVariants.map((variant, variantIndex) => ({
    area: family.area,
    id: `topic-${familyIndex + 1}-${variantIndex + 1}`,
    itemCount: 18 + ((familyIndex * 13 + variantIndex * 7) % 114),
    name: `${family.name} ${variant}`,
    smes: getTopicSmes(family, familyIndex, variantIndex),
    source: family.source,
  }))
);
