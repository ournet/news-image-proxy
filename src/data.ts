
import { CacheGraphQlQueryExecutor, OurnetQueryApi } from '@ournet/api-client';
import { badImplementation } from "boom";

const headers = {
    authorization: `Key ${process.env.OURNET_API_KEY}`,
    'Content-Type': 'application/json'
};

const executor = new CacheGraphQlQueryExecutor({
    url: process.env.OURNET_API_HOST || '',
    timeout: 1000 * 4,
    headers,
}, {});

export class OurnetApi {
    query<QT>(): OurnetQueryApi<QT> {
        return createQueryApiClient<QT>();
    }

    execure<QT>(query: OurnetQueryApi<QT>) {
        return executeApiClient<QT>(query);
    }
}

export const ournetAPI = new OurnetApi();

function createQueryApiClient<QT>(): OurnetQueryApi<QT> {
    return new OurnetQueryApi<QT>(executor)
}

async function executeApiClient<APIT>(client: OurnetQueryApi<APIT>) {
    if (!client.queryHasItems()) {
        return {} as APIT;
    }
    const apiResult = await client.queryExecute();
    if (apiResult.errors) {
        throw badImplementation(apiResult.errors[0].message);
    }
    return apiResult.data;
}
