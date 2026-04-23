import _ from "lodash";
import BillingSessionModel, {
    BillingSessionType,
} from "@/models/mongodb/billingDB/sessions.js";
import {
    QueryFilter,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
} from "mongoose";

export default class BillingSessionDAO {
    static async createSession(sessionParams: BillingSessionType) {
        try {
            let session = new BillingSessionModel(sessionParams);
            await session.save();
            return session;
        } catch (error) {
            throw error;
        }
    }

    static async updateSession(
        filter: QueryFilter<BillingSessionType>,
        updateDoc:
            | UpdateQuery<BillingSessionType>
            | UpdateWithAggregationPipeline,
        queryOptions?: QueryOptions<BillingSessionType>,
    ) {
        try {
            let updatedSession = await BillingSessionModel.updateOne(
                filter,
                updateDoc,
            ).exec();

            return updatedSession;
        } catch (error) {
            throw error;
        }
    }

    static async findSession(
        filter: QueryFilter<BillingSessionType>,
        projection?: ProjectionType<BillingSessionType>,
        queryOptions?: QueryOptions<BillingSessionType>,
    ) {
        try {
            let session = await BillingSessionModel.findOne(
                filter,
                projection,
                queryOptions,
            ).exec();
            return session;
        } catch (error) {
            throw error;
        }
    }

    static async doesSessionExist(filter: QueryFilter<BillingSessionType>) {
        try {
            let session = await BillingSessionModel.exists(filter).exec();

            return !_.isNil(session);
        } catch (error) {
            throw error;
        }
    }

    static async deleteSession(
        filter: QueryFilter<BillingSessionType>,
        queryOptions?: QueryOptions<BillingSessionType>,
    ) {
        try {
            return await BillingSessionModel.deleteOne(filter).exec();
        } catch (error) {
            throw error;
        }
    }
}
