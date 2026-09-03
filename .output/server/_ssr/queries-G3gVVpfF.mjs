import { m as repositories } from "./Card-BvuBlAzF.mjs";
import { n as queryOptions, r as useQuery } from "../_libs/tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/queries-G3gVVpfF.js
var proceduresQuery = queryOptions({
	queryKey: ["procedures"],
	queryFn: () => repositories.procedures.list(),
	staleTime: 3e4
});
var handoffsQuery = queryOptions({
	queryKey: ["handoffs"],
	queryFn: () => repositories.handoffs.list(),
	staleTime: 3e4
});
var activityQuery = queryOptions({
	queryKey: ["activity"],
	queryFn: () => repositories.activity.list(),
	staleTime: 1e4
});
var recordingsQuery = queryOptions({
	queryKey: ["recordings"],
	queryFn: () => repositories.recordings.list(),
	staleTime: 1e4
});
queryOptions({
	queryKey: ["accounts"],
	queryFn: () => repositories.accounts.list(),
	staleTime: 5e3
});
var helpRequestsQuery = queryOptions({
	queryKey: ["help-requests"],
	queryFn: () => repositories.helpRequests.list(),
	staleTime: 5e3
});
function useWorkspaceOverview() {
	const procedures = useQuery(proceduresQuery);
	const handoffs = useQuery(handoffsQuery);
	const activity = useQuery(activityQuery);
	const recordings = useQuery(recordingsQuery);
	const helpRequests = useQuery(helpRequestsQuery);
	return {
		procedures,
		handoffs,
		activity,
		recordings,
		helpRequests,
		isPending: procedures.isPending || handoffs.isPending || activity.isPending || recordings.isPending || helpRequests.isPending,
		isError: procedures.isError || handoffs.isError || activity.isError || recordings.isError || helpRequests.isError
	};
}
//#endregion
export { useWorkspaceOverview as a, recordingsQuery as i, handoffsQuery as n, helpRequestsQuery as r, activityQuery as t };
