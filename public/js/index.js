document.addEventListener('DOMContentLoaded', function() {
  const ctx = document.getElementById('myChart').getContext('2d');
  
  // Lấy các phần tử hiển thị giá trị nhiệt độ, độ ẩm và ánh sáng
  const tempElement = document.getElementById('text-temp');
  const humidElement = document.getElementById('text-humid');
  const lightElement = document.getElementById('text-light');
  
  const tempIcon = document.querySelector('#card-temp i');
  const humidIcon = document.querySelector('#card-humid i');
  const lightIcon = document.querySelector('#card-light i');
  // Dữ liệu ban đầu
  let temperatureData = [22, 24, 19, 23, 25, 27, 30];
  let humidityData = [60, 65, 55, 70, 75, 80, 85];
  let lightData = [100, 200, 150, 300, 350, 400, 450];

  const myChart = new Chart(ctx, {
      type: 'line', 
      data: {
          labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
          datasets: [{
              label: 'Nhiệt độ (°C)',
              data: temperatureData, 
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 1
          }, {
              label: 'Độ ẩm (%)',
              data: humidityData, 
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 1
          }, {
              label: 'Ánh sáng (lux)',
              data: lightData, 
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

  // Hàm giả lập cập nhật dữ liệu mới mỗi 2 giây
  setInterval(function() {
      // Tạo dữ liệu ngẫu nhiên cho các giá trị
      const newTemperature = Math.floor(Math.random() * 31) + 10; // Dữ liệu ngẫu nhiên từ 10 đến 40
      const newHumidity = Math.floor(Math.random() * 91) + 10; // Dữ liệu ngẫu nhiên từ 10% đến 100%
      const newLight = Math.floor(Math.random() * 1001); // Dữ liệu ngẫu nhiên từ 0 đến 1000 Lux

      // Thêm dữ liệu mới vào mảng
      temperatureData.push(newTemperature);
      humidityData.push(newHumidity);
      lightData.push(newLight);

      // Xóa dữ liệu cũ nếu có quá nhiều
      if (temperatureData.length > 10) {
          temperatureData.shift();
      }
      if (humidityData.length > 10) {
          humidityData.shift();
      }
      if (lightData.length > 10) {
          lightData.shift();
      }

      // Cập nhật giá trị trên giao diện
      tempElement.textContent = `${newTemperature}°C`;
      humidElement.textContent = `${newHumidity}%`;
      lightElement.textContent = `${newLight} Lux`;

      // Cập nhật biểu tượng nhiệt độ
      if (newTemperature < 20) {
        tempIcon.className = 'fas fa-thermometer-quarter'; 
      } else if (newTemperature >= 20 && newTemperature <= 30) {
        tempIcon.className = 'fas fa-thermometer-half'; 
      } else {
        tempIcon.className = 'fas fa-thermometer-full'; 
      }

      // Cập nhật biểu tượng độ ẩm
      if (newHumidity < 40) {
        humidIcon.className = 'fas fa-tint-slash'; 
      } else if (newHumidity >= 40 && newHumidity <= 60) {
        humidIcon.className = 'fas fa-tint';
      } else {
        humidIcon.className = 'fas fa-cloud-rain'; 
      }

      // Cập nhật biểu tượng ánh sáng
      if (newLight < 200) {
        lightIcon.className = 'fas fa-moon'; 
      } else if (newLight >= 200 && newLight <= 700) {
        lightIcon.className = 'fas fa-sun'; 
      } else {
        lightIcon.className = 'fas fa-lightbulb';
      }

      // Cập nhật đồ thị
      myChart.update();
  }, 2000); // Cập nhật mỗi 2 giây
});

const buttonChangeStatus = document.querySelectorAll("[button-change-status]");

  if (buttonChangeStatus.length > 0) {
    buttonChangeStatus.forEach(button => {
      button.addEventListener("click", async () => {
        const status = button.getAttribute("data-status");
        const id = button.getAttribute("data-id");
        let statusChange = status === "on" ? "off" : "on";

        const icon = document.querySelector(`[data-id='${id}-icon']`);

        try {
          const response = await axios.post(`/change-status/${statusChange}/${id}`);
          const newStatus = response.data.newStatus;
          button.setAttribute("data-status", newStatus);
          if (newStatus === "on") {
            button.classList.remove('badge-danger');
            button.classList.add('badge-success');
            button.textContent = 'Bật';
            if (icon) updateIconOn(icon);
          } else {
            button.classList.remove('badge-success');
            button.classList.add('badge-danger');
            button.textContent = 'Tắt';
            if (icon) updateIconOff(icon);
          }
        } catch (error) {
          console.error('Lỗi khi thay đổi trạng thái thiết bị:', error);
        }
      });
    });
  }

  function updateIconOn(icon) {
    if (icon.classList.contains('fa-fan')) {
      icon.classList.remove('fan-off');
      icon.classList.add('fan-on');
    } else if (icon.classList.contains('fa-lightbulb')) {
      icon.classList.remove('light-off');
      icon.classList.add('light-on');
    } else if (icon.classList.contains('fa-snowflake')) {
      icon.classList.remove('text-muted');
      icon.classList.add('fan-on');
    }
  }

  function updateIconOff(icon) {
    if (icon.classList.contains('fa-fan')) {
      icon.classList.remove('fan-on');
      icon.classList.add('fan-off');
    } else if (icon.classList.contains('fa-lightbulb')) {
      icon.classList.remove('light-on');
      icon.classList.add('light-off');
    } else if (icon.classList.contains('fa-snowflake')) {
      icon.classList.remove('fan-on');
      icon.classList.add('text-muted');
    }
  }
