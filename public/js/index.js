document.addEventListener('DOMContentLoaded', function() {
  const ctx = document.getElementById('myChart').getContext('2d');
  const tempElement = document.getElementById('text-temp');
  const humidElement = document.getElementById('text-humid');
  const lightElement = document.getElementById('text-light');
  const windSpeedElement = document.getElementById('text-wind');
  const warningElement = document.getElementById('text-warning');
  
  const tempIcon = document.querySelector('#card-temp i');
  const humidIcon = document.querySelector('#card-humid i');
  const lightIcon = document.querySelector('#card-light i');
  const windSpeedIcon = document.querySelector('#wind-speed-icon');
  
  let temperatureData = JSON.parse(localStorage.getItem('temperatureData')) || [];
  let humidityData = JSON.parse(localStorage.getItem('humidityData')) || [];
  let lightData = JSON.parse(localStorage.getItem('lightData')) || [];
  let windSpeedData = JSON.parse(localStorage.getItem('windSpeedData')) || [];
  let labelsData = [...Array(20).keys()]; // updated to hold 20 labels
  
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
      }, {
        label: 'Sức gió (m/s)',
        data: windSpeedData,
        borderColor: 'rgba(255, 165, 0, 1)',
        backgroundColor: 'rgba(255, 165, 0, 0.2)', 
        borderWidth: 3,
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
        const { countWarning, temperature, humidity, light, windSpeed } = response.data;

        warningElement.textContent = `${countWarning} lần`;
        
        temperatureData.push(temperature);
        humidityData.push(humidity);
        lightData.push(light);
        windSpeedData.push(windSpeed); 

        labelsData.push(labelsData[labelsData.length - 1] + 1); 
        labelsData.shift();
        if (temperatureData.length > 20) {  // updated to retain 20 entries
          temperatureData.shift();
          humidityData.shift();
          lightData.shift();
          windSpeedData.shift(); 
        }
        tempElement.textContent = `${temperature}°C`;
        humidElement.textContent = `${humidity}%`;
        lightElement.textContent = `${light} Lux`;
        windSpeedElement.textContent = `${windSpeed} m/s`; 

        localStorage.setItem('temperatureData', JSON.stringify(temperatureData));
        localStorage.setItem('humidityData', JSON.stringify(humidityData));
        localStorage.setItem('lightData', JSON.stringify(lightData));
        localStorage.setItem('windSpeedData', JSON.stringify(windSpeedData)); 

        if (windSpeed >= 60) {
          document.querySelector('.card-wind').classList.add('blinking-background'); 
        } else {
          document.querySelector('.card-wind').classList.remove('blinking-background'); 
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
        }, 5000);
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
  } else if (icon.classList.contains('fa-cog')) { 
    icon.classList.remove('device-off');
    icon.classList.add('device-on');
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
  } else if (icon.classList.contains('fa-cog')) {  
    icon.classList.remove('device-on');
    icon.classList.add('device-off');
  }
}