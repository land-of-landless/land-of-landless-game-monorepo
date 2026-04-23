import _ from "lodash";
import { MongoClient, Db, Collection } from "mongodb";
import { dbLogger } from "../../../utils/logger.ts";
import UserModel, { UserType } from "@/models/mongodb/authDB/user.js";
import {
    QueryFilter,
    ProjectionType,
    QueryOptions,
    UpdateQuery,
    UpdateWithAggregationPipeline,
} from "mongoose";

export default class UsersDAO {
    static async findUser(
        filter: QueryFilter<UserType>,
        projection?: ProjectionType<UserType>,
        queryOptions?: QueryOptions<UserType>,
    ) {
        try {
            let result = await UserModel.findOne(
                filter,
                projection,
                queryOptions,
            )
                .lean()
                .exec();

            return result;
        } catch (error) {
            dbLogger.error("MongoDB operation failed", {
                error: error instanceof Error ? error.message : error,
            });
            // fastify.log.error(error);
            return null;
        }
    }

    static async createUser(user: UserType) {
        try {
            let result = await UserModel.create(user);

            return result;
        } catch (error) {
            dbLogger.error("MongoDB operation failed", {
                error: error instanceof Error ? error.message : error,
            });
            // fastify.log.error(error);
            return null;
        }
    }

    static async updateUser(
        filter: QueryFilter<UserType>,
        updateDoc: UpdateQuery<UserType> | UpdateWithAggregationPipeline,
        queryOptions?: QueryOptions<UserType>,
    ) {
        try {
            let result = await UserModel.updateOne(filter, updateDoc);

            return result;
        } catch (error) {
            dbLogger.error("MongoDB operation failed", {
                error: error instanceof Error ? error.message : error,
            });
            // fastify.log.error(error);
            return null;
        }
    }
}
