import { db } from "./connection";
import { identities, identityIps } from "../../models/postgres/schema";
import { eq } from "drizzle-orm";

export class IdentityPostgresDAO {
    static async save(data: any) {
        return await db.transaction(async (tx) => {
            await tx
                .insert(identities)
                .values({ userId: data.userId })
                .onConflictDoNothing();

            await tx.delete(identityIps).where(eq(identityIps.userId, data.userId));
            if (data.ips?.length > 0) {
                await tx.insert(identityIps).values(
                    data.ips.map((ip: string, index: number) => ({
                        userId: data.userId,
                        ip,
                        count: data.ips_count?.[index] || 0,
                    })),
                );
            }
        });
    }

    static async findByUserId(userId: string) {
        const res = await db.query.identities.findFirst({
            where: eq(identities.userId, userId),
        });
        if (!res) return null;

        const ips = await db
            .select()
            .from(identityIps)
            .where(eq(identityIps.userId, userId));

        return {
            userId: res.userId,
            ips: ips.map((i) => i.ip),
            ips_count: ips.map((i) => i.count),
        };
    }
}
