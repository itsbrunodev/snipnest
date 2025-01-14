import JavascriptIcon from "devicons-react/lib/icons/JavascriptOriginal";
import TypescriptIcon from "devicons-react/lib/icons/TypescriptOriginal";
import RustIcon from "devicons-react/lib/icons/RustOriginal";
import PythonIcon from "devicons-react/lib/icons/PythonOriginal";
import ReactIcon from "devicons-react/lib/icons/ReactOriginal";

import { RegexIcon } from "lucide-react";

import type { Language } from "./types";

/**
 * List of languages, the order doesn't matter as it will be alphabetically sorted
 */
export const LANGUAGES: Language[] = [
  {
    name: "JavaScript",
    value: "javascript",
    icon: JavascriptIcon,
    isColored: true,
  },
  {
    name: "TypeScript",
    value: "typescript",
    icon: TypescriptIcon,
    isColored: true,
  },
  {
    name: "Rust",
    value: "rust",
    icon: RustIcon,
    isColored: false,
  },
  {
    name: "Python",
    value: "python",
    icon: PythonIcon,
    isColored: true,
  },
  /**
   * Languages below aren't languages, but for the
   * sake of simplicity they are considered languages.
   *
   * The "alias" property (optional) is used to highlight the
   * code block properly when the language's value is not
   * supported by the highlighter e.g. react is not a language,
   * but tsx is a supported language by shiki.
   */
  {
    name: "React",
    value: "react",
    alias: "tsx",
    icon: ReactIcon,
    isColored: true,
  },
  {
    name: "Regex",
    value: "regex",
    icon: RegexIcon,
    isColored: false,
  },
];
