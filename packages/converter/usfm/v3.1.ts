const m = (
  type: Marker["type"],
  desc: string,
  levelsOrMeta?:
    | Marker["levels"]
    | {
        levels?: Marker["levels"];
        recommendedUse?: boolean;
        deprecated?: string;
      },
): Marker => {
  const isMeta = typeof levelsOrMeta === "object" && !Array.isArray(levelsOrMeta);

  const { recommendedUse, deprecated, levels: metaLevels } = isMeta ? levelsOrMeta : {};

  const levels = metaLevels ?? (!isMeta ? levelsOrMeta : undefined);

  return { type, desc, levels, recommendedUse, deprecated };
};

export interface Marker {
  type:
    | ChapterAndVerseMarker
    | IdentificationMarker
    | IntroductionMaker
    | TitlesAndSectionsMarker
    | BodyParagraphsMarker
    | PoetryMark
    | PoetryCharMark
    | ListMark
    | ListCharMark
    | TableMarker
    | TableCellMarker
    | TextFeaturesCharMarker
    | TextFormattingCharMarker
    | SpacingAndBreaksCharMarker
    | IntroductionCharMaker
    | FootnoteMarker
    | CrossReferenceMarker
    | MilestoneMarker
    | SidebarMarker
    | ContentCategoryNoteMarker
    | FigMarker;

  desc: string;
  recommendedUse?: boolean;
  deprecated?: string;

  /** levels start at 1 */
  levels?: number | string[];
}

type ChapterAndVerseMarker = "c" | "ca" | "cp" | "v" | "va" | "vp";

const CHAPTER_AND_VERSE_MARKERS = [
  m("c", "Chapter number"),
  m("ca", "Alternate chapter number"),
  m("cp", "Published chapter number"),
  m("v", "Verse number"),
  m("va", "Alternate verse number"),
  m("vp", "Published verse number"),
];

type IdentificationMarker = "usfm" | "id" | "ide" | "sts" | "rem" | "h" | "h#" | "toc#" | "toca#";

const _TOC_LEVELS = ["Long book name", "short book name", "Book abbreviation"];

const BOOK_IDENTIFICATION_MARKERS = [
  m("usfm", "USFM version"),
  m("id", "Book identification"),
  m("ide", "Character encoding"),
  m("sts", "Text status"),
  m("rem", "Remarks"),
  m("h", "Running header text"),
  m("h#", "Running header text", { deprecated: "3.0" }),
  m("toc#", "Book name texts (Table of Contents)", _TOC_LEVELS),
  m("toca#", "Alternate book name texts (Table of Contents)", _TOC_LEVELS),
] as const;

type IntroductionMaker =
  | "imt#"
  | "is#"
  | "ip"
  | "ipi"
  | "im"
  | "imi"
  | "ipq"
  | "imq"
  | "ipr"
  | "iq#"
  | "ili#"
  | "ib"
  | "iot"
  | "io#"
  | "iex"
  | "imte#"
  | "ie";

const BOOK_INTRO_MARKERS = [
  m("imt#", "Intro major title", { levels: 4, recommendedUse: true }),
  m("is#", "Intro section heading", 2),
  m("ip", "Intro paragraph"),
  m("ipi", "Intro indented"),
  m("im", "Intro margin"),
  m("imi", "Intro indented margin"),
  m("ipq", "Intro quote"),
  m("imq", "Intro quote margin"),
  m("ipr", "Intro right-aligned"),
  m("iq#", "Intro poetic line", 3),
  m("ili#", "Intro list entry", 2),
  m("ib", "Intro blank line"),
  m("iot", "Intro outline title"),
  m("io#", "Intro outline entry", 4),
  m("iex", "Intro bridge text"),
  m("imte#", "Intro major title end", 2),
  m("ie", "Intro end"),
] as const;

type TitlesAndSectionsMarker =
  | "mt#"
  | "mte#"
  | "cl"
  | "cd"
  | "ms#"
  | "mr"
  | "s#"
  | "sr"
  | "r"
  | "d"
  | "sp"
  | "sd#";

const BOOK_TITLES_AND_SECTIONS_MARKERS = [
  m("mt#", "Main title", 4),
  m("mte#", "Main title end", 2),
  m("cl", "Chapter label"),
  m("cd", "Chapter description"),
  m("ms#", "Major section heading", 3),
  m("mr", "Major section reference range"),
  m("s#", "Section heading", 4),
  m("sr", "Section reference range"),
  m("r", "Parallel passage reference(s)"),
  m("d", "Descriptive title(Hebrew subtitle)"),
  m("sp", "Speaker identification"),
  m("sd#", "Semantic division", 4),
];

type BodyParagraphsMarker =
  | "p"
  | "m"
  | "po"
  | "cls"
  | "pr"
  | "pc"
  | "pm"
  | "pmo"
  | "pmc"
  | "pmr"
  | "pi#"
  | "mi#"
  | "lit"
  | "nb"
  | "b"
  | "ph";

const BODY_PARAGRAPH_MARKERS = [
  m("p", "Paragraph"),
  m("m", "Continuation (margin)"),
  m("po", "Letter opening"),
  m("cls", "Letter closing"),
  m("pr", "Right-aligned"),
  m("pc", "Centered"),
  m("pm", "Embedded paragraph"),
  m("pmo", "Embedded opening"),
  m("pmc", "Embedded closing"),
  m("pmr", "Embedded refrain"),
  m("pi#", "indented", 3),
  m("mi#", "indented continuation", 3),
  m("lit", "Liturgical note"),
  m("nb", "No break"),
  m("b", "Blank line"),
  m("ph", "indented hanging", { levels: 3, deprecated: "3.0" }),
];

type PoetryMark = "q#" | "qr" | "qc" | "qa" | "qm#" | "qd" | "b";

type PoetryCharMark = "qs" | "qac";

const POETRY_MARK = [
  m("q#", "Poetic line", 4),
  m("qr", "Right-aligned"),
  m("qc", "Centered"),
  m("qa", "Acrostic heading"),
  m("qm#", "Embedded poetic line", 3),
  m("qd", "Hebrew note"),
  m("b", "Blank line"),
];

const POETRY_CHAR_MARK = [m("qs", "Selah"), m("qac", "Acrostic Character")];

type ListMark = "lh" | "li#" | "lf" | "lim#";

type ListCharMark = "litl" | "lik" | "liv";

const LIST_MARKERS = [
  m("lh", "List header"),
  m("li#", "List entry", 4),
  m("lf", "List footer"),
  m("lim#", "Embedded list entry", 4),
];

const LIST_CHAR_MARKERS = [
  m("litl", "List entry total"),
  m("lik", "List entry key"),
  m("liv", "List entry value"),
];

type TableMarker = "tr";

const TABLE_MARKERS = [m("tr", "Table row start")];

type TableCellMarker = "th#" | "thr#" | "thc#" | "tc#" | "tcr#" | "tcc#";

const TABLE_CELL_MARKERS = [
  m("th#", "Table column head"),
  m("thr#", "Table column head - right aligned"),
  m("thc#", "Table column head - center aligned"),
  m("tc#", "Table cell"),
  m("tcr#", "Table cell - right aligned"),
  m("tcc#", "Table cell - center aligned"),
];

type TextFeaturesCharMarker =
  | "add"
  | "bk"
  | "dc"
  | "em"
  | "jmp"
  | "k"
  | "nd"
  | "ord"
  | "pn"
  | "png"
  | "qt"
  | "rb"
  | "rq"
  | "ref"
  | "sig"
  | "sis"
  | "tl"
  | "w"
  | "wa"
  | "wg"
  | "wh"
  | "wj"
  | "addpn"
  | "pro";

const TEXT_FEATURES_CHAR_MARKERS = [
  m("add", "Translator addition"),
  m("bk", "Quoted book title"),
  m("dc", "DC(Deuterocanonical)-only content"),
  m("em", "Emphasis text"),
  m("jmp", "Link text"),
  m("k", "Keyword/keyterm"),
  m("nd", "Name of God (deity)"),
  m("ord", "Ordinal ending"),
  m("pn", "Proper name"),
  m("png", "Geographic name"),
  m("qt", "Quoted text"),
  m("rb", "Ruby gloss"),
  m("rq", "Inline quotation refs"),
  m("ref", "Scripture reference"),
  m("sig", "Author's signature"),
  m("sis", "Secondary source"),
  m("tl", "Transliterated words"),
  m("w", "Wordlist entry"),
  m("wa", "Aramaic wordlist entry"),
  m("wg", "Greek wordlist entry"),
  m("wh", "Hebrew wordlist entry"),
  m("wj", "Words of Jesus"),
  m("addpn", "Proper name + translator's addition", { deprecated: "3.0" }),
  m("pro", "Pronunciation annotation", { deprecated: "3.0" }),
];

type TextFormattingCharMarker = "bd" | "it" | "bdit" | "no" | "sc" | "sup";

const TEXT_FORMATTING_CHAR_MARKERS = [
  m("bd", "Bold text"),
  m("it", "Italic text"),
  m("bdit", "Bold + italic text"),
  m("no", "Normal text"),
  m("sc", "Smallcap text"),
  m("sup", "Superscript text"),
];

type SpacingAndBreaksCharMarker = "//" | "pb";

const SPACING_AND_BREAKS_CHAR_MARKERS = [m("//", "Optional line break"), m("pb", "Page break")];

type IntroductionCharMaker = "ior" | "iqt";

const INTRODUCTION_CHAR_MARKERS = [m("ior", "Intro outline refs"), m("iqt", "Intro quoted text")];

type FootnoteMarker =
  | "fr"
  | "fq"
  | "fqa"
  | "fk"
  | "ft"
  | "fl"
  | "fw"
  | "fp"
  | "fv"
  | "fdc"
  | "fm"
  | "f"
  | "fe"
  | "ef"
  | "efe";

const FOOTNOTE_MARKERS = [
  m("fr", "Origin reference"),
  m("fq", "Translation quote"),
  m("fqa", "Alternate translation"),
  m("fk", "Keyword"),
  m("ft", "Note text"),
  m("fl", "Label text"),
  m("fw", "Witness list"),
  m("fp", "Additional paragraph"),
  m("fv", "Verse number"),
  m("fdc", "DC(Deuterocanonical)-only content"),
  m("fm", "Reference mark"),
  m("f", "Footnote"),
  m("fe", "Endnote"),
  m("ef", "Extended note"),
  m("efe", "Extended Endnote"),
];

type CrossReferenceMarker =
  | "xo"
  | "xop"
  | "xk"
  | "xq"
  | "xt"
  | "xta"
  | "xot"
  | "xnt"
  | "xdc"
  | "x"
  | "ex";

const CROSS_REFERENCE_MARKERS = [
  m("xo", "Origin reference"),
  m("xop", "Published origin text"),
  m("xk", "Keyword"),
  m("xq", "Translation quote"),
  m("xt", "Target references"),
  m("xta", "Target added text"),
  m("xot", "OT references"),
  m("xnt", "NT references"),
  m("xdc", "DC(Deuterocanonical) references"),
  m("x", "Cross reference"),
  m("ex", "Extended CrossRef"),
];

type MilestoneMarker = "qt#" | "ts";

const MILESTONE_MARKERS = [m("qt#", "(Speaker) Quotations", 5), m("ts", "Translator's section")];

type SidebarMarker = "esb" | "esbe";

const SIDEBAR_MARKERS = [m("esb", "Sidebar"), m("esbe", "Sidebar end")];

type ContentCategoryNoteMarker = "cat";

const CONTENT_CATEGORY_NOTE_MARKERS = [m("cat", "Note category")];

type FigMarker = "fig";

const FIG_MARKERS = [m("fig", "Figure / illustration")];

export const MARKERS = {
  CHAPTER_AND_VERSE_MARKERS,
  BOOK_IDENTIFICATION_MARKERS,
  BOOK_INTRO_MARKERS,
  BOOK_TITLES_AND_SECTIONS_MARKERS,
  BODY_PARAGRAPH_MARKERS,
  POETRY_MARK,
  POETRY_CHAR_MARK,
  LIST_MARKERS,
  LIST_CHAR_MARKERS,
  TABLE_MARKERS,
  TABLE_CELL_MARKERS,
  TEXT_FEATURES_CHAR_MARKERS,
  TEXT_FORMATTING_CHAR_MARKERS,
  SPACING_AND_BREAKS_CHAR_MARKERS,
  INTRODUCTION_CHAR_MARKERS,
  FOOTNOTE_MARKERS,
  CROSS_REFERENCE_MARKERS,
  MILESTONE_MARKERS,
  SIDEBAR_MARKERS,
  CONTENT_CATEGORY_NOTE_MARKERS,
  FIG_MARKERS,
} as const;
