import type { PreviewType } from "../../../services/sandbox/sandboxTypes";
import type { ImageAttachment } from '../../../types/image-attachment';
import type { BehaviorType, ProjectType, ChatMode } from '../../../agents/core/types';
import type { CredentialsPayload } from '../../../agents/inferutils/config.types';

export const MAX_AGENT_QUERY_LENGTH = 20_000;

export interface CodeGenArgs {
    query: string;
    language?: string;
    frameworks?: string[];
    selectedTemplate?: string;
    behaviorType?: BehaviorType;
    projectType?: ProjectType;
    images?: ImageAttachment[];

    /** Chat mode: 'plan' (analyze only) or 'build' (implement). Defaults to 'plan'. */
    mode?: ChatMode;

    /** Optional ephemeral credentials (BYOK / gateway override) for sdk */
    credentials?: CredentialsPayload;
}

/**
 * Data structure for connectToExistingAgent response
 */
export interface AgentConnectionData {
    websocketUrl: string;
    agentId: string;
}

export type AgentPreviewResponse = PreviewType;

/**
 * Real deployment diagnostics for an app — probes the actual state behind
 * "App not found or not deployed yet" rather than inferring from DB fields.
 */
export interface DeploymentDiagnostics {
    appId: string;
    title: string;
    /** App generation status from the DB. */
    status: 'generating' | 'completed';
    /** Worker script name / subdomain slug. Null = never deployed to Cloudflare. */
    deploymentId: string | null;
    /** Expected live URL: https://{slug}.{domain}. Null if no deploymentId. */
    liveUrl: string | null;
    /** Dispatch namespace probed (the one the router resolves against). */
    namespace: string | null;
    /** True/false if the worker exists in the namespace; null if the probe could not run. */
    workerInNamespace: boolean | null;
    /** Worker last-modified timestamp from Cloudflare, if available. */
    workerModifiedOn: string | null;
    /** HTTP status from GETting the live URL; null if unreachable or skipped. */
    liveUrlStatus: number | null;
    /** Overall verdict severity. */
    severity: 'ok' | 'degraded' | 'failed' | 'not_deployed' | 'unknown';
    /** Human-readable root-cause / next-step explanation. */
    verdict: string;
    /** ISO timestamp when diagnostics ran. */
    checkedAt: string;
}
