import { db } from "./connection";
import {
    miniGames,
    mg2RemainingNumbers,
    mg3BoxesState,
} from "../../models/postgres/schema";
import { eq } from "drizzle-orm";

export class MiniGamesPostgresDAO {
    static async save(data: any) {
        return await db.transaction(async (tx) => {
            await tx
                .insert(miniGames)
                .values({
                    userId: data.userId,
                    mg2TargetNumber: data.miniGame2?.target_number,
                    mg2UserCorrectGuesses: data.miniGame2?.user_correct_guesses,
                    mg3UserCorrectGuesses: data.miniGame3?.user_correct_guesses,
                    mg3IsStarted: data.miniGame3?.is_started,
                    mg4IsStarted: data.miniGame4?.is_started,
                    mg4UserCorrectGuesses: data.miniGame4?.user_correct_guesses,
                })
                .onConflictDoUpdate({
                    target: miniGames.userId,
                    set: {
                        mg2TargetNumber: data.miniGame2?.target_number,
                        mg2UserCorrectGuesses: data.miniGame2?.user_correct_guesses,
                        mg3UserCorrectGuesses: data.miniGame3?.user_correct_guesses,
                        mg3IsStarted: data.miniGame3?.is_started,
                        mg4IsStarted: data.miniGame4?.is_started,
                        mg4UserCorrectGuesses: data.miniGame4?.user_correct_guesses,
                    },
                });

            await tx
                .delete(mg2RemainingNumbers)
                .where(eq(mg2RemainingNumbers.userId, data.userId));
            if (data.miniGame2?.remaining_numbers?.length > 0) {
                await tx.insert(mg2RemainingNumbers).values(
                    data.miniGame2.remaining_numbers.map((num: number) => ({
                        userId: data.userId,
                        num,
                    })),
                );
            }

            await tx
                .delete(mg3BoxesState)
                .where(eq(mg3BoxesState.userId, data.userId));
            if (data.miniGame3?.boxes_state?.length > 0) {
                await tx.insert(mg3BoxesState).values(
                    data.miniGame3.boxes_state.map((state: number, index: number) => ({
                        userId: data.userId,
                        position: index,
                        state,
                    })),
                );
            }
        });
    }

    static async findByUserId(userId: string) {
        const res = await db.query.miniGames.findFirst({
            where: eq(miniGames.userId, userId),
        });
        if (!res) return null;

        const mg2Nums = await db
            .select()
            .from(mg2RemainingNumbers)
            .where(eq(mg2RemainingNumbers.userId, userId));
        const mg3States = await db
            .select()
            .from(mg3BoxesState)
            .where(eq(mg3BoxesState.userId, userId))
            .orderBy(mg3BoxesState.position);

        return {
            userId: res.userId,
            miniGame2: {
                target_number: res.mg2TargetNumber,
                user_correct_guesses: res.mg2UserCorrectGuesses,
                remaining_numbers: mg2Nums.map((n) => n.num),
            },
            miniGame3: {
                boxes_state: mg3States.map((s) => s.state),
                user_correct_guesses: res.mg3UserCorrectGuesses,
                is_started: res.mg3IsStarted,
            },
            miniGame4: {
                is_started: res.mg4IsStarted,
                user_correct_guesses: res.mg4UserCorrectGuesses,
            },
        };
    }
}
