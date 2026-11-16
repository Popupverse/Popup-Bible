import { queryOptions } from "@tanstack/react-query";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { useSearch } from "@tanstack/react-router";

import { BookChapter } from "@/reader/BookChapter.tsx";
import { BookContainer } from "@/reader/BookContainer.tsx";
import { BookSection } from "@/reader/BookSection.tsx";

import type { RouterContext } from "./__root.tsx";

export const bookQueryOptions = (bookId: string, fetchBook: RouterContext["fetchBook"]) =>
  queryOptions({
    queryKey: ["book", bookId],

    async queryFn() {
      const book = await fetchBook?.(bookId);

      return book;
    },
  });

export const Route = createFileRoute("/book/$bookId")({
  component: RouteComponent,

  validateSearch(search) {
    return search as unknown as { chapter: number; verse?: number };
  },

  loaderDeps({ search }) {
    return { search };
  },

  async loader({ params: { bookId }, context: { queryClient, fetchBook } }) {
    const book = await queryClient.query(bookQueryOptions(bookId, fetchBook));

    if (!book) throw `book(${bookId}) not found`;

    return book;
  },
});

function RouteComponent() {
  const book = useLoaderData({ from: Route.id });

  const { chapter } = useSearch({ from: Route.id });

  return (
    <BookContainer>
      <BookChapter>
        {book.chapters[chapter - 1]?.sections.map((s, i) => (
          <BookSection {...s} key={i} />
        ))}
      </BookChapter>
    </BookContainer>
  );
}
