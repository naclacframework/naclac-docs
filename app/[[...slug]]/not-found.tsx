import Link from "next/link";
import { getFlatPages } from "@/content/nav";

export default function NotFound() {
  const suggestions = getFlatPages().slice(0, 5);

  return (
    <div className="flex flex-col items-center px-6 py-24 text-center">
      <p className="text-8xl font-bold text-gray-200 dark:text-gray-800">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-gray-950 dark:text-gray-50">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-gray-600 dark:text-gray-400">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Go home
      </Link>

      {suggestions.length > 0 && (
        <div className="mt-12 w-full max-w-sm text-left">
          <p className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            You might be looking for
          </p>
          <ul className="flex flex-col gap-2">
            {suggestions.map((page) => (
              <li key={page.id}>
                <Link
                  href={`/${page.slug.join("/")}`}
                  className="text-sm text-gray-600 transition-colors hover:text-primary dark:text-gray-400 dark:hover:text-primary-light"
                >
                  {page.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
