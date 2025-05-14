"use client";

import { useParams, usePathname } from "next/navigation";

import type { SnippetParams } from "@/app/snippets/[language]/[category]/[name]/page";

import { LANGUAGES } from "@/lib/languages";
import { cn, decodeLanguageURI, toTitleCase } from "@/lib/utils";
import type { Snippet } from "@/lib/snippets";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function SidebarMargin({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 lg:ml-80 ml-0 lg:w-[calc(100%-20rem)] w-full lg:pl-6 pl-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function GroupedSnippetsContent({
  snippetList,
  children,
}: {
  snippetList: Snippet[];
  children: React.ReactNode;
}) {
  const params = useParams<Awaited<SnippetParams["params"]>>();
  const pathname = usePathname().split("/").filter(Boolean);

  const lng = decodeLanguageURI(params.language || LANGUAGES[0].value);

  const languageLink = `/snippets/${lng}`;
  const categoryLink = `/snippets/${lng}/${params.category}`;

  const languageName = LANGUAGES.find((language) => language.value === lng)
    ?.name!;
  const categoryName = toTitleCase(params.category || "");

  const snippet = snippetList.find((snippet) => snippet.name === params.name);

  const snippetName = snippet?.metadata.name!;

  return (
    <SidebarMargin>
      {pathname.length > 1 && (
        <Breadcrumb className="pt-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/snippets">Snippets</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {pathname.length === 2 ? (
                <BreadcrumbPage>{languageName}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={languageLink}>
                  {languageName}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {pathname.length > 2 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {pathname.length === 3 ? (
                <BreadcrumbPage>{categoryName}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={categoryLink}>
                  {categoryName}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {pathname.length === 4 && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{snippetName}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      )}
      <div className="flex flex-col gap-4 pb-6">{children}</div>
    </SidebarMargin>
  );
}
