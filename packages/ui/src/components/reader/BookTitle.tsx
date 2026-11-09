import type { Book } from "@popup-bible/flat-converter";
import { tv } from "tailwind-variants";

const useStyles = tv({
  slots: {
    root: "space-y-2 text-center",
    mt1: "text-4xl leading-8 font-bold",
    mt2: "",
  },
});

export function BookTitle(book: Book) {
  const { root, mt1, mt2 } = useStyles();

  return (
    <header className={root()}>
      {book.titles[2] && <h2 className={mt2()}>{book.titles[2]}</h2>}
      {book.titles[1] && <h1 className={mt1()}>{book.titles[1]}</h1>}
    </header>
  );
}
