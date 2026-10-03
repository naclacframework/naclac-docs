import path from "node:path";

/**
 * Absolute path to the content root this engine renders. Swapping this
 * (env var or otherwise) is the entire mechanism for pointing the same
 * engine at a different project's docs — nothing else should hardcode a
 * content path.
 */
export const CONTENT_DIR =
  process.env.CONTENT_DIR ?? path.resolve(process.cwd(), "../mintlify-docs");
