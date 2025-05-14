import { Fragment } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { getSnippet } from "@/lib/snippets";
import { decodeLanguageURI, formatPath } from "@/lib/utils";

import { GitHubIcon } from "@/components/icons/github";

import { Snippet } from "./snippet";

export interface SnippetParams {
  params: Promise<{ language: string; category: string; name: string }>;
}

export async function generateMetadata({
  params,
}: SnippetParams): Promise<Metadata> {
  const { language, category, name } = await params;

  const lng = decodeLanguageURI(language);

  const snippet = await getSnippet(lng, category, name);

  if (!snippet) {
    notFound();
  }

  const title = `${snippet.metadata.name} - SnipNest`;
  const url = `https://snipnest.dev/snippets/${formatPath(
    lng,
    category,
    name
  )}`;

  return {
    title,
    description: snippet.metadata.description,
    keywords: snippet.metadata.keywords,
    authors: snippet.metadata.contributors.map((contributor) => ({
      name: contributor,
      url: `https://github.com/${contributor}`,
    })),
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: snippet.metadata.description,
      url,
      type: "article",
    },
  };
}

export default async function SnippetPage({ params }: SnippetParams) {
  const { language, category, name } = await params;

  const lng = decodeLanguageURI(language);

  const snippet = await getSnippet(lng, category, name);

  if (!snippet) {
    notFound();
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold font-sans">
            {snippet.metadata.name}
          </h1>
          <p className="text-muted-foreground">
            {snippet.metadata.description}
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Contributed by{" "}
          {snippet.metadata.contributors.map((contributor, i) => (
            <Fragment key={contributor}>
              <Link
                className="hover:underline text-foreground"
                href={`https://github.com/${contributor}`}
                target="_blank"
              >
                @{contributor}
              </Link>
              {i < snippet.metadata.contributors.length - 1 && ", "}
            </Fragment>
          ))}
        </p>
      </div>
      <Snippet
        name={name}
        category={category}
        language={lng}
      />
      <Link
        className="text-sm text-foreground hover:underline flex items-center gap-2 group w-fit"
        href={`https://github.com/itsbrunodev/snipnest/edit/main/snippets/${formatPath(
          lng,
          category,
          name
        )}.mdx`}
        target="_blank"
      >
        <GitHubIcon className="fill-muted-foreground group-hover:fill-foreground transition-colors" />
        Edit on GitHub
      </Link>
    </>
  );
}
