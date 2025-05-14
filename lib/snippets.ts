import { cache } from "react";

import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

import type { SnippetMetadata } from "./types";
import {
  formatPath,
  getSnippetList,
  parseMetadata,
  throwIfLanguageInvalid,
  toKebabCase,
} from "./utils";
import { LANGUAGES } from "./languages";

export interface Snippet {
  language: string;
  category: string;
  name: string;
  metadata: SnippetMetadata;
}

export type GroupedSnippets = Record<string, Record<string, Snippet[]>>;

const basePath = join(process.cwd(), "snippets");

export const getSnippet: (
  language: Snippet["language"],
  category: Snippet["category"],
  name: Snippet["name"]
) => Promise<Snippet | null> = cache(async (lng, category, name) => {
  const language = lng.toLowerCase();

  throwIfLanguageInvalid(language);

  const path = join(basePath, `${formatPath(language, category, name)}.mdx`);

  const exists = existsSync(path);

  if (!exists) {
    throw new Error("Snippet not found.", { cause: { status: 404 } });
  }

  const content = await readFile(path, { encoding: "utf-8" });

  if (!content) {
    throw new Error("Couldn't read the snippet's content.", {
      cause: { status: 500 },
    });
  }

  return {
    language,
    category,
    name,
    metadata: parseMetadata(content),
  };
});

export const getSnippetContent: (
  language: Snippet["language"],
  category: Snippet["category"],
  name: Snippet["name"]
) => Promise<string | null> = cache(async (lng, category, name) => {
  const language = lng.toLowerCase();

  throwIfLanguageInvalid(language);

  const path = join(basePath, `${formatPath(language, category, name)}.mdx`);

  const exists = existsSync(path);

  if (!exists) {
    throw new Error("Snippet not found.", { cause: { status: 404 } });
  }

  const content = await readFile(path, { encoding: "utf-8" });

  if (!content) {
    throw new Error("Couldn't read the snippet's content.", {
      cause: { status: 500 },
    });
  }

  const regexContent = content
    // todo: although this works fine for now, we need to improve this
    .replace(
      /export\s+const\s+metadata\s*=\s*\{[^}]*\}(?:;?)|(?:\r?\n){3,}|```\w*/g,
      ""
    )
    // .replace(/<[\w]+>|<\/[\w]+>/g, "")
    .replace(/^[\r\n]+|[\r\n]+$/g, "")
    .replace(/(?:\r\n|\n){3,}/g, "\n\n");
  // .trim()
  // .replace(/^\s{0,5}/gm, "");

  return regexContent;
});

export const getLanguageCategories: (
  language: Snippet["language"]
) => Promise<string[]> = cache(async (lng) => {
  const language = lng.toLowerCase();

  const categories = (
    await readdir(join(basePath, language), {
      withFileTypes: true,
    })
  )
    .filter((f) => f.isDirectory())
    .map((f) => f.name);

  return categories;
});

export const getGroupedSnippets: () => Promise<GroupedSnippets> = cache(
  async () => {
    try {
      const files = (await readdir(basePath, { recursive: true })) as string[];

      const snippets = files
        .filter((file) => file.endsWith(".mdx"))
        .map(async (file) => {
          const path = resolve(basePath, file);

          const relativePath = path
            .replace(process.cwd(), "")
            .replace(/\\/g, "/");

          const parts = relativePath.replace("/snippets/", "").split("/");
          const language = parts[0];
          const category = parts[1];
          const name = parts[2].replace(".mdx", "");

          const fileContent = await readFile(path, { encoding: "utf-8" });

          const metadata = parseMetadata(fileContent);

          return { language, category, name, metadata };
        });

      const resolvedSnippets = await Promise.all(snippets);

      const groupedSnippets = resolvedSnippets.reduce((acc, snippet) => {
        const { language, category, name, metadata } = snippet;

        if (!acc[language]) {
          acc[language] = {};
        }

        if (!acc[language][category]) {
          acc[language][category] = [];
        }

        if (LANGUAGES.flatMap((x) => x.value).includes(language)) {
          acc[language][category].push({
            language,
            category,
            name,
            metadata,
          });
        } else {
          throw new Error(
            `"${language}" is missing from the list of languages in lib/languages.ts`
          );
        }

        return acc;
      }, {} as GroupedSnippets);

      return groupedSnippets;
    } catch (e) {
      console.error(e);
      return {};
    }
  }
);

export async function getRandomSnippet() {
  const groupedSnippets = await getGroupedSnippets();

  const snippetList = getSnippetList(groupedSnippets).filter(
    (snippet) => toKebabCase(snippet.language) !== "regex"
  );

  const snippetData =
    snippetList[Math.floor(Math.random() * snippetList.length)];

  const snippet = await getSnippet(
    snippetData.language,
    snippetData.category,
    snippetData.name
  );

  const content = await getSnippetContent(
    snippetData.language,
    snippetData.category,
    snippetData.name
  );

  return {
    snippet,
    content,
  };
}
