import Link from "next/link";

export default function BackButton({ href = "/admin/" }: { href?: string }) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-6 text-sm transition-colors group"
        >
            <span className="transition-transform group-hover:-translate-x-1">←</span> Volver al panel
        </Link>
    );
}