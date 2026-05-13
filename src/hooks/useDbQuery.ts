import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getFunctionName, type FunctionReference } from "convex/server";
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

  // Convex's `api.module.fn` accessor is backed by a Proxy whose `get` trap
  // returns a brand-new Proxy on every property access. That means the
  // `query` argument here is a fresh reference on every render. If we put
  // it directly into `useMemo`/`useCallback` dep arrays, React will treat
  // every render as a dep change, rebuild the `watch`, rebuild `subscribe`
  // and `getSnapshot`, and force `useSyncExternalStore` to tear down and
  // re-create the underlying Convex subscription on every commit. That
  // emits a Remove+Add pair on the websocket every render; the resulting
  // server Transitions briefly evict this queryToken from the local cache,
  // so `localQueryResult()` flips between the real value and `undefined`.
  // For boolean UI (e.g. `isSubmitted = !!submission` on the Surveys card)
  // that shows up as the card oscillating between "BEGIN SURVEY" and
  // "✓ SUBMITTED" on every server round-trip (~2s on mobile networks).
  //
  // Key the memo on the stable function-name string instead, mirroring how
  // Convex's own `useQuery` handles this exact problem.
  const queryName = getFunctionName(query);

  const stableArgs = useMemo(
    () => (argsKey === "skip" ? "skip" : (JSON.parse(argsKey) as Query["_args"])),
    [argsKey],
  );

  const watch = useMemo(() => {
    if (stableArgs === "skip") return null;
    const client = getConvexClient(source);
    return client.watchQuery(query, stableArgs);
    // `query` is intentionally excluded from deps — it's the unstable
    // Proxy reference; `queryName` is its stable identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [source, queryName, stableArgs]);

  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      watch ? watch.onUpdate(onStoreChange) : () => undefined,
    [watch],
  );

  const getSnapshot = useCallback(
    () => watch?.localQueryResult(),
    [watch],
  );

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
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
  // Same Proxy-identity caveat as `useDbQuery`: key on the function name.
  const mutationName = getFunctionName(mutation);

  return useCallback(
    (args: Mutation["_args"]) => client.mutation(mutation, args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [client, mutationName],
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
