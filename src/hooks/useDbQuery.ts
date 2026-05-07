import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { FunctionReference } from "convex/server";
import { getConvexClient, type DbSource } from "../convexClients";

type QueryArgs<Query extends FunctionReference<"query">> =
  | Query["_args"]
  | "skip"
  | undefined;

export function useDbQuery<Query extends FunctionReference<"query">>(
  source: DbSource,
  query: Query,
  args?: QueryArgs<Query>,
): Query["_returnType"] | undefined {
  const resolvedArgs = (args === undefined ? {} : args) as Query["_args"] | "skip";
  const argsKey = resolvedArgs === "skip" ? "skip" : JSON.stringify(resolvedArgs);

  const stableArgs = useMemo(
    () => (argsKey === "skip" ? "skip" : (JSON.parse(argsKey) as Query["_args"])),
    [argsKey],
  );

  const watch = useMemo(() => {
    if (stableArgs === "skip") return null;
    const client = getConvexClient(source);
    return client.watchQuery(query, stableArgs);
  }, [source, query, stableArgs]);

  return useSyncExternalStore(
    (onStoreChange) => (watch ? watch.onUpdate(onStoreChange) : () => undefined),
    () => watch?.localQueryResult(),
    () => watch?.localQueryResult(),
  );
}

export function useAdminReadQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: QueryArgs<Query>,
): Query["_returnType"] | undefined {
  return useDbQuery("admin", query, args);
}

export function useMemberQuery<Query extends FunctionReference<"query">>(
  query: Query,
  args?: QueryArgs<Query>,
): Query["_returnType"] | undefined {
  return useDbQuery("member", query, args);
}

export function useDbMutation<Mutation extends FunctionReference<"mutation">>(
  source: DbSource,
  mutation: Mutation,
): (args: Mutation["_args"]) => Promise<Mutation["_returnType"]> {
  const client = useMemo(() => getConvexClient(source), [source]);

  return useCallback(
    (args: Mutation["_args"]) => client.mutation(mutation, args),
    [client, mutation],
  );
}

export function useAdminMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
): (args: Mutation["_args"]) => Promise<Mutation["_returnType"]> {
  return useDbMutation("admin", mutation);
}

export function useMemberMutation<Mutation extends FunctionReference<"mutation">>(
  mutation: Mutation,
): (args: Mutation["_args"]) => Promise<Mutation["_returnType"]> {
  return useDbMutation("member", mutation);
}
