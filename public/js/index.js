document.addEventListener('DOMContentLoaded', function() {
  // Initialize Chart.js
  const ctx = document.getElementById('myChart').getContext('2d');
  const myChart = new Chart(ctx, {
      type: 'line', 
      data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [{
              label: 'Nhiệt độ (°C)',
              data: [22, 24, 19, 23, 25, 27, 30], 
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 1
          }, {
              label: 'Độ ẩm (%)',
              data: [60, 65, 55, 70, 75, 80, 85], 
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 1
          }, {
              label: 'Ánh sáng (lux)',
              data: [100, 200, 150, 300, 350, 400, 450], 
              borderColor: 'rgba(255, 206, 86, 1)',
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          plugins: {
              legend: {
                  position: 'top',
                  onClick: function(e, legendItem) {
                      const index = legendItem.datasetIndex;
                      const chart = this.chart;
                      const meta = chart.getDatasetMeta(index);
                      meta.hidden = !meta.hidden;
                      chart.update();
                  }
              }
          },
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
});
const buttonChangStatus = document.querySelectorAll("[button-change-status]");

if (buttonChangStatus.length > 0) {
  console.log("Đã tìm thấy các nút cần xử lý");  // Kiểm tra xem có tìm thấy các nút không
  buttonChangStatus.forEach(button => {
    button.addEventListener("click", async () => {
      console.log("Nút đã được nhấn");  // Kiểm tra sự kiện click

      const status = button.getAttribute("data-status");
      const id = button.getAttribute("data-id");
      let statusChange = status === "on" ? "off" : "on";

      // Lấy phần tử biểu tượng bằng cách tìm kiếm qua thuộc tính data-id
      const icon = document.querySelector(`[data-id='${id}-icon']`);

      try {
        const response = await axios.post(`/change-status/${statusChange}/${id}`);
        const newStatus = response.data.newStatus;
        button.setAttribute("data-status", newStatus);

        // Cập nhật nút trạng thái và biểu tượng cho các thiết bị
        if (newStatus === "on") {
          button.classList.remove('badge-danger');
          button.classList.add('badge-success');
          button.textContent = 'Bật';

          // Cập nhật icon tương ứng với thiết bị bật
          if (icon) {
            if (icon.classList.contains('fa-fan')) {
              // Xử lý quạt quay
              icon.classList.remove('fan-off');
              icon.classList.add('fan-on');
            } else if (icon.classList.contains('fa-lightbulb')) {
              // Xử lý đèn sáng
              icon.classList.remove('light-off');
              icon.classList.add('light-on');
            } else if (icon.classList.contains('fa-snowflake')) {
              // Xử lý điều hòa bật
              icon.classList.remove('text-muted');
              icon.classList.add('fan-on'); // Điều hòa bật
            }
          }

        } else {
          button.classList.remove('badge-success');
          button.classList.add('badge-danger');
          button.textContent = 'Tắt';

          // Cập nhật icon tương ứng với thiết bị tắt
          if (icon) {
            if (icon.classList.contains('fa-fan')) {
              // Xử lý quạt dừng quay
              icon.classList.remove('fan-on');
              icon.classList.add('fan-off');
            } else if (icon.classList.contains('fa-lightbulb')) {
              // Xử lý đèn tắt
              icon.classList.remove('light-on');
              icon.classList.add('light-off');
            } else if (icon.classList.contains('fa-snowflake')) {
              // Xử lý điều hòa tắt
              icon.classList.remove('fan-on');
              icon.classList.add('text-muted'); // Điều hòa tắt
            }
          }
        }
      } catch (error) {
        console.error('Error updating status:', error);
      }
    });
  });
}
// Giả sử bạn nhận dữ liệu nhiệt độ, độ ẩm và ánh sáng từ server
const temperatureValue = 30; // ví dụ: nhiệt độ
const humidityValue = 65;    // ví dụ: độ ẩm
const lightValue = 500;      // ví dụ: ánh sáng

// Cập nhật icon cho nhiệt độ
const tempIcon = document.querySelector('#card-temp i');
const tempText = document.querySelector('#text-temp');
console.log(tempText)
tempText.textContent = `${temperatureValue}°C`;

if (temperatureValue < 20) {
  tempIcon.className = 'fas fa-thermometer-quarter'; // Nhiệt độ thấp
} else if (temperatureValue >= 20 && temperatureValue <= 30) {
  tempIcon.className = 'fas fa-thermometer-half'; // Nhiệt độ trung bình
} else {
  tempIcon.className = 'fas fa-thermometer-full'; // Nhiệt độ cao
}

// Cập nhật icon cho độ ẩm
const humidIcon = document.querySelector('#card-humid i');
const humidText = document.querySelector('#text-humid');
humidText.textContent = `${humidityValue}%`;

if (humidityValue < 40) {
  humidIcon.className = 'fas fa-tint-slash'; // Độ ẩm thấp
} else if (humidityValue >= 40 && humidityValue <= 60) {
  humidIcon.className = 'fas fa-tint'; // Độ ẩm trung bình
} else {
  humidIcon.className = 'fas fa-cloud-rain'; // Độ ẩm cao
}

// Cập nhật icon cho ánh sáng
const lightIcon = document.querySelector('#card-light i');
const lightText = document.querySelector('#text-light');
lightText.textContent = `${lightValue} Lux`;

if (lightValue < 200) {
  lightIcon.className = 'fas fa-moon'; // Ánh sáng yếu
} else if (lightValue >= 200 && lightValue <= 700) {
  lightIcon.className = 'fas fa-sun'; // Ánh sáng trung bình
} else {
  lightIcon.className = 'fas fa-lightbulb'; // Ánh sáng mạnh
}
