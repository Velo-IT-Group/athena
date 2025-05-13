import type { Database as DB } from "@/types/supabase.d.ts";

declare global {
    type Database = DB;

    type Conversation = Database["reporting"]["Tables"]["conversations"]["Row"];
    type Profile = Database["public"]["Tables"]["profiles"]["Row"];
    type ProfileKey = Database["public"]["Tables"]["profile_keys"]["Row"];
    type View = Database["user_experience"]["Tables"]["views"]["Row"];

    type NestedEngagement = Engagement & {
        reservations: EngagementReservation[];
    };

    type Engagement = DB["reporting"]["Tables"]["engagements"]["Row"];
    type EngagementInsert = DB["reporting"]["Tables"]["engagements"]["Insert"];
    type EngagementUpdate = DB["reporting"]["Tables"]["engagements"]["Update"];

    type EngagementReservation =
        DB["reporting"]["Tables"]["engagement_reservations"]["Row"];
    type EngagementReservationInsert =
        DB["reporting"]["Tables"]["engagement_reservations"]["Insert"];
    type EngagementReservationUpdate =
        DB["reporting"]["Tables"]["engagement_notes"]["Update"];

    type Integration = DB["public"]["Tables"]["integrations"]["Row"];

    type Organization = DB["public"]["Tables"]["organizations"]["Row"];
    type OrganizationUpdate = DB["public"]["Tables"]["organizations"]["Update"];
    type OrganizationInsert = DB["public"]["Tables"]["organizations"]["Insert"];
    type OrganizationIntegrationInsert =
        DB["public"]["Tables"]["organization_integrations"]["Insert"];
    type OrganizationIntegrationUpdate =
        DB["public"]["Tables"]["organization_integrations"]["Update"];
    type OrganizationIntegration =
        DB["public"]["Tables"]["organization_integrations"]["Row"];

    type Member = DB["public"]["Tables"]["profiles"]["Row"];

    type ProposalTotals = DB["public"]["Views"]["proposal_totals"]["Row"];

    type ProposalSettings = DB["public"]["Tables"]["proposal_settings"]["Row"];
    type ProposalSettingsUpdate =
        DB["public"]["Tables"]["proposal_settings"]["Update"];
    type ProposalSettingsInsert =
        DB["public"]["Tables"]["proposal_settings"]["Insert"];

    type Phase = DB["public"]["Tables"]["phases"]["Row"];
    type PhaseInsert = DB["public"]["Tables"]["phases"]["Insert"];
    type PhaseUpdate = DB["public"]["Tables"]["phases"]["Update"];

    type PinnedItem = DB["public"]["Tables"]["pinned_items"]["Row"];
    type PinnedItemInsert = DB["public"]["Tables"]["pinned_items"]["Insert"];
    type PinnedItemUpdate = DB["public"]["Tables"]["pinned_items"]["Update"];

    type Product = DB["public"]["Tables"]["products"]["Row"];
    type ProductInsert = DB["public"]["Tables"]["products"]["Insert"];
    type ProductUpdate = DB["public"]["Tables"]["products"]["Update"];
    type NestedProduct = Product & { products?: Product[] };

    type Profile = DB["public"]["Tables"]["profiles"]["Row"];

    type Proposal = DB["public"]["Tables"]["proposals"]["Row"];
    type ProposalUpdate = DB["public"]["Tables"]["proposals"]["Update"];
    type ProposalInsert = DB["public"]["Tables"]["proposals"]["Insert"];

    type Section = DB["public"]["Tables"]["sections"]["Row"];
    type SectionInsert = DB["public"]["Tables"]["sections"]["Insert"];
    type SectionUpdate = DB["public"]["Tables"]["sections"]["Update"];

    type Task = DB["public"]["Tables"]["tasks"]["Row"];
    type TaskInsert = DB["public"]["Tables"]["tasks"]["Insert"];
    type TaskUpdate = DB["public"]["Tables"]["tasks"]["Update"];

    type Ticket = DB["public"]["Tables"]["tickets"]["Row"];
    type TicketInsert = DB["public"]["Tables"]["tickets"]["Insert"];
    type TicketUpdate = DB["public"]["Tables"]["tickets"]["Insert"];

    type Version = DB["public"]["Tables"]["versions"]["Row"];
    type VersionInsert = DB["public"]["Tables"]["versions"]["Insert"];
    type VersionUpdate = DB["public"]["Tables"]["versions"]["Update"];

    type StatusEnum = DB["public"]["Enums"]["status"];

    type NestedProposal = Proposal & {
        working_version?: Version & {
            products: NestedProduct[];
            sections: Array<Section & { products: NestedProduct[] }>;
            phases: NestedPhase[];
        };
        phases?: Array<NestedPhase>;
        products?: NestedProduct[];
        sections?: Array<Section & { products?: NestedProduct[] }>;
    };
    type NestedProduct = Phase & {
        tickets?: Array<Ticket & { tasks?: Task[] }>;
    };
    type NestedTicket = Ticket & { tasks?: Task[] };
    type NestedPhase = Phase & { tickets?: NestedTicket[] };
    type NestedSection = Section & { products?: NestedProduct[] };
}
