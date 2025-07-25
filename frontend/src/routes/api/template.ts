import { createServerFileRoute } from "@tanstack/react-start/server"
import { getTemplates } from "@/lib/manage/read";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/lib/utils";
import type { ProjectTemplate, ProjectWorkPlan } from "@/types/manage";
import { baseHeaders } from "@/utils/manage/params";
import { json } from "@tanstack/react-start";

export const ServerRoute = createServerFileRoute("/api/template").methods({
    GET: async ({ request, params }) => {
        const projectTemplateResponse = await fetch(
            `${env
                .VITE_CONNECT_WISE_URL!}/project/projectTemplates`,
            {
                headers: baseHeaders,
            },
        );

        if (!projectTemplateResponse.ok) {
            console.error(projectTemplateResponse.statusText);
            throw Error(
                "Error fetching project templates... " +
                    projectTemplateResponse.statusText,
                {
                    cause: projectTemplateResponse.statusText,
                },
            );
        }

        const templates: ProjectTemplate[] = await projectTemplateResponse
            .json();

        const workplansResponse = await Promise.all(
            templates.map(({ id }) =>
                fetch(
                    `${env
                        .VITE_CONNECT_WISE_URL!}/project/projectTemplates/${id}/workplan`,
                    {
                        // next: {
                        // 	revalidate: 21600,
                        // 	tags: ['workplans'],
                        // },
                        headers: baseHeaders,
                    },
                )
            ),
        );

        const workplans: ProjectWorkPlan[] = await Promise.all(
            workplansResponse.map((r) => r.json()),
        );

        const fullTemplates: ProjectTemplate[] = templates.map((template) => {
            return {
                ...template,
                workplan: workplans.find((workplan) =>
                    workplan.templateId === template.id
                ),
            };
        });

        const supabase = createClient();

        const templateData = await Promise.all(
            fullTemplates.map(async (template) => {
                const { data: templateData, error } = await supabase
                    .from("proposal_templates")
                    .insert({
                        name: template.name,
                        description: template.description,
                    })
                    .select();

                console.log(templateData, error);

                if (template.workplan) {
                    await Promise.all(
                        template.workplan?.phases.map(async (phase) => {
                            const { data: phaseData, error: phaseError } =
                                await supabase
                                    .from("phase_templates")
                                    .insert({
                                        description: phase.description,
                                        order: parseInt(phase.wbsCode),
                                        template_id: templateData?.[0].id ?? "",
                                        bill_phase_separately:
                                            phase.billPhaseSeparately,
                                        mark_as_milestone_flag:
                                            phase.markAsMilestoneFlag,
                                    })
                                    .select();

                            console.log("phaseData", phaseData, phaseError);

                            if (phase.tickets) {
                                await Promise.all(
                                    phase.tickets.map(async (ticket, index) => {
                                        const {
                                            data: ticketData,
                                            error: ticketError,
                                        } = await supabase
                                            .from(
                                                "ticket_templates",
                                            )
                                            .insert({
                                                summary: ticket.summary,
                                                description: ticket.description,
                                                budgetHours: ticket.budgetHours,
                                                order: ticket.wbsCode
                                                    ? parseInt(
                                                        ticket.wbsCode
                                                            .split(
                                                                ".",
                                                            )[0],
                                                    )
                                                    : index,
                                                phase_id: phaseData?.[0].id ??
                                                    "",
                                            }).select();

                                        console.log(ticketData, ticketError);

                                        if (ticket.tasks) {
                                            await Promise.all(
                                                ticket.tasks.map(
                                                    async (task) => {
                                                        const {
                                                            data: taskData,
                                                            error: taskError,
                                                        } = await supabase
                                                            .from(
                                                                "task_templates",
                                                            )
                                                            .insert({
                                                                summary:
                                                                    task.summary ??
                                                                        "",
                                                                notes:
                                                                    task.notes ??
                                                                        "",
                                                                priority:
                                                                    task.priority ??
                                                                        0,
                                                                ticket_id:
                                                                    ticketData
                                                                        ?.[0]
                                                                        .id ??
                                                                        "",
                                                            });

                                                        console.log(
                                                            taskData,
                                                            taskError,
                                                        );
                                                    },
                                                ),
                                            );
                                        }
                                        return ticketData;
                                    }),
                                );
                            }
                        }),
                    );
                }

                return templateData;
            }),
        );

        return json(templateData);
    },
});
