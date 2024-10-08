function paginationRange(currentPage, totalPages, delta = 2) {
  const range = [];
  const rangeWithDots = [];
  const leftTruncate = currentPage - delta > 2;
  const rightTruncate = currentPage + delta < totalPages - 1;

  if (leftTruncate) {
      range.push(1);  // Trang đầu tiên
      range.push('...');  // Dấu ...
  }

  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      range.push(i);  // Các trang lân cận với trang hiện tại
  }

  if (rightTruncate) {
      range.push('...');
      range.push(totalPages);  // Trang cuối cùng
  }

  return range;
}