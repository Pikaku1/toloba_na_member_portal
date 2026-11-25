import React, { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import PageMasthead from "../components/Layout/PageMasthead";
import ListPageSkeleton from "../components/ListPageSkeleton";
import { placeForJamaat } from "../jamaatPlaces";

type RosterMember = {
  id: string;
  name: string;
  designation: string;
  pendingTo: string | null;
  pendingId: string | null;
};

type IncomingTransfer = {
  id: string;
  name: string;
  designation: string;
  fromJamaat: string;
};

type MyJamaatData = {
  jamaat: string | null;
  canTransfer: boolean;
  members: RosterMember[];
  incoming: IncomingTransfer[];
  cities: { jamaat: string }[];
};

const myJamaat = makeFunctionReference<"query", Record<string, never>, MyJamaatData | null>(
  "jamaatTransfers:myJamaat",
);

const requestTransfer = makeFunctionReference<
  "mutation",
  { memberId: string; toJamaat: string },
  null
>("jamaatTransfers:requestTransfer");

const acceptTransfer = makeFunctionReference<"mutation", { transferId: string }, null>(
  "jamaatTransfers:acceptTransfer",
);

const declineTransfer = makeFunctionReference<"mutation", { transferId: string }, null>(
  "jamaatTransfers:declineTransfer",
);

const cancelTransfer = makeFunctionReference<"mutation", { transferId: string }, null>(
  "jamaatTransfers:cancelTransfer",
);

function cityLabel(jamaat: string): string {
  return placeForJamaat(jamaat)?.label ?? jamaat;
}

function messageFrom(err: unknown): string {
  if (err && typeof err === "object" && "data" in err && typeof err.data === "string") {
    return err.data;
  }
  if (err instanceof Error) {
    const match = err.message.match(/Uncaught (?:Convex)?Error: ([^\n]+)/);
    if (match?.[1]) return match[1];
  }
  return "Something went wrong. Please try again.";
}

const MyJamaat: React.FC = () => {
  const data = useQuery(myJamaat, {});
  const send = useMutation(requestTransfer);
  const accept = useMutation(acceptTransfer);
  const decline = useMutation(declineTransfer);
  const cancel = useMutation(cancelTransfer);

  const [open, setOpen] = useState(false);
  const [memberId, setMemberId] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (data === undefined) {
    return (
      <div className="my-jamaat-page">
        <PageMasthead title="My Jamaat" subtitle="Members in your city" />
        <ListPageSkeleton rows={4} />
      </div>
    );
  }

  const jamaat = data?.jamaat ?? null;
  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    setBusy(true);
    try {
      await action();
    } catch (err) {
      setError(messageFrom(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="my-jamaat-page">
      <PageMasthead
        title="My Jamaat"
        subtitle={jamaat ? cityLabel(jamaat) : "Your city is not on the roster"}
      />

      <div className="container my-jamaat-wrap">
        {!jamaat ? (
          <section className="card">
            <p className="quiet">Your membership is not linked to a jamaat yet.</p>
          </section>
        ) : (
          <>
            {data?.canTransfer && data.incoming.length > 0 && (
              <section className="card incoming">
                <h2>Incoming requests</h2>
                {data.incoming.map((request) => (
                  <article key={request.id} className="request">
                    <div>
                      <strong>{request.name}</strong>
                      <span>
                        {request.designation} · from {cityLabel(request.fromJamaat)}
                      </span>
                    </div>
                    <div className="request-actions">
                      <button
                        type="button"
                        className="btn btn-navy"
                        disabled={busy}
                        onClick={() => void run(() => accept({ transferId: request.id }))}
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost"
                        disabled={busy}
                        onClick={() => void run(() => decline({ transferId: request.id }))}
                      >
                        Decline
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            )}

            <section className="card roster">
              {data && data.members.length === 0 ? (
                <p className="quiet">No members are listed for this jamaat.</p>
              ) : (
                data?.members.map((member) => (
                  <div key={member.id} className="member-row">
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.designation}</span>
                    </div>
                    {member.pendingTo && (
                      <div className="pending">
                        <span>Pending · {cityLabel(member.pendingTo)}</span>
                        {data?.canTransfer && member.pendingId && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() =>
                              void run(() => cancel({ transferId: member.pendingId! }))
                            }
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </section>

            {data?.canTransfer && (
              <section className="card transfer">
                {!open ? (
                  <button type="button" className="btn btn-navy" onClick={() => setOpen(true)}>
                    Transfer member to another jamaat
                  </button>
                ) : (
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (!memberId || !city) return;
                      void run(async () => {
                        await send({ memberId, toJamaat: city });
                        setOpen(false);
                        setMemberId("");
                        setCity("");
                      });
                    }}
                  >
                    <h2>Transfer a member</h2>
                    <label htmlFor="transfer-member">Member</label>
                    <select
                      id="transfer-member"
                      value={memberId}
                      onChange={(event) => setMemberId(event.target.value)}
                      disabled={busy}
                    >
                      <option value="">Choose a member</option>
                      {data.members
                        .filter((member) => !member.pendingTo)
                        .map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} · {member.designation}
                          </option>
                        ))}
                    </select>

                    <label htmlFor="transfer-city">City</label>
                    <select
                      id="transfer-city"
                      value={city}
                      onChange={(event) => setCity(event.target.value)}
                      disabled={busy}
                    >
                      <option value="">Choose a city</option>
                      {data.cities.map((option) => (
                        <option key={option.jamaat} value={option.jamaat}>
                          {cityLabel(option.jamaat)}
                        </option>
                      ))}
                    </select>

                    <button
                      type="submit"
                      className="btn btn-navy"
                      disabled={busy || !memberId || !city}
                    >
                      Send request
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      disabled={busy}
                      onClick={() => {
                        setOpen(false);
                        setMemberId("");
                        setCity("");
                        setError(null);
                      }}
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </section>
            )}

            {error && (
              <p className="field-error" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </div>

      <style>{`
        .my-jamaat-wrap { padding-top: 16px; }

        .incoming { margin-bottom: 12px; }
        .incoming h2, .transfer h2 {
          font-size: 16px;
          margin-bottom: 12px;
        }

        .request {
          display: flex;
          flex-direction: column;
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid var(--border);
        }

        .request strong, .member-row strong {
          display: block;
          font-size: 15px;
        }

        .request span, .member-row span, .quiet {
          color: var(--ink-muted);
          font-size: 13px;
        }

        .request-actions { display: flex; flex-direction: column; gap: 8px; }

        .roster { padding: 4px 16px; }

        .member-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
        }

        .member-row:last-child { border-bottom: none; }

        .pending {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .pending button {
          background: none;
          border: 0;
          padding: 0;
          color: var(--brand);
          font: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .transfer { margin-top: 12px; }
        .transfer form { display: flex; flex-direction: column; gap: 8px; }
        .transfer .btn-ghost { margin-top: 4px; }
      `}</style>
    </div>
  );
};

export default MyJamaat;
