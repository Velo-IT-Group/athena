// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js";
import { asyncThrottle } from "npm:@tanstack/pacer@0.2.0";
const clientId = Deno.env.get("CONNECT_WISE_CLIENT_ID");
const username = Deno.env.get("CONNECT_WISE_USERNAME");
const password = Deno.env.get("CONNECT_WISE_PASSWORD");
const url = Deno.env.get("CONNECT_WISE_URL");
const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_ANON_KEY"));
Deno.serve(async (req)=>{
  const { proposalId, versionId } = await req.json();
  if (!proposalId || !versionId) {
    throw new Error("Missing proposalId or versionId");
  }
  const { error: proposalUpdateError } = await supabase.from("proposals").update({
    is_getting_converted: true
  }).eq("id", proposalId);
  if (proposalUpdateError) {
    throw new Error(proposalUpdateError.message);
  }
  const [{ data: proposal, error: proposalError }, { data: products, error: productsError }, { data: phases, error: phasesError }] = await Promise.all([
    supabase.from("proposals").select("*, created_by(system_member_id)").eq("id", proposalId).single(),
    supabase.from("products").select("*, products(*)").eq("version", versionId).is("parent", null),
    supabase.from("phases").select("*, tickets(*, tasks(*))").eq("version", versionId)
  ]);
  if (proposalError || productsError || phasesError) {
    throw new Error(proposalError?.message || productsError?.message || phasesError?.message);
  }
  let opportunityId = proposal.opportunity_id;
  if (!opportunityId) {
    const opportunity = await createOpportunity({
      name: proposal.name,
      type: {
        id: 5
      },
      primarySalesRep: {
        id: proposal.created_by?.system_member_id ?? -1
      },
      company: {
        id: proposal.company_id ?? -1
      },
      contact: {
        id: proposal.contact_id ?? -1
      }
    });
    opportunityId = opportunity.id;
  } else {
    opportunityId = proposal.opportunity_id;
  }
  if (!opportunityId) {
    throw new Error("Error creating opportunity");
  }
  await supabase.from("proposals").update({
    opportunity_id: opportunityId
  }).eq("id", proposalId);
  // Create default service product if doesn't exist
  if (!products.some((product)=>product.id === 15)) {
    await createManageProduct({
      catalogItem: {
        id: 15
      },
      price: proposal.labor_rate,
      quantity: phases.reduce((acc, current)=>acc + current.hours, 0),
      opportunity: {
        id: opportunityId
      },
      billableOption: "Billable"
    });
  }
  // // Create all products
  for (const product of products){
    await throttledCreateManageProduct({
      catalogItem: {
        id: product.id
      },
      opportunity: {
        id: opportunityId
      },
      quantity: product.quantity,
      price: product.price ?? undefined,
      cost: product.cost ?? undefined,
      billableOption: "Billable"
    });
  }
  const flattendProducts = products?.flatMap((product)=>product.products ?? []);
  const opportunityProducts = await getOpportunityProducts(opportunityId);
  // Filter bundled products to update the sub items prices
  const bundledProducts = opportunityProducts.filter((product)=>flattendProducts.some((p)=>p && p.catalog_item === product.catalogItem.id));
  const bundledChanges = await Promise.all(bundledProducts.map((b)=>{
    const product = flattendProducts.find((p)=>p.id === b.catalogItem.id);
    if (!product) return null;
    return updateManageProduct(b.id, [
      {
        op: "replace",
        path: "/price",
        value: product.price
      },
      {
        op: "replace",
        path: "/cost",
        value: product.cost
      }
    ]);
  }));
  let projectId = proposal.project_id;
  if (!projectId) {
    const project = await convertOpportunityToProject(opportunityId, {
      includeAllProductsFlag: true,
      board: {
        id: 51
      },
      estimatedStart: new Date().toISOString().split(".")[0] + "Z",
      estimatedEnd: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split(".")[0] + "Z"
    });
    projectId = project.id;
  } else {
    projectId = proposal.project_id;
  }
  if (!projectId) {
    throw new Error("Error creating project");
  }
  await supabase.from("proposals").update({
    project_id: projectId
  }).eq("id", proposalId);
  const estimatedHours = phases.reduce((acc, current)=>acc + current.hours, 0);
  await updateManageProject(projectId, [
    {
      op: "replace",
      path: "/billProjectAfterClosedFlag",
      value: true
    },
    {
      op: "replace",
      path: "/budgetFlag",
      value: true
    },
    {
      op: "replace",
      path: "/estimatedHours",
      value: estimatedHours
    },
    {
      op: "replace",
      path: "/billingMethod",
      value: "FixedFee"
    }
  ]);
  for (const phase of phases.sort((a, b)=>a.order - b.order)){
    console.log(phase);
    await throttledCreateProjectPhase({
      projectId,
      phase
    });
  }
  await supabase.from("proposals").update({
    is_getting_converted: false
  }).eq("id", proposalId);
  return new Response(JSON.stringify({
    success: true
  }), {
    headers: {
      "Content-Type": "application/json",
      "Connection": "keep-alive"
    }
  });
});
const headers = new Headers();
headers.set("clientId", clientId);
headers.set("Authorization", "Basic " + btoa(username + ":" + password));
headers.set("Content-Type", "application/json");
headers.set("Access-Control-Allow-Origin", "*");
const userHeaders = new Headers(headers);
userHeaders.set("Authorization", "Basic " + btoa("velo+" + "maaPiVTeEybbK3SX" + ":" + "eCT1NboeMrXq9P3z"));
export const throttledCreateManageProduct = asyncThrottle(async (product)=>await createManageProduct(product), {
  wait: 200
});
export const throttledCreateProjectPhase = asyncThrottle(async (params)=>await createProjectPhase(params.projectId, params.phase), {
  wait: 200
});
const throttledCreateProjectTicket = asyncThrottle(async (params)=>await createProjectTicket(params.phaseId, params.ticket), {
  wait: 200
});
const throttledCreateProjectTask = asyncThrottle(async (params)=>await createProjectTask(params.ticketId, params.task), {
  wait: 200
});
export const getOpportunityProducts = async (opportunityId)=>{
  const response = await fetch(`${url}/procurement/products?conditions=opportunity/id=${opportunityId}`, {
    headers
  });
  if (!response.ok) {
    throw Error("Error fetching products... " + await response.json(), {
      cause: response.statusText
    });
  }
  return await response.json();
};
export const createOpportunity = async (opportunity)=>{
  const body = JSON.stringify(opportunity);
  const response = await fetch(`${url}/sales/opportunities`, {
    method: "POST",
    body,
    headers: userHeaders
  });
  if (!response.ok) {
    throw new Error("Error creating opportunity: \n\n" + JSON.stringify(await response.json()));
  }
  return await response.json();
};
export const createManageProduct = async (product)=>{
  const body = JSON.stringify(product);
  const response = await fetch(`${url}/procurement/products`, {
    method: "POST",
    body,
    headers: userHeaders
  });
  if (!response.ok) {
    throw new Error("Error creating product: \n\n" + JSON.stringify(await response.json()));
  }
  return await response.json();
};
export const convertOpportunityToProject = async (id, data)=>{
  const body = JSON.stringify(data);
  const response = await fetch(`${url}/sales/opportunities/${id}/convertToProject`, {
    method: "POST",
    body,
    headers
  });
  if (!response.ok) {
    throw new Error("Error converting opportunity to project: \n\n" + JSON.stringify(await response.json()));
  }
  return await response.json();
};
export const createProjectPhase = async (projectId, phase)=>{
  const body = JSON.stringify({
    projectId,
    description: phase.description,
    wbsCode: String(phase.order)
  });
  const response = await fetch(`${url}/project/projects/${projectId}/phases`, {
    method: "POST",
    body,
    headers
  });
  if (!response.ok) {
    throw new Error("Error creating opportunity: \n\n" + JSON.stringify(await response.json()));
  }
  const data = await response.json();
  if (phase.tickets) {
    for (const ticket of phase.tickets.sort((a, b)=>a.order - b.order)){
      await throttledCreateProjectTicket({
        phaseId: data.id,
        ticket
      });
    }
  }
  return data;
};
export const createProjectTicket = async (phaseId, ticket)=>{
  const { summary, budget_hours: budgetHours } = ticket;
  const body = JSON.stringify({
    summary,
    budgetHours,
    phase: {
      id: phaseId
    }
  });
  const config = {
    method: "POST",
    headers,
    body
  };
  const response = await fetch(`${url}/project/tickets`, config);
  if (!response.ok) {
    throw new Error(`Error creating project ticket: ${response.statusText} \n\n` + JSON.stringify(await response.json()));
  }
  const data = await response.json();
  if (ticket.tasks && ticket.tasks.length) {
    const { tasks } = ticket;
    for (const task of tasks.sort((a, b)=>a.priority - b.priority)){
      await throttledCreateProjectTask({
        ticketId: data.id,
        task
      });
    }
  }
};
export const createProjectTask = async (ticketId, task)=>{
  const { notes, priority } = task;
  const body = JSON.stringify({
    notes,
    priority
  });
  const config = {
    method: "POST",
    headers,
    body
  };
  const response = await fetch(`${url}/project/tickets/${ticketId}/tasks`, config);
  if (!response.ok) {
    throw new Error(`Error creating task: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
};
export const updateManageProject = async (id, operation)=>{
  const response = await fetch(`${url}/project/projects/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(operation)
  });
  if (!response.ok) {
    throw new Error("Error updating manage project " + JSON.stringify(await response.json()));
  }
  return await response.json();
};
export const updateManageProduct = async (id, operation)=>{
  const response = await fetch(`${url}/procurement/products/${id}`, {
    method: "PATCH",
    headers: userHeaders,
    body: JSON.stringify(operation)
  });
  if (!response.ok) {
    throw new Error("Error updating manage product " + JSON.stringify(await response.json()));
  }
  return await response.json();
}; /* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/convert-proposal-to-project' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/ 
