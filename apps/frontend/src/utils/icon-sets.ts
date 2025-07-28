import { AuditType } from "@/types/manage";
import {
    AppWindow,
    Calendar,
    Circle,
    Clock,
    FileText,
    Image,
    LucideIcon,
    Mail,
    MonitorSmartphone,
    Network,
    Pencil,
    Phone,
    Printer,
    Router,
    Server,
    Shield,
    Tablet,
    Tag,
    ThumbsUp,
    User,
    UserCircle,
    UtilityPole,
} from "lucide-react";

interface AuditTrailIcon { type: AuditType; subType?: string; icon: LucideIcon }

export const auditTrailIcons: AuditTrailIcon[] = [
    {
        type: "Record",
        subType: "Created",
        icon: User,
    },
    {
        type: "Resource",
        subType: "Record",
        icon: Calendar,
    },
    {
        type: "Tickets",
        subType: "Status",
        icon: Circle,
    },
    {
        type: "Tickets",
        subType: "Team",
        icon: Shield,
    },
    {
        type: "Tickets",
        subType: "Type",
        icon: Tag,
    },
    {
        type: "Company",
        subType: "Contact",
        icon: User,
    },
    {
        type: "Company",
        subType: "Email",
        icon: Mail,
    },
    {
        type: "Company",
        subType: "Phone",
        icon: Phone,
    },
    {
        type: "Resource",
        subType: "Owner",
        icon: UserCircle,
    },
    {
        type: "Resource",
        subType: "Acknowledged",
        icon: ThumbsUp,
    },
    {
        type: "Notes",
        icon: Pencil,
    },
    {
        type: "SLA",
        icon: Clock,
    },
];

export const configurationIcons: {
    type: string;
    icon: LucideIcon;
}[] = [
    { type: "Server", icon: Server },
    { type: "Application", icon: AppWindow },
    { type: "Diagram", icon: Image },
    { type: "Mobile", icon: Phone },
    { type: "Tablet", icon: Tablet },
    { type: "Network", icon: Network },
    { type: "Network - Router/Firewall", icon: Network },
    { type: "Printer/MFP", icon: Printer },
    { type: "Router", icon: Router },
    { type: "Workstation", icon: MonitorSmartphone },
    { type: "Application - Line of Business ", icon: AppWindow },
    { type: "Utility Account", icon: UtilityPole },
];

export const pinnedIcons: Record<string, LucideIcon> = {
    "proposals": FileText,
    "tickets": Tag,
};
