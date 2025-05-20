import { registerGlobalMiddleware } from "@tanstack/react-start";
import { logMiddleware } from "./utils/loggingMiddleware";
import authMiddleware from "@/lib/supabase/middleware";

registerGlobalMiddleware({
  middleware: [logMiddleware, authMiddleware],
});
