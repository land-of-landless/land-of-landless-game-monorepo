import { eq } from "drizzle-orm";
import { db } from "./connection.js";
import { billings, invoices } from "../../models/postgres/schema.js";

export class BillingDAO {
    static async saveBillingProfile(data: any) {
        return await db.transaction(async (tx) => {
            await tx.insert(billings).values({
                userId: data.userId,
            }).onConflictDoNothing();

            await tx.delete(invoices).where(eq(invoices.userId, data.userId));

            const invoicesList: any[] = [];
            if (data.finishedInvoices?.length > 0) {
                data.finishedInvoices.forEach((id: string) => {
                    invoicesList.push({ id, userId: data.userId, status: 'finished' });
                });
            }
            if (data.ongoingInvoices?.length > 0) {
                data.ongoingInvoices.forEach((id: string) => {
                    invoicesList.push({ id, userId: data.userId, status: 'ongoing' });
                });
            }

            if (invoicesList.length > 0) {
                await tx.insert(invoices).values(invoicesList);
            }
        });
    }

    static async createBilling(data: any) {
        return this.saveBillingProfile(data);
    }

    static async findBillingById(userId: string) {
        const res = await db.query.billings.findFirst({
            where: eq(billings.userId, userId),
            with: {
                invoices: true
            }
        });
        if (!res) return null;

        return {
            userId: res.userId,
            finishedInvoices: res.invoices.filter(i => i.status === 'finished').map(i => i.id),
            ongoingInvoices: res.invoices.filter(i => i.status === 'ongoing').map(i => i.id),
        };
    }
}
