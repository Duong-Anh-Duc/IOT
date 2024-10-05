document.getElementById('deviceFilter').addEventListener('change', function() {
  filterData();
});
document.getElementById('limitSelect').addEventListener('change', function() {
  filterData();
});
function filterData() {
  const deviceFilter = document.getElementById('deviceFilter').value;
  const limit = document.getElementById('limitSelect').value;
  axios.get(`/History1?deviceFilter=${deviceFilter}&limit=${limit}`, {
    headers: {
      'X-Requested-With': 'XMLHttpRequest' 
    }
  })
  .then(response => {
    console.log(response.data);
    document.getElementById('tableWrapper').innerHTML = response.data;
  })
  .catch(error => {
    console.error("Có lỗi xảy ra khi tải dữ liệu:", error);
  });
}
