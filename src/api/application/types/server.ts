import {FeatureLimits, ServerLimits} from "@/api/common/types/server_limits";
import {Container} from "@/api/application/types/container";


export type Server = {
    id: number,
    external_id: string | null,
    uuid: string,
    identifier: string,
    name: string,
    description: string,
    status: any | null,
    suspended: boolean,
    limits: ServerLimits,
    feature_limits: FeatureLimits,
    user: number,
    node: number,
    allocation: number,
    nest: number,
    egg: number,
    container: Container,
    created_at: string,
    updated_at: string | null
}