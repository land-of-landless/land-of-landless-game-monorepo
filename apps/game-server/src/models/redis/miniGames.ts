import { Schema, Entity } from "redis-om";

export interface MiniGames extends Entity {
    userId: string;

    // mini game 2 (Guess the Number)
    miniGame2: {
        target_number: number;
        user_correct_guesses: number;
        remaining_numbers: number[];
    };

    // mini game 3 (Pick the Boxes)
    miniGame3: {
        boxes_state: number[];
        user_correct_guesses: number;
        is_started: boolean;
    };

    // mini game 4 (Rock Paper Scissors)
    miniGame4: {
        is_started: boolean;
        user_correct_guesses: number;
    };
}

export const miniGamesSchema = new Schema<MiniGames>("miniGames", {
    userId: {
        type: "string",
        indexed: true,
    },
});

export default miniGamesSchema;
