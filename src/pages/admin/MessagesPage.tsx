import { useState } from "react";
import { Inbox, Mail, MailOpen, Reply } from "lucide-react";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminErrorState, AdminListSkeleton } from "@/components/admin/AdminStates";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { SectionTabs } from "@/pages/admin/SectionTabs";
import {
  useContactMessages,
  useSetMessageArchived,
  useSetMessageRead,
  type ContactMessage,
} from "@/lib/data/contact";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

export function MessagesPage() {
  const [showArchived, setShowArchived] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: messages, isLoading, isError, error, refetch } = useContactMessages(showArchived);
  const setRead = useSetMessageRead();
  const setArchived = useSetMessageArchived();

  const selected: ContactMessage | null = messages?.find((m) => m.id === selectedId) ?? null;
  const unreadCount = messages?.filter((m) => !m.is_read).length ?? 0;

  function openMessage(m: ContactMessage) {
    setSelectedId(m.id);
    if (!m.is_read) setRead.mutate({ id: m.id, read: true });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        title="Messages"
        description="Inquiries sent through the public contact form."
        action={
          !showArchived && unreadCount > 0 ? (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-small font-medium text-primary">
              {unreadCount} unread
            </span>
          ) : undefined
        }
      />

      <SectionTabs
        tabs={[
          { slug: "inbox", label: "Inbox" },
          { slug: "archived", label: "Archived" },
        ]}
        activeTab={showArchived ? "archived" : "inbox"}
        onTabChange={(slug) => {
          setShowArchived(slug === "archived");
          setSelectedId(null);
        }}
      />

      {isLoading && <AdminListSkeleton rows={4} />}
      {isError && <AdminErrorState error={error} onRetry={() => refetch()} />}

      {messages && messages.length === 0 && (
        <AdminEmptyState
          icon={Inbox}
          title={showArchived ? "No archived messages" : "Inbox zero"}
          description={
            showArchived
              ? "Archived messages will appear here."
              : "Messages sent through /contact will land here."
          }
        />
      )}

      {messages && messages.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <ul className="space-y-2" aria-label="Message list">
            {messages.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => openMessage(m)}
                  aria-current={selectedId === m.id}
                  className={`w-full rounded-lg border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
                    selectedId === m.id
                      ? "border-primary bg-surface"
                      : "border-border bg-surface hover:bg-background"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {m.is_read ? (
                      <MailOpen size={14} className="shrink-0 text-text-secondary" aria-hidden="true" />
                    ) : (
                      <Mail size={14} className="shrink-0 text-primary" aria-hidden="true" />
                    )}
                    <span className={`min-w-0 flex-1 truncate text-small ${m.is_read ? "text-text-secondary" : "font-semibold text-text-primary"}`}>
                      {m.subject}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2 text-[12px] text-text-secondary">
                    <span className="truncate">{m.name}</span>
                    <span className="shrink-0">{formatWhen(m.created_at)}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>

          <div>
            {selected ? (
              <AdminCard className="p-5">
                <div className="mb-4 flex items-start justify-between gap-3 border-b border-border pb-4">
                  <div className="min-w-0">
                    <h2 className="text-subtitle font-semibold text-text-primary">{selected.subject}</h2>
                    <p className="mt-1 text-small text-text-secondary">
                      {selected.name} · <a className="underline" href={`mailto:${selected.email}`}>{selected.email}</a>
                      {selected.phone && <> · {selected.phone}</>}
                    </p>
                    <p className="mt-0.5 text-[12px] text-text-secondary">{formatWhen(selected.created_at)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <AdminButton
                      type="button"
                      variant="ghost"
                      className="min-h-9 px-2.5"
                      onClick={() => setRead.mutate({ id: selected.id, read: !selected.is_read })}
                    >
                      {selected.is_read ? <Mail size={15} aria-hidden="true" /> : <MailOpen size={15} aria-hidden="true" />}
                      <span className="hidden sm:inline">{selected.is_read ? "Mark unread" : "Mark read"}</span>
                    </AdminButton>
                    <ConfirmButton
                      label={showArchived ? `Restore message from ${selected.name}` : `Archive message from ${selected.name}`}
                      confirmMessage={showArchived ? "Restore this message to the inbox?" : "Archive this message?"}
                      onConfirm={() => {
                        setArchived.mutate({ id: selected.id, archived: !showArchived });
                        setSelectedId(null);
                      }}
                    />
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-small leading-relaxed text-text-primary">{selected.message}</p>
                <div className="mt-5 border-t border-border pt-4">
                  <a
                    href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-3.5 py-2 text-small font-semibold text-white transition-colors hover:bg-primary-600"
                  >
                    <Reply size={15} aria-hidden="true" /> Reply via email
                  </a>
                </div>
              </AdminCard>
            ) : (
              <AdminCard className="flex h-full min-h-48 items-center justify-center p-6 text-center">
                <p className="text-small text-text-secondary">Select a message to read it.</p>
              </AdminCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

