import type { SnippetParams } from "./page";

export async function Snippet({
  name,
  category,
  language,
}: Awaited<SnippetParams["params"]>) {
  const { default: Code } = await import(
    `@/snippets/${language}/${category}/${name}.mdx`
  );

  return <Code />;
}
