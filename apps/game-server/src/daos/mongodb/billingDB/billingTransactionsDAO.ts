import _ from "lodash";
import {
    QueryFilter,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    Types,
} from "mongoose";
import BillingTransactionModel, {
    BillingTransactionType,
} from "@/models/mongodb/billingDB/transaction";

export default class BillingTransactionDAO {
    static async createTransaction(
        transactionParams: BillingTransactionType,
        queryOptions: QueryOptions<BillingTransactionType>,
    ) {
        try {
            let transaction = new BillingTransactionModel(
                transactionParams,
                queryOptions,
            );

            await transaction.save();
            return transaction;
        } catch (error) {
            throw error;
        }
    }
}
