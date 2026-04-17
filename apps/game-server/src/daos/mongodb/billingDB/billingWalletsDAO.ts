import _ from "lodash";
import BillingWalletModel, {
    BillingWalletType,
} from "@/models/mongodb/billingDB/wallet";
import {
    FilterQuery,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
    Types,
} from "mongoose";

export default class BillingWalletDAO {
    static async createWallet(walletParams: BillingWalletType) {
        try {
            let wallet = new BillingWalletModel(walletParams);

            await wallet.save();
            return wallet;
        } catch (error) {
            throw error;
        }
    }

    static async findWallet(
        filter: FilterQuery<BillingWalletType>,
        projection?: ProjectionType<BillingWalletType>,
        queryOptions?: QueryOptions<BillingWalletType>,
    ) {
        try {
            let foundWallet = await BillingWalletModel.findOne(
                filter,
                projection,
                queryOptions,
            ).exec();

            return foundWallet;
        } catch (error) {
            throw error;
        }
    }

    static async updateWallet(
        filter: FilterQuery<BillingWalletType>,
        updateDoc:
            | UpdateQuery<BillingWalletType>
            | UpdateWithAggregationPipeline,
        queryOptions?: QueryOptions<BillingWalletType>,
    ) {
        try {
            let updateResult = await BillingWalletModel.updateOne(
                filter,
                updateDoc,
            ).exec();

            return updateResult;
        } catch (error) {
            throw error;
        }
    }
}
