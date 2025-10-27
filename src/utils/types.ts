
export type ExactlyOneKey<K extends keyof any, V, KK extends keyof any = K> =
    { [P in K]: { [Q in P]: V } &
        { [Q in Exclude<KK, P>]?: never} extends infer O ?
        { [Q in keyof O]: O[Q] } : never
    }[K];

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>


export type Maybe<T> = T | null | undefined
export type Nullable<T> = T | null