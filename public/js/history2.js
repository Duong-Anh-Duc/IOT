$(document).ready(function() {
    var table = $('#weatherTable').DataTable({
      "paging": true, // Bật phân trang
      "lengthChange": true, // Bật tùy chọn thay đổi số lượng hàng trên mỗi trang
      "searching": true, // Bật thanh tìm kiếm
      "info": true, // Hiển thị thông tin bảng (ví dụ: Showing 1 to 10 of 50 entries)
      "autoWidth": false, // Tắt tự động điều chỉnh độ rộng của cột
      "language": {
        "lengthMenu": "Hiển thị _MENU_ bản ghi trên mỗi trang",
        "search": "Tìm kiếm:",
        "info": "Hiển thị _START_ đến _END_ của _TOTAL_ bản ghi",
        "paginate": {
          "first": "Trang đầu",
          "last": "Trang cuối",
          "next": "Tiếp",
          "previous": "Trước"
        }
      }
    });
    
    // Lọc theo loại chỉ số
    $('#weatherFilter').on('change', function() {
      var filterValue = $(this).val();
      if (filterValue === 'all') {
        table.column(0).search('').draw(); // Hiển thị tất cả
      } else {
        table.rows().every(function() {
          var weatherType = $(this.node()).data('weather');
          if (filterValue === weatherType || filterValue === 'all') {
            $(this.node()).show(); // Hiển thị hàng
          } else {
            $(this.node()).hide(); // Ẩn hàng
          }
        });
        table.draw();
      }
    });
  });
  