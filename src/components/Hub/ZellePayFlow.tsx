import React, { useMemo, useState } from "react";
import type { Id } from "@tolobana/convex-backend/convex/_generated/dataModel";
import { api } from "@tolobana/convex-backend/convex/_generated/api";
import type { FunctionReference } from "convex/server";
import { ConvexError } from "convex/values";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import {
  useAdminAction,
  useAdminMutation,
  useAdminReadQuery,
} from "../../hooks/useDbQuery";

function convexErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ConvexError) {
    return typeof err.data === "string"
      ? err.data
      : err.message || JSON.stringify(err.data);
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function toDatetimeLocalValue(ms: number) {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type Props = {
  paymentId: Id<"hub_contributions">;
  itsNumber: string;
  onStartOver: () => void;
};

/**
 * Stages after a payment request exists:
 * pay → confirm → done (pending verification message)
 */
const ZellePayFlow: React.FC<Props> = ({ paymentId, itsNumber, onStartOver }) => {
  const payment = useAdminReadQuery(api.zellePayments.getPayment, {
    contributionId: paymentId,
  });

  const submitConfirmation = useAdminAction(
    api.zellePayments.submitConfirmation as unknown as FunctionReference<"action">,
  );
  const generateUploadUrl = useAdminMutation(
    api.zellePayments.generateScreenshotUploadUrl,
  );

  const [stage, setStage] = useState<"pay" | "confirm" | "done">("pay");
  const [copied, setCopied] = useState<"contact" | "amount" | "ref" | null>(null);
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [claimedAt, setClaimedAt] = useState(() => toDatetimeLocalValue(Date.now()));
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slaDays, setSlaDays] = useState(3);

  const zelleContact = payment?.zelle_contact?.trim() ?? "";
  const amount = payment?.amount ?? 0;
  const refCode = payment?.reference_code ?? "";
  const memoHint = payment?.desired_memo?.trim() ?? "";

  const steps = useMemo(
    () => [
      "Open your bank's app",
      "Go to Zelle",
      `Send ${money(amount)} to ${zelleContact || "our Zelle contact"}`,
      "Come back here and confirm",
    ],
    [amount, zelleContact],
  );

  async function copy(kind: "contact" | "amount" | "ref", text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("Could not copy to clipboard.");
    }
  }

  async function uploadScreenshot(): Promise<Id<"_storage"> | undefined> {
    if (!screenshotFile) return undefined;
    const uploadUrl = await generateUploadUrl({});
    const result = await fetch(uploadUrl, {
      method: "POST",
      headers: { "Content-Type": screenshotFile.type || "image/jpeg" },
      body: screenshotFile,
    });
    if (!result.ok) {
      throw new Error("Screenshot upload failed. Try again or skip the screenshot.");
    }
    const json = (await result.json()) as { storageId: Id<"_storage"> };
    return json.storageId;
  }

  async function handleConfirmSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmationNumber.trim()) {
      setError("Enter the confirmation number or last 4 digits from your bank.");
      return;
    }
    const sentAt = new Date(claimedAt).getTime();
    if (!Number.isFinite(sentAt)) {
      setError("Enter a valid date and time.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const screenshotId = await uploadScreenshot();
      const result = (await submitConfirmation({
        contributionId: paymentId,
        its_number: itsNumber,
        confirmation_number: confirmationNumber,
        confirmation_screenshot_id: screenshotId,
        donor_claimed_sent_at: sentAt,
      })) as { status: string; duplicate?: boolean };

      setSlaDays(payment?.verification_sla_business_days ?? 3);
      if (result.duplicate) {
        // Still accepted — staff will see the duplicate flag.
      }
      setStage("done");
    } catch (err: unknown) {
      setError(convexErrorMessage(err, "Could not submit confirmation. Try again."));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (payment === undefined) {
    return <p className="meta">Loading payment…</p>;
  }

  if (payment === null) {
    return (
      <div className="card payment-card">
        <p className="field-error">Payment request not found.</p>
        <button type="button" className="btn btn-navy" onClick={onStartOver}>
          Start over
        </button>
      </div>
    );
  }

  if (payment.status === "pending_verification" || stage === "done") {
    return (
      <div className="card payment-card">
        <div className="accent-font kicker" style={{ color: "var(--gold-dark)", marginBottom: 16 }}>
          PENDING VERIFICATION
        </div>
        <div className="gold-rule-small"></div>
        <div className="success-inline" style={{ marginTop: 16 }}>
          <span className="accent-font">THANKS — WE&apos;LL CONFIRM YOUR PAYMENT</span>
          <p className="success-note">
            We&apos;ll confirm your payment against our bank records within{" "}
            <strong>{slaDays || payment.verification_sla_business_days}</strong> business
            days. This is not yet verified — please keep your bank confirmation until then.
          </p>
          {refCode && (
            <p className="success-note" style={{ marginTop: 8 }}>
              Reference: <code>{refCode}</code>
            </p>
          )}
        </div>
        <button
          type="button"
          className="btn btn-navy"
          style={{ marginTop: 24 }}
          onClick={onStartOver}
        >
          Done
        </button>
      </div>
    );
  }

  if (payment.status === "rejected") {
    return (
      <div className="card payment-card">
        <div className="accent-font kicker" style={{ color: "var(--gold-dark)" }}>
          PAYMENT NOT VERIFIED
        </div>
        <p className="meta" style={{ marginTop: 12 }}>
          {payment.rejection_reason ||
            "Staff could not match this claim to a bank deposit."}
        </p>
        <button type="button" className="btn btn-gold" style={{ marginTop: 20 }} onClick={onStartOver}>
          Start a new payment
        </button>
      </div>
    );
  }

  if (payment.status === "expired") {
    return (
      <div className="card payment-card">
        <p className="meta">This payment request expired. Start a new one to continue.</p>
        <button type="button" className="btn btn-gold" onClick={onStartOver}>
          Start over
        </button>
      </div>
    );
  }

  if (payment.status === "verified") {
    return (
      <div className="card payment-card">
        <div className="success-inline">
          <span className="accent-font">PAYMENT VERIFIED — THANK YOU</span>
        </div>
        <button type="button" className="btn btn-navy" style={{ marginTop: 20 }} onClick={onStartOver}>
          Done
        </button>
      </div>
    );
  }

  if (stage === "confirm") {
    return (
      <div className="card payment-card">
        <div className="accent-font kicker" style={{ color: "var(--gold-dark)", marginBottom: 16 }}>
          CONFIRM YOU SENT PAYMENT
        </div>
        <div className="gold-rule-small"></div>
        <p className="meta" style={{ margin: "12px 0 20px", fontSize: 13 }}>
          Submitting this tells us you sent a Zelle transfer. It is a claim for staff to verify
          against the bank — not a confirmed receipt.
        </p>

        <form onSubmit={(e) => void handleConfirmSubmit(e)} className="log-form">
          <div className="input-group">
            <label>CONFIRMATION NUMBER / LAST 4 *</label>
            <input
              type="text"
              value={confirmationNumber}
              onChange={(e) => setConfirmationNumber(e.target.value)}
              placeholder="Whatever your bank showed"
              required
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          <div className="input-group">
            <label>WHEN DID YOU SEND IT?</label>
            <input
              type="datetime-local"
              value={claimedAt}
              onChange={(e) => setClaimedAt(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="input-group">
            <label>SCREENSHOT (OPTIONAL)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setScreenshotFile(e.target.files?.[0] ?? null)}
              disabled={isSubmitting}
            />
            <p className="meta" style={{ marginTop: 6, fontSize: 11 }}>
              A screenshot of your Zelle confirmation screen helps staff match the deposit.
            </p>
          </div>

          {error && (
            <p className="field-error" style={{ marginBottom: 16, justifyContent: "center" }}>
              ⚠ {error}
            </p>
          )}

          <button type="submit" className="btn btn-gold" disabled={isSubmitting}>
            {isSubmitting ? <div className="loading-spinner" /> : "Submit for verification"}
          </button>
          <button
            type="button"
            className="btn-gold-ghost"
            style={{ marginTop: 12 }}
            disabled={isSubmitting}
            onClick={() => setStage("pay")}
          >
            Back to payment instructions
          </button>
        </form>
      </div>
    );
  }

  // stage === "pay"
  return (
    <div className="card payment-card">
      <div className="accent-font kicker" style={{ color: "var(--gold-dark)", marginBottom: 16 }}>
        PAY WITH ZELLE
      </div>
      <div className="gold-rule-small"></div>

      {!zelleContact && (
        <div className="warning-panel" style={{ marginTop: 16 }}>
          <AlertTriangle size={20} className="warning-icon" />
          <p>
            Zelle contact is not configured for this campaign. Contact your administrator before
            sending money.
          </p>
        </div>
      )}

      {zelleContact && (
        <>
          <div className="field-label" style={{ color: "var(--gold-dark)", fontSize: 10, marginTop: 20 }}>
            SEND TO
          </div>
          <div className="memo-container" onClick={() => void copy("contact", zelleContact)}>
            <div className="memo-left">
              <code className="memo-text" style={{ fontSize: 22 }}>
                {zelleContact}
              </code>
              <p className="memo-note">Organization Zelle email or phone</p>
            </div>
            <div className="memo-right">
              {copied === "contact" ? (
                <Check size={18} style={{ color: "var(--green)" }} />
              ) : (
                <Copy size={18} style={{ color: "var(--gold-dark)" }} />
              )}
            </div>
          </div>
          {copied === "contact" && (
            <p className="meta" style={{ fontSize: 11, color: "var(--green)" }}>
              Copied
            </p>
          )}
        </>
      )}

      <div className="field-label" style={{ color: "var(--gold-dark)", fontSize: 10, marginTop: 20 }}>
        AMOUNT
      </div>
      <div
        className="memo-container"
        onClick={() => void copy("amount", amount.toFixed(2))}
      >
        <div className="memo-left">
          <code className="memo-text" style={{ fontSize: 22 }}>
            {money(amount)}
          </code>
          <p className="memo-note">Send this exact amount</p>
        </div>
        <div className="memo-right">
          {copied === "amount" ? (
            <Check size={18} style={{ color: "var(--green)" }} />
          ) : (
            <Copy size={18} style={{ color: "var(--gold-dark)" }} />
          )}
        </div>
      </div>

      {refCode && (
        <>
          <div className="field-label" style={{ color: "var(--gold-dark)", fontSize: 10, marginTop: 20 }}>
            REFERENCE (MEMO / NOTE)
          </div>
          <div className="memo-container" onClick={() => void copy("ref", refCode)}>
            <div className="memo-left">
              <code className="memo-text">{refCode}</code>
              <p className="memo-note">
                Put this in the Zelle memo if your bank supports notes (best-effort)
              </p>
            </div>
            <div className="memo-right">
              {copied === "ref" ? (
                <Check size={18} style={{ color: "var(--green)" }} />
              ) : (
                <Copy size={18} style={{ color: "var(--gold-dark)" }} />
              )}
            </div>
          </div>
          {memoHint && (
            <p className="meta" style={{ fontSize: 11, marginTop: 6 }}>
              Campaign hint: {memoHint}
            </p>
          )}
        </>
      )}

      {zelleContact && (
        <div className="qr-spread" style={{ marginTop: 24 }}>
          <div className="qr-frame">
            <QRCodeSVG value={zelleContact} size={140} fgColor="#001529" level="H" />
          </div>
          <div className="qr-actions">
            <p className="meta" style={{ fontSize: 12 }}>
              Scan to copy our Zelle info, then send from your bank app.
            </p>
          </div>
        </div>
      )}

      <ol className="zelle-steps">
        {steps.map((s, i) => (
          <li key={i}>{s}</li>
        ))}
      </ol>

      <button
        type="button"
        className="btn btn-gold"
        style={{ marginTop: 8 }}
        onClick={() => setStage("confirm")}
        disabled={!zelleContact}
      >
        I&apos;ve sent the payment
      </button>
      <button
        type="button"
        className="btn-gold-ghost"
        style={{ marginTop: 12 }}
        onClick={onStartOver}
      >
        Cancel
      </button>

      <style>{`
        .zelle-steps {
          margin: 24px 0 16px;
          padding-left: 22px;
          color: var(--ink, #1a1a1a);
          font-size: 14px;
          line-height: 1.55;
        }
        .zelle-steps li { margin-bottom: 6px; }
      `}</style>
    </div>
  );
};

export default ZellePayFlow;
