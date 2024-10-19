document.addEventListener('DOMContentLoaded', function() {
  const ctx = document.getElementById('myChart').getContext('2d');
  const tempElement = document.getElementById('text-temp');
  const humidElement = document.getElementById('text-humid');
  const lightElement = document.getElementById('text-light');
  const windSpeedElement = document.getElementById('text-wind');

  const tempIcon = document.querySelector('#card-temp i');
  const humidIcon = document.querySelector('#card-humid i');
  const lightIcon = document.querySelector('#card-light i');
  const windSpeedIcon = document.querySelector('#wind-speed-icon');

  let temperatureData = JSON.parse(sessionStorage.getItem('temperatureData')) || [];
  let humidityData = JSON.parse(sessionStorage.getItem('humidityData')) || [];
  let lightData = JSON.parse(sessionStorage.getItem('lightData')) || [];
  let windSpeedData = JSON.parse(sessionStorage.getItem('windSpeedData')) || [];
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
        }, {
            label: 'Sức gió (m/s)',
            data: windSpeedData,
            borderColor: 'rgba(255, 165, 0, 1)',
            backgroundColor: 'rgba(255, 165, 0, 0.2)', 
            borderWidth: 1,
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
      const response = await axios.get('/sensor-data');
      if (response.data.success) {
          const { temperature, humidity, light, windSpeed } = response.data;

          temperatureData.push(temperature);
          humidityData.push(humidity);
          lightData.push(light);
          windSpeedData.push(windSpeed); 

          labelsData.push(labelsData[labelsData.length - 1] + 1); 
          labelsData.shift();
          if (temperatureData.length > 10) {
              temperatureData.shift();
              humidityData.shift();
              lightData.shift();
              windSpeedData.shift(); 
          }
          tempElement.textContent = `${temperature}°C`;
          humidElement.textContent = `${humidity}%`;
          lightElement.textContent = `${light} Lux`;
          windSpeedElement.textContent = `${windSpeed} m/s`; 

          sessionStorage.setItem('temperatureData', JSON.stringify(temperatureData));
          sessionStorage.setItem('humidityData', JSON.stringify(humidityData));
          sessionStorage.setItem('lightData', JSON.stringify(lightData));
          sessionStorage.setItem('windSpeedData', JSON.stringify(windSpeedData)); 

          const body = document.body; 
          if (windSpeed > 60) {
              body.classList.add('blinking-background'); 
          } else {
              body.classList.remove('blinking-background'); 
          }
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
setInterval(fetchSensorData, 5000); 
});


const buttonChangeStatus = document.querySelectorAll("[button-change-status]");

if (buttonChangeStatus.length > 0) {
  buttonChangeStatus.forEach(button => {
    button.addEventListener("click", async () => {
      const status = button.getAttribute("data-status");
      const id = button.getAttribute("data-id");
      let statusChange = status === "on" ? "off" : "on";

      const icon = document.querySelector(`[data-id='${id}-icon']`);
      button.textContent = 'Đang xử lý...';

      const loader = document.createElement('span');
      loader.classList.add('loading-icon');
      button.appendChild(loader);

      try {
        const response = await axios.post('/api/change-status', {
          id: id,
          status: statusChange
        });
        const newStatus = response.data.status;
        console.log(newStatus);
        if (newStatus === "on") {
          button.setAttribute("data-status", "on");
          button.classList.remove('badge-success');
          button.classList.add('badge-danger');
          button.textContent = 'Tắt';
          if (icon) updateIconOn(icon);
        } else {
          button.setAttribute("data-status", "off");
          button.classList.remove('badge-danger');
          button.classList.add('badge-success');
          button.textContent = 'Bật';
          if (icon) updateIconOff(icon);
        }

        loader.remove(); 
      } catch (error) {
        console.error('Lỗi khi thay đổi trạng thái thiết bị:', error);
        button.textContent = 'Lỗi';
        setTimeout(() => {
          loader.remove();
        }, 2000);
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

