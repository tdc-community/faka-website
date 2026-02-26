export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-16">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="h-7 w-1.5 bg-primary rounded-sm" />
                <div className="h-5 w-1.5 bg-primary/60 rounded-sm" />
              </div>
              <span className="font-serif text-lg font-bold uppercase tracking-wider text-foreground">
                Faka<span className="text-primary">Performance</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Най-доброто списание за автомобилни ентусиасти. Седмични издания, състезания и най-добрите проекти от нашата общност.
            </p>
          </div>

          {/* Magazine */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">
              Списание
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Конкурс на Живо", href: "/#live-contest" },
                { label: "Табло", href: "/dashboard" },
                { label: "Качи Своята Кола", href: "/dashboard" },
                { label: "Редакция", href: "/#news" }
              ].map(
                (item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">
              Общност
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Кола на Седмицата", href: "/#car-of-the-week" },
                { label: "Ревюта на Писти", href: "/#tracks" },
                { label: "Класации", href: "/#live-contest" },
                { label: "Събития", href: "/#news" }
              ].map(
                (item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-serif text-sm font-bold uppercase tracking-wider text-foreground">
              Свързване
            </h3>
            <ul className="mt-4 space-y-3">
              {[
                { label: "Discord", href: "https://discord.com" },
                { label: "Instagram", href: "https://instagram.com" },
                { label: "YouTube", href: "https://youtube.com" },
                { label: "Twitter", href: "https://twitter.com" }
              ].map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-xs text-muted-foreground">
            {"Списание FakaPerformance. Всички права запазени."}
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Поверителност
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              Условия
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
