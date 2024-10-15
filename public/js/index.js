document.addEventListener('DOMContentLoaded', function() {
  const ctx = document.getElementById('myChart').getContext('2d');
  const tempElement = document.getElementById('text-temp');
  const humidElement = document.getElementById('text-humid');
  const lightElement = document.getElementById('text-light');
  
  const tempIcon = document.querySelector('#card-temp i');
  const humidIcon = document.querySelector('#card-humid i');
  const lightIcon = document.querySelector('#card-light i');

  let temperatureData = JSON.parse(sessionStorage.getItem('temperatureData')) || [];
  let humidityData = JSON.parse(sessionStorage.getItem('humidityData')) || [];
  let lightData = JSON.parse(sessionStorage.getItem('lightData')) || [];
  let labelsData = [...Array(10).keys()]; 

  const myChart = new Chart(ctx, {
      type: 'line', 
      data: {
          labels: labelsData, 
          datasets: [{
              label: 'Nhiệt độ (°C)',
              data: temperatureData, 
              borderColor: 'rgba(255, 99, 132, 1)',
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderWidth: 3
          }, {
              label: 'Độ ẩm (%)',
              data: humidityData, 
              borderColor: 'rgba(54, 162, 235, 1)',
              backgroundColor: 'rgba(54, 162, 235, 0.2)',
              borderWidth: 3
          }, {
              label: 'Ánh sáng (lux)',
              data: lightData, 
              borderColor: 'rgba(255, 206, 86, 1)',
              backgroundColor: 'rgba(255, 206, 86, 0.2)',
              borderWidth: 3
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
              },
              datalabels: {
                  color: '#000',
                  anchor: 'end',
                  align: 'top',
                  formatter: function(value) {
                      return value;
                  }
              }
          },
          scales: {
              x: {
                  display: false 
              },
              y: {
                  beginAtZero: true
              }
          }
      },
      plugins: [ChartDataLabels] 
  });

  async function fetchSensorData() {
    try {
      const response = await axios.get('http://localhost:3000/sensor-data');
      console.log(response.data);
      if (response.data.success) {
        const { temperature, humidity, light } = response.data;
        
        temperatureData.push(temperature);
        humidityData.push(humidity);
        lightData.push(light);
        
        labelsData.push(labelsData[labelsData.length - 1] + 1); 
        labelsData.shift();
        if (temperatureData.length > 10) {
          temperatureData.shift();
          humidityData.shift();
          lightData.shift();
        }
        tempElement.textContent = `${temperature}°C`;
        humidElement.textContent = `${humidity}%`;
        lightElement.textContent = `${light} Lux`;

        // Lưu dữ liệu vào sessionStorage
        sessionStorage.setItem('temperatureData', JSON.stringify(temperatureData));
        sessionStorage.setItem('humidityData', JSON.stringify(humidityData));
        sessionStorage.setItem('lightData', JSON.stringify(lightData));

        // Thay đổi icon dựa trên giá trị
        if (temperature < 20) {
          tempIcon.className = 'fas fa-thermometer-quarter'; 
        } else if (temperature >= 20 && temperature <= 30) {
          tempIcon.className = 'fas fa-thermometer-half'; 
        } else {
          tempIcon.className = 'fas fa-thermometer-full'; 
        }
        if (humidity < 40) {
          humidIcon.className = 'fas fa-tint-slash'; 
        } else if (humidity >= 40 && humidity <= 60) {
          humidIcon.className = 'fas fa-tint';
        } else {
          humidIcon.className = 'fas fa-cloud-rain'; 
        }

        if (light < 200) {
          lightIcon.className = 'fas fa-moon'; 
        } else if (light >= 200 && light <= 700) {
          lightIcon.className = 'fas fa-sun'; 
        } else {
          lightIcon.className = 'fas fa-lightbulb';
        }

        myChart.update();
      } else {
        console.error('No sensor data available');
      }
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  }

  fetchSensorData();

  setInterval(fetchSensorData, 2000); 
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
