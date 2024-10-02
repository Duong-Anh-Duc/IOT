$(document).ready(function() {
  var table = $('#deviceTable').DataTable({
    "language": {
      "lengthMenu": "Hiển thị _MENU_ bản ghi trên mỗi trang",
      "zeroRecords": "Không tìm thấy bản ghi nào",
      "info": "Hiển thị _START_ đến _END_ của _TOTAL_ bản ghi",
      "infoEmpty": "Không có bản ghi nào",
      "infoFiltered": "(lọc từ _MAX_ bản ghi)",
      "search": "Tìm kiếm:",
      "paginate": {
        "first": "Trang đầu",
        "last": "Trang cuối",
        "next": "Tiếp",
        "previous": "Trước"
      }
    }
  });
});
