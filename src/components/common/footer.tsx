import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border py-8">
            <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="uppercase text-sm tracking-[0.08em] font-medium font-sans text-muted-foreground">
                    © 2026 Sharvin Shah
                </p>
                <p className="uppercase text-sm tracking-[0.08em] font-medium font-sans text-muted-foreground">
                    Founder of{" "}
                    <Link
                        href="https://www.mtechzilla.com/"
                        className="text-accent hover:underline underline-offset-4"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        MTechZilla
                    </Link>
                </p>
            </div>
        </footer>
    );
}
