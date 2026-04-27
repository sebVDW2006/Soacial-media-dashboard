type LoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};
  const error = params.error === "1";
  const next = typeof params.next === "string" ? params.next : "/";

  return (
    <div className="mx-auto max-w-lg pt-16">
      <section className="app-card space-y-6 p-6 sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">
            Single-user access
          </p>
          <h1 className="section-title mt-3">Unlock Content OS</h1>
          <p className="muted mt-4 text-base">
            Enter the password set in `CONTENT_OS_PASSWORD` to open the content system.
          </p>
        </div>
        <form action="/api/auth/login" method="post" className="space-y-4">
          <input type="hidden" name="next" value={next} />
          <div>
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" required autoFocus />
          </div>
          {error ? (
            <p className="rounded-2xl bg-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">
              Incorrect password. Try again.
            </p>
          ) : null}
          <button type="submit" className="primary-button w-full">
            Continue
          </button>
        </form>
      </section>
    </div>
  );
}

