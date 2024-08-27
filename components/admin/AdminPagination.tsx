import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const AdminPagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
}: AdminPaginationProps) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <Pagination>
      <PaginationContent className="list-none">
        <PaginationItem className="bg-gray-700 w-[120px]">
          <PaginationPrevious
            href="#"
            onClick={handlePrevious}
            className={
              currentPage === 1
                ? "cursor-not-allowed text-gray-300 no-underline"
                : "text-white no-underline"
            }
          />
        </PaginationItem>

        <PaginationItem className="bg-gray-700 w-[120px]">
          <PaginationNext
            href="#"
            onClick={handleNext}
            className={
              currentPage === totalPages
                ? "cursor-not-allowed text-gray-300 no-underline"
                : "text-white no-underline"
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default AdminPagination;
