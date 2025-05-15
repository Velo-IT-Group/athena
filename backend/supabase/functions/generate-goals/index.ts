// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'npm:@supabase/supabase-js';

function getNextPeriod(recurrence: string): { start: Date; end: Date } {
	const today = new Date();
	switch (recurrence) {
		case 'daily': {
			const start = new Date(today);
			start.setDate(today.getDate() + 1);
			start.setHours(0, 0, 0, 0);
			const end = new Date(start);
			end.setHours(23, 59, 59, 999);
			return { start, end };
		}
		case 'monthly': {
			const year = today.getFullYear();
			const month = today.getMonth() + 1;
			const start = new Date(year, month, 1);
			const end = new Date(year, month + 1, 0, 23, 59, 59);
			return { start, end };
		}
		case 'quarterly': {
			const year = today.getFullYear();
			const currentQuarter = Math.floor(today.getMonth() / 3);
			const nextQuarterStartMonth = (currentQuarter + 1) * 3;
			const start = new Date(year, nextQuarterStartMonth, 1);
			const end = new Date(year, nextQuarterStartMonth + 3, 0, 23, 59, 59);
			return { start, end };
		}
		default:
			throw new Error('Invalid recurrence: ' + recurrence);
	}
}

Deno.serve(async () => {
	const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
	const { data: templates, error } = await supabase.from('goal_templates').select('*').eq('auto_generate', true);

	if (error) {
		console.error('Error fetching templates', error);
		return new Response('Failed', { status: 500 });
	}

	const inserts = [];

	for (const template of templates || []) {
		const { start, end } = getNextPeriod(template.recurrence);

		// Skip weekends for daily recurrence
		if (template.recurrence === 'daily' && (start.getDay() === 0 || start.getDay() === 6)) {
			continue;
		}

		const { data: existing } = await supabase
			.from('goals')
			.select('id')
			.eq('template_id', template.id)
			.eq('period_start', start.toISOString().slice(0, 10));

		if (existing && existing.length > 0) {
			continue; // already created
		}

		inserts.push({
			template_id: template.id,
			user_id: template.user_id,
			period_start: start.toISOString().slice(0, 10),
			period_end: end.toISOString().slice(0, 10),
			target_value: template.target_value,
			unit: template.unit,
		});
	}

	if (inserts.length) {
		await supabase.from('goals').insert(inserts);
	}

	return new Response(`Inserted ${inserts.length} goals`, { status: 200 });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/generate-goals' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
