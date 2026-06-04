import _ from "lodash";
import AccountModel, { AccountType } from "@/models/mongodb/authDB/account";
import {
    QueryFilter,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
} from "mongoose";

export default class AccountsDAO {
    static async findAccount(
        filter: QueryFilter<AccountType>,
        projection?: ProjectionType<AccountType>,
        queryOptions?: QueryOptions<AccountType>,
    ) {
        try {
            let result = await AccountModel.findOne(
                filter,
                projection,
                queryOptions,
            ).exec();

            return result;
        } catch (error) {
            throw error;
        }
    }

    static async createAccount(account: AccountType) {
        try {
            let newAccount = new AccountModel(account);

            await newAccount.save();
            return newAccount;
        } catch (error) {
            throw error;
        }
    }
}
