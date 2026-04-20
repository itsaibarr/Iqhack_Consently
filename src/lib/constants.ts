export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type ConsentStatus = "ACTIVE" | "REVOKED";

export const RISK_CONFIG_MAP = {
  HIGH: { color: "#F44336", label: "High Risk" },
  MEDIUM: { color: "#FFC107", label: "Medium Risk" },
  LOW: { color: "#00FF88", label: "Low Risk" },
};

export interface CompanyRecord {
  id: string;
  name: string;
  category: "EDUCATION" | "GOVERNMENT" | "FINANCIAL" | "CONSUMER" | "HEALTH";
  risk: RiskLevel;
  status: ConsentStatus;
  dataTypes: { name: string; category: "PII" | "HEALTH" | "FINANCIAL" | "DIGITAL" | "SOCIAL" }[];
  sharedWith: string[];
  connectedAt: string;
  description: string;
  logoUid: string;
}

export const MOCK_COMPANIES: CompanyRecord[] = [
  {
    id: "1",
    name: "Canvas University LMS",
    category: "EDUCATION",
    risk: "HIGH",
    status: "ACTIVE",
    dataTypes: [
      { name: "grades", category: "PII" },
      { name: "activity_log", category: "DIGITAL" },
      { name: "device_id", category: "DIGITAL" }
    ],
    sharedWith: ["Anthology Analytics", "Ministry of Science & Higher Education"],
    connectedAt: "2023-09-12",
    description: "Accesses academic performance data and behavioral logs for institutional reporting.",
    logoUid: "canvas"
  },
  {
    id: "2",
    name: "Kaspi Bank",
    category: "FINANCIAL",
    risk: "MEDIUM",
    status: "ACTIVE",
    dataTypes: [
      { name: "location", category: "DIGITAL" },
      { name: "payment_history", category: "FINANCIAL" }
    ],
    sharedWith: ["Retail Partners"],
    connectedAt: "2024-01-15",
    description: "Required for processing payments and location-based fraud detection.",
    logoUid: "kaspi"
  },
  {
    id: "3",
    name: "eGov Kazakhstan",
    category: "GOVERNMENT",
    risk: "HIGH",
    status: "ACTIVE",
    dataTypes: [
      { name: "national_id", category: "PII" },
      { name: "digital_signature", category: "PII" },
      { name: "household_data", category: "SOCIAL" }
    ],
    sharedWith: ["Ministry of Interior", "Ministry of Justice"],
    connectedAt: "2022-11-20",
    description: "Centralized government access for civic services and digital documentation.",
    logoUid: "egov"
  },
  {
    id: "4",
    name: "Glovo",
    category: "CONSUMER",
    risk: "MEDIUM",
    status: "ACTIVE",
    dataTypes: [
      { name: "delivery_address", category: "PII" },
      { name: "phone_number", category: "PII" }
    ],
    sharedWith: ["Fleet Management", "Marketing Agencies"],
    connectedAt: "2024-02-10",
    description: "Used for logistics and promotional communications.",
    logoUid: "glovo"
  }
];

export interface ActivityRecord {
  id: string;
  companyName: string;
  action: "GRANTED" | "REVOKED" | "UPDATED";
  timestamp: string;
  dataTypes: string[];
}

export const MOCK_HISTORY: ActivityRecord[] = [
  {
    id: "h1",
    companyName: "Kaspi Bank",
    action: "GRANTED",
    timestamp: "2024-01-15 14:22",
    dataTypes: ["payment_history", "location"]
  },
  {
    id: "h2",
    companyName: "Canvas University LMS",
    action: "UPDATED",
    timestamp: "2023-11-30 09:15",
    dataTypes: ["activity_log"]
  },
  {
    id: "h3",
    companyName: "FoodDash",
    action: "REVOKED",
    timestamp: "2023-10-05 18:45",
    dataTypes: ["location", "contacts"]
  }
];
