import { NextResponse } from "next/server";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { GroupedSnippets, Snippet } from "./snippets";
import { LANGUAGE_EXTENSIONS, LANGUAGES } from "./languages";
import type { RegexGroups, SnippetMetadata } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string) {
  return str
    .split("-")
    .join(" ")
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

export function toKebabCase(str: string) {
  return str
    .replace(/^[^A-Za-z0-9]*|[^A-Za-z0-9]*$/g, "")
    .replace(/([a-z])([A-Z])/g, (m, a, b) => `${a}_${b.toLowerCase()}`)
    .replace(/[^A-Za-z0-9]+|_+/g, "-")
    .toLowerCase();
}

export function shadeColor(color: string, decimal: number): string {
  const base = color.startsWith("#") ? 1 : 0;

  let r = Number.parseInt(color.substring(base, 3), 16);
  let g = Number.parseInt(color.substring(base + 2, 5), 16);
  let b = Number.parseInt(color.substring(base + 4, 7), 16);

  r = Math.round(r / decimal);
  g = Math.round(g / decimal);
  b = Math.round(b / decimal);

  r = r < 255 ? r : 255;
  g = g < 255 ? g : 255;
  b = b < 255 ? b : 255;

  const rr =
    r.toString(16).length === 1 ? `0${r.toString(16)}` : r.toString(16);
  const gg =
    g.toString(16).length === 1 ? `0${g.toString(16)}` : g.toString(16);
  const bb =
    b.toString(16).length === 1 ? `0${b.toString(16)}` : b.toString(16);

  return `#${rr}${gg}${bb}`.replaceAll("-", "");
}

export function getSnippetList(groupedSnippets: GroupedSnippets): Snippet[] {
  return Object.values(groupedSnippets)
    .flatMap((languageGroups) => Object.values(languageGroups))
    .flat()
    .map((snippet) => ({
      ...snippet,
      language: formatLanguage(snippet.language),
      category: toTitleCase(snippet.category),
    }));
}

export function decodeLanguageURI(language: string) {
  return decodeURI(language).replace(/ /g, "-").toLowerCase();
}

/**
 * Properly formats the language name e.g. ("javascript" -> "JavaScript")
 */
export function formatLanguage(language: string) {
  return LANGUAGES.find((x) => x.value === language)?.name || language;
}

export function getFileExtension(language: string) {
  return LANGUAGE_EXTENSIONS.get(toKebabCase(language));
}

function languageExists(language: string) {
  return LANGUAGES.find((x) => x.value === language) !== undefined;
}

export function throwIfLanguageInvalid(language: string) {
  if (!languageExists(language)) {
    throw new Error(
      `"${language}" is not a valid language. Valid languages are: ${LANGUAGES.map((x) => x.value).join(", ")}.`,
      {
        cause: { status: 400 },
      }
    );
  }
}

export const METADATA_REGEX =
  /export\s+const\s+metadata\s*=\s*{\s*(?:name:\s*(?:"|')(?<name>.*)(?:"|'),\s*description:\s*(?:"|')(?<description>.*)(?:"|'),\s*keywords:\s*\[(?<keywords>(?:\s*"[^"]+"\s*,?\s*)*)\],\s*contributors:\s*\[(?<contributors>(?:\s*"[^"]+"\s*,?\s*)*)\]\s*,?\s*)}/;

export function parseMetadata(code: string): SnippetMetadata {
  const match = code.match(METADATA_REGEX);

  if (!match) {
    return {
      name: "",
      description: "",
      keywords: [],
      contributors: [""],
    };
  }

  const { name, description, contributors, keywords } = match!
    .groups as unknown as RegexGroups;

  function arrayParser(input: string): string[] {
    return (
      input.match(/"([^"]+)"/g)?.map((k: string) => k.replace(/"/g, "")) || []
    );
  }

  const parsedKeywords = arrayParser(keywords);
  const parsedContributors = arrayParser(contributors);

  return {
    name,
    description,
    keywords: parsedKeywords,
    contributors: parsedContributors,
  };
}

export function formatPath(
  language: Snippet["language"],
  category: string,
  name: string
) {
  return `${language.toLowerCase()}/${toKebabCase(category)}/${toKebabCase(name)}`;
}

export function handleApiError(error: unknown) {
  if (error instanceof Error) {
    const status = (error.cause as { status: number })?.status || 500;

    return NextResponse.json(
      {
        status,
        message: error.message || "Not found.",
      },
      {
        status,
      }
    );
  }

  // An unknown error occurred
  console.error(error);

  return NextResponse.json(
    JSON.stringify({
      status: 500,
      message: "Something went wrong.",
    }),
    {
      status: 500,
    }
  );
}
