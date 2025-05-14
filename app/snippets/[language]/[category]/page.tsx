import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getGroupedSnippets } from "@/lib/snippets";
import { decodeLanguageURI, formatLanguage, toTitleCase } from "@/lib/utils";

import type { SnippetParams } from "./[name]/page";

export async function generateMetadata({
  params,
}: SnippetParams): Promise<Metadata> {
  const { language, category } = await params;

  const lng = decodeLanguageURI(language);

  const title = `${toTitleCase(category)} - SnipNest`;
  const description = `Snippets in the ${toTitleCase(
    category
  )} category of ${formatLanguage(lng)}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
  };
}

export default async function SnippetCategoryPage({ params }: SnippetParams) {
  const { language, category } = await params;

  const lng = decodeLanguageURI(language);

  const groupedSnippets = await getGroupedSnippets();
  const snippetsOfCategory = groupedSnippets[lng][category];

  if (!snippetsOfCategory) {
    notFound();
  }

  return (
    <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
      {snippetsOfCategory.map((snippet) => (
        <Link
          className="w-full bg-card hover:bg-accent/30 dark:hover:bg-accent/50 transition-colors rounded-md border border-border shadow-sm dark:shadow-none"
          href={`/snippets/${lng}/${category}/${snippet.name}`}
          key={snippet.metadata.name}
        >
          <div className="p-4 flex flex-col gap-1">
            <h1 className="font-medium text-lg">{snippet.metadata.name}</h1>
            <p className="text-sm text-muted-foreground line-clamp-2 w-full">
              {snippet.metadata.description}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
