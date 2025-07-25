// deno-lint-ignore-file no-explicit-any
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.4';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';
import { AccessToken } from 'npm:livekit-server-sdk@2.13.1';
// env
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const livekitApiKey = Deno.env.get('LIVEKIT_API_KEY');
const livekitApiSecret = Deno.env.get('LIVEKIT_API_SECRET');
serve(async (req)=>{
  // 1. Auth context ---------------------------------------------------------
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    db: {
      schema: 'livekit'
    }
  });
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return new Response('Unauthorized', {
    status: 401
  });
  // 2. Validate body --------------------------------------------------------
  const schema = z.object({
    room: z.string().min(1),
    toUserId: z.string().uuid(),
    expiresMinutes: z.number().int().positive().max(24 * 60).optional()
  });
  const body = await req.json().catch(()=>({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return new Response(parsed.error.message, {
      status: 400
    });
  }
  const { room, toUserId, expiresMinutes = 60 } = parsed.data;
  // 3. Mint LiveKit token ----------------------------------------------------
  const token = new AccessToken(livekitApiKey, livekitApiSecret, {
    identity: toUserId,
    ttl: Math.floor(Date.now() / 1000) + expiresMinutes * 60
  });
  token.addGrant({
    roomJoin: true,
    room
  });
  const jwt = token.toJwt();
  // 4. Persist invite – this triggers Realtime ------------------------------
  const { error } = await supabase.from('join_requests').insert({
    room,
    token: jwt,
    to_user: toUserId,
    from_user: user.id,
    expires_at: new Date(Date.now() + expiresMinutes * 60_000).toISOString()
  });
  if (error) return new Response(error.message, {
    status: 500
  });
  return new Response(JSON.stringify({
    ok: true
  }), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
});
