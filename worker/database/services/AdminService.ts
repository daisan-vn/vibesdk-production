/**
 * Admin Service - platform-wide read queries for the admin panel.
 * Intentionally read-only over D1; per-user limit overrides live in KV
 * (user_config:<id>) and are handled by AdminController, not here.
 */

import { BaseService } from './BaseService';
import * as schema from '../schema';
import { desc, eq, sql } from 'drizzle-orm';

export interface AdminUserRow {
    id: string;
    email: string;
    displayName: string | null;
    username: string | null;
    provider: string | null;
    isSuspended: boolean | null;
    createdAt: Date | null;
    appCount: number;
}

export interface AdminAppRow {
    id: string;
    title: string;
    userId: string | null;
    userEmail: string | null;
    visibility: string;
    status: string;
    deploymentId: string | null;
    framework: string | null;
    createdAt: Date | null;
}

export class AdminService extends BaseService {
    async getStats(): Promise<{ users: number; apps: number; deployedApps: number }> {
        const db = this.getReadDb('fresh');
        const usersRes = await db.select({ c: sql<number>`count(*)` }).from(schema.users);
        const appsRes = await db.select({ c: sql<number>`count(*)` }).from(schema.apps);
        const deployedRes = await db
            .select({ c: sql<number>`count(*)` })
            .from(schema.apps)
            .where(sql`${schema.apps.deploymentId} IS NOT NULL`);
        return {
            users: Number(usersRes[0]?.c ?? 0),
            apps: Number(appsRes[0]?.c ?? 0),
            deployedApps: Number(deployedRes[0]?.c ?? 0),
        };
    }

    async listAllUsers(limit = 500, offset = 0): Promise<AdminUserRow[]> {
        const db = this.getReadDb('fresh');
        // A correlated subquery for per-user app counts proved unreliable through
        // drizzle's sql interpolation, so count apps in one grouped pass and merge.
        const [rows, counts] = await Promise.all([
            db
                .select({
                    id: schema.users.id,
                    email: schema.users.email,
                    displayName: schema.users.displayName,
                    username: schema.users.username,
                    provider: schema.users.provider,
                    isSuspended: schema.users.isSuspended,
                    createdAt: schema.users.createdAt,
                })
                .from(schema.users)
                .orderBy(desc(schema.users.createdAt))
                .limit(limit)
                .offset(offset),
            db
                .select({ userId: schema.apps.userId, c: sql<number>`count(*)` })
                .from(schema.apps)
                .groupBy(schema.apps.userId),
        ]);
        const countMap = new Map<string, number>();
        for (const c of counts) {
            if (c.userId) countMap.set(c.userId, Number(c.c));
        }
        return rows.map((r) => ({ ...r, appCount: countMap.get(r.id) ?? 0 })) as AdminUserRow[];
    }

    async listAllApps(limit = 500, offset = 0): Promise<AdminAppRow[]> {
        const db = this.getReadDb('fresh');
        const rows = await db
            .select({
                id: schema.apps.id,
                title: schema.apps.title,
                userId: schema.apps.userId,
                userEmail: schema.users.email,
                visibility: schema.apps.visibility,
                status: schema.apps.status,
                deploymentId: schema.apps.deploymentId,
                framework: schema.apps.framework,
                createdAt: schema.apps.createdAt,
            })
            .from(schema.apps)
            .leftJoin(schema.users, eq(schema.apps.userId, schema.users.id))
            .orderBy(desc(schema.apps.createdAt))
            .limit(limit)
            .offset(offset);
        return rows as AdminAppRow[];
    }
}
